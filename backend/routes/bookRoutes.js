import express from "express";
const router = express.Router();
// Import controller functions (note .js extension)
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
// Import middleware functions (note .js extension)
import { protect, admin } from "../middlewares/authMiddleware.js";

// Routes for getting all books (public) and creating a book (admin only)
router
  .route("/")
  .get(getBooks) // Anyone can get books
  .post(protect, admin, createBook); // Only logged-in admins can create

// Routes for getting, updating, or deleting a specific book by ID
router
  .route("/:id")
  .get(getBookById) // Anyone can get a specific book
  .put(protect, admin, updateBook) // Only logged-in admins can update
  .delete(protect, admin, deleteBook); // Only logged-in admins can delete

export default router;
