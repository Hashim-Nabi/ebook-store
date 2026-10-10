import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Package,
  Calendar,
  Edit,
  AlertTriangle,
} from "lucide-react"; // Added icons
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext"; // Auth hook for user info
import type { Order } from "../types"; // Order type
import { API_URL } from "../apiConfig"; // API base URL
import Loader from "../components/Loader"; // Loader component

const Profile = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Get current user info and token
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile"); // State for active tab

  // --- State for API Data ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // --- Fetch Order History ---
  useEffect(() => {
    // Fetch orders only if the 'orders' tab is active and user is logged in
    if (activeTab === "orders" && token) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        setOrdersError(null);
        try {
          const response = await fetch(`${API_URL}/orders/myorders`, {
            headers: {
              // Send token to access protected route
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch order history.");
          }
          // Sort orders by date, newest first
          data.sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(data);
        } catch (error: any) {
          console.error("Failed to fetch orders:", error);
          setOrdersError(error.message);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, token]); // Refetch when tab changes or token becomes available

  // --- Helper Function for Status Badge ---
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- Render Logic ---
  // If user data is not yet loaded or user is not logged in (handled by ProtectedRoute, but good fallback)
  if (!user) {
    return <Loader fullScreen />; // Or a message asking to log in
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            My Account
          </h1>
          <p className="text-gray-600">
            Manage your profile and view order history.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow p-6 sticky top-24">
              {" "}
              {/* Sticky Sidebar */}
              {/* User Avatar and Name */}
              <div className="text-center mb-6 border-b pb-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-blue-200">
                  {/* Placeholder Icon */}
                  <UserIcon
                    strokeWidth={1.5}
                    className="h-10 w-10 text-blue-600"
                  />
                  {/* In future, you could add image upload functionality */}
                </div>
                <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              {/* Navigation Tabs */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center gap-3 ${
                    activeTab === "profile"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <UserIcon size={18} /> Profile Information
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center gap-3 ${
                    activeTab === "orders"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Package size={18} /> Order History
                  {/* Optional: Show order count if available */}
                  {/* {orders.length > 0 && <span className="ml-auto text-xs bg-gray-200 px-1.5 py-0.5 rounded">{orders.length}</span>} */}
                </button>
                {/* Add more links here if needed (e.g., Settings, Addresses) */}
              </nav>
            </div>
          </motion.div>
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {" "}
              {/* Smooth transition between tabs */}
              {activeTab === "profile" ? (
                // --- Profile Information Tab ---
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow p-6 md:p-8"
                >
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Profile Information
                    </h2>
                    {/* TODO: Add Edit Profile functionality later */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        alert("Edit Profile clicked - feature coming soon!")
                      }
                    >
                      <Edit size={14} className="mr-1.5" /> Edit Profile
                    </Button>
                  </div>

                  <div className="space-y-5">
                    {/* Detail Item Component (or just repeat structure) */}
                    <ProfileDetailItem
                      icon={UserIcon}
                      label="Full Name"
                      value={user.name}
                    />
                    <ProfileDetailItem
                      icon={Mail}
                      label="Email Address"
                      value={user.email}
                    />
                    <ProfileDetailItem
                      icon={Phone}
                      label="Phone Number"
                      value={user.phone || "Not provided"}
                    />
                    <ProfileDetailItem
                      icon={MapPin}
                      label="Default Address"
                      value={user.address || "Not provided"}
                    />
                    {/* You can add more details like 'Member Since' if available from backend */}
                    {/* <ProfileDetailItem icon={Calendar} label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} /> */}
                  </div>
                </motion.div>
              ) : (
                // --- Order History Tab ---
                <motion.div
                  key="orders-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4" // Spacing between order cards
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">
                    Order History
                  </h2>

                  {loadingOrders ? (
                    <Loader />
                  ) : ordersError ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm flex items-center gap-2 shadow">
                      <AlertTriangle size={18} /> {ordersError}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                      <Package
                        strokeWidth={1}
                        className="h-16 w-16 text-gray-300 mx-auto mb-4"
                      />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No orders yet
                      </h3>
                      <p className="text-gray-500 text-sm mb-5">
                        When you place an order, it will appear here.
                      </p>
                      <Button
                        onClick={() => navigate("/books")}
                        variant="outline"
                      >
                        Browse Books
                      </Button>
                    </div>
                  ) : (
                    // Display list of orders
                    orders.map((order) => (
                      <motion.div
                        key={order._id} // Use MongoDB _id
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{
                          y: -2,
                          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                        }} // Subtle hover effect
                        className="bg-white rounded-lg shadow p-4 md:p-5 transition-all duration-150"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          {/* Order Info */}
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-50 rounded-md mt-1">
                              <Package size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                                Order #{order._id.substring(0, 8)}...{" "}
                                {/* Show partial ID */}
                              </h3>
                              <p className="text-xs text-gray-500">
                                Placed on:{" "}
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                              {/* Item count can be useful */}
                              <p className="text-xs text-gray-500 mt-1">
                                {order.orderItems.length}{" "}
                                {order.orderItems.length === 1
                                  ? "item"
                                  : "items"}
                              </p>
                            </div>
                          </div>

                          {/* Status and Total */}
                          <div className="flex flex-col items-start md:items-end gap-1.5 md:text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {/* Capitalize status */}
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                            <p className="text-base font-bold text-gray-800">
                              ${order.totalPrice.toFixed(2)}
                            </p>
                            {/* Optional: Add a "View Details" link/button */}
                            <Link
                              to={`/order/${order._id}`}
                              className="text-xs text-blue-600 hover:underline mt-1"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>{" "}
          {/* End Main Content Area */}
        </div>
      </div>
    </div>
  );
};

// --- Helper Component for Profile Details --- (Optional: can be inline)
interface ProfileDetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string | undefined | null;
}
const ProfileDetailItem: React.FC<ProfileDetailItemProps> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 p-2.5 bg-gray-100 rounded-lg mt-0.5">
      <Icon size={18} className="text-gray-600" />
    </div>
    <div className="flex-1">
      <label className="block text-xs font-medium text-gray-500 mb-0.5">
        {label}
      </label>
      <p className="text-sm font-semibold text-gray-800">
        {value || <span className="text-gray-400 italic">Not set</span>}
      </p>
    </div>
  </div>
);

export default Profile;
