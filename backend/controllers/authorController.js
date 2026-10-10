import asyncHandler from "express-async-handler";
import Author from "../models/authorModel.js"; // Import Author model
import Book from "../models/bookModel.js"; // Needed for delete check

// @desc    Fetch all authors
// @route   GET /api/authors
// @access  Public
export const getAuthors = asyncHandler(async (req, res) => {
  const authors = await Author.find({}).sort({ name: 1 });
  res.json(authors);
});

// --- Admin Only Actions ---

// @desc    Create a new author
// @route   POST /api/authors
// @access  Private/Admin
export const createAuthor = asyncHandler(async (req, res) => {
  const { name, bio, photo_url } = req.body;

  if (!name || name.trim() === "") {
    res.status(400);
    throw new Error("Author name is required");
  }

  const authorExists = await Author.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (authorExists) {
    res.status(400);
    throw new Error("Author with this name already exists");
  }

  const author = new Author({ name: name.trim(), bio, photo_url });
  const createdAuthor = await author.save();
  res.status(201).json(createdAuthor);
});

// @desc    Update an existing author
// @route   PUT /api/authors/:id
// @access  Private/Admin
export const updateAuthor = asyncHandler(async (req, res) => {
  const { name, bio, photo_url } = req.body;
  const author = await Author.findById(req.params.id);

  if (author) {
    const trimmedName = name?.trim();
    author.name = trimmedName || author.name;
    author.bio = bio !== undefined ? bio : author.bio;
    author.photo_url = photo_url !== undefined ? photo_url : author.photo_url;

    // Check name conflict only if name is being changed
    if (
      trimmedName &&
      trimmedName.toLowerCase() !== author.name.toLowerCase()
    ) {
      const existingAuthor = await Author.findOne({
        name: { $regex: `^${trimmedName}$`, $options: "i" },
        _id: { $ne: author._id },
      });
      if (existingAuthor) {
        res.status(400);
        throw new Error("Another author with this name already exists");
      }
    }

    const updatedAuthor = await author.save();
    res.json(updatedAuthor);
  } else {
    res.status(404);
    throw new Error("Author not found");
  }
});

// @desc    Delete an author
// @route   DELETE /api/authors/:id
// @access  Private/Admin
export const deleteAuthor = asyncHandler(async (req, res) => {
  const authorId = req.params.id;
  const author = await Author.findById(authorId);

  if (author) {
    // Safety Check: Prevent deletion if books are linked
    const booksByAuthor = await Book.countDocuments({ author: authorId });
    if (booksByAuthor > 0) {
      res.status(400);
      throw new Error(
        `Cannot delete author "${author.name}" as ${booksByAuthor} book(s) are assigned.`
      );
    }

    await author.deleteOne();
    res.json({ message: `Author "${author.name}" removed successfully` });
  } else {
    res.status(404);
    throw new Error("Author not found");
  }
});
