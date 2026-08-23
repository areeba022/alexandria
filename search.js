const fs = require('fs');
const Papa = require('papaparse');

const fileContent = fs.readFileSync('dataset/books.csv', 'utf8');
const parsed = Papa.parse(fileContent, { header: true });
const books = parsed.data;

console.log("Total books loaded:", books.length);

function searchBooks(query) {
  const lowerQuery = query.toLowerCase();
  const results = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    let score = 0;

    if (book.title && book.title.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }
    if (book.authors && book.authors.toLowerCase().includes(lowerQuery)) {
      score += 3;
    }
    if (book.description && book.description.toLowerCase().includes(lowerQuery)) {
      score += 1;
    }

    if (score > 0) {
      book.score = score;
      results.push(book);
    }
  }

  results.sort((a, b) => b.score - a.score);

  console.log(`Found ${results.length} result(s) for "${query}":`);
  for (let i = 0; i < results.length && i < 5; i++) {
    console.log(` - [score ${results[i].score}]`, results[i].title, "by", results[i].authors);
  }
}

searchBooks("Tolkien");