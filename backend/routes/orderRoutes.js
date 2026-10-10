import express from "express";
const router = express.Router();
// Import controller functions (note .js extension)
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToDelivered,
  // updateOrderToPaid, // Import if added
} from "../controllers/orderController.js";
// Import middleware functions (note .js extension)
import { protect, admin } from "../middlewares/authMiddleware.js";

// Route for creating a new order (requires login)
// Route for getting all orders (admin only)
router.route("/").post(protect, createOrder).get(protect, admin, getAllOrders);

// Route for getting the logged-in user's orders (requires login)
router.route("/myorders").get(protect, getMyOrders);

// Route for getting a specific order by ID (requires login - owner or admin)
router.route("/:id").get(protect, getOrderById);

// Route for marking an order as delivered (admin only)
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);

// Optional: Route for marking an order as paid (requires login)
// router.route('/:id/pay').put(protect, updateOrderToPaid);

export default router;
