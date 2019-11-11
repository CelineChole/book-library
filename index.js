const fetch = require("node-fetch");
const fs = require("fs");
const chalk = require("chalk");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const loadReadingList = () => {
  const raw = fs.readFileSync("books.json");
  return JSON.parse(raw);
};

let books = [];
let readingList = loadReadingList();

const getInput = question => {
  return new Promise(resolve => {
    readline.question(chalk`${chalk.bold(question)}\n> `, answer => {
      resolve(answer.toLowerCase());
    });
  });
};

const addFavorite = async book => {
  let bookToAdd = books[book - 1];
  console.log(bookToAdd);
  readingList.push({
    id: readingList.length + 1,
    title: bookToAdd[1],
    author: bookToAdd[2],
    publisher: bookToAdd[3]
  });
  await displayReadingList();
};

const exit = () => {
  let dataToSave = JSON.stringify(readingList);
  fs.writeFileSync("books.json", dataToSave);
  console.log("Come back soon");
  process.exit();
};

const mainMenu = async () => {
  let input = "";
  while (true) {
    input = await getInput(
      "Hey you are new here do you want to (S)earch for books or (E)xit?"
    );
    switch (input) {
      case "e":
        exit();
      case "s":
        await searchBookMenu();
        break;
      default:
        break;
    }
  }
};

const searchBookMenu = async () => {
  while (true) {
    const searchTerm = await getInput("What do you want to search for?");
    if (searchTerm === "") {
      continue;
    }
    books.push(await fetchBooks(searchTerm));
    if (books.length === 0) {
      console.log("No books sorry");
    } else {
      const addThebook = await getInput("add book 1-5 or (S)earch again?");
      if (addThebook === "s") {
        await fetchBooks(books);
      } else {
        const bookNumber = Number(addThebook);
        if (bookNumber && (bookNumber >= 1 && bookNumber <= 5)) {
          await addFavorite(addThebook);
        } else {
          console.log("Invalid input");
        }
      }
    }
  }
};

const fetchBooks = async userInput => {
  try {
    const result = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${userInput}&maxResults=5`
    );
    const json = await result.json();
    const booksList = await json.items.map(bookList => bookList.volumeInfo);
    books = booksList.map((book, id) => {
      let publisher;
      if (book.publisher === undefined) {
        publisher = "Unknown publisher";
      } else {
        publisher = book.publisher;
      }
      let author;
      if (book.authors === undefined) {
        author = "No author";
      } else {
        author = book.authors;
      }

      console.log(
        `${chalk.blueBright(`[${id + 1}]`)} ${
          book.title
        } ${author} ${publisher}`
      );
      return [id, book.title, author, publisher];
    });
  } catch (err) {
    console.error("No other book found", err);
  }
};

const removeFavorite = async () => {
  const id = await getInput(
    "Type the id of the book you would like to remove from your reading list"
  );
  if (readingList.length) {
    readingList = readingList.filter(book => {
      return book.id !== Number(id);
    });
  }
};

const displayReadingList = async () => {
  while (true) {
    if (readingList.length) {
      console.clear();
      console.log("Your reading list");
      readingList.forEach(book => {
        console.log(
          chalk`${chalk.blueBright(`[${book.id}]`)} ${chalk.bold.italic(
            book.title
          )} by ${book.author} (${book.publisher})`
        );
      });
      const userInput = await getInput(
        `Choose an option: \n(S)earch for a book \n(R)emove a book from your reading list \n(E)xit`
      );
      switch (userInput) {
        case ("S", "s"):
          const searchTerm = await getInput("What do you want to search for?");
          books.push(await fetchBooks(searchTerm));
          const addThebook = await getInput("add book 1-5 or (S)earch again??");
          if (addThebook === "S" || addThebook === "s") {
            books = new Array();
            await fetchBooks(books);
          } else {
            await addFavorite(addThebook);
          }
          break;
        case "r":
          await removeFavorite();
          break;
        case "e":
          exit();
        default:
          break;
      }
    } else {
      await mainMenu();
    }
  }
};

const main = async () => {
  await displayReadingList();
  readline.close();
};
main();
