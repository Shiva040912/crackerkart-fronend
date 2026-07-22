import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import toast from "react-hot-toast";

import socket from "../../service/socket";
import api from "../../api/axios";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/product";

import "../../styles/admincommon.css";
import "../../styles/adminproduct.css";

import defaultProductImage from "../../assets/image.jpeg";
import AdminSidebar from "../../components/AdminSidebar";

const initialForm = {
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
};

const Product = () => {
  const adminUser = JSON.parse(
    localStorage.getItem("adminUser") || "{}",
  );

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const [form, setForm] = useState(initialForm);

  const resetForm = () => {
    setForm(initialForm);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await getProducts();

      setProducts(
        Array.isArray(response.data) ? response.data : [],
      );
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
        Array.isArray(response.data)
          ? response.data.filter(
              (category) => category.isActive === true,
            )
          : [],
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

    if (
      !form.packQuantity ||
      Number(form.packQuantity) <= 0
    ) {
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
      toast.error(
        error.response?.data?.message || "Action failed",
      );
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
      category:
        product.category?._id || product.category || "",
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
        product.isActive
          ? "Product deactivated"
          : "Product activated",
      );

      fetchProducts();
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Delete this product permanently?",
    );

    if (!confirmed) return;

    try {
      await deleteProduct(productId);

      toast.success("Product deleted successfully");

      fetchProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Delete failed",
      );
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query);

      const productCategoryId =
        product.category?._id || product.category;

      const matchesCategory =
        categoryFilter === "all" ||
        productCategoryId === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          product.isActive) ||
        (statusFilter === "inactive" &&
          !product.isActive);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
  ]);

  const canReorder =
    search.trim() === "" && statusFilter === "all";

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    if (!canReorder) {
      toast.error(
        "Search and status filters clear pannitu drag pannu",
      );
      return;
    }

    if (
      result.source.index ===
      result.destination.index
    ) {
      return;
    }

    const reorderedProducts = Array.from(
      filteredProducts,
    );

    const [movedProduct] = reorderedProducts.splice(
      result.source.index,
      1,
    );

    reorderedProducts.splice(
      result.destination.index,
      0,
      movedProduct,
    );

    const reorderedWithPosition =
      reorderedProducts.map((product, index) => ({
        ...product,
        displayOrder: index + 1,
      }));

    const reorderedMap = new Map(
      reorderedWithPosition.map((product) => [
        product._id,
        product,
      ]),
    );

    setProducts((currentProducts) => {
      if (categoryFilter === "all") {
        return reorderedWithPosition;
      }

      const updatedProducts = currentProducts.map(
        (product) =>
          reorderedMap.get(product._id) || product,
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
        productIds: reorderedWithPosition.map(
          (product) => product._id,
        ),
      });

      toast.success("Product order updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Product order update failed",
      );

      await fetchProducts();
    } finally {
      setReordering(false);
    }
  };

  const activeProducts = products.filter(
    (product) => product.isActive,
  ).length;

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 10,
  ).length;

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0,
  );

  const getStockClass = (stock) => {
    const value = Number(stock);

    if (value <= 0) return "out";
    if (value <= 10) return "danger";
    if (value <= 20) return "warning";

    return "success";
  };

  const getStockText = (stock) => {
    const value = Number(stock);

    if (value <= 0) return "Out of stock";

    return `${value} available`;
  };

  const getFeatureCount = (product) => {
    let count = 0;

    if (Number(product.discount) > 0) count += 1;
    if (product.isBestSeller) count += 1;
    if (product.isNewArrival) count += 1;
    if (product.festivalOffer) count += 1;

    return count;
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content product-page">
        <header className="admin-topbar product-topbar">
          <div className="product-topbar-content">
            <span className="product-page-eyebrow">
              Product Catalogue
            </span>

            <h1>Product Management</h1>

            <p>
              Add products, update pricing, control availability and organize
              the store catalogue.
            </p>
          </div>

          <div className="product-header-actions">
            <button
              type="button"
              className="product-add-button"
              onClick={openAddModal}
            >
              <FiPlus />
              Add Product
            </button>

            <div className="product-header-insight">
              <span className="product-header-insight-icon">
                <FiPackage />
              </span>

              <div>
                <small>Catalogue</small>
                <strong>Live Products</strong>
              </div>
            </div>

            <div className="admin-user-chip product-admin-chip">
              <span className="admin-user-avatar">
                {(adminUser?.name || "A").charAt(0).toUpperCase()}
              </span>

              <div>
                <strong>{adminUser?.name || "Admin"}</strong>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>

        <section className="product-summary-grid">
          <article className="product-summary-card total">
            <span className="product-summary-icon">
              <FiPackage />
            </span>

            <div className="product-summary-content">
              <p>Total Products</p>
              <strong>{products.length}</strong>
              <small>Products in catalogue</small>
            </div>

            <span className="product-summary-shape" />
          </article>

          <article className="product-summary-card active">
            <span className="product-summary-icon">
              <FiPackage />
            </span>

            <div className="product-summary-content">
              <p>Active Products</p>
              <strong>{activeProducts}</strong>
              <small>Visible to customers</small>
            </div>

            <span className="product-summary-shape" />
          </article>

          <article className="product-summary-card stock">
            <span className="product-summary-icon">
              <FiPackage />
            </span>

            <div className="product-summary-content">
              <p>Total Stock</p>
              <strong>{totalStock}</strong>
              <small>Available stock units</small>
            </div>

            <span className="product-summary-shape" />
          </article>

          <article className="product-summary-card low">
            <span className="product-summary-icon">
              <FiPackage />
            </span>

            <div className="product-summary-content">
              <p>Low Stock</p>
              <strong>{lowStockProducts}</strong>
              <small>Products needing attention</small>
            </div>

            <span className="product-summary-shape" />
          </article>
        </section>

        <section className="product-management-panel">
          <div className="product-panel-header">
            <div>
              <span className="product-section-eyebrow">
                Store Catalogue
              </span>

              <h2>All Products</h2>

              <p>
                {filteredProducts.length} product
                {filteredProducts.length !== 1
                  ? "s"
                  : ""}{" "}
                shown
              </p>
            </div>

            {reordering && (
              <span className="product-reordering-status">
                Saving product order...
              </span>
            )}
          </div>

          <div className="product-toolbar">
            <div className="product-search-box">
              <FiSearch />

              <input
                type="text"
                placeholder="Search product or brand..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          {!canReorder &&
            filteredProducts.length > 0 && (
              <div className="product-reorder-notice">
                Search and status filters clear pannuna
                product order drag panni change pannalam.
              </div>
            )}

          {loading ? (
            <div className="product-empty-state">
              <span className="product-loading-spinner" />

              <strong>Loading products...</strong>

              <p>
                Product catalogue load aaguthu.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="product-empty-state">
              <span className="product-empty-icon">
                <FiPackage />
              </span>

              <strong>No products found</strong>

              <p>
                Search or filter maathi try pannunga.
              </p>
            </div>
          ) : (
            <>
              <div className="product-table-wrapper">
                <DragDropContext
                  onDragEnd={handleDragEnd}
                >
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
                          {filteredProducts.map(
                            (product, index) => (
                              <Draggable
                                key={product._id}
                                draggableId={String(
                                  product._id,
                                )}
                                index={index}
                                isDragDisabled={
                                  !canReorder ||
                                  reordering
                                }
                              >
                                {(
                                  provided,
                                  snapshot,
                                ) => (
                                  <tr
                                    ref={
                                      provided.innerRef
                                    }
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided
                                        .draggableProps
                                        .style,
                                      cursor:
                                        canReorder &&
                                        !reordering
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
                                      <div className="product-image-cell">
                                        <img
                                          className="product-table-image"
                                          src={
                                            product.imageUrl ||
                                            defaultProductImage
                                          }
                                          alt={
                                            product.name
                                          }
                                          onError={(
                                            event,
                                          ) => {
                                            event.currentTarget.src =
                                              defaultProductImage;
                                          }}
                                        />

                                        {Number(
                                          product.discount,
                                        ) > 0 && (
                                          <span className="product-image-discount">
                                            {
                                              product.discount
                                            }
                                            %
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    <td>
                                      <div className="product-name-cell">
                                        <strong>
                                          {product.name}
                                        </strong>

                                        <span>
                                          {product.packQuantity ||
                                            1}{" "}
                                          {product.unit ||
                                            "Piece"}{" "}
                                          /{" "}
                                          {product.packType ||
                                            "Single"}
                                        </span>
                                      </div>
                                    </td>

                                    <td>
                                      <span className="product-brand-text">
                                        {product.brand ||
                                          "-"}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="product-category-badge">
                                        {product
                                          .category
                                          ?.name ||
                                          "No Category"}
                                      </span>
                                    </td>

                                    <td>
                                      <strong className="product-price">
                                        ₹
                                        {Number(
                                          product.price ||
                                            0,
                                        ).toLocaleString(
                                          "en-IN",
                                        )}
                                      </strong>
                                    </td>

                                    <td>
                                      <span
                                        className={`product-stock-badge ${getStockClass(
                                          product.stock,
                                        )}`}
                                      >
                                        {getStockText(
                                          product.stock,
                                        )}
                                      </span>
                                    </td>

                                    <td>
                                      <button
                                        type="button"
                                        className={`product-status-button ${
                                          product.isActive
                                            ? "active"
                                            : "inactive"
                                        }`}
                                        onClick={() =>
                                          handleStatusToggle(
                                            product,
                                          )
                                        }
                                      >
                                        <span />

                                        {product.isActive
                                          ? "Active"
                                          : "Inactive"}
                                      </button>
                                    </td>

                                    <td>
                                      <div className="product-feature-list">
                                        {Number(
                                          product.discount,
                                        ) > 0 && (
                                          <span className="discount">
                                            {
                                              product.discount
                                            }
                                            % OFF
                                          </span>
                                        )}

                                        {product.isBestSeller && (
                                          <span className="best-seller">
                                            Best Seller
                                          </span>
                                        )}

                                        {product.isNewArrival && (
                                          <span className="new-arrival">
                                            New
                                          </span>
                                        )}

                                        {product.festivalOffer && (
                                          <span className="festival">
                                            Festival
                                          </span>
                                        )}

                                        {getFeatureCount(
                                          product,
                                        ) === 0 && (
                                          <span className="no-feature">
                                            No features
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    <td>
                                      <div className="product-action-buttons">
                                        <button
                                          type="button"
                                          className="product-edit-button"
                                          title="Edit product"
                                          aria-label={`Edit ${product.name}`}
                                          onClick={() =>
                                            handleEdit(
                                              product,
                                            )
                                          }
                                        >
                                          <FiEdit2 />
                                        </button>

                                        <button
                                          type="button"
                                          className="product-delete-button"
                                          title="Delete product"
                                          aria-label={`Delete ${product.name}`}
                                          onClick={() =>
                                            handleDelete(
                                              product._id,
                                            )
                                          }
                                        >
                                          <FiTrash2 />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Draggable>
                            ),
                          )}

                          {provided.placeholder}
                        </tbody>
                      )}
                    </Droppable>
                  </table>
                </DragDropContext>
              </div>

              <div className="product-mobile-list">
                {filteredProducts.map((product) => (
                  <article
                    className={`product-mobile-card ${
                      Number(product.stock) <= 10
                        ? "low-stock-card"
                        : ""
                    }`}
                    key={product._id}
                  >
                    <div className="product-mobile-main">
                      <div className="product-mobile-image-box">
                        <img
                          src={
                            product.imageUrl ||
                            defaultProductImage
                          }
                          alt={product.name}
                          onError={(event) => {
                            event.currentTarget.src =
                              defaultProductImage;
                          }}
                        />

                        {Number(product.discount) >
                          0 && (
                          <span>
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="product-mobile-content">
                        <div className="product-mobile-title-row">
                          <div>
                            <h3>{product.name}</h3>

                            <p>
                              {product.brand ||
                                "No brand"}
                            </p>
                          </div>

                          <button
                            type="button"
                            className={`product-status-button ${
                              product.isActive
                                ? "active"
                                : "inactive"
                            }`}
                            onClick={() =>
                              handleStatusToggle(
                                product,
                              )
                            }
                          >
                            <span />

                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </button>
                        </div>

                        <span className="product-category-badge">
                          {product.category?.name ||
                            "No Category"}
                        </span>

                        <div className="product-mobile-price-row">
                          <strong>
                            ₹
                            {Number(
                              product.price || 0,
                            ).toLocaleString(
                              "en-IN",
                            )}
                          </strong>

                          <span
                            className={`product-stock-badge ${getStockClass(
                              product.stock,
                            )}`}
                          >
                            {getStockText(
                              product.stock,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="product-mobile-pack">
                      <div>
                        <small>Pack Type</small>

                        <strong>
                          {product.packType ||
                            "Single"}
                        </strong>
                      </div>

                      <div>
                        <small>Quantity</small>

                        <strong>
                          {product.packQuantity || 1}{" "}
                          {product.unit ||
                            "Piece"}
                        </strong>
                      </div>
                    </div>

                    {getFeatureCount(product) > 0 && (
                      <div className="product-feature-list product-mobile-features">
                        {Number(product.discount) >
                          0 && (
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
                          <span className="new-arrival">
                            New Arrival
                          </span>
                        )}

                        {product.festivalOffer && (
                          <span className="festival">
                            Festival Offer
                          </span>
                        )}
                      </div>
                    )}

                    <div className="product-mobile-actions">
                      <button
                        type="button"
                        className="product-mobile-edit"
                        onClick={() =>
                          handleEdit(product)
                        }
                      >
                        <FiEdit2 />
                        Edit Product
                      </button>

                      <button
                        type="button"
                        className="product-mobile-delete"
                        onClick={() =>
                          handleDelete(product._id)
                        }
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {showModal && (
        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="product-form-modal">
            <div className="product-modal-header">
              <div>
                <span className="product-section-eyebrow">
                  {editingId
                    ? "Update Catalogue"
                    : "New Catalogue Item"}
                </span>

                <h2>
                  {editingId
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p>
                  Enter complete product information.
                </p>
              </div>

              <button
                type="button"
                className="product-modal-close"
                aria-label="Close product form"
                onClick={closeModal}
              >
                <FiX />
              </button>
            </div>

            <form
              className="product-form-grid"
              onSubmit={handleSubmit}
            >
              <div className="product-form-group">
                <label htmlFor="product-name">
                  Product Name
                </label>

                <input
                  id="product-name"
                  name="name"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label htmlFor="product-brand">
                  Brand
                </label>

                <input
                  id="product-brand"
                  name="brand"
                  placeholder="Enter brand name"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label htmlFor="product-category">
                  Category
                </label>

                <select
                  id="product-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="product-form-group">
                <label htmlFor="product-price">
                  Price
                </label>

                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  placeholder="Selling price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label htmlFor="product-stock">
                  Stock
                </label>

                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="Available stock"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label htmlFor="product-discount">
                  Discount %
                </label>

                <input
                  id="product-discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Discount percentage"
                  value={form.discount}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label htmlFor="product-pack-type">
                  Pack Type
                </label>

                <select
                  id="product-pack-type"
                  name="packType"
                  value={form.packType}
                  onChange={handleChange}
                >
                  <option value="Single">
                    Single
                  </option>

                  <option value="Box">Box</option>

                  <option value="Bundle">
                    Bundle
                  </option>
                </select>
              </div>

              <div className="product-form-group">
                <label htmlFor="product-pack-quantity">
                  Pack Quantity
                </label>

                <input
                  id="product-pack-quantity"
                  name="packQuantity"
                  type="number"
                  min="1"
                  placeholder="Pack quantity"
                  value={form.packQuantity}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group">
                <label htmlFor="product-unit">
                  Unit
                </label>

                <select
                  id="product-unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                >
                  <option value="Piece">
                    Piece
                  </option>

                  <option value="Pieces">
                    Pieces
                  </option>

                  <option value="Packet">
                    Packet
                  </option>

                  <option value="Packets">
                    Packets
                  </option>
                </select>
              </div>

              <div className="product-form-group">
                <label htmlFor="product-image">
                  Image URL
                </label>

                <input
                  id="product-image"
                  name="imageUrl"
                  placeholder="Paste image URL"
                  value={form.imageUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="product-form-group product-form-full">
                <label htmlFor="product-description">
                  Description
                </label>

                <textarea
                  id="product-description"
                  name="description"
                  placeholder="Enter product description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="product-toggle-grid product-form-full">
                <label
                  className={
                    form.isBestSeller
                      ? "selected"
                      : ""
                  }
                >
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={form.isBestSeller}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Best Seller</strong>
                    <small>
                      Highlight popular product
                    </small>
                  </span>
                </label>

                <label
                  className={
                    form.isNewArrival
                      ? "selected"
                      : ""
                  }
                >
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={form.isNewArrival}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>New Arrival</strong>
                    <small>
                      Mark as recently added
                    </small>
                  </span>
                </label>

                <label
                  className={
                    form.festivalOffer
                      ? "selected"
                      : ""
                  }
                >
                  <input
                    type="checkbox"
                    name="festivalOffer"
                    checked={form.festivalOffer}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Festival Offer</strong>
                    <small>
                      Include in festival offers
                    </small>
                  </span>
                </label>

                <label
                  className={
                    form.isActive
                      ? "selected"
                      : ""
                  }
                >
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>Active Product</strong>
                    <small>
                      Visible to customers
                    </small>
                  </span>
                </label>
              </div>

              {form.imageUrl && (
                <div className="product-image-preview product-form-full">
                  <img
                    src={form.imageUrl}
                    alt="Product preview"
                    onError={(event) => {
                      event.currentTarget.src =
                        defaultProductImage;
                    }}
                  />

                  <div>
                    <span className="product-section-eyebrow">
                      Preview
                    </span>

                    <strong>Product Image</strong>

                    <p>
                      Save panna munadi image correct-ah
                      irukanu confirm pannunga.
                    </p>
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

                <button
                  type="submit"
                  className="product-save-button"
                >
                  {editingId
                    ? "Update Product"
                    : "Save Product"}
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