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

const knjizareRef = ref(db, 'knjizare');
let allBookstores = [];

// Function to highlight search terms in text
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to display bookstores with optional search filtering
function displayBookstores(bookstores, searchTerm = '') {
    const container = document.getElementById('knjizare-list');
    container.innerHTML = '';

    if (!bookstores || Object.keys(bookstores).length === 0) {
        container.innerHTML = '<p class="no-data">Trenutno nema dostupnih knjižara.</p>';
        return;
    }

    // Filter bookstores if search term exists
    const filteredBookstores = searchTerm 
        ? Object.fromEntries(
            Object.entries(bookstores).filter(([_, knjizara]) => 
                knjizara.naziv.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        : bookstores;

    if (Object.keys(filteredBookstores).length === 0) {
        container.innerHTML = '<p class="no-data">Nema rezultata za vašu pretragu.</p>';
        return;
    }

    // Display all or filtered bookstores
    for (const id in filteredBookstores) {
        const knjizara = filteredBookstores[id];
        
        const card = document.createElement('div');
        card.className = 'bookstore-card';
        card.innerHTML = `
            <a href="bookstore.html?id=${knjizara.knjige}" class="bookstore-link">
                <div class="card-image">
                    <img src="${knjizara.logo || 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}" alt="${knjizara.naziv}">
                </div>
            </a>
            <div class="card-content">
                <h3>${highlightSearchTerm(knjizara.naziv, searchTerm)}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${knjizara.adresa}</p>
                <p><i class="fas fa-calendar-alt"></i> Godina osnivanja: ${knjizara.godinaOsnivanja}</p>
                <p><i class="fas fa-phone"></i> ${knjizara.kontaktTelefon}</p>
                <p><i class="fas fa-envelope"></i> ${knjizara.email}</p>
            </div>
        `;
        
        container.appendChild(card);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load all bookstores initially
    onValue(knjizareRef, (snapshot) => {
        allBookstores = snapshot.val();
        displayBookstores(allBookstores);
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearSearch = document.getElementById('clearSearch');

    // Perform search when button is clicked
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        displayBookstores(allBookstores, searchTerm);
        clearSearch.classList.toggle('hidden', !searchTerm);
    });

    // Perform search when Enter is pressed
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            displayBookstores(allBookstores, searchTerm);
            clearSearch.classList.toggle('hidden', !searchTerm);
        }
    });

    // Clear search results
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        displayBookstores(allBookstores);
        clearSearch.classList.add('hidden');
    });
});