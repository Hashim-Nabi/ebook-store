import express from "express";
const router = express.Router();
// Import controller functions (note .js extension)
import {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../controllers/authorController.js";
// Import middleware functions (note .js extension)
import { protect, admin } from "../middlewares/authMiddleware.js";

// Routes for getting all authors (public) and creating an author (admin only)
router
  .route("/")
  .get(getAuthors) // Anyone can get authors
  .post(protect, admin, createAuthor); // Only logged-in admins can create

// Routes for updating or deleting a specific author by ID (admin only)
router
  .route("/:id")
  .put(protect, admin, updateAuthor) // Only logged-in admins can update
  .delete(protect, admin, deleteAuthor); // Only logged-in admins can delete

export default router;
