import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiBox,
  FiCheck,
  FiPackage,
  FiSearch,
  FiSlash,
  FiTrendingUp,
} from "react-icons/fi";
import toast from "react-hot-toast";

import AdminSidebar from "../../components/AdminSidebar";
import socket from "../../service/socket";
import {
  getProducts,
  updateProduct,
} from "../../api/product";

import "../../styles/admincommon.css";
import "../../styles/adminstock.css";

const Stock = () => {
  const adminUser = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [stockValues, setStockValues] = useState({});

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await getProducts();

      const productList = Array.isArray(response.data)
        ? response.data
        : [];

      setProducts(productList);

      const values = {};

      productList.forEach((product) => {
        values[product._id] = "";
      });

      setStockValues(values);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load stock"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    socket.on("productUpdated", loadProducts);

    return () => {
      socket.off("productUpdated", loadProducts);
    };
  }, []);

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0
  );

  const lowStockCount = products.filter(
    (product) =>
      Number(product.stock) > 0 &&
      Number(product.stock) <= 10
  ).length;

  const outOfStockCount = products.filter(
    (product) => Number(product.stock) === 0
  ).length;

  const healthyStockCount = products.filter(
    (product) => Number(product.stock) > 10
  ).length;

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name
          ?.toLowerCase()
          .includes(query) ||
        product.brand
          ?.toLowerCase()
          .includes(query) ||
        product.category?.name
          ?.toLowerCase()
          .includes(query);

      const stock = Number(product.stock || 0);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "healthy" && stock > 10) ||
        (stockFilter === "low" &&
          stock > 0 &&
          stock <= 10) ||
        (stockFilter === "out" && stock === 0);

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const handleStockInputChange = (
    productId,
    value
  ) => {
    if (value === "") {
      setStockValues((current) => ({
        ...current,
        [productId]: "",
      }));

      return;
    }

    const numericValue = Number(value);

    if (numericValue < 0) return;

    setStockValues((current) => ({
      ...current,
      [productId]: numericValue,
    }));
  };

  const handleStockUpdate = async (product) => {
    const stockToAdd = Number(
      stockValues[product._id]
    );

    if (
      stockValues[product._id] === "" ||
      Number.isNaN(stockToAdd) ||
      stockToAdd <= 0
    ) {
      return toast.error(
        "Enter a valid stock quantity to add"
      );
    }

    const currentStock = Number(product.stock || 0);

    const updatedStock =
      currentStock + stockToAdd;

    try {
      setUpdatingId(product._id);

      await updateProduct(product._id, {
        stock: updatedStock,
      });

      toast.success(
        `${stockToAdd} units added to ${product.name}. Total stock: ${updatedStock}`
      );

      await loadProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Stock update failed"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStockStatus = (stockValue) => {
    const stock = Number(stockValue || 0);

    if (stock === 0) {
      return {
        label: "Out of Stock",
        className: "out",
      };
    }

    if (stock <= 10) {
      return {
        label: "Low Stock",
        className: "low",
      };
    }

    return {
      label: "Healthy",
      className: "healthy",
    };
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-topbar stock-topbar">
          <div className="stock-topbar-copy">
            <span className="stock-eyebrow">
              Inventory Control
            </span>

            <h1>Stock Management</h1>

            <p>
              Monitor live inventory, identify low-stock
              products, and add available quantities.
            </p>
          </div>

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
        </header>

        <section className="stock-summary-grid">
          <article className="stock-summary-card">
            <span className="stock-summary-icon total">
              <FiPackage />
            </span>

            <div className="stock-summary-content">
              <p>Total Stock</p>

              <strong>{totalStock}</strong>

              <small>
                Available inventory units
              </small>
            </div>
          </article>

          <article className="stock-summary-card">
            <span className="stock-summary-icon healthy">
              <FiCheck />
            </span>

            <div className="stock-summary-content">
              <p>Healthy Products</p>

              <strong>{healthyStockCount}</strong>

              <small>More than 10 units</small>
            </div>
          </article>

          <article className="stock-summary-card">
            <span className="stock-summary-icon low">
              <FiAlertTriangle />
            </span>

            <div className="stock-summary-content">
              <p>Low Stock</p>

              <strong>{lowStockCount}</strong>

              <small>
                Between 1 and 10 units
              </small>
            </div>
          </article>

          <article className="stock-summary-card">
            <span className="stock-summary-icon out">
              <FiSlash />
            </span>

            <div className="stock-summary-content">
              <p>Out of Stock</p>

              <strong>{outOfStockCount}</strong>

              <small>
                Needs immediate refill
              </small>
            </div>
          </article>
        </section>

        <section className="stock-management-panel">
          <div className="stock-panel-header">
            <div>
              <span className="stock-section-label">
                Inventory Records
              </span>

              <h2>Product Stock</h2>

              <p>
                Add stock quantities without changing
                product details.
              </p>
            </div>

            <span className="stock-result-count">
              {filteredProducts.length} product
              {filteredProducts.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="stock-toolbar">
            <div className="stock-search-box">
              <FiSearch />

              <input
                type="text"
                placeholder="Search product, brand or category..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(event.target.value)
              }
            >
              <option value="all">
                All Stock Status
              </option>

              <option value="healthy">
                Healthy Stock
              </option>

              <option value="low">
                Low Stock
              </option>

              <option value="out">
                Out of Stock
              </option>
            </select>
          </div>

          {loading ? (
            <div className="stock-empty-state">
              <span className="stock-loading-ring" />

              <strong>Loading stock...</strong>

              <p>
                Please wait while inventory data is
                loaded.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="stock-empty-state">
              <FiPackage />

              <strong>No products found</strong>

              <p>
                Try changing your search or stock filter.
              </p>
            </div>
          ) : (
            <div className="stock-table-wrapper">
              <table className="admin-stock-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th>Add Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => {
                      const stockStatus =
                        getStockStatus(
                          product.stock
                        );

                      return (
                        <tr key={product._id}>
                          <td>
                            <div className="stock-product-cell">
                              <span className="stock-product-icon">
                                <FiBox />
                              </span>

                              <div className="stock-product-copy">
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
                            </div>
                          </td>

                          <td>
                            <span className="stock-brand-value">
                              {product.brand || "-"}
                            </span>
                          </td>

                          <td>
                            <span className="stock-category-value">
                              {product.category?.name ||
                                "No Category"}
                            </span>
                          </td>

                          <td>
                            <div className="stock-current-cell">
                              <strong className="stock-current-value">
                                {product.stock}
                              </strong>

                              <span>units</span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`stock-status-badge ${stockStatus.className}`}
                            >
                              {stockStatus.label}
                            </span>
                          </td>

                          <td>
                            <div className="stock-input-wrap">
                              <FiTrendingUp />

                              <input
                                className="stock-update-input"
                                type="number"
                                min="1"
                                placeholder="Qty"
                                value={
                                  stockValues[
                                    product._id
                                  ] ?? ""
                                }
                                onChange={(event) =>
                                  handleStockInputChange(
                                    product._id,
                                    event.target.value
                                  )
                                }
                              />
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="stock-update-button"
                              disabled={
                                updatingId ===
                                product._id
                              }
                              onClick={() =>
                                handleStockUpdate(
                                  product
                                )
                              }
                            >
                              {updatingId ===
                              product._id
                                ? "Adding..."
                                : "Add Stock"}
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Stock;