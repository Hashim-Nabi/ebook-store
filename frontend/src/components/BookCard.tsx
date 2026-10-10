import { motion } from "framer-motion";
import { ShoppingCart, Eye, Star } from "lucide-react";
import type { BookWithDetails } from "../types"; // Import the detailed book type
import { useCart } from "../context/CartContext"; // Import the cart hook
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  book: BookWithDetails; // Expects the book object with author and category details
  index?: number; // Optional index for staggered animation delay
}

const BookCard: React.FC<BookCardProps> = ({ book, index = 0 }) => {
  const { addToCart } = useCart(); // Get the addToCart function from context
  const navigate = useNavigate(); // Hook for navigation

  // Function to add the book to the cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from triggering
    addToCart(book);
    // Optional: Add a toast notification here for user feedback
    console.log(`${book.title} added to cart`);
  };

  // Function to navigate to the book details page
  const handleViewDetails = () => {
    navigate(`/book/${book.id}`); // Navigate using the book's ID
  };

  // Framer Motion variants for card animation (staggered entry)
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.08, // Small delay based on index
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // Fallback image URL
  const fallbackImageUrl =
    "https://islandpress.org/sites/default/files/default_book_cover_2015.jpg";

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -6,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }} // Lift effect on hover
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer group h-full flex flex-col" // Added h-full and flex flex-col for consistent height
      onClick={handleViewDetails}
      layout // Animate layout changes
    >
      {/* Book Cover Image */}
      <div className="relative h-60 overflow-hidden bg-gray-200">
        {" "}
        {/* Adjusted height */}
        <img
          // Use cover_image_url if available, otherwise use fallback
          src={book.cover_image_url || fallbackImageUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" // Subtle scale on hover
          // Add error handling for broken image links
          onError={(e) => (e.currentTarget.src = fallbackImageUrl)}
        />
        {/* Overlay with action buttons (visible on hover) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" // Use group-hover for visibility
        >
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#2563EB" }} // Use specific color value
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={book.stock_quantity === 0} // Disable if out of stock
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </motion.button>
          {/* Removed View Details button from overlay as card itself is clickable */}
        </motion.div>
        {/* Stock Badge */}
        {book.stock_quantity > 0 && book.stock_quantity < 10 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            Only {book.stock_quantity} left
          </div>
        )}
        {book.stock_quantity === 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            Out of Stock
          </div>
        )}
      </div>

      {/* Book Details (Flex-grow takes remaining space) */}
      <div className="p-4 flex flex-col flex-grow">
        {" "}
        {/* Added flex-grow */}
        {/* Category Badge */}
        <div className="mb-1">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {/* Safely access category name */}
            {book.category?.name || "Uncategorized"}
          </span>
        </div>
        {/* Book Title */}
        <h3 className="text-md font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors flex-grow">
          {" "}
          {/* Adjusted size, clamp, color, and added flex-grow */}
          {book.title}
        </h3>
        {/* Author Name */}
        <p className="text-sm text-gray-500 mb-2">
          {/* Safely access author name */}
          by {book.author?.name || "Unknown Author"}
        </p>
        {/* Rating */}
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(book.rating)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-1.5 text-xs text-gray-500">
            ({book.numReviews || 0} reviews) {/* Show review count */}
          </span>
        </div>
        {/* Price and Add to Cart Button (Pushed to bottom) */}
        <div className="flex items-center justify-between mt-auto pt-2">
          {" "}
          {/* Added mt-auto and pt-2 */}
          <span className="text-xl font-bold text-gray-800">
            ${book.price.toFixed(2)}
          </span>
          {/* Add to Cart Button (visible only if in stock) */}
          {book.stock_quantity > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
