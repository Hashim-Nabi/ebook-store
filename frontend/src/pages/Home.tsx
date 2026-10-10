import { motion } from "framer-motion";
import { Search, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react"; // Import useEffect
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
// --- Import Components & Data ---
import BookCard from "../components/BookCard";
import Loader from "../components/Loader"; // Import Loader
import { API_URL } from "../apiConfig"; // Import API base URL
import type { BookWithDetails, Category } from "../types"; // Import necessary types

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // --- State for API Data ---
  const [featuredBooks, setFeaturedBooks] = useState<BookWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true); // Start in loading state
  const [error, setError] = useState<string | null>(null); // State for errors

  // --- Fetch Data from Backend ---
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        // Fetch books and categories simultaneously
        const [booksRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/books?limit=4`), // Fetch only a few books (e.g., 4) - We need to add limit logic to backend later
          fetch(`${API_URL}/categories?limit=6`), // Fetch a few categories - We need to add limit logic to backend later
        ]);

        if (!booksRes.ok || !categoriesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const booksData: BookWithDetails[] = await booksRes.json();
        const categoriesData: Category[] = await categoriesRes.json();

        // Use fetched data (adjust slice if backend sends limited data)
        setFeaturedBooks(booksData.slice(0, 4));
        setCategories(categoriesData.slice(0, 6));
      } catch (err: any) {
        console.error("Error fetching home data:", err);
        setError(err.message || "Could not load data. Please try again later.");
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchHomeData();
  }, []); // Empty dependency array means run once on component mount

  // --- Event Handlers ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/books?category=${categoryId}`);
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50">
      {" "}
      {/* Adjusted min-height */}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden py-20 md:py-28">
        {" "}
        {/* Adjusted padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {" "}
              {/* Adjusted size/leading */}
              Discover Your Next
              <br />
              <span className="text-yellow-300">Favorite Book</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Explore thousands of titles across all genres, ready to be
              delivered to your door.
            </p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-xl mx-auto" // Adjusted max-width
            >
              <div className="relative">
                <input
                  type="search" // Use type="search" for better semantics
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors..."
                  className="w-full pl-5 pr-16 py-3 rounded-full text-gray-900 text-base shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50" // Adjusted padding/ring
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1" // Adjusted padding/focus
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </motion.form>
          </motion.div>
        </div>
        {/* Optional Decorative Elements can be added here */}
      </section>
      {/* Display Loading or Error State */}
      {loading && <Loader size="lg" />}
      {error && (
        <div className="text-center py-10 text-red-600 bg-red-50">{error}</div>
      )}
      {/* Categories Section (Only render if not loading and no error) */}
      {!loading && !error && categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Browse by Category
              </h2>
              <p className="text-lg text-gray-600">
                Find your perfect read in any genre.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5" // Adjusted gap
            >
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    scale: 1.03,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  onClick={() => handleCategoryClick(category.id)}
                  className="bg-gray-50 p-4 rounded-lg cursor-pointer shadow hover:shadow-md transition-all duration-200 text-center" // Adjusted styles
                >
                  <BookOpen className="h-7 w-7 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-1">
                    {category.name}
                  </h3>
                  {/* Optional: Description can be added if needed */}
                  {/* <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p> */}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
      {/* Featured Books Section (Only render if not loading and no error) */}
      {!loading && !error && featuredBooks.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10" // Adjusted margin
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Featured Books
                </h2>
                <p className="text-lg text-gray-600">
                  Hand-picked selections you might love.
                </p>
              </div>
              <Link // Use Link instead of button for navigation
                to="/books"
                className="mt-3 sm:mt-0 flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors group"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
      {/* --- Other Sections (like Best Sellers, CTA) can be added similarly --- */}
      {/* Example: Best Sellers Section (you would need a separate API endpoint ideally) */}
      {/* {!loading && !error && featuredBooks.length > 0 && ( // Reusing featured for now
         <section className="py-16 bg-white"> ... </section>
      )} */}
      {/* Call to Action Section */}
      {!loading &&
        !error && ( // Only show CTA if data loaded
          <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Join Our Book Community
                </h2>
                <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                  Get exclusive deals, recommendations, and early access to new
                  releases.
                </p>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/signup")}
                  className="px-8 py-3 bg-white text-blue-700 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-md"
                >
                  Sign Up Now
                </motion.button>
              </motion.div>
            </div>
          </section>
        )}
    </div>
  );
};

export default Home;
