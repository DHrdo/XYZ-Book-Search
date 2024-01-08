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

import '/src/sass/style.scss';  // Importa il foglio di stile Sass
import BACKGROUND_IMG from '/src/images/background.jpg';  // Importa l'immagine di sfondo
import { setBooks, setCurrentFocusIndex, fetchBooks } from "./fetchBooks";

const background = document.querySelector('.background');
background.src = BACKGROUND_IMG;
const searchBtn = document.getElementById('search-button');
let isSearchInProgress = false;




// Event listener per il pulsante di ricerca
searchBtn.addEventListener('click', async () => {
    let userInput = document.getElementById('search-city').value;
    let bookCards = document.querySelectorAll('.book-card');

    // Verifica se una ricerca è già in corso
    if (isSearchInProgress) {
        return;
    }

    isSearchInProgress = true;

    setBooks({});

    // Pulizia dei risultati di ricerca precedenti
    if (bookCards.length > 0) {
        bookCards.forEach(book => book.remove());
        setCurrentFocusIndex(-1);
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
export function scrollpage() {
    window.scrollTo({
        top: 350,  // Valore specifico per scorrere la pagina
        left: 0,
        behavior: "smooth",
    });
};