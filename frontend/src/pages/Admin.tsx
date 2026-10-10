import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Users,
  FolderOpen,
  X as XIcon,
  AlertTriangle,
  Package,
  LoaderIcon,
} from "lucide-react";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { API_URL } from "../apiConfig";
import type { BookWithDetails, Author, Category } from "../types";
import { useAuth } from "../context/AuthContext";
import "../admin-styles.css"; // Import the CSS file

type Tab = "books" | "authors" | "categories";

// --- Helper Components (Defined BEFORE the main Admin component) ---

// Generic Table Structure
interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
}
const AdminTable: React.FC<AdminTableProps> = ({ headers, children }) => (
  <table className="w-full text-sm text-left text-gray-500 min-w-[600px]">
    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
      <tr>
        {headers.map((header, index) => (
          <th
            key={header}
            scope="col"
            className={`admin-table-header ${
              index === headers.length - 1 ? "text-right" : ""
            }`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
    {children}
  </table>
);

// Row for indicating no data in table
interface NoDataRowProps {
  colSpan: number;
  message: string;
}
const NoDataRow: React.FC<NoDataRowProps> = ({ colSpan, message }) => (
  <tbody>
    <tr className="bg-white">
      <td colSpan={colSpan} className="text-center py-5 text-gray-400 italic">
        {message}
      </td>
    </tr>
  </tbody>
);

// Edit/Delete Action Buttons
interface AdminActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
}
const AdminActionButtons: React.FC<AdminActionButtonsProps> = ({
  onEdit,
  onDelete,
}) => (
  <div className="flex items-center justify-end space-x-1">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onEdit}
      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
      aria-label="Edit item"
    >
      <Edit size={16} />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onDelete}
      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
      aria-label="Delete item"
    >
      <Trash2 size={16} />
    </motion.button>
  </div>
);

// --- Main Admin Component ---
const Admin = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("books");

  // --- State ---
  const [books, setBooks] = useState<BookWithDetails[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [bookFormData, setBookFormData] = useState({
    title: "",
    author: "",
    category: "",
    price: "0",
    stock_quantity: "0",
    isbn: "",
    description: "",
    publication_date: "",
    cover_image_url: "",
    rating: "0",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const requests = [
        fetch(`${API_URL}/books`),
        fetch(`${API_URL}/authors`),
        fetch(`${API_URL}/categories`),
      ];
      const responses = await Promise.all(requests);
      const results = await Promise.all(
        responses.map(async (res, index) => {
          const resourceName = ["books", "authors", "categories"][index];
          if (!res.ok) {
            let errorMsg = `Failed to fetch ${resourceName}. Status: ${res.status}`;
            try {
              const errData = await res.json();
              errorMsg = errData.message || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
          }
          return res.json();
        })
      );
      setBooks(results[0]);
      setAuthors(results[1]);
      setCategories(results[2]);
    } catch (err: any) {
      console.error("Error fetching admin data:", err);
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers (Correct Order) ---

  // Define closeModal first
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormError(null);
  };

  const handleAddNew = () => {
    setModalMode("add");
    setSelectedItem(null);
    if (activeTab === "books") {
      setBookFormData({
        title: "",
        author: "",
        category: "",
        price: "0",
        stock_quantity: "0",
        isbn: "",
        description: "",
        publication_date: "",
        cover_image_url: "",
        rating: "0",
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormError(null);
    if (activeTab === "books") {
      const bookItem = item as BookWithDetails;
      setBookFormData({
        title: bookItem.title || "",
        author: bookItem.author?.id || "",
        category: bookItem.category?.id || "",
        price: bookItem.price?.toString() || "0",
        stock_quantity: bookItem.stock_quantity?.toString() || "0",
        isbn: bookItem.isbn || "",
        description: bookItem.description || "",
        publication_date: bookItem.publication_date || "",
        cover_image_url: bookItem.cover_image_url || "",
        rating: bookItem.rating?.toString() || "0",
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setBookFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
  };

  const handleSaveBook = useCallback(async () => {
    if (
      !bookFormData.title ||
      !bookFormData.author ||
      !bookFormData.category ||
      !bookFormData.isbn ||
      bookFormData.price === "" ||
      bookFormData.stock_quantity === ""
    ) {
      setFormError(
        "Please fill in required fields: Title, Author, Category, ISBN, Price, Stock."
      );
      return;
    }
    const priceNum = parseFloat(bookFormData.price);
    const stockNum = parseInt(bookFormData.stock_quantity, 10);
    const ratingNum = parseFloat(bookFormData.rating);
    if (isNaN(priceNum) || priceNum < 0 || isNaN(stockNum) || stockNum < 0) {
      setFormError("Price and Stock must be valid non-negative numbers.");
      return;
    }
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      setFormError("Rating must be a number between 0 and 5.");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    const method = modalMode === "add" ? "POST" : "PUT";
    const url =
      modalMode === "add"
        ? `${API_URL}/books`
        : `${API_URL}/books/${selectedItem?.id}`;
    const payload = {
      title: bookFormData.title,
      isbn: bookFormData.isbn,
      description: bookFormData.description,
      price: priceNum,
      stock_quantity: stockNum,
      publication_date: bookFormData.publication_date || undefined,
      cover_image_url: bookFormData.cover_image_url || undefined,
      rating: ratingNum,
      author: bookFormData.author,
      category: bookFormData.category,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Failed to ${modalMode} book.`);
      }
      await fetchData();
      closeModal(); // This now works because closeModal is defined above
    } catch (err: any) {
      console.error(`Error saving book:`, err);
      setFormError(err.message || `An error occurred while saving the book.`);
    } finally {
      setIsSaving(false);
    }
  }, [modalMode, selectedItem, bookFormData, token, fetchData, closeModal]); // Add closeModal to dependencies

  const handleDelete = useCallback(
    async (itemId: string, itemName?: string) => {
      const itemType = activeTab.slice(0, -1);
      if (
        confirm(
          `DELETE ${itemType}: "${
            itemName || itemId
          }"?\nThis action cannot be undone.`
        )
      ) {
        setError(null);
        try {
          const response = await fetch(`${API_URL}/${activeTab}/${itemId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || `Failed to delete ${itemType}.`);
          }
          switch (activeTab) {
            case "books":
              setBooks((prev) => prev.filter((item) => item.id !== itemId));
              break;
            case "authors":
              setAuthors((prev) => prev.filter((item) => item.id !== itemId));
              break;
            case "categories":
              setCategories((prev) =>
                prev.filter((item) => item.id !== itemId)
              );
              break;
          }
        } catch (err: any) {
          console.error(`Error deleting ${itemType}:`, err);
          setError(
            `Delete failed: ${err.message || `Could not delete ${itemType}.`}`
          );
        }
      }
    },
    [activeTab, token]
  );

  // --- Tab Config ---
  const tabs = [
    { id: "books" as Tab, label: "Books", icon: BookOpen, count: books.length },
    {
      id: "authors" as Tab,
      label: "Authors",
      icon: Users,
      count: authors.length,
    },
    {
      id: "categories" as Tab,
      label: "Categories",
      icon: FolderOpen,
      count: categories.length,
    },
  ];

  // --- Render Logic ---
  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-100 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage bookstore content.</p>
        </motion.div>

        {/* Loading / Error Display */}
        {loading && (
          <div className="py-16 flex justify-center">
            <Loader size="lg" />
          </div>
        )}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg text-sm flex items-center gap-2 shadow"
            role="alert"
          >
            {" "}
            <AlertTriangle size={18} /> {error}{" "}
          </motion.div>
        )}

        {/* Tabs */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg shadow border border-gray-200 p-2 inline-flex items-center space-x-1 flex-wrap gap-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md font-medium text-xs sm:text-sm transition-colors duration-150 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {" "}
                    <Icon size={16} /> <span>{tab.label}</span>{" "}
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {" "}
                      {tab.count}{" "}
                    </span>{" "}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow border border-gray-200 p-5 md:p-7"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 border-b pb-4 gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 capitalize">
                {" "}
                Manage {activeTab}{" "}
              </h2>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={handleAddNew}
                  size="sm"
                  disabled={activeTab !== "books"}
                >
                  {" "}
                  <Plus size={16} className="mr-1.5 inline" /> Add New{" "}
                  {activeTab === "books" ? "Book" : activeTab.slice(0, -1)}{" "}
                </Button>
              </motion.div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto"
              >
                {activeTab === "books" && (
                  <AdminTable
                    headers={[
                      "Book",
                      "Author",
                      "Category",
                      "Price",
                      "Stock",
                      "Actions",
                    ]}
                  >
                    <tbody>
                      {books.map((book) => (
                        <tr key={book.id} className="admin-table-row">
                          {" "}
                          <td className="admin-table-cell font-medium text-gray-900 max-w-[200px] truncate">
                            <div className="flex items-center gap-3">
                              <img
                                src={book.cover_image_url || "/placeholder.jpg"}
                                alt=""
                                className="h-10 w-8 object-cover rounded-sm flex-shrink-0 border"
                              />
                              <span title={book.title}>{book.title}</span>
                            </div>
                          </td>{" "}
                          <td className="admin-table-cell">
                            {book.author?.name || "N/A"}
                          </td>{" "}
                          <td className="admin-table-cell">
                            {book.category?.name || "N/A"}
                          </td>{" "}
                          <td className="admin-table-cell">
                            ${book.price.toFixed(2)}
                          </td>{" "}
                          <td className="admin-table-cell">
                            {book.stock_quantity}
                          </td>{" "}
                          <td className="admin-table-cell text-right">
                            <AdminActionButtons
                              onEdit={() => handleEdit(book)}
                              onDelete={() => handleDelete(book.id, book.title)}
                            />
                          </td>{" "}
                        </tr>
                      ))}
                      {books.length === 0 && (
                        <NoDataRow
                          colSpan={6}
                          message="No books found. Click 'Add New Book' to add one."
                        />
                      )}
                    </tbody>
                  </AdminTable>
                )}
                {activeTab === "authors" && (
                  <AdminTable headers={["Author", "Bio", "Actions"]}>
                    <tbody>
                      {authors.map((author) => (
                        <tr key={author.id} className="admin-table-row">
                          <td className="admin-table-cell font-medium text-gray-900">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  author.photo_url || "/avatar-placeholder.png"
                                }
                                alt=""
                                className="h-8 w-8 rounded-full object-cover flex-shrink-0 border"
                              />
                              <span>{author.name}</span>
                            </div>
                          </td>
                          <td className="admin-table-cell max-w-md truncate whitespace-normal">
                            {author.bio || "-"}
                          </td>
                          <td className="admin-table-cell text-right">
                            <AdminActionButtons
                              onEdit={() => alert("Edit Author form needed")}
                              onDelete={() =>
                                handleDelete(author.id, author.name)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                      {authors.length === 0 && (
                        <NoDataRow colSpan={3} message="No authors found." />
                      )}
                    </tbody>
                  </AdminTable>
                )}
                {activeTab === "categories" && (
                  <AdminTable
                    headers={["Category Name", "Description", "Actions"]}
                  >
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id} className="admin-table-row">
                          <td className="admin-table-cell font-medium text-gray-900">
                            {category.name}
                          </td>
                          <td className="admin-table-cell max-w-md truncate whitespace-normal">
                            {category.description || "-"}
                          </td>
                          <td className="admin-table-cell text-right">
                            <AdminActionButtons
                              onEdit={() => alert("Edit Category form needed")}
                              onDelete={() =>
                                handleDelete(category.id, category.name)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                      {categories.length === 0 && (
                        <NoDataRow colSpan={3} message="No categories found." />
                      )}
                    </tbody>
                  </AdminTable>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {showModal && activeTab === "books" && (
          <motion.div
            /* Backdrop */ initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              /* Modal Panel */ initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 20,
                duration: 0.3,
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-800 capitalize">
                  {" "}
                  {modalMode === "add" ? "Add New Book" : "Edit Book"}{" "}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  {" "}
                  <XIcon size={20} />{" "}
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveBook();
                }}
                className="p-6 space-y-4 overflow-y-auto flex-grow custom-scrollbar"
              >
                {formError && (
                  <div
                    className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-center gap-2 border border-red-200"
                    role="alert"
                  >
                    {" "}
                    <AlertTriangle size={16} /> {formError}{" "}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {" "}
                    <label htmlFor="title" className="form-label">
                      Title *
                    </label>{" "}
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={bookFormData.title}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />{" "}
                  </div>
                  <div>
                    {" "}
                    <label htmlFor="isbn" className="form-label">
                      ISBN *
                    </label>{" "}
                    <input
                      type="text"
                      id="isbn"
                      name="isbn"
                      value={bookFormData.isbn}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />{" "}
                  </div>
                  <div>
                    {" "}
                    <label htmlFor="author" className="form-label">
                      Author *
                    </label>{" "}
                    <select
                      id="author"
                      name="author"
                      value={bookFormData.author}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    >
                      {" "}
                      <option value="" disabled>
                        Select an author
                      </option>{" "}
                      {authors.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>
                  <div>
                    {" "}
                    <label htmlFor="category" className="form-label">
                      Category *
                    </label>{" "}
                    <select
                      id="category"
                      name="category"
                      value={bookFormData.category}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    >
                      {" "}
                      <option value="" disabled>
                        Select a category
                      </option>{" "}
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>
                  <div>
                    {" "}
                    <label htmlFor="price" className="form-label">
                      Price ($) *
                    </label>{" "}
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={bookFormData.price}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="0.01"
                      className="form-input"
                    />{" "}
                  </div>
                  <div>
                    {" "}
                    <label htmlFor="stock_quantity" className="form-label">
                      Stock Quantity *
                    </label>{" "}
                    <input
                      type="number"
                      id="stock_quantity"
                      name="stock_quantity"
                      value={bookFormData.stock_quantity}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="1"
                      className="form-input"
                    />{" "}
                  </div>
                  <div>
                    {" "}
                    <label htmlFor="publication_date" className="form-label">
                      Publication Date
                    </label>{" "}
                    <input
                      type="text"
                      id="publication_date"
                      name="publication_date"
                      value={bookFormData.publication_date}
                      onChange={handleFormChange}
                      placeholder="YYYY-MM-DD"
                      className="form-input"
                    />{" "}
                  </div>
                  <div>
                    {" "}
                    <label htmlFor="rating" className="form-label">
                      Rating (0-5)
                    </label>{" "}
                    <input
                      type="number"
                      id="rating"
                      name="rating"
                      value={bookFormData.rating}
                      onChange={handleFormChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="form-input"
                    />{" "}
                  </div>
                  <div className="md:col-span-2">
                    {" "}
                    <label htmlFor="cover_image_url" className="form-label">
                      Cover Image URL
                    </label>{" "}
                    <input
                      type="url"
                      id="cover_image_url"
                      name="cover_image_url"
                      value={bookFormData.cover_image_url}
                      onChange={handleFormChange}
                      placeholder="https://"
                      className="form-input"
                    />{" "}
                  </div>
                  <div className="md:col-span-2">
                    {" "}
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>{" "}
                    <textarea
                      id="description"
                      name="description"
                      value={bookFormData.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="form-input"
                    ></textarea>{" "}
                  </div>
                </div>
              </form>
              <div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t rounded-b-lg flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  {" "}
                  Cancel{" "}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveBook}
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? (
                    <LoaderIcon className="animate-spin h-4 w-4 mr-2" />
                  ) : null}
                  {isSaving
                    ? "Saving..."
                    : modalMode === "add"
                    ? "Create Book"
                    : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
