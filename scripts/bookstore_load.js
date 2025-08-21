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
let allBooks = [];

// Function for redirecting to error page
function redirectToErrorPage(errorCode) {
    window.location.href = `error.html?message=${errorCode}`;
}

// Function to highlight search terms in text
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.toString().replace(regex, '<span class="highlight">$1</span>');
}

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function loadBookstoreDetails() {
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
                displayBookstoreDetails(knjizaraInfo);
            } else {
                detaljiContainer.innerHTML = '<p>Knjižara nije pronađena.</p>';
            }

            // Load the books from this ID
            const knjigeRef = ref(db, `knjige/${knjigeId}`);
            onValue(knjigeRef, (booksSnapshot) => {
                allBooks = booksSnapshot.val();
                displayBooks(allBooks);
                setupSearch();
            }, (error) => {
                console.error("Error loading books:", error);
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

// Function to set up search functionality
function setupSearch() {
    const searchTitleInput = document.getElementById('searchTitleInput');
    const searchAuthorInput = document.getElementById('searchAuthorInput');
    const searchGenreInput = document.getElementById('searchGenreInput');
    const searchButton = document.getElementById('searchBooksButton');
    const clearSearch = document.getElementById('clearBooksSearch');

    searchButton.addEventListener('click', () => {
        const searchTerms = {
            title: searchTitleInput.value.trim(),
            author: searchAuthorInput.value.trim(),
            genre: searchGenreInput.value.trim()
        };
        filterBooks(searchTerms);
        clearSearch.classList.toggle('hidden', !hasSearchTerms(searchTerms));
    });

    // Search on Enter key in any input field
    [searchTitleInput, searchAuthorInput, searchGenreInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerms = {
                    title: searchTitleInput.value.trim(),
                    author: searchAuthorInput.value.trim(),
                    genre: searchGenreInput.value.trim()
                };
                filterBooks(searchTerms);
                clearSearch.classList.toggle('hidden', !hasSearchTerms(searchTerms));
            }
        });
    });

    clearSearch.addEventListener('click', () => {
        searchTitleInput.value = '';
        searchAuthorInput.value = '';
        searchGenreInput.value = '';
        displayBooks(allBooks);
        clearSearch.classList.add('hidden');
    });
}

// Function to check if there are search terms
function hasSearchTerms(terms) {
    return terms.title || terms.author || terms.genre;
}

// Function to filter books based on search terms
function filterBooks(searchTerms) {
    if (!hasSearchTerms(searchTerms)) {
        displayBooks(allBooks);
        return;
    }

    const filteredBooks = {};
    const lowerTitle = searchTerms.title.toLowerCase();
    const lowerAuthor = searchTerms.author.toLowerCase();
    const lowerGenre = searchTerms.genre.toLowerCase();

    for (const bookId in allBooks) {
        const book = allBooks[bookId];
        if (book && typeof book === 'object') {
            const matchesTitle = !searchTerms.title || 
                (book.naziv && book.naziv.toLowerCase().includes(lowerTitle));
            const matchesAuthor = !searchTerms.author || 
                (book.autor && book.autor.toLowerCase().includes(lowerAuthor));
            const matchesGenre = !searchTerms.genre || 
                (book.zanr && book.zanr.toLowerCase().includes(lowerGenre));

            if (matchesTitle && matchesAuthor && matchesGenre) {
                filteredBooks[bookId] = book;
            }
        }
    }

    displayBooks(filteredBooks, searchTerms);
}

// Function to display bookstore details
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
    document.title = `${knjizara.naziv} - Libraries`;
}

// Function to display books
function displayBooks(booksData, searchTerms = {}) {
    knjigeContainer.innerHTML = '';

    if (!booksData || Object.keys(booksData).length === 0) {
        knjigeContainer.innerHTML = hasSearchTerms(searchTerms || {}) 
            ? '<p class="no-data">Nema rezultata za vašu pretragu.</p>'
            : '<p class="no-data">Ova knjižara trenutno nema knjiga u ponudi.</p>';
        return;
    }

    for (const bookId in booksData) {
        const knjiga = booksData[bookId];
        if (knjiga && typeof knjiga === 'object') {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <a href="book.html?id=${knjigeId}&book=${bookId}" class="book-link">
                    <div class="card-image">
                        <img src="${knjiga.slike?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}" alt="${knjiga.naziv}">
                    </div>
                </a>
                <div class="card-content">
                    <h3>${highlightSearchTerm(knjiga.naziv, searchTerms.title)}</h3>
                    <p><i class="fas fa-user"></i> ${highlightSearchTerm(knjiga.autor, searchTerms.author)}</p>
                    <p><i class="fas fa-tags"></i> ${highlightSearchTerm(knjiga.zanr, searchTerms.genre)}</p>
                    <p><i class="fas fa-money-bill-wave"></i> ${knjiga.cena} RSD</p>
                    <p><i class="fas fa-book-open"></i> ${knjiga.brojStrana} strana</p>
                    <p class="book-description">${knjiga.opis}</p>
                </div>
            `;
            knjigeContainer.appendChild(card);
        }
    }
}

document.addEventListener('DOMContentLoaded', loadBookstoreDetails);