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
const knjizareRef = ref(db, 'knjizare');

// DOM elements
const knjizareList = document.getElementById('knjizare-list');
const addKnjizaraBtn = document.getElementById('add-knjizara-btn');
const knjizaraModal = document.getElementById('knjizaraModal');
const knjizaraForm = document.getElementById('knjizara-form');
const modalTitle = document.getElementById('modal-title');
const confirmDialog = document.getElementById('confirmDialog');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const confirmCancelBtn = document.getElementById('confirm-cancel');

let currentKnjizaraId = null;

// Modal functionality
function openModal() {
    knjizaraModal.style.display = 'block';
}

function closeModal() {
    knjizaraModal.style.display = 'none';
    knjizaraForm.reset();
    currentKnjizaraId = null;
}

// Close modal when clicking on X or cancel button
document.querySelectorAll('[data-close="knjizaraModal"]').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// Add new bookstore button
addKnjizaraBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Dodaj novu knjižaru';
    openModal();
});

// Form submission
knjizaraForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const knjizaraData = {
        naziv: document.getElementById('knjizara-naziv').value,
        adresa: document.getElementById('knjizara-adresa').value,
        kontaktTelefon: document.getElementById('knjizara-telefon').value,
        email: document.getElementById('knjizara-email').value,
        knjige: document.getElementById('knjizara-knjige').value,
        godinaOsnivanja: document.getElementById('knjizara-godina').value,
        logo: document.getElementById('knjizara-logo').value || 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    };

    if (!knjizaraData.naziv || !knjizaraData.adresa || !knjizaraData.kontaktTelefon || !knjizaraData.email || !knjizaraData.knjige || !knjizaraData.godinaOsnivanja) {
        alert("Molimo popunite sva polja!");
        return;
    }
    
    if (currentKnjizaraId) {
        // Update existing bookstore
        const knjizaraRef = ref(db, `knjizare/${currentKnjizaraId}`);
        set(knjizaraRef, knjizaraData)
            .then(() => {
                alert('Knjižara uspešno ažurirana!');
                closeModal();
            })
            .catch(error => {
                alert('Došlo je do greške pri ažuriranju: ' + error.message);
            });
    } else {
        // Add new bookstore
        push(knjizareRef, knjizaraData)
            .then(() => {
                alert('Knjižara uspešno dodata!');
                closeModal();
            })
            .catch(error => {
                alert('Došlo je do greške pri dodavanju: ' + error.message);
            });
    }
});

// Load bookstores
onValue(knjizareRef, (snapshot) => {
    const data = snapshot.val();
    knjizareList.innerHTML = '';

    if (!data) {
        knjizareList.innerHTML = '<p class="no-data">Trenutno nema dostupnih knjižara.</p>';
        return;
    }

    for (const id in data) {
        const knjizara = data[id];
        
        const card = document.createElement('div');
        card.className = 'bookstore-card';
        card.innerHTML = `
            <a href="admin_book.html?id=${knjizara.knjige}" class="bookstore-link">
                <div class="card-image">
                    <img src="${knjizara.logo}" alt="${knjizara.naziv}">
                </div>
            </a>
            <div class="card-content">
                <h3>${knjizara.naziv}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${knjizara.adresa}</p>
                <p><i class="fas fa-calendar-alt"></i> Godina osnivanja: ${knjizara.godinaOsnivanja}</p>
                <p><i class="fas fa-phone"></i> ${knjizara.kontaktTelefon}</p>
                <p><i class="fas fa-envelope"></i> ${knjizara.email}</p>
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
        
        knjizareList.appendChild(card);
    }

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            editKnjizara(id, data[id]);
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

// Edit bookstore
function editKnjizara(id, knjizara) {
    currentKnjizaraId = id;
    modalTitle.textContent = 'Izmeni knjižaru';
    
    document.getElementById('knjizara-id').value = id;
    document.getElementById('knjizara-naziv').value = knjizara.naziv;
    document.getElementById('knjizara-adresa').value = knjizara.adresa;
    document.getElementById('knjizara-email').value = knjizara.email;
    document.getElementById('knjizara-godina').value = knjizara.godinaOsnivanja;
    document.getElementById('knjizara-telefon').value = knjizara.kontaktTelefon;
    document.getElementById('knjizara-knjige').value = knjizara.knjige,
    document.getElementById('knjizara-logo').value = knjizara.logo;
    
    openModal();
}

// Delete bookstore confirmation
function showDeleteConfirmation(id) {
    currentKnjizaraId = id;
    confirmDialog.style.display = 'flex';
}

confirmCancelBtn.addEventListener('click', () => {
    confirmDialog.style.display = 'none';
    currentKnjizaraId = null;
});

confirmDeleteBtn.addEventListener('click', () => {
    if (currentKnjizaraId) {
        const knjizaraRef = ref(db, `knjizare/${currentKnjizaraId}`);
        remove(knjizaraRef)
            .then(() => {
                alert('Knjižara uspešno obrisana!');
                confirmDialog.style.display = 'none';
                currentKnjizaraId = null;
            })
            .catch(error => {
                alert('Došlo je do greške pri brisanju: ' + error.message);
            });
    }
});

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === knjizaraModal) {
        closeModal();
    }
    if (e.target === confirmDialog) {
        confirmDialog.style.display = 'none';
    }
});