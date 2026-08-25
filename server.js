require('dotenv').config();

const express = require('express');
const { Client } = require('pg');

const app = express();


app.use(express.static('.'));

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().then(() => {
    console.log("Connected to database.");
});

app.get('/suggest', async (req, res) => {
    const query = req.query.q || '';
    if (query.length < 2) {
        return res.json([]);
    }
    const searchTerm = `%${query}%`;

    const result = await client.query(
        `SELECT DISTINCT title
     FROM books
     WHERE title ILIKE $1
     ORDER BY title
     LIMIT 6`,
        [searchTerm]
    );

    res.json(result.rows.map(row => row.title));
});

app.get('/search', async (req, res) => {
    const query = req.query.q || '';
    const searchTerm = `%${query}%`;

    const result = await client.query(
        `SELECT title, authors, description, published_date, categories, thumbnail,
       (CASE WHEN title ILIKE $1 THEN 5 ELSE 0 END) +
       (CASE WHEN authors ILIKE $1 THEN 3 ELSE 0 END) +
       (CASE WHEN description ILIKE $1 THEN 1 ELSE 0 END) AS score
     FROM books
     WHERE title ILIKE $1 OR authors ILIKE $1 OR description ILIKE $1
     ORDER BY score DESC
     LIMIT 10`,
        [searchTerm]
    );

    res.json(result.rows);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});