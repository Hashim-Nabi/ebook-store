import express from "express";
const router = express.Router();
// Import controller functions (note .js extension)
import { registerUser, loginUser } from "../controllers/authController.js";

// Route for user registration
router.post("/register", registerUser);

// Route for user login
router.post("/login", loginUser);

export default router; // Export the router
