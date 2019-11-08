const fetch = require("node-fetch");
const chalk = require("chalk");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

let books = [];

// let readingList = [];

let readingList = [
  {
    id: 1,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    publisher: "super publisher"
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    publisher: "Publisher 2"
  }
];

const getInput = question => {
  return new Promise(resolve => {
    readline.question(chalk`${chalk.bold(question)}\n> `, answer => {
      resolve(answer);
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
  console.log("Come back soon");
};

const addNewFavorite = async () => {
  let test = true;
  while (test) {
    const userInput = await getInput(
      `\nChoose an option: \n(S)earch for another book \n(A)dd a book to your reading list \n(E)xit`
    );

    switch (userInput) {
      case ("S", "s"):
        const searchTerm = await getInput("What do you want to search for?");
        books.push(await fetchBooks(searchTerm));
        break;
      case ("A", "a"):
        await addFavorite();
        test = false;
        break;
      case ("E", "e"):
        exit();
        break;
      default:
        break;
    }
  }
};

const searchBookMenu = async () => {
  let input = "";
  input = await getInput(
    "Hey you are new here do you want to (S)earch for books or (E)xit?"
  ); // ask user for input
  while (input !== "E" && input !== "e") {
    const searchTerm = await getInput("What do you want to search for?");
    if (input === "S" || input === "s") {
      books.push(await fetchBooks(searchTerm));
      if (books.length === 0) {
        console.log("No books sorry");
      } else {
        const addThebook = await getInput("add book 1-5 or (S)earch again??");
        if (addThebook === "S" || addThebook === "s") {
          books = new Array();
          await fetchBooks(books);
        } else {
          await addFavorite(addThebook);
        }
      }
    }
  }
  await exit();

  // returns
  // switch, if they say search...
  // books = await fetchBooks(userInput)
  // displayBooks(books)
  // if books.length - ask user if they want to add one

  // else loop to the top...
};

const fetchBooks = async userInput => {
  try {
    const result = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${userInput}&maxResults=5`
    );
    const json = await result.json();
    const booksList = await json.items.map(bookList => bookList.volumeInfo);
    await booksList.map((book, id) => {
      let publisher;
      if (book.publisher === undefined) {
        publisher = "Unknown publisher";
      } else {
        publisher = book.publisher;
      }
      books.push([id, book.title, book.authors, publisher]);
      console.log(
        `${chalk.blueBright(`[${id + 1}]`)} ${book.title} ${
          book.authors[0]
        } ${publisher}`
      );
    });
  } catch {
    console.log("No other book found");
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
        case ("R", "r"):
          await removeFavorite();
          break;
        case ("E", "e"):
          exit();
          return;
        default:
          break;
      }
    } else {
      await searchBookMenu();
    }
  }
};

const main = async () => {
  // welcome
  await displayReadingList();
  readline.close();
};
main();

// to be fixed
// - if no reading list, need to handle if user doesn't type s or e
// - handle multiple authors
