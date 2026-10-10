import express from "express";
const router = express.Router();
// Import controller functions (note .js extension)
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} from "../controllers/userController.js";
// Import middleware functions (note .js extension)
import { protect, admin } from "../middlewares/authMiddleware.js";

// Routes for the logged-in user's own profile (requires login)
router
  .route("/profile")
  .get(protect, getUserProfile) // Get own profile
  .put(protect, updateUserProfile); // Update own profile

// Route for getting all users (admin only)
router.route("/").get(protect, admin, getAllUsers); // Requires login AND admin role

// Optional: Add routes for admin managing specific users later
// router.route('/:id').get(protect, admin, getUserById).put(protect, admin, updateUser).delete(protect, admin, deleteUser);

export default router;
