import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- Context Providers ---
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// --- Layout Components ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute"; // Component to protect routes

// --- Page Components ---
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound"; // 404 page

function App() {
  return (
    // AuthProvider wraps everything to manage login state globally
    <AuthProvider>
      {/* CartProvider is inside to access user info if needed in the future */}
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navbar is always visible */}
            <Navbar />

            {/* Main content area where pages are rendered */}
            <main className="flex-grow">
              {/* Define all application routes */}
              <Routes>
                {/* --- Public Routes (Accessible to everyone) --- */}
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/book/:id" element={<BookDetails />} />
                <Route path="/cart" element={<Cart />} />

                {/* --- Authentication Routes --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* --- Protected Routes (Require user to be logged in) --- */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                {/* --- Admin Only Route (Requires login AND admin role) --- */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* --- Catch-all Route for 404 Not Found --- */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer is always visible */}
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
