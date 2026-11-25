const input = document.getElementById('search-input');
const button = document.getElementById('search-button');
const message = document.getElementById('message');
const results = document.getElementById('results');
const sortSelect = document.getElementById('sort-select');
const ratingSelect = document.getElementById('rating-select');
const readingListDiv = document.getElementById('reading-list');

let allBooks = [];
let readingList = [];
try {
    readingList = JSON.parse(localStorage.getItem('readingList')) || [];
} catch (err) {
    readingList = [];
}

function saveReadingList() {
    localStorage.setItem('readingList', JSON.stringify(readingList));
}

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
     
    const rating = document.createElement('p');
    if (info.averageRating) {
        rating.textContent = 'Rating: ' + info.averageRating;
    } else {
        rating.textContent = 'No rating';
    }
     
    const pages = document.createElement('p');
    if (info.pageCount) {
        pages.textContent = 'Pages: ' + info.pageCount;
    } else {
        pages.textContent = 'Pages are unknown.';
    }

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
      const savedList = readingList.some(item => item.id === book.id);
      if (savedList) {
        return;
      }

      readingList.push({
        id:book.id,
        title:info.title || 'Untitled',
        authors:info.authors ? info.authors.join(',') : 'Unknown author',
        status: 'Want to read'
      });
      saveReadingList();
      renderReadingList();
    });

    card.append(title, author, year, rating, pages, saveButton);
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

function renderReadingList(){
    readingListDiv.textContent = '';

    if (readingList.length === 0) {
        readingListDiv.textContent = 'Nothing saved yet.';
    return;
    }

    readingList.forEach(item => {
        const entry = document.createElement('div');
        entry.className = 'card';
 
    const title = document.createElement('h3');
    title.textContent = item.title;

    const authors = document.createElement('p');
    authors.textContent = item.authors;

    const statusSelect = document.createElement('select');
    ['Want to read','Reading','Finished'].forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent= optionText;
        statusSelect.appendChild(option);
    });
    statusSelect.value = item.status;
    statusSelect.addEventListener('change', () => {
        item.status = statusSelect.value;
        saveReadingList();
    });

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        readingList = readingList.filter(saved => saved.id !== item.id);
        saveReadingList();
        renderReadingList();
    });

    entry.append(title,authors, statusSelect, removeButton);
    readingListDiv.appendChild(entry);

     });
}

button.addEventListener('click', searchBooks);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchBooks();
});

sortSelect.addEventListener('change', renderBooks);
ratingSelect.addEventListener('change', renderBooks);

renderReadingList();