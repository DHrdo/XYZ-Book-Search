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

import axios from 'axios';  // Utilizzo di axios per effettuare chiamate HTTP
import '/src/sass/style.scss';  // Importa il foglio di stile Sass
import BACKGROUND_IMG from '/src/images/background.jpg';  // Importa l'immagine di sfondo
import ERROR_IMAGE from '/src/images/noResults.png';  // Importa l'immagine di sfondo

// Selezione dell'elemento di sfondo e impostazione della sua sorgente
const background = document.querySelector('.background');
background.src = BACKGROUND_IMG;


// -----------------------------*****INIZIALIZZAZIONE DELLE VARIABILI*****-------------------------------------------


// Ottenimento del riferimento al pulsante di ricerca
const searchBtn = document.getElementById('search-button');


//let imagesLoaded = 0;  // Contatore per le immagini di copertina caricate
let books = {};  // oggetto per memorizzare i dettagli dei libri recuperati
let currentFocusIndex = 0;  // Indice del libro attualmente in primo piano

let getInput = ''; // Variabile globale per memorizzare l'input dell'utente (userinput non poteva essere usata)

//** SETTINGS DELLA PAGINAZIONE **/
const BOOKS_LIMIT = 200;  // Limite di libri da recuperare                                     [ ** MODIFICARE SE E' NECESSARIO VARIARE IL LIMITE DI FETCHING DEI LIBRI **]
const PAGINATION_LIMIT = 10;  // Limite di pagine per la paginazione                           [ ** MODIFICARE SE E' NECESSARIO VARIARE IL LIMITE DI LIBRI PER PAGINA **]
const MAX_VISIBLE_PAGES = 5;  // Limite di pagine visibili all'utente per la paginazione       [ ** MODIFICARE SE E' NECESSARIO VARIARE IL LIMITE DI PAGINE VISIBILI PRIMA DI SCORRERE CON IL TASTO '>' **]
// -----------------------------------------------------------------------------------------------------------------

// Variabili globali per la paginazione
let skipIndex = 0; // Indice di partenza per la paginazione
let currentPageIndex = 1; // Inizializazione della pagina corrente
let IndexScrollPaginationNumbers = 0 // Variabile per controllo del numero delle volte che le viene scorse

let isSearchInProgress = false; // Variabile per controllare se la ricerca è in corso, in modo da non effettuare chiamate sovrapposte
let isPaginationCreated = false; // Variabile per controllare se la paginazione è stata già creata
let paginationBox; // Variabile per memorizzare il div della paginazione

// Funzione per recuperare libri in base all'input dell'utente
async function fetchBooks(userInput) {
    const divSearchResults = document.querySelector('.search-results');
    Object.assign({}, books);
    divSearchResults.innerHTML = '';

    try {
        getInput = userInput.toLowerCase();
        //console.log(userInput); // DEBUG

        // Se l'oggetto ha già degli elementi allora crea le card dei libri e fetcha le descrizioni
        if (Object.keys(books).length) {

            // Ottieni solo gli elementi corrispondenti alla paginazione
            const paginatedBooks = Object.values(books).slice(skipIndex, skipIndex + PAGINATION_LIMIT);
            await createBookCards(PAGINATION_LIMIT, divSearchResults, paginatedBooks);
            await fetchForBookDescription(paginatedBooks);

        } else {

            // Altrimenti, fetcha i libri con dei criteri di ricerca specifici
            const response = await axios.get(`https://openlibrary.org/subjects/${getInput}.json?limit=${BOOKS_LIMIT}&offset=${skipIndex}`);
            const data = response.data;
            isPaginationCreated = false;

            // Rimuove la paginazione creata in precedenza se esiste e reinizializza le variabili di indice
            const pagination = document.querySelector('.pagination-box');
            if (pagination) {
                pagination.remove();
                IndexScrollPaginationNumbers = 0;
                currentPageIndex = 0;
            }

            console.log(data); // DEBUG

            // Crea un oggetto per memorizzare i dettagli dei libri
            data.works.forEach(async (work, i) => {
                books[i] = {
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
                const paginatedBooks = Object.values(books).slice(skipIndex, skipIndex + PAGINATION_LIMIT);
                await createBookCards(PAGINATION_LIMIT, divSearchResults, Object.values(books).slice(skipIndex, skipIndex + PAGINATION_LIMIT));
                await fetchForBookDescription(paginatedBooks);
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
}

// Funzione per gestire il caso in cui non ci siano libri
async function noBooksFound() {
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
}

// Funzione per recuperare descrizioni dei libri quando viene cliccata una scheda libro
async function fetchForBookDescription(books) {
    const selectedBook = document.querySelectorAll('.book-card');
    selectedBook.forEach((book, index) => {
        book.addEventListener('click', async () => {
            const descriptionBox = book.querySelector('.description-box');
            const pDescription = book.querySelector('.description-text');
            currentFocusIndex = index;
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
                        closeAllDescriptions(currentFocusIndex);
                        return;
                    } else {
                        // Aggiornamento della descrizione nel DOM
                        pDescription.textContent = data.description.value || data.description;
                        books[index].fetchingDescriptionSate = true;

                        // Aggiunta di stili per mostrare la casella delle descrizioni
                        descriptionBox.classList.add('slide-bottom', 'description-background', 'overflow-scroll');
                        closeAllDescriptions(currentFocusIndex);
                    }
                }
                catch (error) {
                    console.error(error);
                }
            } else {
                closeAllDescriptions(currentFocusIndex);
                return;
            }
        });
    });
}

// Funzione per chiudere tutte le descrizioni, tranne quella selezionata
function closeAllDescriptions(currentFocusIndex) {
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
}

// Event listener per il pulsante di ricerca
searchBtn.addEventListener('click', async () => {
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
        currentFocusIndex = -1;
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
}
// ***------------------------------------------------------------------------------------------------------------------------------------------





// *** GESTIONE DOM PER LE CARD DEI LIBRI ***---------------------------------------------------------------------------------------------------

// Funzioni per creare i singoli elementi html appartenenti alla card di ogni libro
function createCard(className) {
    const card = document.createElement('div');
    card.className = className;

    return card;
}

// Aggiunta del titolo della card
function createCardTitle(books, i, className) {
    const title = document.createElement('h2');
    title.textContent = books[i].title;
    title.className = className;

    return title;
}

// Aggiunta dell'autore della card
function createCardAuthor(books, i, className) {
    const author = document.createElement('p');
    author.className = className;
    author.textContent = books[i].author;

    return author;
}

// Aggiunta della copertina della card
function createCardCover(books, i, className) {
    const cover = document.createElement('img');
    cover.src = `https://covers.openlibrary.org/b/id/${books[i].cover_id}-M.jpg`;
    cover.alt = books[i].title;
    cover.className = className;

    return cover;
}

// Aggiunta della box di descrizione
function createCardDescriptionBox(className) {
    const descriptionBox = document.createElement('div');
    descriptionBox.className = className;

    return descriptionBox;
}

// Aggiunta del testo del box della descrizione
function createCardDescriptionText(className) {
    const descriptionBox = document.querySelector('.description-box');
    const descriptionText = document.createElement('p');
    descriptionText.className = className;

    return descriptionText;
}

// Funzione per mettere insieme, all'interno della card, i vari elementi creati precedentemente
async function createBookCards(element, eParent, books) {

    const remainingBooks = BOOKS_LIMIT - skipIndex;
    console.log(remainingBooks);
    console.log(skipIndex)

    for (let i = 0; i < element && i < remainingBooks; i++) {

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
    }


    fetchForBookDescription(books);

    if (!isPaginationCreated) {
        isPaginationCreated = true;
        paginationBox = createPagination();
        const main = document.querySelector('.main');
        main.appendChild(paginationBox);


        //Imposta il primo pulsante come attivo in modo che venga visualizzato "evidenziata"
        const paginationButton = document.querySelectorAll('.pagination-button');
        paginationButton.forEach((button, index) => {
            if (index === 0) {
                button.classList.add('active-button');
            }
        })

        changePagesClick();
    } else {
        changePagesClick();
    }
    handlePrevPagesClick()
    handleNextPagesClick();
}
// ***----------------------------------------------------------------------------------------------------------------------------





// *** GESTIONE PAGINAZIONE ***---------------------------------------------------------------------------------------------------

// Funzione per gestire il cambio di pagine al click dei pulsanti (i numeri della paginazione)
function changePagesClick() {
    let paginationButtons = document.querySelectorAll('.pagination-button');

    // Rimuove gli event listener esistenti
    paginationButtons.forEach(button => {
        button.removeEventListener('click', handlePaginationClick);
    });

    // Aggiunge gli event listener aggiornati
    paginationButtons.forEach((button, index) => {
        lightArrows(index);
        lastPageInFocus(paginationButtons, currentPageIndex, index);
        button.addEventListener('click', handlePaginationClick);
    });
}

// Crea la paginazione e aggiunge la funzione handlePaginationClick() come event listener
function createPagination() {
    let pages = Object.keys(books).length / PAGINATION_LIMIT; // Calcola il numero di pagine totali da creare
    const paginationBox = document.createElement('div');
    paginationBox.className = 'pagination-box';

    for (let i = 0; i < pages; i++) {
        // Crea le prime pagine in base alle pagine totali visualizzabili all'utente nella paginazione (in basso).
        const paginationButton = document.createElement('button');
        paginationButton.className = 'pagination-button';
        paginationButton.textContent = i + 1;
        paginationButton.addEventListener('click', handlePaginationClick);
        paginationBox.appendChild(paginationButton);

        // Se i è uguale al massimo delle pagine (in basso) visibili all'utente && le pagine totali sono superiori alle pagine visibili all'utente 
        if (i === MAX_VISIBLE_PAGES - 1 && pages > MAX_VISIBLE_PAGES) {
            const btnPreviousPages = document.createElement('button');
            btnPreviousPages.className = 'btn-prev-pages';
            btnPreviousPages.textContent = '<';
            paginationBox.insertBefore(btnPreviousPages, paginationBox.firstChild);

            const btnNextPages = document.createElement('button');
            btnNextPages.className = 'btn-next-pages';
            btnNextPages.textContent = '>';
            paginationBox.appendChild(btnNextPages);
            break;
        }
    }

    let paginationButton = document.querySelectorAll('.pagination-button');
    currentPageIndex = 1;
    paginationButton.forEach((button, index) => {
        if (parseInt(button[0].textContent) === currentPageIndex) {
            button.classList.add('active-button');
        }
    })

    return paginationBox;
}

// Funzione per ottenere il numero dell'ultima pagina in focus
function lastPageInFocus(paginationButtons, currentPageIndex, index) {
    console.log('last page in focus', currentPageIndex);

    if (parseInt(paginationButtons[index].textContent) === currentPageIndex) {
        paginationButtons[index].classList.add('active-button');
    } else {
        paginationButtons[index].classList.remove('active-button');
    }

    return currentPageIndex;
}

// Funzione di gestione del click sulla paginazione
function handlePaginationClick() {
    currentPageIndex = parseInt(event.target.textContent);
    skipIndex = (currentPageIndex - 1) * PAGINATION_LIMIT;

    const paginationButtons = document.querySelectorAll('.pagination-button');

    let searchResults = document.querySelector('.search-results');
    searchResults.innerHTML = '';
    createBookCards(PAGINATION_LIMIT, searchResults, Object.values(books).slice(skipIndex, skipIndex + PAGINATION_LIMIT));
}

// Funzione per gestire il click listener del cambio di pagine precedenti
function handlePrevPagesClick() {
    const btnPreviousPages = document.querySelector('.btn-prev-pages');

    btnPreviousPages.removeEventListener('click', previousPage);
    btnPreviousPages.addEventListener('click', previousPage);
}

// Funzione per gestire il click listener del cambio di pagine successive
function handleNextPagesClick() {
    const pages = Math.ceil(Object.keys(books).length / PAGINATION_LIMIT);
    const paginationButtons = document.querySelectorAll('.pagination-button');
    const btnNextPages = document.querySelector('.btn-next-pages');

    if (parseInt(paginationButtons[paginationButtons.length - 1].textContent) === pages) {
        btnNextPages.removeEventListener('click', nextPage);
    } else {
        btnNextPages.addEventListener('click', nextPage);
    }

}

// Funzione per gestire il cambio di pagine successive
function nextPage() {
    const pages = Math.ceil(Object.keys(books).length / PAGINATION_LIMIT);
    const btnNextPages = document.querySelector('.btn-next-pages');
    const btnPreviousPages = document.querySelector('.btn-prev-pages');
    const paginationButtons = document.querySelectorAll('.pagination-button');

    btnPreviousPages.addEventListener('click', previousPage); // Aggiunge l'event listener al pulsante "precedente" per RIabilitarlo;

    IndexScrollPaginationNumbers++;
    console.log('IndexScrollPaginationNumbers', IndexScrollPaginationNumbers)

    paginationButtons.forEach((button, index) => {
        button.textContent = index + 1 + IndexScrollPaginationNumbers;

        // Se il numero dell'ultima pagina è superiore alla quantità di pagine totali, rimuove l'event listener in modo che non si possa andare alla pagina successiva
        if (parseInt(paginationButtons[paginationButtons.length - 1].textContent) === pages) {
            btnNextPages.removeEventListener('click', nextPage);
        }

        button.classList.remove('active-button');
        lastPageInFocus(paginationButtons, currentPageIndex, index);
        lightArrows(index)
    })
}

// Funzione per gestire il cambio di pagine precedenti
function previousPage() {
    const btnNextPages = document.querySelector('.btn-next-pages');
    const btnPreviousPages = document.querySelector('.btn-prev-pages');

    btnNextPages.addEventListener('click', nextPage); // Aggiunge l'event listener al pulsante "successivo" per RIabilitarlo;

    const paginationButtons = document.querySelectorAll('.pagination-button');

    IndexScrollPaginationNumbers--;
    console.log('IndexScrollPaginationNumbers', IndexScrollPaginationNumbers);

    // Se l'index dello scroll delle pagine è inferiore o uguale a 0, rimuove l'event listener in modo che non si possa andare alla pagina 0 
    if (IndexScrollPaginationNumbers <= 0) {
        IndexScrollPaginationNumbers = 0;
        btnPreviousPages.removeEventListener('click', previousPage);
    }

    paginationButtons.forEach((button, index) => {
        button.textContent = index + 1 + IndexScrollPaginationNumbers;
        // Se si torna alla prima pagina, nascondi il pulsante "precedente"

        button.classList.remove('active-button');
        lastPageInFocus(paginationButtons, currentPageIndex, index);
        lightArrows(index);
    });
}

// Funzione per illuminare le frecce della paginazione quando la pagina attiva è inferiore o superiore a quelle visualizzate al momento
function lightArrows(index) {
    const paginationButtons = document.querySelectorAll('.pagination-button');
    const prevArrow = document.querySelector('.btn-prev-pages');
    const nextArrow = document.querySelector('.btn-next-pages');
    const currentPage = lastPageInFocus(paginationButtons, currentPageIndex, index);
    console.log('currentPage', currentPage);
    console.log('parseInt(paginationButtons[index].textContent)', parseInt(paginationButtons[0].textContent));

    if (currentPage < parseInt(paginationButtons[0].textContent)) {
        prevArrow.style.color = 'yellow';
    }
    else if (currentPage > parseInt(paginationButtons[paginationButtons.length - 1].textContent)) {
        nextArrow.style.color = 'yellow';
    } else {
        prevArrow.style.color = '#00ADB5';
        nextArrow.style.color = '#00ADB5';
    }
}



// -----------------------------------------------------------------------------------------------------------------------------------------
