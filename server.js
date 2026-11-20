require('dotenv').config();
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/api/search', async (req, res) => {
    const q = req.query.q;

    if (!q) {
        return res.status(400).json({error: 'Please enter a term. '});
    }
    try {
        const url = 'https://www.googleapis.com/books/v1/volumes?q='
        + encodeURIComponent(q)
        + '&maxResults=20&key='
        + process.env.Google_books_key;

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({error: 'The book service returned an error. Please try again.'});
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({error: 'Could not reach the book service. Check your connection and try again.'});
    }
});
app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});