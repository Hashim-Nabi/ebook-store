import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Book from "../models/bookModel.js"; // Needed for stock update

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, taxPrice, shippingPrice, totalPrice } =
    req.body;

  // Validation
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }
  if (
    !shippingAddress?.address ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.zipCode ||
    !shippingAddress?.fullName ||
    !shippingAddress?.phone
  ) {
    res.status(400);
    throw new Error("Shipping address is incomplete");
  }
  if (
    totalPrice === undefined ||
    taxPrice === undefined ||
    shippingPrice === undefined
  ) {
    res.status(400);
    throw new Error("Pricing information is missing");
  }

  // Map frontend items to backend schema (ensure book ID is passed correctly)
  const mappedOrderItems = orderItems.map((item) => ({
    title: item.title,
    quantity: item.quantity,
    price: item.price,
    cover_image_url: item.cover_image_url,
    book: item.bookId || item.book, // Accept bookId (from frontend state) or book (if full object sent)
  }));

  // Create order instance
  const order = new Order({
    user: req.user._id,
    orderItems: mappedOrderItems,
    shippingAddress,
    taxPrice,
    shippingPrice,
    totalPrice,
    status: "pending",
  });

  // --- Atomically Update Stock and Save Order ---
  try {
    // Check stock for all items BEFORE saving order
    for (const item of order.orderItems) {
      const book = await Book.findById(item.book);
      if (!book)
        throw new Error(
          `Book with ID ${item.book} not found during order creation`
        );
      if (book.stock_quantity < item.quantity) {
        throw new Error(
          `Not enough stock for "${item.title}". Only ${book.stock_quantity} available.`
        );
      }
    }

    // If stock check passes, save the order
    const createdOrder = await order.save();

    // After saving order, decrease stock for each item
    for (const item of createdOrder.orderItems) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock_quantity: -item.quantity },
      });
    }
    res.status(201).json(createdOrder); // Send created order back
  } catch (error) {
    res.status(400); // Bad request if stock check fails or other validation error
    throw error; // Rethrow the specific error message
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    // Security check: Allow only owner or admin
    if (order.user._id.equals(req.user._id) || req.user.role === "admin") {
      res.json(order);
    } else {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  }); // Newest first
  res.json(orders);
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name") // Include user ID and name
    .sort({ createdAt: -1 }); // Newest first
  res.json(orders);
});

// @desc    Update order to delivered (Admin only)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Optional: Check if paid first
    // if (!order.isPaid) {
    //   res.status(400); throw new Error('Order must be paid before marking as delivered');
    // }
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = "delivered"; // Update status

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// Add updateOrderToPaid if needed
