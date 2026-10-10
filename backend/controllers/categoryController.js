import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js"; // Import Category model
import Book from "../models/bookModel.js"; // Needed for delete check

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories);
});

// --- Admin Only Actions ---

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === "") {
    res.status(400);
    throw new Error("Category name is required");
  }

  const categoryExists = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category with this name already exists");
  }

  const category = new Category({ name: name.trim(), description });
  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const category = await Category.findById(categoryId);

  if (category) {
    // Safety Check: Prevent deletion if books are linked
    const booksInCategory = await Book.countDocuments({ category: categoryId });
    if (booksInCategory > 0) {
      res.status(400);
      throw new Error(
        `Cannot delete category "${category.name}" as ${booksInCategory} book(s) use it.`
      );
    }

    await category.deleteOne();
    res.json({ message: `Category "${category.name}" removed successfully` });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});
