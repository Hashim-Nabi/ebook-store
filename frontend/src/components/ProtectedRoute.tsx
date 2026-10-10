import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the Auth hook
import Loader from "./Loader"; // Import the Loader component

interface ProtectedRouteProps {
  children: React.ReactElement; // The component/page to render if authorized
  adminOnly?: boolean; // Optional flag to check for admin role
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, isAdmin, user } = useAuth(); // Get auth state
  const location = useLocation(); // Get the current location

  // Optional: Show loader while auth state is being determined (if needed)
  // if (user === undefined) { // Adjust condition based on how initial auth state is handled
  //   return <Loader fullScreen />;
  // }

  // If the route requires admin and the user is not an admin (or not logged in)
  if (adminOnly && !isAdmin) {
    // Redirect them to the home page (or a specific 'unauthorized' page)
    console.warn("Admin access denied for:", location.pathname);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If the route requires login and the user is not authenticated
  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows redirecting back after login.
    console.warn("Authentication required for:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authorized, render the child component (the actual page)
  return children;
};

export default ProtectedRoute;
