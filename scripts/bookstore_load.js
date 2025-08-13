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

// Get bookstore ID from URL
const urlParams = new URLSearchParams(window.location.search);
const knjigeId = urlParams.get('id');

const detaljiContainer = document.getElementById('knjizara-info');
const knjigeContainer = document.getElementById('knjige-container');

async function ucitajDetaljeKnjizare() {
    if (!knjigeId) {
        detaljiContainer.innerHTML = '<p>Nije pronađena knjižara.</p>';
        return;
    }

    try {
        // Load the bookstore info to get its name
        const knjizareRef = ref(db, 'knjizare');
        onValue(knjizareRef, (snapshot) => {
            const knjizareData = snapshot.val();
            let knjizaraInfo = null;
            
            // Find the bookstore that has these books
            for (const id in knjizareData) {
                if (knjizareData[id].knjige === knjigeId) {
                    knjizaraInfo = knjizareData[id];
                    break;
                }
            }

            if (knjizaraInfo) {
                prikaziDetaljeKnjizare(knjizaraInfo);
            } else {
                detaljiContainer.innerHTML = '<p>Knjižara nije pronađena.</p>';
            }

            // Load the books from this ID
            const knjigeRef = ref(db, `knjige/${knjigeId}`);
            onValue(knjigeRef, (booksSnapshot) => {
                const booksData = booksSnapshot.val();
                prikaziKnjige(booksData, knjigeId);
            }, (error) => {
                console.error("Error loading books:", error);
                knjigeContainer.innerHTML = '<p class="error">Došlo je do greške pri učitavanju knjiga.</p>';
            });
        }, (error) => {
            console.error("Error loading bookstores:", error);
            detaljiContainer.innerHTML = '<p class="error">Došlo je do greške pri učitavanju podataka o knjižari.</p>';
        });

    } catch (error) {
        console.error("Greška pri učitavanju podataka: ", error);
        detaljiContainer.innerHTML = '<p class="error">Došlo je do greške pri učitavanju podataka.</p>';
    }
}

// Function for displaying the bookstore details
function prikaziDetaljeKnjizare(knjizara) {
    detaljiContainer.innerHTML = `
        <div class="bookstore-details-header">
            <h1>${knjizara.naziv}</h1>
            <p><i class="fas fa-map-marker-alt"></i> ${knjizara.adresa}</p>
            <p><i class="fas fa-calendar-alt"></i> Godina osnivanja: ${knjizara.godinaOsnivanja}</p>
            <p><i class="fas fa-phone"></i> ${knjizara.kontaktTelefon}</p>
            <p><i class="fas fa-envelope"></i> ${knjizara.email}</p>
        </div>
    `;
    document.title = `${knjizara.naziv} - Libraries`;
}

// Function for displaying all the books
function prikaziKnjige(booksData, knjigeId) {
    knjigeContainer.innerHTML = '';

    if (!booksData) {
        knjigeContainer.innerHTML = '<p class="no-data">Ova knjižara trenutno nema knjiga u ponudi.</p>';
        return;
    }

    for (const bookId in booksData) {
        const knjiga = booksData[bookId];
        if (knjiga && typeof knjiga === 'object') {
            dodajKnjigu(knjiga, bookId, knjigeId);
        }
    }
}

// Function for displaying a single book
function dodajKnjigu(knjiga, bookId) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <a href="book.html?id=${knjigeId}&book=${bookId}" class="book-link">
            <div class="card-image">
                <img src="${knjiga.slike?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}" alt="${knjiga.naziv}">
            </div>
        </a>
        <div class="card-content">
            <h3>${knjiga.naziv}</h3>
            <p><i class="fas fa-user"></i> ${knjiga.autor}</p>
            <p><i class="fas fa-tags"></i> ${knjiga.zanr}</p>
            <p><i class="fas fa-money-bill-wave"></i> ${knjiga.cena} RSD</p>
            <p><i class="fas fa-book-open"></i> ${knjiga.brojStrana} strana</p>
            <p class="book-description">${knjiga.opis}</p>
        </div>
    `;
    knjigeContainer.appendChild(card);
}

document.addEventListener('DOMContentLoaded', ucitajDetaljeKnjizare);