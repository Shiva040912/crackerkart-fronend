import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiLogOut,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import toast from "react-hot-toast";

import socket from "../../service/socket";
import api from "../../api/axios";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/product";

import "../../styles/adminCommon.css";
import "../../styles/adminProduct.css";
import defaultProductImage from "../../assets/image.jpeg";
import AdminSidebar from "../../components/AdminSidebar";

const Product = () => {
  const navigate = useNavigate();

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    category: "",
    packType: "Single",
    packQuantity: "1",
    unit: "Piece",
    isBestSeller: false,
    isNewArrival: false,
    festivalOffer: false,
    discount: "0",
    isActive: true,
  });

  const resetForm = () => {
    setForm({
      name: "",
      brand: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
      category: "",
      packType: "Single",
      packQuantity: "1",
      unit: "Piece",
      isBestSeller: false,
      isNewArrival: false,
      festivalOffer: false,
      discount: "0",
      isActive: true,
    });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await getProducts();
      setProducts(response.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      setCategories(
        response.data.filter((category) => category.isActive === true),
      );
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    socket.on("productUpdated", fetchProducts);

    return () => {
      socket.off("productUpdated", fetchProducts);
    };
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return toast.error("Product name is required");
    }

    if (!form.brand.trim()) {
      return toast.error("Brand name is required");
    }

    if (!form.category) {
      return toast.error("Category is required");
    }

    if (!form.price || Number(form.price) <= 0) {
      return toast.error("Enter a valid price");
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      return toast.error("Enter a valid stock");
    }

    if (!form.packQuantity || Number(form.packQuantity) <= 0) {
      return toast.error("Enter a valid pack quantity");
    }

    const productData = {
      ...form,
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      packQuantity: Number(form.packQuantity),
      discount: Number(form.discount || 0),
    };

    try {
      if (editingId) {
        await updateProduct(editingId, productData);
        toast.success("Product updated successfully");
      } else {
        await createProduct(productData);
        toast.success("Product created successfully");
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      brand: product.brand || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      imageUrl: product.imageUrl || "",
      category: product.category?._id || product.category || "",
      packType: product.packType || "Single",
      packQuantity: product.packQuantity || "1",
      unit: product.unit || "Piece",
      isBestSeller: Boolean(product.isBestSeller),
      isNewArrival: Boolean(product.isNewArrival),
      festivalOffer: Boolean(product.festivalOffer),
      discount: product.discount || "0",
      isActive: Boolean(product.isActive),
    });

    setShowModal(true);
  };

  const handleStatusToggle = async (product) => {
    try {
      await updateProduct(product._id, {
        isActive: !product.isActive,
      });

      toast.success(
        product.isActive ? "Product deactivated" : "Product activated",
      );

      fetchProducts();
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Delete this product permanently?");

    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query);

      const productCategoryId = product.category?._id || product.category;

      const matchesCategory =
        categoryFilter === "all" || productCategoryId === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive) ||
        (statusFilter === "inactive" && !product.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const canReorder = search.trim() === "" && statusFilter === "all";

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    if (!canReorder) {
      toast.error("Search and status filters clear pannitu drag pannu");
      return;
    }

    if (result.source.index === result.destination.index) {
      return;
    }

    const reorderedProducts = Array.from(filteredProducts);

    const [movedProduct] = reorderedProducts.splice(result.source.index, 1);

    reorderedProducts.splice(result.destination.index, 0, movedProduct);

    const reorderedWithPosition = reorderedProducts.map((product, index) => ({
      ...product,
      displayOrder: index + 1,
    }));

    const reorderedMap = new Map(
      reorderedWithPosition.map((product) => [product._id, product]),
    );

    setProducts((currentProducts) => {
      if (categoryFilter === "all") {
        return reorderedWithPosition;
      }

      const updatedProducts = currentProducts.map(
        (product) => reorderedMap.get(product._id) || product,
      );

      return [...updatedProducts].sort(
        (firstProduct, secondProduct) =>
          Number(firstProduct.displayOrder || 0) -
          Number(secondProduct.displayOrder || 0),
      );
    });

    try {
      setReordering(true);

      await api.patch("/products/reorder", {
        categoryId: categoryFilter,
        productIds: reorderedWithPosition.map((product) => product._id),
      });

      toast.success("Product order updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Product order update failed",
      );

      await fetchProducts();
    } finally {
      setReordering(false);
    }
  };
  const activeProducts = products.filter((product) => product.isActive).length;

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 10,
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0,
  );

  const getStockClass = (stock) => {
    const value = Number(stock);

    if (value <= 10) return "danger";
    if (value <= 20) return "warning";

    return "success";
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
        <header className="admin-topbar">
          <div>
            <h1>Product Management</h1>
            <p>Add, update and manage all store products.</p>
          </div>

          <div className="product-header-actions">
            <div className="admin-user-chip">
              <span className="admin-user-avatar">
                {(adminUser?.name || "A").charAt(0).toUpperCase()}
              </span>

              <div>
                <strong>{adminUser?.name || "Admin"}</strong>
                <small>Administrator</small>
              </div>
            </div>

            <button
              type="button"
              className="product-add-button"
              onClick={openAddModal}
            >
              <FiPlus />
              Add Product
            </button>
          </div>
        </header>

        <section className="product-summary-grid">
          <article className="product-summary-card">
            <span className="product-summary-icon">
              <FiPackage />
            </span>

            <div>
              <p>Total Products</p>
              <strong>{products.length}</strong>
            </div>
          </article>

          <article className="product-summary-card active">
            <span className="product-summary-icon">
              <FiPackage />
            </span>

            <div>
              <p>Active Products</p>
              <strong>{activeProducts}</strong>
            </div>
          </article>

          <article className="product-summary-card stock">
            <span className="product-summary-icon">
              <FiPackage />
            </span>

            <div>
              <p>Total Stock</p>
              <strong>{totalStock}</strong>
            </div>
          </article>

          <article className="product-summary-card low">
            <span className="product-summary-icon">
              <FiPackage />
            </span>

            <div>
              <p>Low Stock</p>
              <strong>{lowStockProducts}</strong>
            </div>
          </article>
        </section>

        <section className="product-management-panel">
          <div className="product-toolbar">
            <div className="product-search-box">
              <FiSearch />

              <input
                type="text"
                placeholder="Search product or brand..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All Categories</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="product-table-heading">
            <div>
              <h2>All Products</h2>
              <p>{filteredProducts.length} products shown</p>
            </div>
          </div>

          {loading ? (
            <div className="product-empty-state">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="product-empty-state">No products found</div>
          ) : (
            <div className="product-table-wrapper">
              <DragDropContext onDragEnd={handleDragEnd}>
                <table className="admin-product-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Features</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <Droppable droppableId="product-list">
                    {(provided) => (
                      <tbody
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {filteredProducts.map((product, index) => (
                          <Draggable
                            key={product._id}
                            draggableId={String(product._id)}
                            index={index}
                            isDragDisabled={!canReorder || reordering}
                          >
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.85 : 1,
                                  cursor:
                                    canReorder && !reordering
                                      ? "grab"
                                      : "default",
                                }}
                                className={
                                  snapshot.isDragging
                                    ? "product-row-dragging"
                                    : ""
                                }
                              >
                                <td>
                                  <img
                                    className="product-table-image"
                                    src={
                                      product.imageUrl || defaultProductImage
                                    }
                                    alt={product.name}
                                    onError={(event) => {
                                      event.currentTarget.src =
                                        defaultProductImage;
                                    }}
                                  />
                                </td>

                                <td>
                                  <div className="product-name-cell">
                                    <strong>{product.name}</strong>

                                    <span>
                                      {product.packQuantity || 1}{" "}
                                      {product.unit || "Piece"} /{" "}
                                      {product.packType || "Single"}
                                    </span>
                                  </div>
                                </td>

                                <td>{product.brand || "-"}</td>

                                <td>
                                  {product.category?.name || "No Category"}
                                </td>

                                <td>
                                  <strong className="product-price">
                                    ₹{Number(product.price || 0)}
                                  </strong>
                                </td>

                                <td>
                                  <span
                                    className={`product-stock-badge ${getStockClass(
                                      product.stock,
                                    )}`}
                                  >
                                    {product.stock}
                                  </span>
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className={`product-status-button ${
                                      product.isActive ? "active" : "inactive"
                                    }`}
                                    onClick={() => handleStatusToggle(product)}
                                  >
                                    {product.isActive ? "Active" : "Inactive"}
                                  </button>
                                </td>

                                <td>
                                  <div className="product-feature-list">
                                    {Number(product.discount) > 0 && (
                                      <span className="discount">
                                        {product.discount}% OFF
                                      </span>
                                    )}

                                    {product.isBestSeller && (
                                      <span className="best-seller">
                                        Best Seller
                                      </span>
                                    )}

                                    {product.isNewArrival && (
                                      <span className="new-arrival">New</span>
                                    )}

                                    {product.festivalOffer && (
                                      <span className="festival">Festival</span>
                                    )}

                                    {!product.discount &&
                                      !product.isBestSeller &&
                                      !product.isNewArrival &&
                                      !product.festivalOffer && (
                                        <span className="no-feature">-</span>
                                      )}
                                  </div>
                                </td>

                                <td>
                                  <div className="product-action-buttons">
                                    <button
                                      type="button"
                                      className="product-edit-button"
                                      onClick={() => handleEdit(product)}
                                    >
                                      <FiEdit2 />
                                    </button>

                                    <button
                                      type="button"
                                      className="product-delete-button"
                                      onClick={() => handleDelete(product._id)}
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </table>
              </DragDropContext>
            </div>
          )}
        </section>
      </main>

      {showModal && (
        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="product-form-modal">
            <div className="product-modal-header">
              <div>
                <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

                <p>Enter complete product information.</p>
              </div>

              <button
                type="button"
                className="product-modal-close"
                onClick={closeModal}
              >
                <FiX />
              </button>
            </div>

            <form className="product-form-grid" onSubmit={handleSubmit}>
              <div className="product-form-group">
                <label>Product Name</label>

                <input
                  name="name"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label>Brand</label>

                <input
                  name="brand"
                  placeholder="Brand Name"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label>Category</label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="product-form-group">
                <label>Price</label>

                <input
                  name="price"
                  type="number"
                  min="0"
                  placeholder="Selling Price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label>Stock</label>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="Available Stock"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label>Discount %</label>

                <input
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Discount Percentage"
                  value={form.discount}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label>Pack Type</label>

                <select
                  name="packType"
                  value={form.packType}
                  onChange={handleChange}
                >
                  <option value="Single">Single</option>
                  <option value="Box">Box</option>
                  <option value="Bundle">Bundle</option>
                </select>
              </div>

              <div className="product-form-group">
                <label>Pack Quantity</label>

                <input
                  name="packQuantity"
                  type="number"
                  min="1"
                  placeholder="Pack Quantity"
                  value={form.packQuantity}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label>Unit</label>

                <select name="unit" value={form.unit} onChange={handleChange}>
                  <option value="Piece">Piece</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Packet">Packet</option>
                  <option value="Packets">Packets</option>
                </select>
              </div>

              <div className="product-form-group">
                <label>Image URL</label>

                <input
                  name="imageUrl"
                  placeholder="Paste Image URL"
                  value={form.imageUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group product-form-full">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Product Description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="product-toggle-grid product-form-full">
                <label>
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={form.isBestSeller}
                    onChange={handleChange}
                  />
                  Best Seller
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={form.isNewArrival}
                    onChange={handleChange}
                  />
                  New Arrival
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="festivalOffer"
                    checked={form.festivalOffer}
                    onChange={handleChange}
                  />
                  Festival Offer
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  Active Product
                </label>
              </div>

              {form.imageUrl && (
                <div className="product-image-preview product-form-full">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    onError={(event) => {
                      event.currentTarget.src = defaultProductImage;
                    }}
                  />

                  <div>
                    <strong>Image Preview</strong>
                    <p>Confirm image before saving.</p>
                  </div>
                </div>
              )}

              <div className="product-modal-actions product-form-full">
                <button
                  type="button"
                  className="product-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="product-save-button">
                  {editingId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
