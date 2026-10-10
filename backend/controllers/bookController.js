import asyncHandler from "express-async-handler";
import Book from "../models/bookModel.js"; // Import Book model

// @desc    Fetch all books (with optional filtering)
// @route   GET /api/books
// @access  Public
export const getBooks = asyncHandler(async (req, res) => {
  const { keyword, category, author, limit } = req.query;
  const filter = {};

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { isbn: { $regex: keyword, $options: "i" } },
    ];
  }
  if (category) filter.category = category;
  if (author) filter.author = author;

  let query = Book.find(filter)
    .populate("author", "id name") // Populate author details
    .populate("category", "id name"); // Populate category details

  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const books = await query;
  res.json(books);
});

// @desc    Fetch single book by ID
// @route   GET /api/books/:id
// @access  Public
export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate("author") // Populate full author
    .populate("category"); // Populate full category

  if (book) {
    res.json(book);
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// --- Admin Only Actions ---

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Admin
export const createBook = asyncHandler(async (req, res) => {
  const {
    title,
    isbn,
    description,
    price,
    stock_quantity,
    publication_date,
    cover_image_url,
    rating,
    author,
    category,
  } = req.body;

  if (
    !title ||
    !isbn ||
    !author ||
    !category ||
    price === undefined ||
    stock_quantity === undefined
  ) {
    res.status(400);
    throw new Error(
      "Missing required book details (title, isbn, author, category, price, stock)"
    );
  }

  const book = new Book({
    title,
    isbn,
    description,
    price,
    stock_quantity,
    publication_date,
    cover_image_url,
    rating,
    author,
    category,
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

// @desc    Update an existing book
// @route   PUT /api/books/:id
// @access  Private/Admin
export const updateBook = asyncHandler(async (req, res) => {
  const {
    title,
    isbn,
    description,
    price,
    stock_quantity,
    publication_date,
    cover_image_url,
    rating,
    author,
    category,
  } = req.body;

  const book = await Book.findById(req.params.id);

  if (book) {
    book.title = title || book.title;
    book.isbn = isbn || book.isbn;
    book.description = description || book.description;
    book.price = price !== undefined ? price : book.price;
    book.stock_quantity =
      stock_quantity !== undefined ? stock_quantity : book.stock_quantity;
    book.publication_date = publication_date || book.publication_date;
    book.cover_image_url = cover_image_url || book.cover_image_url;
    book.rating = rating !== undefined ? rating : book.rating;
    book.author = author || book.author;
    book.category = category || book.category;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    await book.deleteOne();
    res.json({ message: "Book removed successfully" });
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});
