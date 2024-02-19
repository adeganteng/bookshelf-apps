const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK-APPS";

function generateID() {
	return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
	return {
		id,
		title,
		author,
		year,
		isCompleted,
	};
}

function findBook(bookId) {
	return books.find((bookItem) => bookItem.id === bookId) || null;
}

function makeBook(bookObject) {
	const { id, title, author, year, isCompleted } = bookObject;

	const bookTitle = document.createElement("h3");
	bookTitle.innerText = title;

	const bookAuthor = document.createElement("p");
	bookAuthor.innerText = `Penulis: ${author}`;

	const bookYearPublication = document.createElement("p");
	bookYearPublication.innerText = `Tahun: ${year}`;

	const container = document.createElement("section");
	container.classList.add("book_item");
	container.setAttribute("id", `book-${id}`);
	container.append(bookTitle, bookAuthor, bookYearPublication);

	const action = document.createElement("div");
	action.classList.add("action");

	const undoButton = document.createElement("button");
	undoButton.classList.add("green");
	undoButton.innerText = isCompleted ? "Belum selesai dibaca" : "Sudah dibaca";
	undoButton.addEventListener("click", () => {
		isCompleted ? undoTaskFromCompleted(id) : addTaskToCompleted(id);
	});

	const removeButton = document.createElement("button");
	removeButton.classList.add("red");
	removeButton.innerText = "Hapus buku";
	removeButton.addEventListener("click", () => {
		removeTaskFromCompleted(id);
	});

	action.append(undoButton, removeButton);
	container.append(action);

	return container;
}

function undoTaskFromCompleted(bookId) {
	const bookTarget = findBook(bookId);
	if (bookTarget) {
		bookTarget.isCompleted = false;
		document.dispatchEvent(new Event(RENDER_EVENT));
		saveData();
	}
}

function removeTaskFromCompleted(bookId) {
	const bookIndex = books.findIndex((bookItem) => bookItem.id === bookId);
	if (bookIndex !== -1) {
		books.splice(bookIndex, 1);
		document.dispatchEvent(new Event(RENDER_EVENT));
		saveData();
	}
}

function addTaskToCompleted(bookId) {
	const bookTarget = findBook(bookId);
	if (bookTarget) {
		bookTarget.isCompleted = true;
		document.dispatchEvent(new Event(RENDER_EVENT));
		saveData();
	}
}

function addBook() {
	const titlebook = document.getElementById("inputBookTitle").value;
	const authorBook = document.getElementById("inputBookAuthor").value;
	const yearOfBook = document.getElementById("inputBookYear").value;
	const isCompleted = document.getElementById("inputBookIsComplete").checked;

	const generatedID = generateID();

	const bookObject = generateBookObject(
		generatedID,
		titlebook,
		authorBook,
		yearOfBook,
		isCompleted
	);

	books.push(bookObject);

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();

	if (isCompleted) {
		addTaskToCompleted(generatedID);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const submitForm = document.getElementById("inputBook");
	submitForm.addEventListener("submit", (event) => {
		event.preventDefault();

		const titlebook = document.getElementById("inputBookTitle").value;
		const isDuplicated = books.some((book) => book.title === titlebook);

		if (isDuplicated) {
			alert(`Buku sudah ditambahkan di daftar`);
		} else {
			addBook();
		}

		document.getElementById("inputBookTitle").value = "";
		document.getElementById("inputBookAuthor").value = "";
		document.getElementById("inputBookYear").value = "";
		document.getElementById("inputBookIsComplete").checked = false;
	});

	const searchForm = document.getElementById("searchBook");
	searchForm.addEventListener("submit", (event) => {
		event.preventDefault();
		searchBook();
	});

	const inputSearchBookTitle = document.getElementById("searchBookTitle");
	inputSearchBookTitle.addEventListener("change", (event) => {
		event.preventDefault();
		searchBook();
	});

	if (isStorageExist()) {
		loadDataFromStorage();
	}
});

document.addEventListener(RENDER_EVENT, () => {
	const incompleteBookshelfList = document.getElementById(
		"incompleteBookshelfList"
	);
	incompleteBookshelfList.innerHTML = "";

	const completeBookshelfList = document.getElementById(
		"completeBookshelfList"
	);
	completeBookshelfList.innerHTML = "";

	for (const bookItem of books) {
		const bookElement = makeBook(bookItem);
		bookItem.isCompleted
			? completeBookshelfList.append(bookElement)
			: incompleteBookshelfList.append(bookElement);
	}
});

const isStorageExist = () => {
	if (typeof Storage === "undefined") {
		alert("Browser kamu tidak mendukung Web Storage");
		return false;
	}

	return true;
};

const saveData = () => {
	if (isStorageExist()) {
		const parsed = JSON.stringify(books);
		localStorage.setItem(STORAGE_KEY, parsed);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
};

document.addEventListener(SAVED_EVENT, () => {
	localStorage.getItem(STORAGE_KEY);
});

const loadDataFromStorage = () => {
	const serializedData = localStorage.getItem(STORAGE_KEY);
	const data = JSON.parse(serializedData) || [];

	if (data.length) {
		books.push(...data);
		document.dispatchEvent(new Event(RENDER_EVENT));
	}
};

function searchBook() {
	const searchTitle = document
		.getElementById("searchBookTitle")
		.value.toLowerCase();
	const searchResults = books.filter((book) =>
		book.title.toLowerCase().includes(searchTitle)
	);

	const searchResultContainer = document.getElementById(
		"searchResultContainer"
	);
	searchResultContainer.innerHTML = "";

	if (searchResults.length) {
		for (const resultBook of searchResults) {
			const resultBookElement = makeBook(resultBook);
			searchResultContainer.appendChild(resultBookElement);
		}
	} else {
		searchResultContainer.innerHTML =
			"<p>Tidak ada buku yang sesuai dengan pencarian.</p>";
	}
}
