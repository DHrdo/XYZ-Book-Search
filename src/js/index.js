//***********************************************************************************************************/
//                            INDEX.JS                                                                      //
// Questo è il progetto finale del corso di Javascript Advanced di Start2Impact University.
//
// Versione: 1.0.8
// Data di creazione: 2023-12-10
// Data di ultima modifica: 2023-12-23
// Autore: Denis Accardo
// GitHub: https://github.com/DHrdo
// Portfolio: https://dhrdo.github.io
// LinkedIn: https://www.linkedin.com/in/denis-accardo-806907135
// 
//***********************************************************************************************************/

// -----------------------------*****IMPORTAZIONE DI MODULI E RISORSE NECESSARIE*****--------------------------------


import '/src/sass/style.scss';  // Importa il foglio di stile Sass
import BACKGROUND_IMG from '/src/images/background.jpg';  // Importa l'immagine di sfondo
import { fetchBooks, fetchForBookDescription } from './fetchBooks.js';
import { createPagination, changePagesClick, handlePrevPagesClick, handleNextPagesClick } from './pagination.js';

// Selezione dell'elemento di sfondo e impostazione della sua sorgente
const background = document.querySelector('.background');
background.src = BACKGROUND_IMG;


// -----------------------------*****INIZIALIZZAZIONE DELLE VARIABILI*****-------------------------------------------


// Ottenimento del riferimento al pulsante di ricerca
const searchBtn = document.getElementById('search-button');

export let books = { };  // oggetto per memorizzare i dettagli dei libri recuperati
export let currentFocusIndexObj = { currentFocusIndex: 0 };  // Indice del libro attualmente in primo piano


//** SETTINGS DELLA PAGINAZIONE **/
export const BOOKS_LIMIT = 200;  // Limite di libri da recuperare                                     [ ** MODIFICARE SE E' NECESSARIO VARIARE IL LIMITE DI FETCHING DEI LIBRI **]
export const PAGINATION_LIMIT = 12;  // Limite di pagine per la paginazione                           [ ** MODIFICARE SE E' NECESSARIO VARIARE IL LIMITE DI LIBRI PER PAGINA **]
export const MAX_VISIBLE_PAGES = 5;  // Limite di pagine visibili all'utente per la paginazione       [ ** MODIFICARE SE E' NECESSARIO VARIARE IL LIMITE DI PAGINE VISIBILI PRIMA DI SCORRERE CON IL TASTO '>' **]
// -----------------------------------------------------------------------------------------------------------------

// Variabili globali per la paginazione
export let skipIndexObj = { skipIndex: 0 }; // Indice di partenza per la paginazione
export let currentPageIndexObj = { currentPageIndex: 1 }; // Inizializazione della pagina corrente
export let IndexScrollPaginationNumbersObj = { IndexScrollPaginationNumbers: 0 } // Variabile per controllo del numero delle volte che le viene scorse

let isSearchInProgress = false; // Variabile per controllare se la ricerca è in corso, in modo da non effettuare chiamate sovrapposte
export let isPaginationCreatedObj = { isPaginationCreated: false }; // Variabile per controllare se la paginazione è stata già creata
export let paginationBox; // Variabile per memorizzare il div della paginazione


// Event listener per il pulsante di ricerca
searchBtn.addEventListener('click', async () => {
    console.log('ciao')
    let userInput = document.getElementById('search-city').value;
    let bookCards = document.querySelectorAll('.book-card');

    // Verifica se una ricerca è già in corso
    if (isSearchInProgress) {
        return;
    }

    isSearchInProgress = true;

    books = {};

    // Pulizia dei risultati di ricerca precedenti
    if (bookCards.length > 0) {
        bookCards.forEach(book => book.remove());
        currentFocusIndexObj.currentFocusIndex = -1;
        try {
            // Recupero di nuovi libri in base all'input dell'utente
            await fetchBooks(userInput);
            // Scorrimento ai nuovi risultati di ricerca
            scrollpage();

        } catch (error) {
            console.error(error);

        } finally {
            isSearchInProgress = false;
        }
    } else {
        if (userInput === "") { // Se l'utente non ha inserito alcun valore
            alert('Please insert a valid book genre. Example: "fantasy, crime, horror, ..."');
            return;
        } else {
            try {
                // Recupero di libri in base all'input dell'utente
                await fetchBooks(userInput);
            } catch (error) {
                console.log(error);
            } finally {
                isSearchInProgress = false;
            }
        }
    }
});

// Funzione per scorrere la pagina a una posizione specifica dopo la ricerca
function scrollpage() {
    window.scrollTo({
        top: 350,  // Valore specifico per scorrere la pagina
        left: 0,
        behavior: "smooth",
    });
};
// ***------------------------------------------------------------------------------------------------------------------------------------------





// *** GESTIONE DOM PER LE CARD DEI LIBRI ***---------------------------------------------------------------------------------------------------

// Funzioni per creare i singoli elementi html appartenenti alla card di ogni libro
export function createCard(className) {
    const card = document.createElement('div');
    card.className = className;

    return card;
};

// Aggiunta del titolo della card
export function createCardTitle(books, i, className) {
    const title = document.createElement('h2');
    title.textContent = books[i].title;
    title.className = className;

    return title;
};

// Aggiunta dell'autore della card
export function createCardAuthor(books, i, className) {
    const author = document.createElement('p');
    author.className = className;
    author.textContent = books[i].author;

    return author;
};

// Aggiunta della copertina della card
export function createCardCover(books, i, className) {
    const cover = document.createElement('img');
    cover.src = `https://covers.openlibrary.org/b/id/${books[i].cover_id}-M.jpg`;
    cover.alt = books[i].title;
    cover.className = className;

    return cover;
};

// Aggiunta della box di descrizione
export function createCardDescriptionBox(className) {
    const descriptionBox = document.createElement('div');
    descriptionBox.className = className;

    return descriptionBox;
};

// Aggiunta del testo del box della descrizione
export function createCardDescriptionText(className) {
    const descriptionBox = document.querySelector('.description-box');
    const descriptionText = document.createElement('p');
    descriptionText.className = className;

    return descriptionText;
};

// Funzione per mettere insieme, all'interno della card, i vari elementi creati precedentemente
export async function createBookCards(element, eParent, books) {

    for (let i = 0; i < element && i < BOOKS_LIMIT; i++) {

        const CARD = createCard('book-card');
        const CARD_TITLE = createCardTitle(books, i, 'book-card-title');
        const CARD_AUTHOR = createCardAuthor(books, i, 'authors');
        const CARD_COVER = createCardCover(books, i, 'book-cover');
        const CARD_DESCRIPTION_BOX = createCardDescriptionBox('description-box');
        const CARD_DESCRIPTION_TEXT = createCardDescriptionText('description-text');
        CARD_DESCRIPTION_BOX.appendChild(CARD_DESCRIPTION_TEXT);

        // Aggiunta di elementi alla scheda e al contenitore principale
        CARD.append(CARD_TITLE, CARD_AUTHOR, CARD_COVER, CARD_DESCRIPTION_BOX);
        eParent.appendChild(CARD);

        // Quando si raggiunge il limite di elementi per la prima pagina, crea più pagine

        if (i === PAGINATION_LIMIT - 1) {

            break;
        }
    };


    fetchForBookDescription(books);

    if (!isPaginationCreatedObj.isPaginationCreated) {
        isPaginationCreatedObj.isPaginationCreated = true;
        paginationBox = createPagination();
        const main = document.querySelector('.main');
        main.appendChild(paginationBox);


        //Imposta il primo pulsante come attivo in modo che venga visualizzato "evidenziato"
        const paginationButton = document.querySelectorAll('.pagination-button');
        paginationButton.forEach((button, index) => {
            if (index === 0) {
                button.classList.add('active-button');
            }
        });

        changePagesClick();
    } else {
        changePagesClick();
    }
    handlePrevPagesClick();
    handleNextPagesClick();
};
// ***----------------------------------------------------------------------------------------------------------------------------
