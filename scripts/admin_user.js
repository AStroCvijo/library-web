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
const usersRef = ref(db, 'korisnici');

// DOM elements
const usersList = document.getElementById('users-list');
const addUserBtn = document.getElementById('add-user-btn');
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('user-form');
const modalTitle = document.getElementById('modal-title');
const confirmDialog = document.getElementById('confirmDialog');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const confirmCancelBtn = document.getElementById('confirm-cancel');

let currentUserId = null;

// Modal functionality
function openModal() {
    userModal.style.display = 'block';
}

function closeModal() {
    userModal.style.display = 'none';
    userForm.reset();
    currentUserId = null;
}

// Close modal when clicking on X or cancel button
document.querySelectorAll('[data-close="userModal"]').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// Add new user button
addUserBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Dodaj novog korisnika';
    openModal();
});

// Form submission
userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userData = {
        ime: document.getElementById('user-ime').value,
        prezime: document.getElementById('user-prezime').value,
        korisnickoIme: document.getElementById('user-username').value,
        email: document.getElementById('user-email').value,
        lozinka: document.getElementById('user-password').value,
        telefon: document.getElementById('user-phone').value || '',
        adresa: document.getElementById('user-address').value || '',
        datumRodjenja: document.getElementById('user-birthdate').value || '',
        zanimanje: document.getElementById('user-occupation').value || '',
        tip: 'korisnik' // Default role
    };
    
    if (currentUserId) {
        // Update existing user
        const userRef = ref(db, `korisnici/${currentUserId}`);
        set(userRef, userData)
            .then(() => {
                alert('Korisnik uspešno ažuriran!');
                closeModal();
            })
            .catch(error => {
                alert('Došlo je do greške pri ažuriranju: ' + error.message);
            });
    } else {
        // Add new user
        push(usersRef, userData)
            .then(() => {
                alert('Korisnik uspešno dodat!');
                closeModal();
            })
            .catch(error => {
                alert('Došlo je do greške pri dodavanju: ' + error.message);
            });
    }
});

// Load users
onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    usersList.innerHTML = '';

    if (!data) {
        usersList.innerHTML = '<p class="no-data">Trenutno nema registrovanih korisnika.</p>';
        return;
    }

    for (const id in data) {
        const user = data[id];
        
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <a href="profile.html?id=${id}" class="btn-view">
                <div class="user-card-header">
                    <div class="user-avatar">
                        ${user.ime ? user.ime.charAt(0) : ''}${user.prezime ? user.prezime.charAt(0) : ''}
                    </div>
                    <div class="user-info">
                        <h3>${user.ime || ''} ${user.prezime || ''}</h3>
                        <p class="username">@${user.korisnickoIme || 'username'}</p>
                    </div>
                </div>
            </a>
            <div class="user-card-details">
                <p><i class="fas fa-envelope"></i> ${user.email || 'Nepoznato'}</p>
                ${user.telefon ? `<p><i class="fas fa-phone"></i> ${user.telefon}</p>` : ''}
                ${user.zanimanje ? `<p><i class="fas fa-briefcase"></i> ${user.zanimanje}</p>` : ''}
            </div>
            <div class="action-buttons">
                <button class="btn btn-edit edit-btn" data-id="${id}">
                    <i class="fas fa-edit"></i> Izmeni
                </button>
                <button class="btn btn-delete delete-btn" data-id="${id}">
                    <i class="fas fa-trash"></i> Obriši
                </button>
            </div>
        `;
        
        usersList.appendChild(card);
    }

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            editUser(id, data[id]);
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

// Edit user
function editUser(id, user) {
    currentUserId = id;
    modalTitle.textContent = 'Izmeni korisnika';
    
    document.getElementById('user-id').value = id;
    document.getElementById('user-ime').value = user.ime || '';
    document.getElementById('user-prezime').value = user.prezime || '';
    document.getElementById('user-username').value = user.korisnickoIme || '';
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-password').value = user.lozinka || '';
    document.getElementById('user-phone').value = user.telefon || '';
    document.getElementById('user-address').value = user.adresa || '';
    document.getElementById('user-birthdate').value = user.datumRodjenja || '';
    document.getElementById('user-occupation').value = user.zanimanje || '';
    
    openModal();
}

// Delete user confirmation
function showDeleteConfirmation(id) {
    currentUserId = id;
    confirmDialog.style.display = 'flex';
}

confirmCancelBtn.addEventListener('click', () => {
    confirmDialog.style.display = 'none';
    currentUserId = null;
});

confirmDeleteBtn.addEventListener('click', () => {
    if (currentUserId) {
        const userRef = ref(db, `korisnici/${currentUserId}`);
        remove(userRef)
            .then(() => {
                alert('Korisnik uspešno obrisan!');
                confirmDialog.style.display = 'none';
                currentUserId = null;
            })
            .catch(error => {
                alert('Došlo je do greške pri brisanju: ' + error.message);
            });
    }
});

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === userModal) {
        closeModal();
    }
    if (e.target === confirmDialog) {
        confirmDialog.style.display = 'none';
    }
});