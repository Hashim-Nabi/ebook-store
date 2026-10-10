import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  MapPin,
  User as UserIcon,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"; // Added icons
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Cart hook
import { useAuth } from "../context/AuthContext"; // Auth hook
import Button from "../components/Button"; // Button component
import { API_URL } from "../apiConfig"; // API base URL
import Loader from "../components/Loader"; // Loader component

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart(); // Get cart details and clear function
  const { user, token } = useAuth(); // Get logged-in user details and token

  // --- State ---
  const [isProcessing, setIsProcessing] = useState(false); // Loading state for order placement
  const [orderComplete, setOrderComplete] = useState(false); // State for success screen
  const [apiError, setApiError] = useState<string | null>(null); // State for API errors

  // Form state - Pre-fill with user data if available
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: "",
    state: "",
    zipCode: "",
    // Payment fields (Note: In a real app, handle payment securely, e.g., with Stripe Elements)
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

  // Form validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Effects ---
  // Redirect to cart if it's empty and order isn't complete
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      console.log("Cart is empty, redirecting to cart page.");
      navigate("/cart", { replace: true });
    }
  }, [items, orderComplete, navigate]);

  // --- Calculations ---
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99; // Free shipping over $50
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  // --- Event Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for the field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // --- Form Validation ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Basic validation rules (can be enhanced)
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email address is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"; // Add phone validation if needed
    if (!formData.address.trim())
      newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required"; // Add zip code validation if needed

    // Basic payment validation (DO NOT use for real payments)
    if (!formData.cardNumber.trim())
      newErrors.cardNumber = "Card number is required";
    if (!formData.cardExpiry.trim())
      newErrors.cardExpiry = "Expiry date (MM/YY) is required";
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry))
      newErrors.cardExpiry = "Format must be MM/YY";
    if (!formData.cardCVC.trim()) newErrors.cardCVC = "CVC is required";
    else if (!/^\d{3,4}$/.test(formData.cardCVC))
      newErrors.cardCVC = "Must be 3 or 4 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // --- Handle Order Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null); // Clear previous API error

    if (!validateForm()) {
      // Find the first field with an error and scroll to it (optional enhancement)
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      element?.focus();
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsProcessing(true); // Show processing state

    // Prepare order data for the backend
    const orderData = {
      orderItems: items.map((item) => ({
        // Send necessary book details needed by backend Order model
        bookId: item.book.id, // Send book ID
        title: item.book.title,
        quantity: item.quantity,
        price: item.book.price, // Price at time of purchase
        cover_image_url: item.book.cover_image_url,
      })),
      shippingAddress: {
        // Match backend shippingAddress structure
        fullName: formData.fullName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        phone: formData.phone,
      },
      // Payment method details (should be handled securely in real app)
      // paymentMethod: 'Card', // Example
      taxPrice: parseFloat(tax.toFixed(2)),
      shippingPrice: parseFloat(shipping.toFixed(2)),
      totalPrice: parseFloat(total.toFixed(2)),
    };

    try {
      // Send the order data to the backend API (protected route)
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include JWT token for authorization
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Throw error if backend returns an error
        throw new Error(
          responseData.message || "Failed to place order. Please try again."
        );
      }

      // --- Order Successful ---
      setIsProcessing(false);
      setOrderComplete(true); // Show success screen
      clearCart(); // Clear the cart in context and localStorage
    } catch (error: any) {
      console.error("Order submission error:", error);
      setApiError(error.message); // Display error to user
      setIsProcessing(false); // Stop processing state
    }
  };

  // --- Render Order Complete Screen ---
  if (orderComplete) {
    return (
      <div className="min-h-[calc(100vh-128px)] bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-5" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Thank you for your purchase. Your order details have been sent to
            your email.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/profile")}
              className="w-full py-2.5"
            >
              View Order History
            </Button>
            <Button
              onClick={() => navigate("/books")}
              variant="outline"
              className="w-full py-2.5"
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Render Main Checkout Form ---
  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">
            Complete your shipping and payment details.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate>
          {" "}
          {/* Added noValidate to rely on custom validation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
            {/* --- Left Column: Forms --- */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow p-6"
              >
                <div className="flex items-center space-x-2 mb-5 border-b pb-3">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Personal Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.fullName ? "input-error" : ""
                      }`}
                      placeholder="John M Doe"
                    />
                    {errors.fullName && (
                      <p className="input-error-msg">{errors.fullName}</p>
                    )}
                  </div>
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.email ? "input-error" : ""
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="input-error-msg">{errors.email}</p>
                    )}
                  </div>
                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.phone ? "input-error" : ""
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="input-error-msg">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow p-6"
              >
                <div className="flex items-center space-x-2 mb-5 border-b pb-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Shipping Address
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.address ? "input-error" : ""
                      }`}
                      placeholder="123 Main St, Apt 4B"
                    />
                    {errors.address && (
                      <p className="input-error-msg">{errors.address}</p>
                    )}
                  </div>
                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.city ? "input-error" : ""
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && (
                      <p className="input-error-msg">{errors.city}</p>
                    )}
                  </div>
                  {/* State */}
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.state ? "input-error" : ""
                      }`}
                      placeholder="NY"
                    />
                    {errors.state && (
                      <p className="input-error-msg">{errors.state}</p>
                    )}
                  </div>
                  {/* ZIP Code */}
                  <div>
                    {" "}
                    {/* Changed span */}
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.zipCode ? "input-error" : ""
                      }`}
                      placeholder="10001"
                    />
                    {errors.zipCode && (
                      <p className="input-error-msg">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow p-6"
              >
                <div className="flex items-center space-x-2 mb-5 border-b pb-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Payment Information (Demo Only)
                  </h2>
                </div>
                <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded mb-4">
                  Note: This is a demo. Do not enter real card details.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                  {/* Card Number */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Number *
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.cardNumber ? "input-error" : ""
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {errors.cardNumber && (
                      <p className="input-error-msg">{errors.cardNumber}</p>
                    )}
                  </div>
                  {/* Expiry */}
                  <div>
                    <label
                      htmlFor="cardExpiry"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      id="cardExpiry"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.cardExpiry ? "input-error" : ""
                      }`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.cardExpiry && (
                      <p className="input-error-msg">{errors.cardExpiry}</p>
                    )}
                  </div>
                  {/* CVC */}
                  <div>
                    <label
                      htmlFor="cardCVC"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      CVC *
                    </label>
                    <input
                      type="text"
                      id="cardCVC"
                      name="cardCVC"
                      value={formData.cardCVC}
                      onChange={handleInputChange}
                      required
                      className={`checkout-input ${
                        errors.cardCVC ? "input-error" : ""
                      }`}
                      placeholder="123"
                      maxLength={4}
                    />
                    {errors.cardCVC && (
                      <p className="input-error-msg">{errors.cardCVC}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>{" "}
            {/* End Left Column */}
            {/* --- Right Column: Order Summary --- */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 sticky top-24" // Sticky summary
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-5 border-b pb-3">
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div
                      key={item.book.id}
                      className="flex space-x-3 items-center text-sm"
                    >
                      <img
                        src={item.book.cover_image_url || fallbackImageUrl}
                        alt={item.book.title}
                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                        onError={(e) =>
                          (e.currentTarget.src = fallbackImageUrl)
                        }
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 line-clamp-1">
                          {item.book.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ${(item.book.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
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
                    <span>Tax (Est.)</span>
                    <span className="font-medium text-gray-800">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* API Error Display */}
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center flex items-center gap-2"
                    role="alert"
                  >
                    <AlertTriangle size={16} /> {apiError}
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="mt-6">
                  <Button
                    type="submit"
                    disabled={isProcessing || items.length === 0}
                    className="w-full flex items-center justify-center space-x-2 py-3 text-base"
                  >
                    {isProcessing ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white" /* ... */
                      ></svg>
                    ) : null}
                    <span>
                      {isProcessing ? "Placing Order..." : "Complete Order"}
                    </span>
                  </Button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-3">
                  By completing your purchase, you agree to our Terms of
                  Service.
                </p>
              </motion.div>
            </div>{" "}
            {/* End Right Column */}
          </div>
        </form>
      </div>
      {/* Helper CSS for inputs (can be moved to index.css) */}
      <style jsx global>{`
        .checkout-input {
          display: block;
          width: 100%;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          padding-top: 0.625rem;
          padding-bottom: 0.625rem;
          border-width: 1px;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border-color: #d1d5db; /* gray-300 */
        }
        .checkout-input:focus {
          outline: none;
          --tw-ring-color: #3b82f6; /* blue-500 */
          box-shadow: 0 0 0 2px var(--tw-ring-color);
          border-color: #3b82f6;
        }
        .input-error {
          border-color: #ef4444; /* red-500 */
          --tw-ring-color: #ef4444;
        }
        .input-error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 2px var(--tw-ring-color);
        }
        .input-error-msg {
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: #dc2626; /* red-600 */
        }
      `}</style>
    </div>
  );
};

export default Checkout;
