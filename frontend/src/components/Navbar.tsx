import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  BookOpen,
  Search,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext"; // <-- CartContext Hook
import { useAuth } from "../context/AuthContext"; // <-- AuthContext Hook

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Get state and functions from contexts
  const { getCartCount } = useCart();
  const { user, logout, isAdmin } = useAuth(); // Get user info, logout function, and admin status

  const cartCount = getCartCount();

  // Dynamic Navigation links based on admin status
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/books", label: "Books" },
  ];

  if (isAdmin) {
    navLinks.push({ path: "/admin", label: "Admin" }); // Add Admin link if user is admin
  }

  // Function to check if a link is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="h-8 w-8 text-blue-600" />
            </motion.div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              The Quite Page
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator" // Animation for active link underline
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon (Links to Books page) */}
            <Link to="/books">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search Books"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </motion.button>
            </Link>

            {/* Cart Icon with Badge */}
            <Link to="/cart" className="relative" aria-label="Shopping Cart">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {cartCount > 0 && ( // Show badge only if cart is not empty
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold"
                    aria-label={`${cartCount} items in cart`}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            </Link>

            {/* Conditional rendering based on user login status */}
            {user ? (
              // If logged in: Show Profile icon and Logout button
              <>
                <Link to="/profile" aria-label="User Profile">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-700" />
                  </motion.button>
                </Link>
                <motion.button
                  onClick={logout} // Call logout function from AuthContext
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                </motion.button>
              </>
            ) : (
              // If logged out: Show Login icon
              <Link to="/login" aria-label="Login">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-700" />
                </motion.button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)} // Close menu on link click
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
