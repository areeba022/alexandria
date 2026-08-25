const fs = require('fs');
const Papa = require('papaparse');
const { Client } = require('pg');

const fileContent = fs.readFileSync('dataset/books.csv', 'utf8');
const parsed = Papa.parse(fileContent, { header: true });
const books = parsed.data;

console.log("Total books to insert:", books.length);

require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function loadBooks() {
  await client.connect();
  console.log("Connected to database.");

  await client.query(`DROP TABLE IF EXISTS books`);
  console.log("Old table dropped.");

  await client.query(`
    CREATE TABLE books (
      id SERIAL PRIMARY KEY,
      title TEXT,
      authors TEXT,
      description TEXT,
      publisher TEXT,
      published_date TEXT,
      categories TEXT,
      thumbnail TEXT
    )
  `);
  console.log("Table ready.");

  let inserted = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];

    if (!book.title) continue;

    await client.query(
      `INSERT INTO books (title, authors, description, publisher, published_date, categories, thumbnail)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [book.title, book.authors, book.description, book.publisher, book.published_date, book.categories, book.thumbnail]
    );

    inserted++;
    if (inserted % 1000 === 0) {
      console.log(`Inserted ${inserted} so far...`);
    }
  }

  console.log(`Done. Inserted ${inserted} books total.`);
  await client.end();
}

loadBooks();