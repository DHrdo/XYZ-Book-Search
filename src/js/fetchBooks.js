import axios from 'axios';  // Utilizzo di axios per effettuare chiamate HTTP
import ERROR_IMAGE from '/src/images/noResults.png';  // Importa l'immagine di sfondo
import { scrollpage } from './index';
import { BOOKS_LIMIT, createBookCards } from './createBookCards';
import { PAGINATION_LIMIT, setIndexScrollPaginationNumbers, setCurrentPageIndex } from "./pagination";

export let books = {};  // oggetto per memorizzare i dettagli dei libri recuperati
export function setBooks(newBooks) { books = newBooks };
export function getBooks() { return books };

export let skipIndex = 0; // Indice di partenza per la paginazione
export function setSkipIndex(newSkipIndex) { skipIndex = newSkipIndex };
export function getSkipIndex() { return skipIndex };

export let isPaginationCreated = false; // Variabile per controllare se la paginazione è stata già creata
export function setIsPaginationCreated(newIsPaginationCreated) { isPaginationCreated = newIsPaginationCreated };
export function getIsPaginationCreated() { return isPaginationCreated };

export let currentFocusIndex = 0;  // Indice del libro attualmente in primo piano
export function getCurrentFocusIndex() { return currentFocusIndex };
export function setCurrentFocusIndex(newCurrentFocusIndex) { currentFocusIndex = newCurrentFocusIndex };


// Funzione per recuperare libri in base all'input dell'utente
export async function fetchBooks(userInput) {
    const divSearchResults = document.querySelector('.search-results');
    Object.assign({}, getBooks());
    divSearchResults.innerHTML = '';

    try {

        // Se l'oggetto ha già degli elementi allora crea le card dei libri e fetcha le descrizioni
        if (Object.keys(getBooks()).length) {

            // Ottieni solo gli elementi corrispondenti alla paginazione
            await createBookCards(PAGINATION_LIMIT, divSearchResults, Object.values(getBooks()).slice(getSkipIndex(), getSkipIndex() + PAGINATION_LIMIT));
            await fetchForBookDescription(Object.values(getBooks()).slice(getSkipIndex(), getSkipIndex() + PAGINATION_LIMIT));

        } else {

            // Altrimenti, fetcha i libri con dei criteri di ricerca specifici
            const response = await axios.get(`https://openlibrary.org/subjects/${userInput}.json?limit=${BOOKS_LIMIT}&offset=${getSkipIndex()}`);
            const data = response.data;
            isPaginationCreated = false;

            // Rimuove la paginazione creata in precedenza se esiste e reinizializza le variabili di indice
            const pagination = document.querySelector('.pagination-box');
            if (pagination) {
                pagination.remove();
                setIndexScrollPaginationNumbers(0);
                setCurrentPageIndex(0);
            }

            console.log(data); // DEBUG

            // Crea un oggetto per memorizzare i dettagli dei libri
            data.works.forEach(async (work, i) => {
                getBooks()[i] = {
                    title: work.title,
                    author: work.authors[0] ? work.authors[0].name : 'No authors available',
                    cover_id: work.cover_id,
                    book_key: work.key,
                    fetchingDescriptionSate: false,
                }
            });

            // Se non ci sono libri, mostra un messaggio di notifica mediante funzione
            if (data.works.length === 0) {
                await noBooksFound();
            } else {

                // Altrimenti, crea le card e fetcha le descrizioni dei libri
                await createBookCards(PAGINATION_LIMIT, divSearchResults, Object.values(getBooks()).slice(getSkipIndex(), getSkipIndex() + PAGINATION_LIMIT));
                await fetchForBookDescription(Object.values(getBooks()).slice(getSkipIndex(), getSkipIndex() + PAGINATION_LIMIT));
            }
        }
    } catch (error) {
        console.error('Error', error);

        if (error.response) {
            // Errore di risposta HTTP (ad es. 404 Not Found)
            alert('HTTP error, please try again later.');
        } else if (error.request) {
            // Nessuna risposta dal server
            alert('No response from server, please try again later.');
        } else {
            // Altro tipo di errore
            alert('Something went wrong, please try again later.');
        }
    }
};


// Funzione per gestire il caso in cui non ci siano libri
export async function noBooksFound() {
    const divSearchResults = document.querySelector('.search-results');
    const pNoResults = document.createElement('p');
    pNoResults.textContent = 'Sorry. I found no books matching your search. Please try again.';
    divSearchResults.appendChild(pNoResults);
    pNoResults.classList.add('no-results');

    const noResultsImage = document.createElement('img');
    noResultsImage.src = ERROR_IMAGE;
    noResultsImage.alt = 'No results image';
    noResultsImage.classList.add('no-results-image');
    divSearchResults.appendChild(noResultsImage);

    scrollpage(); // DEBUG
};

// Funzione per recuperare descrizioni dei libri quando viene cliccata una scheda libro
export async function fetchForBookDescription(books) {
    const selectedBook = document.querySelectorAll('.book-card');
    selectedBook.forEach((book, index) => {
        book.addEventListener('click', async () => {
            const descriptionBox = book.querySelector('.description-box');
            const pDescription = book.querySelector('.description-text');
            setCurrentFocusIndex(index);
            // Verifica se la descrizione è già stata recuperata
            const key = books[index].book_key;
            if (!books[index].fetchingDescriptionSate) {
                try {
                    // Chiamata API per recuperare la descrizione del libro
                    const response = await axios.get(`https://openlibrary.org${key}.json`);
                    const data = response.data;

                    if (!data.description) {
                        console.log('No description available.'); // DEBUG
                        pDescription.textContent = 'No description available.';
                        descriptionBox.classList.add('slide-bottom', 'description-background');
                        closeAllDescriptions(getCurrentFocusIndex());
                        return;
                    } else {
                        // Aggiornamento della descrizione nel DOM
                        pDescription.textContent = data.description.value || data.description;
                        books[index].fetchingDescriptionSate = true;

                        // Aggiunta di stili per mostrare la casella delle descrizioni
                        descriptionBox.classList.add('slide-bottom', 'description-background', 'overflow-scroll');
                        closeAllDescriptions(getCurrentFocusIndex());
                    }
                }
                catch (error) {
                    console.error(error);
                }
            } else {
                closeAllDescriptions(getCurrentFocusIndex());
                return;
            }
        });
    });
};

// Funzione per chiudere tutte le descrizioni, tranne quella selezionata
export function closeAllDescriptions(currentFocusIndex) {
    const books = document.querySelectorAll('.book-card');
    books.forEach((book, descriptionIndex) => {
        const descriptionBox = book.querySelector('.description-box');
        if (descriptionIndex !== currentFocusIndex) {
            // Nasconde le descrizioni non selezionate
            descriptionBox.classList.remove('slide-bottom', 'description-background', 'overflow-scroll');
            descriptionBox.classList.add('visibility-hidden');
        } else {
            // Mostra la descrizione selezionata
            descriptionBox.classList.add('slide-bottom', 'description-background', 'overflow-scroll');
            descriptionBox.classList.remove('visibility-hidden');
        }
    });
};
