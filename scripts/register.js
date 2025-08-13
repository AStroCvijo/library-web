import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, push, child, get, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// Otvaranje modalnih prozora
document.querySelector('a[data-modal="login"]').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginModal').style.display = 'block';
});

document.querySelector('a[data-modal="register"]').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerModal').style.display = 'block';
});

// Zatvaranje preko X
document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.close).style.display = 'none';
    });
});

// Klik van prozora zatvara
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Zatvaranje svih modalnih prozora
function closePopups() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// === Registracija ===
function register(event) {
    event.preventDefault();
    
    const ime = document.getElementById("regIme").value.trim();
    const prezime = document.getElementById("regPrezime").value.trim();
    const korisnickoIme = document.getElementById("regKorisnickoIme").value.trim();
    const lozinka = document.getElementById("regLozinka").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const adresa = document.getElementById("regAdresa").value.trim();
    const telefon = document.getElementById("regTelefon").value.trim();
    const datumRodjenja = document.getElementById("regDatumRodjenja").value;
    const zanimanje = document.getElementById("regZanimanje").value.trim();

    if (!ime || !prezime || !korisnickoIme || !lozinka || !email) {
        alert("Molimo popunite sva polja!");
        return;
    }

    // Provera da li korisničko ime već postoji
    const usersRef = ref(db, 'korisnici');
    get(usersRef).then((snapshot) => {
        let usernameExists = false;
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                if (user.korisnickoIme === korisnickoIme) {
                    usernameExists = true;
                }
            });
        }

        if (usernameExists) {
            alert("Korisničko ime već postoji. Molimo izaberite drugo.");
            return;
        }

        // Ako korisničko ime ne postoji, registrujemo novog korisnika
        const newUserRef = push(usersRef);
        set(newUserRef, {
            adresa: adresa,
            datumRodjenja: datumRodjenja,
            email: email,
            ime: ime,
            korisnickoIme: korisnickoIme,
            lozinka: lozinka,
            prezime: prezime,
            telefon: telefon,
            zanimanje: zanimanje
        }).then(() => {
            alert("Registracija uspešna! Sada se možete prijaviti.");
            closePopups();
            document.querySelector('#registerModal form').reset();
        }).catch((error) => {
            console.error("Greška prilikom registracije:", error);
            alert("Došlo je do greške prilikom registracije. Pokušajte ponovo.");
        });
    });
}

// === Login ===
function login(event) {
    event.preventDefault();
    
    const korisnickoIme = document.getElementById("loginUsername").value.trim();
    const lozinka = document.getElementById("loginPassword").value.trim();

    if (!korisnickoIme || !lozinka) {
        alert("Unesite korisničko ime i lozinku!");
        return;
    }

    const usersRef = ref(db, 'korisnici');
    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            let userFound = false;
            let userData = null;
            let userId = null;
            
            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                if (user.korisnickoIme === korisnickoIme && user.lozinka === lozinka) {
                    userFound = true;
                    userData = user;
                    userId = childSnapshot.key;
                }
            });

            if (userFound) {
                alert(`Uspešno ste se prijavili, ${userData.ime} ${userData.prezime}!`);
                
                // Čuvanje podataka o korisniku u localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    id: userId,
                    ...userData
                }));
                
                // Sakrivanje login/register linkova
                document.querySelectorAll('.reg').forEach(el => {
                    el.style.display = 'none';
                });
                
                closePopups();
                document.querySelector('#loginModal form').reset();
                
                // Osvježavanje stranice
                window.location.reload();
            } else {
                alert("Pogrešno korisničko ime ili lozinka!");
            }
        } else {
            alert("Nema registrovanih korisnika!");
        }
    }).catch((error) => {
        console.error("Greška prilikom prijave:", error);
        alert("Došlo je do greške prilikom prijave. Pokušajte ponovo.");
    });
}

// Dodavanje event listenera za forme
document.querySelector('#loginModal form').addEventListener('submit', login);
document.querySelector('#registerModal form').addEventListener('submit', register);

// Provera da li je korisnik već prijavljen prilikom učitavanja stranice
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        document.querySelectorAll('.reg').forEach(el => {
            el.style.display = 'none';
        });
        
        // Dodavanje linka ka profilu u navigaciji
        const userNav = document.createElement('li');
        userNav.innerHTML = `<a href="profile.html?id=${userData.id}">${userData.ime} ${userData.prezime}</a>`;
        const logoutNav = document.createElement('li');
        logoutNav.innerHTML = `<a class="btn-logout" id="logout-btn">Odjavi se</a>`;
        document.querySelector('nav ul').appendChild(userNav);
        document.querySelector('nav ul').appendChild(logoutNav);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.reload();
            if (window.location.href.includes('profile.html')) {
                window.location.href = 'index.html';
            }
        });
    }
});