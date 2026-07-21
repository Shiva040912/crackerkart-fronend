import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiMinus,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShoppingCart,
  FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import api from "../../api/axios";
import {
  addToCart,
  getMyCart,
  removeCartItem,
  updateCartItem,
} from "../../api/cart";

import defaultImage from "../../assets/image.jpeg";

import "../../styles/quickbuy.css";

const QuickBuy = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [updatingProductId, setUpdatingProductId] = useState(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const res = await api.get("/products/active");

      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load products:", error);

      setProducts([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      const res = await getMyCart();

      const validItems = Array.isArray(res.data)
        ? res.data.filter((item) => item?.product)
        : [];

      setCartItems(validItems);

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartItems([]);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    loadProducts();
    loadCart();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.category?.name)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const brands = useMemo(() => {
    return [
      ...new Set(
        products.map((product) => product.brand).filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const getCartItem = (productId) => {
    return cartItems.find(
      (item) => item.product?._id === productId
    );
  };

  const handleQuantityChange = async (product, action) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to add products");
      navigate("/login");
      return;
    }

    if (updatingProductId) return;

    const cartItem = getCartItem(product._id);

    const currentQuantity = Number(cartItem?.quantity || 0);
    const availableStock = Number(product.stock || 0);

    if (action === "plus" && availableStock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (
      action === "plus" &&
      currentQuantity >= availableStock
    ) {
      toast.error(`Only ${availableStock} items available`);
      return;
    }

    try {
      setUpdatingProductId(product._id);

      if (action === "plus") {
        if (cartItem) {
          await updateCartItem(cartItem._id, {
            quantity: currentQuantity + 1,
          });
        } else {
          await addToCart({
            productId: product._id,
            quantity: 1,
          });
        }
      }

      if (action === "minus" && cartItem) {
        if (currentQuantity <= 1) {
          await removeCartItem(cartItem._id);
        } else {
          await updateCartItem(cartItem._id, {
            quantity: currentQuantity - 1,
          });
        }
      }

      await loadCart();
    } catch (error) {
      console.error("Failed to update cart:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to update cart"
      );
    } finally {
      setUpdatingProductId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const productName = String(
        product.name || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue || productName.includes(searchValue);

      const matchesCategory =
        category === "all" ||
        product.category?.name === category;

      const matchesBrand =
        brand === "all" || product.brand === brand;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand
      );
    });
  }, [products, search, category, brand]);

  const summary = useMemo(() => {
    const validItems = cartItems.filter(
      (item) => item?.product
    );

    const subtotal = validItems.reduce((total, item) => {
      const price = Number(item.product?.price || 0);
      const quantity = Number(item.quantity || 0);

      return total + price * quantity;
    }, 0);

    const totalItems = validItems.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

    const delivery =
      subtotal === 0 || subtotal >= 1000 ? 0 : 300;

    return {
      totalItems,
      subtotal,
      delivery,
      grandTotal: subtotal + delivery,
    };
  }, [cartItems]);

  const formatPrice = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  const handleCheckout = () => {
    if (summary.totalItems === 0) {
      toast.error("Add at least one product");
      return;
    }

    navigate("/checkout");
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setBrand("all");
  };

  return (
    <>
      <Navbar />

      <main className="quickbuy-page">
        <div className="quickbuy-container">
          <section className="quickbuy-top">
            <div className="quickbuy-title-content">
              <p>Fast Order</p>
              <h1>Quick Buy</h1>

              <span>
                Add multiple products quickly without opening
                every product page.
              </span>
            </div>

            <button
              type="button"
              className="quickbuy-top-checkout"
              onClick={handleCheckout}
              disabled={summary.totalItems === 0}
            >
              <FiZap />
              <span>Checkout</span>

              {summary.totalItems > 0 && (
                <b>{summary.totalItems}</b>
              )}
            </button>
          </section>

          <section className="quickbuy-filters">
            <div className="quickbuy-search">
              <FiSearch />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              <option value="all">All Categories</option>

              {categories.map((categoryName) => (
                <option
                  value={categoryName}
                  key={categoryName}
                >
                  {categoryName}
                </option>
              ))}
            </select>

            <select
              value={brand}
              onChange={(event) =>
                setBrand(event.target.value)
              }
            >
              <option value="all">All Brands</option>

              {brands.map((brandName) => (
                <option
                  value={brandName}
                  key={brandName}
                >
                  {brandName}
                </option>
              ))}
            </select>
          </section>

          <section className="quickbuy-result-bar">
            <div>
              <FiPackage />

              <span>
                <strong>{filteredProducts.length}</strong>{" "}
                products found
              </span>
            </div>

            {(search ||
              category !== "all" ||
              brand !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </section>

          <section className="quickbuy-layout">
            <div className="quickbuy-products-panel">
              {isLoading ? (
                <div className="quickbuy-loading-list">
                  {Array.from({ length: 6 }).map(
                    (_, index) => (
                      <div
                        className="quickbuy-skeleton-row"
                        key={index}
                      >
                        <div className="quickbuy-skeleton-image" />

                        <div className="quickbuy-skeleton-info">
                          <span />
                          <span />
                        </div>

                        <div className="quickbuy-skeleton-box" />
                        <div className="quickbuy-skeleton-box" />
                        <div className="quickbuy-skeleton-qty" />
                      </div>
                    )
                  )}
                </div>
              ) : hasError ? (
                <div className="quickbuy-status">
                  <FiAlertCircle />

                  <h2>Unable to load products</h2>

                  <p>
                    Something went wrong while loading Quick
                    Buy products.
                  </p>

                  <button
                    type="button"
                    onClick={loadProducts}
                  >
                    <FiRefreshCw />
                    Try Again
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="quickbuy-status">
                  <FiSearch />

                  <h2>No matching products</h2>

                  <p>
                    Try changing the search, category or brand
                    filter.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="quickbuy-table">
                  <div className="quickbuy-head">
                    <span>Product</span>
                    <span>Brand</span>
                    <span>Pack</span>
                    <span>Price</span>
                    <span>Quantity</span>
                    <span>Total</span>
                  </div>

                  <div className="quickbuy-list">
                    {filteredProducts.map((product) => {
                      const cartItem = getCartItem(
                        product._id
                      );

                      const quantity = Number(
                        cartItem?.quantity || 0
                      );

                      const productStock = Number(
                        product.stock || 0
                      );

                      const isUpdating =
                        updatingProductId === product._id;

                      const isOutOfStock =
                        productStock <= 0;

                      const reachedStockLimit =
                        productStock > 0 &&
                        quantity >= productStock;

                      const itemTotal =
                        quantity *
                        Number(product.price || 0);

                      return (
                        <article
                          className={`quickbuy-row ${
                            quantity > 0
                              ? "quickbuy-row-selected"
                              : ""
                          }`}
                          key={product._id}
                        >
                          <div className="quickbuy-product">
                            <div className="quickbuy-image-wrap">
                              <img
                                src={
                                  product.imageUrl ||
                                  defaultImage
                                }
                                alt={
                                  product.name || "Product"
                                }
                                onError={(event) => {
                                  event.currentTarget.src =
                                    defaultImage;
                                }}
                              />

                              {quantity > 0 && (
                                <span className="quickbuy-selected-badge">
                                  {quantity}
                                </span>
                              )}
                            </div>

                            <div className="quickbuy-product-info">
                              <h3>{product.name}</h3>

                              <p>
                                {product.category?.name ||
                                  "No Category"}
                              </p>

                              <span
                                className={`quickbuy-stock ${
                                  isOutOfStock
                                    ? "quickbuy-out-stock"
                                    : ""
                                }`}
                              >
                                {isOutOfStock
                                  ? "Out of stock"
                                  : `${productStock} in stock`}
                              </span>
                            </div>
                          </div>

                          <div className="quickbuy-data-cell">
                            <small>Brand</small>

                            <span>
                              {product.brand || "No Brand"}
                            </span>
                          </div>

                          <div className="quickbuy-data-cell">
                            <small>Pack</small>

                            <span>
                              {product.packQuantity || 1}{" "}
                              {product.unit || "Piece"}

                              <em>
                                {product.packType
                                  ? ` / ${product.packType}`
                                  : ""}
                              </em>
                            </span>
                          </div>

                          <div className="quickbuy-data-cell quickbuy-price-cell">
                            <small>Price</small>

                            <strong>
                              ₹{formatPrice(product.price)}
                            </strong>
                          </div>

                          <div className="quickbuy-data-cell quickbuy-quantity-cell">
                            <small>Quantity</small>

                            <div className="quickbuy-qty">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(
                                    product,
                                    "minus"
                                  )
                                }
                                disabled={
                                  quantity === 0 ||
                                  isUpdating
                                }
                              >
                                <FiMinus />
                              </button>

                              <b>
                                {isUpdating
                                  ? "..."
                                  : quantity}
                              </b>

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(
                                    product,
                                    "plus"
                                  )
                                }
                                disabled={
                                  isOutOfStock ||
                                  reachedStockLimit ||
                                  isUpdating
                                }
                              >
                                <FiPlus />
                              </button>
                            </div>
                          </div>

                          <div className="quickbuy-data-cell quickbuy-item-total">
                            <small>Total</small>

                            <strong>
                              {quantity > 0
                                ? `₹${formatPrice(
                                    itemTotal
                                  )}`
                                : "—"}
                            </strong>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <aside className="quickbuy-summary">
              <div className="quickbuy-summary-heading">
                <div>
                  <p>Payment Details</p>
                  <h2>Order Summary</h2>
                </div>

                <FiShoppingCart />
              </div>

              <div className="quickbuy-summary-line">
                <span>
                  Subtotal ({summary.totalItems}{" "}
                  {summary.totalItems === 1
                    ? "item"
                    : "items"}
                  )
                </span>

                <strong>
                  ₹{formatPrice(summary.subtotal)}
                </strong>
              </div>

              <div className="quickbuy-summary-line">
                <span>Delivery Charge</span>

                <strong
                  className={
                    summary.delivery === 0
                      ? "quickbuy-free-delivery"
                      : ""
                  }
                >
                  {summary.delivery === 0
                    ? "FREE"
                    : `₹${formatPrice(
                        summary.delivery
                      )}`}
                </strong>
              </div>

              {summary.subtotal > 0 &&
                summary.subtotal < 1000 && (
                  <div className="quickbuy-delivery-note">
                    Add ₹
                    {formatPrice(
                      1000 - summary.subtotal
                    )}{" "}
                    more for free delivery.
                  </div>
                )}

              <div className="quickbuy-summary-total">
                <span>Grand Total</span>

                <strong>
                  ₹{formatPrice(summary.grandTotal)}
                </strong>
              </div>

              <p className="quickbuy-summary-tax">
                Inclusive of all applicable taxes
              </p>

              <button
                type="button"
                className="quickbuy-summary-button"
                onClick={handleCheckout}
                disabled={summary.totalItems === 0}
              >
                Proceed To Checkout
                <FiArrowRight />
              </button>
            </aside>
          </section>
        </div>

        {summary.totalItems > 0 && (
          <div className="quickbuy-mobile-checkout-bar">
            <div className="quickbuy-mobile-total">
              <span>
                {summary.totalItems}{" "}
                {summary.totalItems === 1
                  ? "Item"
                  : "Items"}
              </span>

              <strong>
                ₹{formatPrice(summary.grandTotal)}
              </strong>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
            >
              Checkout
              <FiArrowRight />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default QuickBuy;