import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Star,
  ArrowLeft,
  Package,
  Truck,
  Minus,
  Plus,
  Check,
} from "lucide-react"; // Added icons
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { API_URL } from "../apiConfig";
import BookCard from "../components/BookCard"; // Reusable BookCard for related books
import Button from "../components/Button";
import Loader from "../components/Loader";
import NotFound from "./NotFound"; // Import NotFound page for handling errors
import type { BookWithDetails } from "../types";

const BookDetails = () => {
  const { id } = useParams<{ id: string }>(); // Get the book ID from the URL
  const navigate = useNavigate();
  const { addToCart, items: cartItems } = useCart(); // Get addToCart and current items

  // --- State ---
  const [book, setBook] = useState<BookWithDetails | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<BookWithDetails[]>([]);
  const [quantity, setQuantity] = useState(1); // Quantity to add/buy
  const [isWishlisted, setIsWishlisted] = useState(false); // Wishlist state (local only for now)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false); // State for add to cart feedback

  // --- Fetch Book and Related Books Data ---
  useEffect(() => {
    const fetchBookData = async () => {
      if (!id) {
        setError("Book ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setAddedToCart(false); // Reset added feedback
      setQuantity(1); // Reset quantity

      try {
        // Fetch the main book details
        const bookRes = await fetch(`${API_URL}/books/${id}`);
        if (bookRes.status === 404) throw new Error("Book not found.");
        if (!bookRes.ok) throw new Error("Failed to fetch book details.");
        const bookData: BookWithDetails = await bookRes.json();
        setBook(bookData);

        // Fetch related books (same category, different ID)
        if (bookData.category?.id) {
          // Check if category exists
          const relatedRes = await fetch(
            `${API_URL}/books?category=${bookData.category.id}`
          );
          if (relatedRes.ok) {
            const allRelated: BookWithDetails[] = await relatedRes.json();
            setRelatedBooks(
              allRelated.filter((b) => b.id !== bookData.id).slice(0, 4) // Exclude current book, limit to 4
            );
          }
        }
      } catch (err: any) {
        console.error("Error fetching book details:", err);
        setError(err.message || "Could not load book details.");
        setBook(null); // Ensure book state is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
    // Scroll to top when ID changes
    window.scrollTo(0, 0);
  }, [id]); // Refetch when the book ID changes

  // --- Event Handlers ---
  const handleQuantityChange = (amount: number) => {
    if (!book) return;
    setQuantity((prev) => {
      const newQuantity = prev + amount;
      // Ensure quantity is between 1 and stock available
      return Math.max(1, Math.min(newQuantity, book.stock_quantity));
    });
  };

  const handleAddToCart = () => {
    if (!book || book.stock_quantity === 0) return;
    addToCart(book, quantity);
    setAddedToCart(true); // Show feedback
    setTimeout(() => setAddedToCart(false), 2000); // Hide feedback after 2 seconds
  };

  const handleBuyNow = () => {
    if (!book || book.stock_quantity === 0) return;
    addToCart(book, quantity); // Add to cart first
    navigate("/checkout"); // Then navigate to checkout
  };

  // --- Render States ---
  if (loading) {
    return <Loader fullScreen />; // Show full screen loader while fetching
  }

  if (error) {
    // Show a proper error message or the NotFound component
    return <NotFound message={error} />;
  }

  if (!book) {
    // This case might be covered by error, but good as a fallback
    return <NotFound message="Book data could not be loaded." />;
  }

  // --- Main JSX ---
  const isInStock = book.stock_quantity > 0;
  const fallbackImageUrl =
    "https://islandpress.org/sites/default/files/default_book_cover_2015.jpg";

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-6 md:py-10">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)} // Go back to the previous page
          className="flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </motion.button>
      </div>

      {/* Book Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-6 md:p-8">
            {/* Book Image Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-1 lg:col-span-2 flex justify-center items-start"
            >
              <div className="relative w-full max-w-xs md:max-w-sm sticky top-24">
                {" "}
                {/* Sticky image */}
                <img
                  src={book.cover_image_url || fallbackImageUrl}
                  alt={book.title}
                  className="w-full h-auto object-contain rounded-lg shadow-md"
                  onError={(e) => (e.currentTarget.src = fallbackImageUrl)}
                />
                {book.stock_quantity < 10 && book.stock_quantity > 0 && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow">
                    Only {book.stock_quantity} left
                  </div>
                )}
                {!isInStock && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow">
                    Out of Stock
                  </div>
                )}
              </div>
            </motion.div>

            {/* Book Information Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="md:col-span-1 lg:col-span-3 space-y-4 md:space-y-5" // Spacing between elements
            >
              {/* Category Badge */}
              <div>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium tracking-wide">
                  {book.category?.name || "Uncategorized"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {book.title}
              </h1>

              {/* Author */}
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-gray-500">by</span>
                <Link
                  to={`/books?author=${book.author?.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {book.author?.name || "Unknown Author"}
                </Link>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={` ${
                        i < Math.round(book.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-800 pt-px">
                  {book.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 pt-px">
                  ({book.numReviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${book.price.toFixed(2)}
                </span>
                {/* Optional: Show discount or original price here */}
              </div>

              {/* Stock Status */}
              <div
                className={`text-sm font-medium ${
                  isInStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {isInStock ? `${book.stock_quantity} in stock` : "Out of stock"}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-1.5 text-base">
                  Description
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-5">
                  {" "}
                  {/* Limit initial lines */}
                  {book.description}
                </p>
                {/* Optional: Add a "Read More" button if description is long */}
              </div>

              {/* Book Info (ISBN, Publication Date) */}
              <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-200 text-sm">
                <div>
                  <p className="text-gray-500">ISBN</p>
                  <p className="font-medium text-gray-800">{book.isbn}</p>
                </div>
                <div>
                  <p className="text-gray-500">Published</p>
                  <p className="font-medium text-gray-800">
                    {book.publication_date
                      ? new Date(book.publication_date).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Quantity Selector (Only if in stock) */}
              {isInStock && (
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-700 text-sm">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-1.5 font-semibold text-gray-800 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= book.stock_quantity}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isInStock || addedToCart} // Disable if out of stock or already added
                  className="flex-1 flex items-center justify-center space-x-2 py-3"
                  variant={addedToCart ? "secondary" : "primary"} // Change variant on add
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} /> <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  variant="secondary" // Use secondary style for Buy Now
                  className="flex-1 py-3"
                >
                  Buy Now
                </Button>

                {/* Wishlist Button (local state only) */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
                  aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <Heart
                    size={20}
                    className={`transition-colors ${
                      isWishlisted
                        ? "text-red-500 fill-current"
                        : "text-gray-400"
                    }`}
                  />
                </motion.button>
              </div>

              {/* Shipping Info */}
              <div className="space-y-2 pt-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-green-600" />
                  <span>
                    {isInStock ? "Ready to ship" : "Currently unavailable"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck size={16} className="text-blue-600" />
                  <span>Free shipping on orders over $50</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 md:mt-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook, index) => (
                <BookCard
                  key={relatedBook.id}
                  book={relatedBook}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- NotFound Component (can be moved to its own file later) ---
interface NotFoundProps {
  message?: string;
}
const DefaultNotFound: React.FC<NotFoundProps> = ({
  message = "The page you're looking for doesn't exist.",
}) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <X size={64} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Not Found</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button onClick={() => navigate("/")}>Go Back Home</Button>
      </motion.div>
    </div>
  );
};
// Use the DefaultNotFound component if NotFound wasn't imported
const EffectiveNotFound = NotFound || DefaultNotFound;

export default BookDetails;
