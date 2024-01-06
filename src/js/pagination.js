import { books, PAGINATION_LIMIT, MAX_VISIBLE_PAGES, currentPageIndexObj, skipIndexObj, createBookCards, IndexScrollPaginationNumbersObj } from './index.js';

// *** GESTIONE PAGINAZIONE ***---------------------------------------------------------------------------------------------------

// Funzione per gestire il cambio di pagine al click dei pulsanti (i numeri della paginazione)
export function changePagesClick() {
    let paginationButtons = document.querySelectorAll('.pagination-button');

    // Rimuove gli event listener esistenti
    paginationButtons.forEach(button => {
        button.removeEventListener('click', handlePaginationClick);
    });

    // Aggiunge gli event listener aggiornati
    paginationButtons.forEach((button, index) => {
        lightArrows(index);
        lastPageInFocus(paginationButtons, currentPageIndexObj.currentPageIndex, index);
        button.addEventListener('click', handlePaginationClick);
    });
};

// Crea la paginazione e aggiunge la funzione handlePaginationClick() come event listener
export function createPagination() {
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
    currentPageIndexObj.currentPageIndex = 1;
    paginationButton.forEach((button, index) => {
        if (parseInt(button[0].textContent) === currentPageIndexObj.currentPageIndex) {
            button.classList.add('active-button');
        }
    })

    return paginationBox;
};

// Funzione per ottenere il numero dell'ultima pagina in focus
export function lastPageInFocus(paginationButtons, currentPageIndex, index) {

    if (parseInt(paginationButtons[index].textContent) === currentPageIndexObj.currentPageIndex) {
        paginationButtons[index].classList.add('active-button');
    } else {
        paginationButtons[index].classList.remove('active-button');
    }

    return currentPageIndexObj.currentPageIndex;
};

// Funzione di gestione del click sulla paginazione
export function handlePaginationClick() {
    currentPageIndexObj.currentPageIndex = parseInt(event.target.textContent);
    skipIndexObj.skipIndex = (currentPageIndexObj.currentPageIndex - 1) * PAGINATION_LIMIT;

    const paginationButtons = document.querySelectorAll('.pagination-button');

    let searchResults = document.querySelector('.search-results');
    searchResults.innerHTML = '';
    createBookCards(PAGINATION_LIMIT, searchResults, Object.values(books).slice(skipIndexObj.skipIndex, skipIndexObj.skipIndex + PAGINATION_LIMIT));
};

// Funzione per gestire il click listener del cambio di pagine precedenti
export function handlePrevPagesClick() {
    const btnPreviousPages = document.querySelector('.btn-prev-pages');

    btnPreviousPages.removeEventListener('click', previousPage);
    btnPreviousPages.addEventListener('click', previousPage);
};

// Funzione per gestire il click listener del cambio di pagine successive
export function handleNextPagesClick() {
    const pages = Math.ceil(Object.keys(books).length / PAGINATION_LIMIT);
    const paginationButtons = document.querySelectorAll('.pagination-button');
    const btnNextPages = document.querySelector('.btn-next-pages');

    if (parseInt(paginationButtons[paginationButtons.length - 1].textContent) === pages) {
        btnNextPages.removeEventListener('click', nextPage);
    } else {
        btnNextPages.addEventListener('click', nextPage);
    }

};

// Funzione per gestire il cambio di pagine successive
export function nextPage() {
    const pages = Math.ceil(Object.keys(books).length / PAGINATION_LIMIT);
    const btnNextPages = document.querySelector('.btn-next-pages');
    const btnPreviousPages = document.querySelector('.btn-prev-pages');
    const paginationButtons = document.querySelectorAll('.pagination-button');

    btnPreviousPages.addEventListener('click', previousPage); // Aggiunge l'event listener al pulsante "precedente" per RIabilitarlo;

    IndexScrollPaginationNumbersObj.IndexScrollPaginationNumbers++;

    paginationButtons.forEach((button, index) => {
        button.textContent = index + 1 + IndexScrollPaginationNumbersObj.IndexScrollPaginationNumbers;

        // Se il numero dell'ultima pagina è superiore alla quantità di pagine totali, rimuove l'event listener in modo che non si possa andare alla pagina successiva
        if (parseInt(paginationButtons[paginationButtons.length - 1].textContent) === pages) {
            btnNextPages.removeEventListener('click', nextPage);
        }

        button.classList.remove('active-button');
        lastPageInFocus(paginationButtons, currentPageIndexObj.currentPageIndex, index);
        lightArrows(index)
    })
};

// Funzione per gestire il cambio di pagine precedenti
export function previousPage() {
    const btnNextPages = document.querySelector('.btn-next-pages');
    const btnPreviousPages = document.querySelector('.btn-prev-pages');

    btnNextPages.addEventListener('click', nextPage); // Aggiunge l'event listener al pulsante "successivo" per RIabilitarlo;

    const paginationButtons = document.querySelectorAll('.pagination-button');

    IndexScrollPaginationNumbersObj.IndexScrollPaginationNumbers--;

    // Se l'index dello scroll delle pagine è inferiore o uguale a 0, rimuove l'event listener in modo che non si possa andare alla pagina 0 
    if (IndexScrollPaginationNumbersObj.IndexScrollPaginationNumbers <= 0) {
        IndexScrollPaginationNumbersObj.IndexScrollPaginationNumbers = 0;
        btnPreviousPages.removeEventListener('click', previousPage);
    }

    paginationButtons.forEach((button, index) => {
        button.textContent = index + 1 + IndexScrollPaginationNumbersObj.IndexScrollPaginationNumbers;
        // Se si torna alla prima pagina, nascondi il pulsante "precedente"

        button.classList.remove('active-button');
        lastPageInFocus(paginationButtons, currentPageIndexObj.currentPageIndex, index);
        lightArrows(index);
    });
};

// Funzione per illuminare le frecce della paginazione quando la pagina attiva è inferiore o superiore a quelle visualizzate al momento
export function lightArrows(index) {
    const paginationButtons = document.querySelectorAll('.pagination-button');
    const prevArrow = document.querySelector('.btn-prev-pages');
    const nextArrow = document.querySelector('.btn-next-pages');
    const currentPage = lastPageInFocus(paginationButtons, currentPageIndexObj.currentPageIndex, index);

    if (currentPage < parseInt(paginationButtons[0].textContent)) {
        prevArrow.style.color = 'yellow';
    }
    else if (currentPage > parseInt(paginationButtons[paginationButtons.length - 1].textContent)) {
        nextArrow.style.color = 'yellow';
    } else {
        prevArrow.style.color = '#00ADB5';
        nextArrow.style.color = '#00ADB5';
    }
};



// -----------------------------------------------------------------------------------------------------------------------------------------
