import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../../api/axios";
import "../../styles/adminCommon.css";
import "../../styles/adminCategory.css";
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

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
  });

  const defaultImage =
    "https://dummyimage.com/120x90/e2e8f0/0f172a&text=Category";

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return toast.error("Category name is required");
    }

    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, form);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", form);
        toast.success("Category created successfully");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Action failed"
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleStatusToggle = async (category) => {
    try {
      await api.patch(`/categories/${category._id}`, {
        isActive: !category.isActive,
      });

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
      await api.delete(`/categories/${categoryId}`);

      toast.success("Category deleted successfully");

      if (editingId === categoryId) {
        resetForm();
      }

      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Delete failed"
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
      <AdminSidebar/>

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1>Category Management</h1>
            <p>
              Create, update and manage product categories.
            </p>
          </div>

          <div className="admin-user-chip">
            <span className="admin-user-avatar">
              {(adminUser?.name || "A")
                .charAt(0)
                .toUpperCase()}
            </span>

            <div>
              <strong>{adminUser?.name || "Admin"}</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        <section className="category-summary-grid">
          <article className="category-summary-card">
            <span className="category-summary-icon">
              <FiGrid />
            </span>

            <div>
              <p>Total Categories</p>
              <strong>{categories.length}</strong>
            </div>
          </article>

          <article className="category-summary-card">
            <span className="category-summary-icon active">
              <FiFolder />
            </span>

            <div>
              <p>Active Categories</p>
              <strong>{activeCount}</strong>
            </div>
          </article>

          <article className="category-summary-card">
            <span className="category-summary-icon inactive">
              <FiFolder />
            </span>

            <div>
              <p>Inactive Categories</p>
              <strong>{inactiveCount}</strong>
            </div>
          </article>
        </section>

        <section className="category-form-panel">
          <div className="category-panel-heading">
            <div>
              <h2>
                {editingId
                  ? "Edit Category"
                  : "Add New Category"}
              </h2>

              <p>
                Fill the details below and save the category.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="category-cancel-edit"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            className="category-form-grid"
            onSubmit={handleSubmit}
          >
            <div className="category-form-group">
              <label>Category Name</label>

              <input
                name="name"
                placeholder="Example: Rockets"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="category-form-group">
              <label>Image URL</label>

              <input
                name="image"
                placeholder="Paste category image URL"
                value={form.image}
                onChange={handleChange}
              />
            </div>

            <div className="category-form-group category-form-full">
              <label>Description</label>

              <textarea
                name="description"
                placeholder="Enter a short category description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {form.image && (
              <div className="category-image-preview category-form-full">
                <img
                  src={form.image}
                  alt="Category preview"
                  onError={(event) => {
                    event.currentTarget.src = defaultImage;
                  }}
                />

                <div>
                  <strong>Image Preview</strong>
                  <p>
                    Confirm the image before saving.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="category-save-btn category-form-full"
            >
              {editingId
                ? "Update Category"
                : "Create Category"}
            </button>
          </form>
        </section>

        <section className="category-list-panel">
          <div className="category-list-header">
            <div>
              <h2>All Categories</h2>
              <p>
                {filteredCategories.length} categories shown
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
              Loading categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="category-empty-state">
              No categories found
            </div>
          ) : (
            <div className="category-card-grid">
              {filteredCategories.map((category) => (
                <article
                  className="category-management-card"
                  key={category._id}
                >
                  <div className="category-card-image">
                    <img
                      src={category.image || defaultImage}
                      alt={category.name}
                      onError={(event) => {
                        event.currentTarget.src =
                          defaultImage;
                      }}
                    />

                    <button
                      type="button"
                      className={`category-status-badge ${
                        category.isActive
                          ? "active"
                          : "inactive"
                      }`}
                      onClick={() =>
                        handleStatusToggle(category)
                      }
                    >
                      {category.isActive
                        ? "Active"
                        : "Inactive"}
                    </button>
                  </div>

                  <div className="category-card-content">
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
                          handleDelete(category._id)
                        }
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Categories;