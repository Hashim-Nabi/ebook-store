import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { BookWithDetails, CartItem } from "../types";

// Context mein yeh sab functions available honge
interface CartContextType {
  items: CartItem[];
  addToCart: (book: BookWithDetails, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State ko initialize karte waqt localStorage se purana cart load karein
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart items from localStorage", error);
      return [];
    }
  });

  // Jab bhi 'items' state change ho, usse localStorage mein save karein
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
  }, [items]);

  // Cart mein item add karna (ya quantity barhana)
  const addToCart = (book: BookWithDetails, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.book.id === book.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.book.id === book.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  book.stock_quantity
                ),
              } // Stock limit check karein
            : item
        );
      }
      // Naya item add karte waqt bhi stock limit check karein
      return [
        ...prevItems,
        { book, quantity: Math.min(quantity, book.stock_quantity) },
      ];
    });
  };

  // Cart se item remove karna
  const removeFromCart = (bookId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.book.id !== bookId)
    );
  };

  // Item ki quantity update karna
  const updateQuantity = (bookId: string, quantity: number) => {
    const itemInCart = items.find((item) => item.book.id === bookId);
    if (!itemInCart) return; // Agar item nahi hai toh kuch na karein

    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    // Stock limit check karein
    const newQuantity = Math.min(quantity, itemInCart.book.stock_quantity);
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.book.id === bookId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Poora cart khali karna
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cartItems"); // Local storage se bhi remove karein
  };

  // Cart ki total qeemat calculate karna
  const getCartTotal = () => {
    return items.reduce(
      (total, item) => total + item.book.price * item.quantity,
      0
    );
  };

  // Cart mein total items count karna
  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook taake context ko aasani se use kar sakein
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
