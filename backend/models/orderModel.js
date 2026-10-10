import mongoose from "mongoose";

// Yeh schema aapke 'Order' type aur 'Checkout.tsx' form se match karta hai
const orderSchema = mongoose.Schema(
  {
    // Kaunsa user order kar raha hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // CartLines yahan 'orderItems' ban jayega
    orderItems: [
      {
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // 'price_at_purchase'
        cover_image_url: { type: String },
        book: {
          // Konsi book thi
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Book",
        },
      },
    ],

    // Yeh data Checkout.tsx form se aayega
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true }, // Aapke form mein 'state' hai
      zipCode: { type: String, required: true }, // Aapke form mein 'zipCode' hai
      phone: { type: String, required: true },
    },

    // Yeh CartHeader se match karta hai (aur Cart.tsx se calculate hoga)
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    // Order ka status (Profile.tsx page ke liye)
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
