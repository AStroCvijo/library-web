import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    push, 
    set, 
    remove 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFxk6j-Li3Eqf2jQoJAPHzCgd7PITmlh8",
    authDomain: "library-81114.firebaseapp.com",
    databaseURL: "https://library-81114-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "library-81114",
    storageBucket: "library-81114.appspot.com",
    messagingSenderId: "646187899492",
    appId: "1:646187899492:web:93dcb6d2f8190a09259d71"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get bookstore ID from URL
const urlParams = new URLSearchParams(window.location.search);
const bookstoreId = urlParams.get('id');

// Set database reference based on bookstore ID
const knjigeRef = ref(db, `knjige/${bookstoreId}`);

// DOM elements
const knjigeList = document.getElementById('knjige-list');
const addKnjigaBtn = document.getElementById('add-knjiga-btn');
const knjigaModal = document.getElementById('knjigaModal');
const knjigaForm = document.getElementById('knjiga-form');
const modalTitle = document.getElementById('modal-title');
const confirmDialog = document.getElementById('confirmDialog');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const confirmCancelBtn = document.getElementById('confirm-cancel');

let currentKnjigaId = null;

// Function for redirecting to error page
function redirectToErrorPage(errorCode) {
    window.location.href = `error.html?message=${errorCode}`;
}

// Modal functionality
function openModal() {
    knjigaModal.style.display = 'block';
}

function closeModal() {
    knjigaModal.style.display = 'none';
    knjigaForm.reset();
    currentKnjigaId = null;
}

// Close modal when clicking on X or cancel button
document.querySelectorAll('[data-close="knjigaModal"]').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// Add new book button
addKnjigaBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Dodaj novu knjigu';
    openModal();
});

// Form submission
knjigaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const knjigaData = {
        autor: document.getElementById('knjiga-autor').value,
        brojStrana: document.getElementById('knjiga-brojStrana').value,
        cena: document.getElementById('knjiga-cena').value,
        format: document.getElementById('knjiga-format').value,
        naziv: document.getElementById('knjiga-naziv').value,
        opis: document.getElementById('knjiga-opis').value,
        zanr: document.getElementById('knjiga-zanr').value,
        slike: document.getElementById('knjiga-slika').value || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    };

    if (!knjigaData.naziv || !knjigaData.autor || !knjigaData.brojStrana || !knjigaData.cena || 
        !knjigaData.format || !knjigaData.opis || !knjigaData.zanr) {
        alert("Molimo popunite sva obavezna polja!");
        return;
    }
    
    if (currentKnjigaId) {
        // Update existing book - use the same path as for reading
        const knjigaRef = ref(db, `knjige/${bookstoreId}/${currentKnjigaId}`);
        set(knjigaRef, knjigaData)
            .then(() => {
                alert('Knjiga uspešno ažurirana!');
                closeModal();
            })
            .catch(error => {
                console.error("Greška pri ažuriranju:", error);
                redirectToErrorPage(error.message);
            });
    } else {
        // Add new book
        push(knjigeRef, knjigaData)
            .then(() => {
                alert('Knjiga uspešno dodata!');
                closeModal();
            })
            .catch(error => {
                console.error("Greška pri dodavanju:", error);
                redirectToErrorPage(error.message);
            });
    }
});

// Load books
onValue(knjigeRef, (snapshot) => {
    const data = snapshot.val();
    knjigeList.innerHTML = '';

    if (!data) {
        knjigeList.innerHTML = '<p class="no-data">Trenutno nema dostupnih knjiga u ovoj knjižari.</p>';
        return;
    }

    for (const id in data) {
        const knjiga = data[id];
        
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="card-image">
                <img src="${knjiga.slike}" alt="${knjiga.naziv}">
            </div>
            <div class="card-content">
                <h3>${knjiga.naziv}</h3>
                <p><i class="fas fa-user"></i> ${knjiga.autor}</p>
                <p><i class="fas fa-tag"></i> Žanr: ${knjiga.zanr}</p>
                <p><i class="fas fa-file"></i> Strana: ${knjiga.brojStrana}</p>
                <p><i class="fas fa-money-bill-wave"></i> Cena: ${knjiga.cena} RSD</p>
                <p><i class="fas fa-book-open"></i> Format: ${knjiga.format}</p>
                <p class="book-description">${knjiga.opis}</p>
                <div class="action-buttons">
                    <button class="btn btn-edit edit-btn" data-id="${id}">
                        <i class="fas fa-edit"></i> Izmeni
                    </button>
                    <button class="btn btn-delete delete-btn" data-id="${id}">
                        <i class="fas fa-trash"></i> Obriši
                    </button>
                </div>
            </div>
        `;
        
        knjigeList.appendChild(card);
    }

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            editKnjiga(id, data[id]);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            showDeleteConfirmation(id);
        });
    });
});

// Edit book
function editKnjiga(id, knjiga) {
    currentKnjigaId = id;
    modalTitle.textContent = 'Izmeni knjigu';
    
    document.getElementById('knjiga-id').value = id;
    document.getElementById('knjiga-naziv').value = knjiga.naziv || '';
    document.getElementById('knjiga-autor').value = knjiga.autor || '';
    document.getElementById('knjiga-brojStrana').value = knjiga.brojStrana || '';
    document.getElementById('knjiga-cena').value = knjiga.cena || '';
    document.getElementById('knjiga-format').value = knjiga.format || '';
    document.getElementById('knjiga-opis').value = knjiga.opis || '';
    document.getElementById('knjiga-zanr').value = knjiga.zanr || '';
    document.getElementById('knjiga-slika').value = knjiga.slike || '';
    
    openModal();
}

// Delete book confirmation
function showDeleteConfirmation(id) {
    currentKnjigaId = id;
    confirmDialog.style.display = 'flex';
}

confirmCancelBtn.addEventListener('click', () => {
    confirmDialog.style.display = 'none';
    currentKnjigaId = null;
});

confirmDeleteBtn.addEventListener('click', () => {
    if (currentKnjigaId) {
        const knjigaRef = ref(db, `knjige/${bookstoreId}/${currentKnjigaId}`);
        remove(knjigaRef)
            .then(() => {
                alert('Knjiga uspešno obrisana!');
                confirmDialog.style.display = 'none';
                currentKnjigaId = null;
            })
            .catch(error => {
                console.error("Greška pri brisanju:", error);
                alert('Došlo je do greške pri brisanju: ' + error.message);
            });
    }
});

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === knjigaModal) {
        closeModal();
    }
    if (e.target === confirmDialog) {
        confirmDialog.style.display = 'none';
    }
});