const input = document.getElementById('search-input');
const button = document.getElementById('search-button');
const message = document.getElementById('message');
const results = document.getElementById('results');
const sortSelect = document.getElementById('sort-select');
const ratingSelect = document.getElementById('rating-select');
let allBooks = [];

async function searchBooks() {
    const term = input.value.trim();
    results.innerHTML = '';
    message.textContent = '';

    if (!term) {
        message.textContent = 'Please type a search term.';
        return;
    }
    message.textContent = 'Loading...';

    try {
        const response = await fetch('/api/search?q=' + encodeURIComponent(term));
        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.error;
            return;
        }
        if (!data.items || data.items.length === 0) {
            message.textContent= 'No books found. Try a different search.';
            return;
        }

        message.textContent = '';
        allBooks = data.items;
        renderBooks();
    } catch (err) {
        console.error(err);
        message.textContent = 'Something went wrong. Check your connection and try again.';
    }
}

function showBook(book) {
    const info = book.volumeInfo;
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = info.title || 'Untitled';

    const author = document.createElement('p');
    author.textContent = info.authors ? info.authors.join(', ') : 'Unknown author';

    const year = document.createElement('p');
    year.textContent = info.publishedDate ? info.publishedDate.slice(0, 4) : 'Year unknown';

    card.append(title, author, year);
    results.appendChild(card);
}

function getYear(book) {
    const date = book.volumeInfo.publishedDate;
    return date ? parseInt(date.slice(0, 4)) : 0;
}

function renderBooks(){
    if (allBooks.length === 0) return;

    let list = [...allBooks];

    const minRating = Number(ratingSelect.value);
    if (minRating > 0) {
        list = list.filter(book =>(book.volumeInfo.averageRating || 0) >= minRating);
    }

    if (sortSelect.value === 'title') {
        list.sort((a, b) => (a.volumeInfo.title || '').localeCompare(b.volumeInfo.title || ''));
    } else if (sortSelect.value === 'year') {
        list.sort((a, b) => getYear(b) - getYear(a));
    }

    results.innerHTML = '';
    message.textContent = '';

    if (list.length === 0) {
        message.textContent = 'No books match your filters.';
        return;
    }

    list.forEach(showBook);
}

button.addEventListener('click', searchBooks);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchBooks();
});

sortSelect.addEventListener('change', renderBooks);
ratingSelect.addEventListener('change', renderBooks);