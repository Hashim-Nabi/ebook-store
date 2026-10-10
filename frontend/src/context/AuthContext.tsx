import React, { createContext, useContext, useState, ReactNode } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State ko initialize karte waqt localStorage se user ki info load karein
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("userInfo");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
      return null;
    }
  });

  // Login function
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    // Optional: Logout par cart bhi clear kar dein
    // localStorage.removeItem('cartItems');
    // window.location.href = '/login'; // Redirect to login page
  };

  // Derived values
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const token = user?.token || null;

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isAdmin, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook taake context ko aasani se use kar sakein
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
