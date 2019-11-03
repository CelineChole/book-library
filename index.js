const fetch = require("node-fetch");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

let bookTitle = "happy";

// readline.question(`Search for a book `, (bookTitle) => {
const fetchBook = async () => {
  const result = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${bookTitle}&maxResults=5`
  );
  const json = await result.json();
  console.log(json.items[0].volumeInfo.title);
};

fetchBook();
readline.close();
// })
