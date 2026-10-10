// Yeh Book type backend ke Book model se match karta hai
export interface Book {
  id: string; // MongoDB '_id' ko 'id' mein virtualize karega
  title: string;
  isbn: string;
  description: string;
  price: number;
  stock_quantity: number;
  publication_date: string;
  cover_image_url?: string;
  rating: number;
  author: string; // Author ID
  category: string; // Category ID
  created_at: string;
}

// Author type
export interface Author {
  id: string;
  name: string;
  bio?: string;
  photo_url?: string;
  created_at: string;
}

// Category type
export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

// User type (yeh AuthController se milta hai)
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  token: string; // Token bhi save kareinge
  phone?: string;
  address?: string;
}

// Order type (yeh OrderController se milta hai)
export interface Order {
  _id: string;
  user: string; // User ID
  orderItems: {
    title: string;
    quantity: number;
    price: number;
    cover_image_url: string;
    book: string; // Book ID
  }[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  totalPrice: number;
  shippingPrice: number;
  taxPrice: number;
  status: string;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

// Yeh UI ke liye hai (jab book ke sath author/category ka poora data ho)
export interface BookWithDetails extends Omit<Book, "author" | "category"> {
  author: Author;
  category: Category;
}

export interface CartItem {
  book: BookWithDetails;
  quantity: number;
}
