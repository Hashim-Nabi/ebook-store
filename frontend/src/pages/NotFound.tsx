import { motion } from "framer-motion";
import { XCircle } from "lucide-react"; // Icon for error/not found
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"; // Import Button component

interface NotFoundProps {
  message?: string; // Optional custom message
}

const NotFound: React.FC<NotFoundProps> = ({ message }) => {
  const navigate = useNavigate();
  const defaultMessage = "Sorry, the page you're looking for cannot be found.";

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center px-4 bg-gray-50 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white p-8 md:p-12 rounded-xl shadow-lg max-w-lg w-full"
      >
        <XCircle
          strokeWidth={1.5}
          className="text-red-500 h-16 w-16 mx-auto mb-5"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          {message || defaultMessage} {/* Display custom message or default */}
        </p>
        <Button onClick={() => navigate("/")} size="lg">
          {" "}
          {/* Use navigate to go home */}
          Go Back Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
