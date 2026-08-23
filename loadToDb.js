const fs = require('fs');
const Papa = require('papaparse');
const { Client } = require('pg');

// Load and parse the CSV, same as before
const fileContent = fs.readFileSync('dataset/books.csv', 'utf8');
const parsed = Papa.parse(fileContent, { header: true });
const books = parsed.data;

console.log("Total books to insert:", books.length);

// Connect to your database
const client = new Client({
  user: 'postgres',
  password: 'alexandria123', // the password you set during install
  host: 'localhost',
  port: 5432,
  database: 'alexandria',
});

async function loadBooks() {
  await client.connect();
  console.log("Connected to database.");

  let inserted = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];

    // Skip rows with no title (same guard as before)
    if (!book.title) continue;

    await client.query(
      `INSERT INTO books (title, authors, description, publisher, published_date, categories)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [book.title, book.authors, book.description, book.publisher, book.published_date, book.categories]
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