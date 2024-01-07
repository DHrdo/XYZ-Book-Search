import { getBooks, getSkipIndex, getIsPaginationCreated, setIsPaginationCreated, fetchForBookDescription } from "./fetchBooks"; // Indice di partenza per la paginazione } from "./fetchBooks";
import { PAGINATION_LIMIT, changePagesClick, handleNextPagesClick, handlePrevPagesClick, createPagination } from "./pagination";

export const BOOKS_LIMIT = 200;  // Limite di libri da recuperare                                     [ ** MODIFICARE SE E' NECESSARIO VARIARE IL LIMITE DI FETCHING DEI LIBRI **]
// *** GESTIONE DOM PER LE CARD DEI LIBRI ***---------------------------------------------------------------------------------------------------

let newBooks = getBooks(); // Variabile per memorizzare i dettagli dei libri recuperati
let paginationBox; // Variabile per memorizzare il div della paginazione

// Funzioni per creare i singoli elementi html appartenenti alla card di ogni libro
function createCard(className) {
    const card = document.createElement('div');
    card.className = className;

    return card;
};

// Aggiunta del titolo della card
function createCardTitle(newBooks, i, className) {
    const title = document.createElement('h2');
    title.textContent = newBooks[i].title;
    title.className = className;

    return title;
};

// Aggiunta dell'autore della card
function createCardAuthor(newBooks, i, className) {
    const author = document.createElement('p');
    author.className = className;
    author.textContent = newBooks[i].author;

    return author;
};

// Aggiunta della copertina della card
function createCardCover(newBooks, i, className) {
    const cover = document.createElement('img');
    cover.src = `https://covers.openlibrary.org/b/id/${newBooks[i].cover_id}-M.jpg`;
    cover.alt = newBooks[i].title;
    cover.className = className;

    return cover;
};

// Aggiunta della box di descrizione
function createCardDescriptionBox(className) {
    const descriptionBox = document.createElement('div');
    descriptionBox.className = className;

    return descriptionBox;
};

// Aggiunta del testo del box della descrizione
function createCardDescriptionText(className) {
    const descriptionText = document.createElement('p');
    descriptionText.className = className;

    return descriptionText;
};

// Funzione per mettere insieme, all'interno della card, i vari elementi creati precedentemente
export async function createBookCards(element, eParent, newBooks) {

    const remainingBooks = BOOKS_LIMIT - getSkipIndex();
    console.log(remainingBooks);
    console.log(getSkipIndex())

    for (let i = 0; i < element && i < remainingBooks; i++) {

        const CARD = createCard('book-card');
        const CARD_TITLE = createCardTitle(newBooks, i, 'book-card-title');
        const CARD_AUTHOR = createCardAuthor(newBooks, i, 'authors');
        const CARD_COVER = createCardCover(newBooks, i, 'book-cover');
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


    fetchForBookDescription(newBooks);

    if (!getIsPaginationCreated()) {
        setIsPaginationCreated(true);
        paginationBox = createPagination();
        const main = document.querySelector('.main');
        main.appendChild(paginationBox);


        //Imposta il primo pulsante come attivo in modo che venga visualizzato "evidenziata"
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