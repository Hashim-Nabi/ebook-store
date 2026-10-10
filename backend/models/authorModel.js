import mongoose from "mongoose";

// Yeh schema aapke 'types/index.ts' Author type se match karta hai
const authorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
    },
    photo_url: {
      // Yeh aapke mockData se match karta hai
      type: String,
    },
  },
  {
    timestamps: true,
    // Yeh virtual 'id' add karega (taake frontend mein '_id' ki jagah 'id' use kar sakein)
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

const Author = mongoose.model("Author", authorSchema);

export default Author;
