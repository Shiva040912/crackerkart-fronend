import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiFolder,
  FiGrid,
  FiImage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import defaultImage from "../../assets/image.jpeg";

import api from "../../api/axios";
import "../../styles/admincommon.css";
import "../../styles/admincategory.css";
import AdminSidebar from "../../components/AdminSidebar";

const Categories = () => {
  const navigate = useNavigate();

  const adminUser = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
  });

  
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await api.get("/categories");
      setCategories(response.data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) => {
      return (
        category.name?.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
      );
    });
  }, [categories, search]);

  const activeCount = categories.filter(
    (category) => category.isActive
  ).length;

  const inactiveCount = categories.length - activeCount;

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      image: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (!showForm) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        resetForm();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.classList.add("category-modal-open");

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("category-modal-open");
    };
  }, [showForm]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return toast.error("Category name is required");
    }

    try {
      if (editingId) {
        await api.patch(
          `/categories/${editingId}`,
          form
        );

        toast.success(
          "Category updated successfully"
        );
      } else {
        await api.post("/categories", form);

        toast.success(
          "Category created successfully"
        );
      }

      resetForm();
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Action failed"
      );
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);

    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
    });

    setShowForm(true);
  };

  const handleStatusToggle = async (category) => {
    try {
      await api.patch(
        `/categories/${category._id}`,
        {
          isActive: !category.isActive,
        }
      );

      toast.success(
        category.isActive
          ? "Category deactivated"
          : "Category activated"
      );

      fetchCategories();
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm(
      "Delete this category permanently?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/categories/${categoryId}`
      );

      toast.success(
        "Category deleted successfully"
      );

      if (editingId === categoryId) {
        resetForm();
      }

      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    toast.success("Admin logged out");
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-topbar category-topbar">
          <div className="category-hero-copy">
            <span className="category-eyebrow">
              Catalog Control
            </span>

            <h1>Category Management</h1>

            <p>
              Build and organize product categories with
              clear visuals, status control and faster updates.
            </p>
          </div>

          <div className="category-header-actions">
            <button
              type="button"
              className="category-add-button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <FiPlus />
              Add Category
            </button>

            <div className="admin-user-chip">
              <span className="admin-user-avatar">
                {(adminUser?.name || "A")
                  .charAt(0)
                  .toUpperCase()}
              </span>

              <div>
                <strong>
                  {adminUser?.name || "Admin"}
                </strong>

                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>

        <section className="category-summary-grid">
          <article className="category-summary-card total">
            <span className="category-summary-icon">
              <FiGrid />
            </span>

            <div>
              <p>Total Categories</p>
              <strong>{categories.length}</strong>
              <small>All catalog groups</small>
            </div>
          </article>

          <article className="category-summary-card active">
            <span className="category-summary-icon">
              <FiFolder />
            </span>

            <div>
              <p>Active Categories</p>
              <strong>{activeCount}</strong>
              <small>Visible to customers</small>
            </div>
          </article>

          <article className="category-summary-card inactive">
            <span className="category-summary-icon">
              <FiFolder />
            </span>

            <div>
              <p>Inactive Categories</p>
              <strong>{inactiveCount}</strong>
              <small>Hidden from customers</small>
            </div>
          </article>
        </section>

        {showForm && (
          <div
            className="category-modal-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                resetForm();
              }
            }}
          >
            <section
              className="category-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-modal-title"
            >
              <div className="category-modal-header">
                <div>
                  <span className="category-section-label">
                    {editingId
                      ? "Editing Category"
                      : "New Category"}
                  </span>

                  <h2 id="category-modal-title">
                    {editingId
                      ? "Update Category"
                      : "Create Category"}
                  </h2>

                  <p>
                    Add the category information and save it
                    to your product catalog.
                  </p>
                </div>

                <button
                  type="button"
                  className="category-modal-close"
                  onClick={resetForm}
                  aria-label="Close category form"
                  title="Close"
                >
                  <FiX />
                </button>
              </div>

              <div className="category-modal-body">
                <div className="category-form-layout">
                  <form
                    className="category-form-grid"
                    onSubmit={handleSubmit}
                  >
                    <div className="category-form-group">
                      <label htmlFor="category-name">
                        Category Name
                      </label>

                      <input
                        id="category-name"
                        name="name"
                        placeholder="Example: Rockets"
                        value={form.name}
                        onChange={handleChange}
                        autoFocus
                      />
                    </div>

                    <div className="category-form-group">
                      <label htmlFor="category-image">
                        Image URL
                      </label>

                      <input
                        id="category-image"
                        name="image"
                        placeholder="Paste category image URL"
                        value={form.image}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="category-form-group category-form-full">
                      <label htmlFor="category-description">
                        Description
                      </label>

                      <textarea
                        id="category-description"
                        name="description"
                        placeholder="Enter a short category description"
                        value={form.description}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="category-modal-actions category-form-full">
                      <button
                        type="button"
                        className="category-modal-cancel"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="category-save-btn"
                      >
                        {editingId
                          ? "Update Category"
                          : "Create Category"}
                      </button>
                    </div>
                  </form>

                  
                </div>
              </div>
            </section>
          </div>
        )}

        <section className="category-list-panel">
          <div className="category-list-header">
            <div>
              <span className="category-section-label">
                Catalog Categories
              </span>

              <h2>All Categories</h2>

              <p>
                {filteredCategories.length} categor
                {filteredCategories.length === 1
                  ? "y"
                  : "ies"}{" "}
                shown
              </p>
            </div>

            <div className="category-search-box">
              <FiSearch />

              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>

          {loading ? (
            <div className="category-empty-state">
              <span className="category-loading-ring" />
              <strong>
                Loading categories...
              </strong>
              <p>
                Please wait while category data is loaded.
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="category-empty-state">
              <FiFolder />
              <strong>No categories found</strong>
              <p>
                Try changing the search text or add
                a new category.
              </p>
            </div>
          ) : (
            <div className="category-card-grid">
              {filteredCategories.map(
                (category) => (
                  <article
                    className="category-management-card"
                    key={category._id}
                  >
                    <div className="category-card-image">
                      <img
                        src={
                          category.image ||
                          defaultImage
                        }
                        alt={category.name}
                        onError={(event) => {
                          event.currentTarget.src =
                            defaultImage;
                        }}
                      />

                      <div className="category-card-overlay" />

                      <button
                        type="button"
                        className={`category-status-badge ${
                          category.isActive
                            ? "active"
                            : "inactive"
                        }`}
                        onClick={() =>
                          handleStatusToggle(
                            category
                          )
                        }
                      >
                        <span />
                        {category.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </div>

                    <div className="category-card-content">
                      <span className="category-card-label">
                        Product Category
                      </span>

                      <h3>{category.name}</h3>

                      <p>
                        {category.description ||
                          "No description available"}
                      </p>

                      <div className="category-card-actions">
                        <button
                          type="button"
                          className="category-edit-btn"
                          onClick={() =>
                            handleEdit(category)
                          }
                        >
                          <FiEdit2 />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="category-delete-btn"
                          onClick={() =>
                            handleDelete(
                              category._id
                            )
                          }
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Categories;
