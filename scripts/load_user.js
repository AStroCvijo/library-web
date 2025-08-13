import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

const userContainer = document.getElementById('user-container');
let currentUser = null;
let isEditMode = false;

// Uzmi userId iz URL parametara
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

function ucitajDetaljeKorisnika() {
    if (!userId) {
        userContainer.innerHTML = '<p class="error">Nije prosleđen ID korisnika u URL-u.</p>';
        return;
    }

    try {
        const usersRef = ref(db, 'korisnici');
        
        onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val();
            let korisnik = null;
            
            // Pronađi korisnika sa odgovarajućim ID-om
            for (const id in usersData) {
                if (id === userId) {
                    korisnik = usersData[id];
                    korisnik.id = id; // Dodajemo ID korisnika u objekat
                    break;
                }
            }

            if (korisnik) {
                currentUser = korisnik;
                prikaziDetaljeKorisnika(korisnik);
            } else {
                userContainer.innerHTML = '<p class="error">Korisnik nije pronađen.</p>';
            }
        }, (error) => {
            console.error("Greška pri učitavanju korisnika:", error);
            userContainer.innerHTML = '<p class="error">Došlo je do greške pri učitavanju podataka o korisniku.</p>';
        });

    } catch (error) {
        console.error("Greška pri učitavanju podataka: ", error);
        userContainer.innerHTML = '<p class="error">Došlo je do greške pri učitavanju podataka.</p>';
    }
}

function prikaziDetaljeKorisnika(korisnik) {
    userContainer.innerHTML = `
        <div class="user-profile ${isEditMode ? 'edit-mode' : ''}">
            <div class="user-header">
                <div class="user-avatar">
                    ${korisnik.ime ? korisnik.ime.charAt(0) : ''}${korisnik.prezime ? korisnik.prezime.charAt(0) : ''}
                </div>
                <h1 class="user-name">${korisnik.ime || ''} ${korisnik.prezime || ''}</h1>
                <p class="user-username">@${korisnik.korisnickoIme || 'username'}</p>
            </div>
            
            <div class="user-details">
                <div class="detail-group">
                    <h3 class="detail-title"><i class="fas fa-id-card"></i> Osnovne informacije</h3>
                    <div class="detail-content">
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <p class="detail-value">${korisnik.email || 'Nepoznato'}</p>
                            <input type="email" class="detail-input" value="${korisnik.email || ''}" data-field="email">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Telefon</span>
                            <p class="detail-value">${korisnik.telefon || 'Nepoznato'}</p>
                            <input type="text" class="detail-input" value="${korisnik.telefon || ''}" data-field="telefon">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Datum rođenja</span>
                            <p class="detail-value">${korisnik.datumRodjenja || 'Nepoznato'}</p>
                            <input type="date" class="detail-input" value="${korisnik.datumRodjenja || ''}" data-field="datumRodjenja">
                        </div>
                    </div>
                </div>
                
                <div class="detail-group">
                    <h3 class="detail-title"><i class="fas fa-map-marker-alt"></i> Lokacija</h3>
                    <div class="detail-content">
                        <div class="detail-item">
                            <span class="detail-label">Adresa</span>
                            <p class="detail-value">${korisnik.adresa || 'Nepoznato'}</p>
                            <input type="text" class="detail-input" value="${korisnik.adresa || ''}" data-field="adresa">
                        </div>
                    </div>
                </div>
                
                <div class="detail-group">
                    <h3 class="detail-title"><i class="fas fa-briefcase"></i> Profesionalne informacije</h3>
                    <div class="detail-content">
                        <div class="detail-item">
                            <span class="detail-label">Zanimanje</span>
                            <p class="detail-value">${korisnik.zanimanje || 'Nepoznato'}</p>
                            <input type="text" class="detail-input" value="${korisnik.zanimanje || ''}" data-field="zanimanje">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                ${isEditMode ? `
                    <button class="btn btn-save" id="saveBtn">Sačuvaj</button>
                    <button class="btn btn-cancel" id="cancelBtn">Otkaži</button>
                ` : `
                    <button class="btn btn-edit" id="editBtn">Izmeni podatke</button>
                    <button class="btn btn-delete" id="deleteBtn">Obriši profil</button>
                `}
            </div>
        </div>
    `;
    
    document.title = `${korisnik.ime || 'Korisnik'} ${korisnik.prezime || ''} - Profil | Library`;
    
    // Dodajemo event listenere za dugmad
    if (isEditMode) {
        document.getElementById('saveBtn').addEventListener('click', sacuvajIzmene);
        document.getElementById('cancelBtn').addEventListener('click', () => {
            isEditMode = false;
            prikaziDetaljeKorisnika(currentUser);
        });
    } else {
        document.getElementById('editBtn').addEventListener('click', () => {
            isEditMode = true;
            prikaziDetaljeKorisnika(currentUser);
        });
        document.getElementById('deleteBtn').addEventListener('click', prikaziPotvrduBrisanja);
    }
}

function sacuvajIzmene() {
    const inputs = document.querySelectorAll('.detail-input');
    const updatedData = {};
    
    inputs.forEach(input => {
        const field = input.getAttribute('data-field');
        updatedData[field] = input.value;
    });
    
    try {
        const userRef = ref(db, `korisnici/${currentUser.id}`);
        update(userRef, updatedData)
            .then(() => {
                alert('Podaci su uspešno ažurirani!');
                isEditMode = false;
                currentUser = {...currentUser, ...updatedData};
                prikaziDetaljeKorisnika(currentUser);
            })
            .catch(error => {
                console.error("Greška pri ažuriranju podataka:", error);
                alert('Došlo je do greške prilikom ažuriranja podataka.');
            });
    } catch (error) {
        console.error("Greška:", error);
        alert('Došlo je do greške prilikom ažuriranja podataka.');
    }
}

function prikaziPotvrduBrisanja() {
    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';
    dialog.innerHTML = `
        <div class="confirmation-content">
            <h3>Potvrda brisanja</h3>
            <p>Da li ste sigurni da želite da obrišete ovaj profil? Ova radnja je nepovratna.</p>
            <div class="confirmation-buttons">
                <button class="btn btn-cancel" id="cancelDeleteBtn">Otkaži</button>
                <button class="btn btn-delete" id="confirmDeleteBtn">Obriši</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', obrisiKorisnika);
}

function obrisiKorisnika() {
    try {
        const userRef = ref(db, `korisnici/${currentUser.id}`);
        remove(userRef)
            .then(() => {
                alert('Korisnik je uspešno obrisan!');
                localStorage.removeItem('currentUser');
                window.location.reload();
                if (window.location.href.includes('profile.html')) {
                    window.location.href = 'index.html';
                }
            })
            .catch(error => {
                console.error("Greška pri brisanju korisnika:", error);
                alert('Došlo je do greške prilikom brisanja korisnika.');
            });
    } catch (error) {
        console.error("Greška:", error);
        alert('Došlo je do greške prilikom brisanja korisnika.');
    } finally {
        const dialog = document.querySelector('.confirmation-dialog');
        if (dialog) {
            document.body.removeChild(dialog);
        }
    }
}

document.addEventListener('DOMContentLoaded', ucitajDetaljeKorisnika);