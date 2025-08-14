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

// Get bookstore ID and book ID from URL
const urlParams = new URLSearchParams(window.location.search);
const knjigeId = urlParams.get('id');
const bookId = urlParams.get('book');

// Function for redirecting to error page
function redirectToErrorPage(errorCode) {
    window.location.href = `error.html?message=${errorCode}`;
}

const detaljiContainer = document.getElementById('knjizara-info');
const bookContainer = document.getElementById('book-details-container');

async function loadBookDetails() {
    if (!knjigeId || !bookId) {
        bookContainer.innerHTML = '<p>Nije pronađena knjiga.</p>';
        return;
    }

    try {
        // Load the bookstore info to get its name
        const knjizareRef = ref(db, 'knjizare');
        onValue(knjizareRef, (snapshot) => {
            const knjizareData = snapshot.val();
            let knjizaraInfo = null;
            
            // Find the bookstore with that Id
            for (const id in knjizareData) {
                if (knjizareData[id].knjige === knjigeId) {
                    knjizaraInfo = knjizareData[id];
                    break;
                }
            }

            if (knjizaraInfo) {
                displayBookstoreDetails(knjizaraInfo);
            } else {
                detaljiContainer.innerHTML = '<p>Knjižara nije pronađena.</p>';
            }

            // Load the specific book
            const knjigaRef = ref(db, `knjige/${knjigeId}/${bookId}`);
            onValue(knjigaRef, (bookSnapshot) => {
                const bookData = bookSnapshot.val();
                displayBook(bookData, knjizaraInfo);
            }, (error) => {
                console.error("Error loading book:", error);
                redirectToErrorPage(error.message);
            });
        }, (error) => {
            console.error("Error loading bookstores:", error);
            redirectToErrorPage(error.message);
        });

    } catch (error) {
        console.error("Greška pri učitavanju podataka: ", error);
        redirectToErrorPage(error.message);
    }
}

// Function for displaying the bookstore details
function displayBookstoreDetails(knjizara) {
    detaljiContainer.innerHTML = `
        <div class="bookstore-details-header">
            <h1>${knjizara.naziv}</h1>
            <p><i class="fas fa-map-marker-alt"></i> ${knjizara.adresa}</p>
            <p><i class="fas fa-calendar-alt"></i> Godina osnivanja: ${knjizara.godinaOsnivanja}</p>
            <p><i class="fas fa-phone"></i> ${knjizara.kontaktTelefon}</p>
            <p><i class="fas fa-envelope"></i> ${knjizara.email}</p>
        </div>
    `;
}

// Function for displaying the book
function displayBook(knjiga, knjizara) {
    if (!knjiga) {
        bookContainer.innerHTML = '<p class="no-data">Knjiga nije pronađena.</p>';
        return;
    }

    // Set the page title
    document.title = `${knjiga.naziv} - ${knjizara.naziv} - Libraries`;

    // Create thumbnail images
    const thumbnails = knjiga.slike?.map((slika, index) => `
        <div class="thumbnail" onclick="changeMainImage('${slika}')">
            <img src="${slika}" alt="${knjiga.naziv} - slika ${index + 1}">
        </div>
    `).join('') || '';

    bookContainer.innerHTML = `
        <a href="bookstore.html?id=${knjigeId}" class="back-link">
            <i class="fas fa-arrow-left"></i> Nazad na knjižaru
        </a>
        <div class="book-details">
            <div class="book-images">
                <div class="main-image">
                    <img src="${knjiga.slike?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}" 
                         alt="${knjiga.naziv}" id="main-book-image">
                </div>
                <div class="thumbnail-container">
                    ${thumbnails}
                </div>
            </div>
            <div class="book-info">
                <h1 class="book-title">${knjiga.naziv}</h1>
                <h2 class="book-author">${knjiga.autor}</h2>
                
                <div class="book-meta">
                    <div class="book-meta-item">
                        <i class="fas fa-tags"></i>
                        <span>${knjiga.zanr}</span>
                    </div>
                    <div class="book-meta-item">
                        <i class="fas fa-book"></i>
                        <span>${knjiga.format}</span>
                    </div>
                    <div class="book-meta-item">
                        <i class="fas fa-book-open"></i>
                        <span>${knjiga.brojStrana} strana</span>
                    </div>
                </div>
                
                <div class="book-price">${knjiga.cena} RSD</div>
                
                <div class="book-description">
                    <h3>Opis</h3>
                    <p>${knjiga.opis}</p>
                </div>
            </div>
        </div>
    `;
}

// Global function to change the main image
window.changeMainImage = function(imageUrl) {
    const mainImage = document.getElementById('main-book-image');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
};

document.addEventListener('DOMContentLoaded', loadBookDetails);