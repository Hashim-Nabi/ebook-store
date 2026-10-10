import mongoose from "mongoose";

// Yeh schema aapke 'Book' type aur 'BookCard.tsx' component se match karta hai
const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    // --- Hum yahan 'ref' use kar rahe hain ---
    // Yeh MongoDB ko batata hai ke 'author' field mein 'Author' model ki ID save hogi
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Author", // 'Author' model ko reference kar raha hai
    },
    // Yeh 'Category' model ko reference kar raha hai
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    // --- Baaki fields aapke schema ke mutabik ---
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    isbn: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    publication_date: {
      type: String, // Hum isse string rakhenge jaisa aapke mockData mein hai
    },
    stock_quantity: {
      // Aapke BookCard.tsx se
      type: Number,
      required: true,
      default: 0,
    },
    cover_image_url: {
      // Aapke BookCard.tsx se
      type: String,
    },
    rating: {
      // Aapke BookCard.tsx se
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      // Aapke handwritten schema se
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
