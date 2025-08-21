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

// Function for redirecting to error page
function redirectToErrorPage(errorCode) {
    window.location.href = `error.html?message=${errorCode}`;
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function for opening modal windows
document.querySelector('a[data-modal="login"]').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginModal').style.display = 'block';
});

document.querySelector('a[data-modal="register"]').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerModal').style.display = 'block';
});

// Function for closing with X
document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.close).style.display = 'none';
    });
});

// Function for closing the window when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Function for closing all modal windows
function closePopups() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Function for handling the registration
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

    // Check if the username already exists
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

        // If the username doesnt already exist we add the new user
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
            redirectToErrorPage(error.message);
        });
    });
}

// Function for handling the login
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
                
                // Save the user info in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    id: userId,
                    ...userData
                }));
                
                // Hide login/register buttons
                document.querySelectorAll('.reg').forEach(el => {
                    el.style.display = 'none';
                });
                
                closePopups();
                document.querySelector('#loginModal form').reset();
                
                // Refresh the page
                window.location.reload();
            } else {
                alert("Pogrešno korisničko ime ili lozinka!");
            }
        } else {
            alert("Nema registrovanih korisnika!");
        }
    }).catch((error) => {
        console.error("Greška prilikom prijave:", error);
        redirectToErrorPage(error.message);
    });
}

// Event listeners for forms
document.querySelector('#loginModal form').addEventListener('submit', login);
document.querySelector('#registerModal form').addEventListener('submit', register);

// Check if the user is already logged in when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        document.querySelectorAll('.reg').forEach(el => {
            el.style.display = 'none';
        });

        // Adding a link to the profile in the navigation
        const userNav = document.createElement('li');
        userNav.innerHTML = `<a href="profile.html?id=${userData.id}">${userData.ime} ${userData.prezime}</a>`;
        const logoutNav = document.createElement('li');
        logoutNav.innerHTML = `<a class="btn-logout" id="logout-btn">Odjavi se</a>`;
        document.querySelector('nav ul').appendChild(userNav);
        document.querySelector('nav ul').appendChild(logoutNav);
    }
});

// Function for handling the logout
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