import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import { useCart } from "../context/CartContext"; // Import Cart hook
import Button from "../components/Button"; // Import Button component

const Cart = () => {
  const navigate = useNavigate();
  // Get cart state and functions from CartContext
  const {
    items,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
    clearCart,
  } = useCart();

  // Calculate totals
  const subtotal = getCartTotal();
  const itemCount = getCartCount();
  // Simple shipping rule: free over $50
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
  // Simple tax rule: 10%
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Navigate to checkout page if cart is not empty
  const handleCheckout = () => {
    if (items.length > 0) {
      navigate("/checkout");
    }
  };

  // Fallback image URL
  const fallbackImageUrl =
    "https://islandpress.org/sites/default/files/default_book_cover_2015.jpg";

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8 md:py-12">
      {" "}
      {/* Adjusted min-height and padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </motion.div>

        {items.length === 0 ? (
          // --- Empty Cart State ---
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center"
          >
            <ShoppingBag
              strokeWidth={1}
              className="h-20 w-20 text-gray-300 mx-auto mb-5"
            />
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any books yet.
            </p>
            <Button onClick={() => navigate("/books")} size="lg">
              Browse Books
            </Button>
          </motion.div>
        ) : (
          // --- Cart with Items ---
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.book.id}
                    layout // Animate position changes
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 flex flex-col sm:flex-row gap-4"
                  >
                    {/* Book Image */}
                    <Link
                      to={`/book/${item.book.id}`}
                      className="flex-shrink-0 w-full sm:w-24"
                    >
                      <img
                        src={item.book.cover_image_url || fallbackImageUrl}
                        alt={item.book.title}
                        className="w-full h-36 sm:h-full object-cover rounded"
                        onError={(e) =>
                          (e.currentTarget.src = fallbackImageUrl)
                        }
                      />
                    </Link>

                    {/* Book Details & Actions */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/book/${item.book.id}`}
                          className="hover:text-blue-600"
                        >
                          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                            {item.book.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mb-2">
                          by {item.book.author?.name || "Unknown Author"}
                        </p>
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          ${item.book.price.toFixed(2)} / unit
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 sm:mt-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQuantity(item.book.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </motion.button>
                          <span className="px-3 py-1 text-sm font-medium text-gray-800 border-x border-gray-200 w-10 text-center">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQuantity(item.book.id, item.quantity + 1)
                            }
                            // Disable if quantity reaches stock limit
                            disabled={item.quantity >= item.book.stock_quantity}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </motion.button>
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item.book.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          aria-label={`Remove ${item.book.title}`}
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Clear Cart Button */}
              {items.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearCart}
                  className="w-full mt-2 py-2 border border-red-200 text-sm text-red-600 rounded-md font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={16} /> Clear Cart
                </motion.button>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6 sticky top-24" // Sticky summary
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-5 border-b pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-medium text-gray-800">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-800">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Est. Tax (10%)</span>
                    <span className="font-medium text-gray-800">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900 mb-5">
                    <span>Order Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={items.length === 0} // Disable if cart is empty
                    className="w-full flex items-center justify-center space-x-2 py-3"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Optional: Add payment icons or security badges */}
                <p className="text-xs text-gray-400 text-center mt-4">
                  Secure checkout
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
