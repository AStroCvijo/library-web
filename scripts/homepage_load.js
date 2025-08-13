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

onValue(knjizareRef, (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('knjizare-list');
    container.innerHTML = '';

    if (!data) {
        container.innerHTML = '<p class="no-data">Trenutno nema dostupnih knjižara.</p>';
        return;
    }

    for (const id in data) {
        const knjizara = data[id];
        
        const card = document.createElement('div');
        card.className = 'bookstore-card';
        card.innerHTML = `
            <a href="bookstore.html?id=${knjizara.knjige}" class="bookstore-link">
                <div class="card-image">
                    <img src="${knjizara.logo || 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}" alt="${knjizara.naziv}">
                </div>
            </a>
            <div class="card-content">
                <h3>${knjizara.naziv}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${knjizara.adresa}</p>
                <p><i class="fas fa-calendar-alt"></i> Godina osnivanja: ${knjizara.godinaOsnivanja}</p>
                <p><i class="fas fa-phone"></i> ${knjizara.kontaktTelefon}</p>
                <p><i class="fas fa-envelope"></i> ${knjizara.email}</p>
            </div>
        `;
        
        container.appendChild(card);
    }
});