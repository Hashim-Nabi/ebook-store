import express from "express";
const router = express.Router();
// Import controller functions (note .js extension)
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
// Import middleware functions (note .js extension)
import { protect, admin } from "../middlewares/authMiddleware.js";

// Routes for getting all categories (public) and creating a category (admin only)
router
  .route("/")
  .get(getCategories) // Anyone can get categories
  .post(protect, admin, createCategory); // Only logged-in admins can create

// Route for deleting a specific category by ID (admin only)
router.route("/:id").delete(protect, admin, deleteCategory); // Only logged-in admins can delete
// Add .put() route here if update functionality is needed later

export default router;
