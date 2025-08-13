import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
                    break;
                }
            }

            if (korisnik) {
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
        <div class="user-profile">
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
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Telefon</span>
                            <p class="detail-value">${korisnik.telefon || 'Nepoznato'}</p>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Datum rođenja</span>
                            <p class="detail-value">${korisnik.datumRodjenja || 'Nepoznato'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="detail-group">
                    <h3 class="detail-title"><i class="fas fa-map-marker-alt"></i> Lokacija</h3>
                    <div class="detail-content">
                        <div class="detail-item">
                            <span class="detail-label">Adresa</span>
                            <p class="detail-value">${korisnik.adresa || 'Nepoznato'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="detail-group">
                    <h3 class="detail-title"><i class="fas fa-briefcase"></i> Profesionalne informacije</h3>
                    <div class="detail-content">
                        <div class="detail-item">
                            <span class="detail-label">Zanimanje</span>
                            <p class="detail-value">${korisnik.zanimanje || 'Nepoznato'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.title = `${korisnik.ime || 'Korisnik'} ${korisnik.prezime || ''} - Profil | Library`;
}

document.addEventListener('DOMContentLoaded', ucitajDetaljeKorisnika);