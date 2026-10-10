import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Yeh schema aapke 'auth' table aur 'types/index.ts' User type se match karta hai
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Har email unique hona chahiye
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Role sirf user ya admin ho sakta hai
      default: "user", // Naye users default 'user' honge
    },
    // Yeh fields aapke handwritten schema se hain
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Yeh 'createdAt' aur 'updatedAt' fields automatically add kar dega
  }
);

// --- Password Hashing Logic ---

// 1. Login ke waqt password check karne ke liye method
userSchema.methods.matchPassword = async function (enteredPassword) {
  // 'this.password' database mein save hashed password hai
  return await bcrypt.compare(enteredPassword, this.password);
};

// 2. User ko save karne se PEHLE password hash karne ke liye
userSchema.pre("save", async function (next) {
  // Agar password modify nahi hua (jaise user ne sirf email update kiya) toh hash mat karo
  if (!this.isModified("password")) {
    next();
  }

  // Naya password hash karo
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
