import { useState, useEffect, useMemo } from "react"; // Added useMemo
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, Search } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom"; // Added useNavigate

// --- Import Components & Data ---
import BookCard from "../components/BookCard";
import Loader from "../components/Loader";
import Button from "../components/Button"; // Import Button
import type { BookWithDetails, Category, Author } from "../types";
import { API_URL } from "../apiConfig";

const Books = () => {
  const [searchParams, setSearchParams] = useSearchParams(); // Get and set search params
  const navigate = useNavigate(); // For updating URL without full reload

  // --- State ---
  const [allBooks, setAllBooks] = useState<BookWithDetails[]>([]); // All books from API
  const [categories, setCategories] = useState<Category[]>([]); // All categories from API
  const [authors, setAuthors] = useState<Author[]>([]); // All authors from API
  const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // --- Filter States ---
  // Initialize filters from URL search params or defaults
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  ); // Local search input state
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedAuthor, setSelectedAuthor] = useState("all"); // Not using URL param for author initially
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]); // Max price can be dynamic later
  const [sortBy, setSortBy] = useState("title"); // Default sort

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [booksRes, categoriesRes, authorsRes] = await Promise.all([
          fetch(`${API_URL}/books`), // Fetch all books
          fetch(`${API_URL}/categories`), // Fetch all categories
          fetch(`${API_URL}/authors`), // Fetch all authors
        ]);

        if (!booksRes.ok || !categoriesRes.ok || !authorsRes.ok) {
          throw new Error("Failed to fetch initial data");
        }

        const booksData = await booksRes.json();
        const categoriesData = await categoriesRes.json();
        const authorsData = await authorsRes.json();

        setAllBooks(booksData);
        setCategories(categoriesData);
        setAuthors(authorsData);

        // Determine max price for slider (optional)
        // const maxPrice = Math.ceil(Math.max(...booksData.map((b: BookWithDetails) => b.price), 100));
        // setPriceRange([0, maxPrice]);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Could not load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Run only once on mount

  // --- Client-Side Filtering and Sorting Logic ---
  const filteredBooks = useMemo(() => {
    let booksToFilter = [...allBooks];
    const currentSearchTerm = searchParams.get("search") || ""; // Read search term from URL

    // 1. Filter by Search Term (from URL)
    if (currentSearchTerm) {
      booksToFilter = booksToFilter.filter(
        (book) =>
          book.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
          book.author.name
            .toLowerCase()
            .includes(currentSearchTerm.toLowerCase()) ||
          book.isbn.toLowerCase().includes(currentSearchTerm.toLowerCase())
      );
    }

    // 2. Filter by Category (from state, sync'd with URL)
    if (selectedCategory !== "all") {
      booksToFilter = booksToFilter.filter(
        (book) => book.category.id === selectedCategory
      );
    }

    // 3. Filter by Author (from state)
    if (selectedAuthor !== "all") {
      booksToFilter = booksToFilter.filter(
        (book) => book.author.id === selectedAuthor
      );
    }

    // 4. Filter by Price Range (from state)
    booksToFilter = booksToFilter.filter(
      (book) => book.price >= priceRange[0] && book.price <= priceRange[1]
    );

    // 5. Sort
    booksToFilter.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating; // Assuming higher rating is better
        case "title":
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return booksToFilter;
  }, [
    allBooks,
    searchParams,
    selectedCategory,
    selectedAuthor,
    priceRange,
    sortBy,
  ]); // Recalculate when dependencies change

  // --- Event Handlers for Filters ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  
  // Apply search term to URL params on form submit or button click
  const applySearch = () => {
    setSearchParams(
      (prev) => {
        if (searchTerm.trim()) {
          prev.set("search", searchTerm.trim());
        } else {
          prev.delete("search");
        }
        return prev;
      },
      { replace: true }
    ); // Use replace to avoid excessive history entries
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applySearch();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    // Update URL param for category
    setSearchParams(
      (prev) => {
        if (categoryId !== "all") {
          prev.set("category", categoryId);
        } else {
          prev.delete("category");
        }
        prev.delete("search"); // Clear search when category changes? Optional.
        return prev;
      },
      { replace: true }
    );
    setSearchTerm(""); // Clear local search term when category changes
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAuthor(e.target.value);
    // Note: We are not updating URL for author to keep URL cleaner, filtering happens client-side
  };

  const handlePriceChange = (index: 0 | 1, value: number) => {
    setPriceRange((prev) => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      // Ensure min price isn't greater than max price
      if (index === 0 && newRange[0] > newRange[1]) newRange[1] = newRange[0];
      if (index === 1 && newRange[1] < newRange[0]) newRange[0] = newRange[1];
      return newRange;
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedAuthor("all");
    setPriceRange([0, 100]); // Reset to default range
    setSortBy("title");
    setSearchTerm(""); // Clear local search term
    setSearchParams({}, { replace: true }); // Clear URL params
    setShowFilters(false); // Close mobile filters
  };

  // Effect to sync category state if URL param changes externally
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8">
      {" "}
      {/* Adjusted min-height */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            All Books
          </h1>
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-4 max-w-lg relative"
          >
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title, author, ISBN..."
              className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
          <p className="text-sm text-gray-600 mt-3">
            Showing {filteredBooks.length}{" "}
            {filteredBooks.length === 1 ? "book" : "books"}{" "}
            {searchParams.get("search")
              ? `for "${searchParams.get("search")}"`
              : ""}
          </p>
        </motion.div>
        {/* Main Layout: Filters + Grid */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between bg-white p-3 rounded-lg shadow mb-4 text-left"
            >
              <span className="font-semibold flex items-center text-gray-700">
                <Filter className="h-5 w-5 mr-2 text-blue-600" />
                Filters & Sort
              </span>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Filter Panel (Desktop always visible, Mobile toggled) */}
            <AnimatePresence>
              {(showFilters || window.innerWidth >= 1024) && ( // Simple check for desktop
                <motion.div
                  key="filters"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-5 rounded-lg shadow space-y-5 overflow-hidden lg:overflow-visible lg:h-auto lg:opacity-100 lg:block" // Ensure desktop styles override animation
                >
                  {/* Filter Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-800">
                      Filters
                    </h3>
                    <button
                      onClick={resetFilters}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label
                      htmlFor="category-filter"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category
                    </label>
                    <select
                      id="category-filter"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Author Filter */}
                  <div>
                    <label
                      htmlFor="author-filter"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Author
                    </label>
                    <select
                      id="author-filter"
                      value={selectedAuthor}
                      onChange={handleAuthorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="all">All Authors</option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range:{" "}
                      <span className="font-semibold">
                        ${priceRange[0]} - ${priceRange[1]}
                      </span>
                    </label>
                    <div className="space-y-3">
                      {/* Min Price Slider */}
                      <input
                        type="range"
                        min="0"
                        max="100" // Adjust max based on actual max price if needed
                        value={priceRange[0]}
                        onChange={(e) =>
                          handlePriceChange(0, Number(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700"
                        aria-label="Minimum Price"
                      />
                      {/* Max Price Slider */}
                      <input
                        type="range"
                        min="0"
                        max="100" // Adjust max based on actual max price if needed
                        value={priceRange[1]}
                        onChange={(e) =>
                          handlePriceChange(1, Number(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700"
                        aria-label="Maximum Price"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label
                      htmlFor="sort-by"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Sort By
                    </label>
                    <select
                      id="sort-by"
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="title">Title (A-Z)</option>
                      <option value="price-low">Price (Low to High)</option>
                      <option value="price-high">Price (High to Low)</option>
                      <option value="rating">Rating (High to Low)</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>{" "}
          {/* End Filters Sidebar */}
          {/* Books Grid */}
          <div className="flex-1">
            {loading ? (
              <Loader size="lg" />
            ) : error ? (
              <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
                <X className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Failed to Load Books
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                {/* Optional: Add a retry button */}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No books found
                </h3>
                <p className="text-gray-600 mb-5">
                  Try adjusting your search or filters.
                </p>
                <Button onClick={resetFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <motion.div
                variants={containerVariants} // Use container variants for stagger
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6" // Responsive grid
              >
                {filteredBooks.map((book, index) => (
                  <BookCard key={book.id} book={book} index={index} />
                ))}
              </motion.div>
            )}
          </div>{" "}
          {/* End Books Grid */}
        </div>{" "}
        {/* End Main Layout */}
      </div>
    </div>
  );
};

export default Books;
