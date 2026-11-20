const input = document.getElementById('search-input');
const button = document.getElementById('search-button');
const message = document.getElementById('message');
const results = document.getElementById('results');

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
        data.items.forEach(showBook);
    } catch (err) {
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

button.addEventListener('click', searchBooks);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchBooks();
});