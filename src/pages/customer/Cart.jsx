import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DEFAULT_IMAGE from "../../assets/image.jpeg"

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../api/cart";

import "../../styles/cart.css";


const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  const notifyCartUpdated = () => {
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const fetchCart = async () => {
    try {
      setIsLoading(true);

      const res = await getMyCart();

      const validItems = Array.isArray(res.data)
        ? res.data.filter((item) => item?.product)
        : [];

      setCart(validItems);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to load your cart"
      );

      setCart([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    fetchCart();
  }, []);

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  const updateQuantity = async (item, newQuantity) => {
    if (!item?._id || newQuantity < 1 || updatingItemId) return;

    try {
      setUpdatingItemId(item._id);

      await updateCartItem(item._id, {
        quantity: newQuantity,
      });

      setCart((previousCart) =>
        previousCart.map((cartItem) =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity: newQuantity,
              }
            : cartItem
        )
      );

      notifyCartUpdated();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update quantity"
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const increaseQty = async (item) => {
    const availableStock = Number(item.product?.stock || 0);

    if (availableStock > 0 && item.quantity >= availableStock) {
      toast.error(`Only ${availableStock} items available`);
      return;
    }

    await updateQuantity(item, item.quantity + 1);
  };

  const decreaseQty = async (item) => {
    if (item.quantity <= 1) return;

    await updateQuantity(item, item.quantity - 1);
  };

  const deleteItem = async (itemId) => {
    if (!itemId || updatingItemId) return;

    try {
      setUpdatingItemId(itemId);

      await removeCartItem(itemId);

      setCart((previousCart) =>
        previousCart.filter((item) => item._id !== itemId)
      );

      notifyCartUpdated();
      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to remove product"
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const clearAll = async () => {
    const shouldClear = window.confirm(
      "Are you sure you want to clear the entire cart?"
    );

    if (!shouldClear || isClearing) return;

    try {
      setIsClearing(true);

      await clearCart();

      setCart([]);
      notifyCartUpdated();

      toast.success("Cart cleared successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to clear cart"
      );
    } finally {
      setIsClearing(false);
    }
  };

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.product?.price || 0);
      const quantity = Number(item.quantity || 0);

      return total + price * quantity;
    }, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }, [cart]);

  const deliveryCharge =
    subtotal === 0 || subtotal >= 1000 ? 0 : 300;

  const grandTotal = subtotal + deliveryCharge;

  const remainingForFreeDelivery = Math.max(1000 - subtotal, 0);

  const deliveryProgress = Math.min(
    Math.round((subtotal / 1000) * 100),
    100
  );

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <div className="cart-container">
          <header className="cart-title-row">
            <div>
              <p>Your Shopping Bag</p>
              <h1>My Cart</h1>

              {!isLoading && cart.length > 0 && (
                <span className="cart-item-count">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              )}
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                className="clear-cart-btn"
                onClick={clearAll}
                disabled={isClearing}
              >
                <FiTrash2 />

                <span>
                  {isClearing ? "Clearing..." : "Clear All"}
                </span>
              </button>
            )}
          </header>

          {isLoading ? (
            <div className="cart-loading">
              <div className="cart-loading-spinner" />
              <p>Loading your cart...</p>
            </div>
          ) : cart.length === 0 ? (
            <section className="empty-cart">
              <div className="empty-cart-icon-box">
                <FiShoppingBag />
              </div>

              <h2>Your cart is empty</h2>

              <p>
                Add your favourite fireworks and prepare for your
                celebration.
              </p>

              <button
                type="button"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
                <FiArrowRight />
              </button>
            </section>
          ) : (
            <>
              <div className="cart-layout">
                <div className="cart-content">
                  <section className="cart-items">
                    {cart.map((item) => {
                      const product = item.product;
                      const productPrice = Number(product.price || 0);
                      const itemTotal =
                        productPrice * Number(item.quantity || 0);

                      const availableStock = Number(
                        product.stock || 0
                      );

                      const isUpdating =
                        updatingItemId === item._id;

                      const isMinimumQuantity =
                        Number(item.quantity) <= 1;

                      const reachedStockLimit =
                        availableStock > 0 &&
                        Number(item.quantity) >= availableStock;

                      return (
                        <article
                          className="cart-card"
                          key={item._id}
                        >
                          <button
                            type="button"
                            className="cart-product-image"
                            onClick={() =>
                              navigate(
                                `/products/${product._id}`
                              )
                            }
                            aria-label={`View ${product.name}`}
                          >
                            <img
                              src={
                                product.imageUrl || DEFAULT_IMAGE
                              }
                              alt={product.name || "Product"}
                              onError={(event) => {
                                event.currentTarget.src =
                                  DEFAULT_IMAGE;
                              }}
                            />
                          </button>

                          <div className="cart-info">
                            <p className="cart-product-brand">
                              {product.brand || "Japan Pattasu"}
                            </p>

                            <h2
                              onClick={() =>
                                navigate(
                                  `/products/${product._id}`
                                )
                              }
                            >
                              {product.name}
                            </h2>

                            <p className="cart-pack-info">
                              {product.packQuantity || 1}{" "}
                              {product.unit || "Piece"}
                              {product.packType
                                ? ` • ${product.packType}`
                                : ""}
                            </p>

                            <p className="cart-unit-price">
                              ₹{formatPrice(productPrice)}
                            </p>

                            <div className="cart-mobile-action-row">
                              <div className="qty-box">
                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQty(item)
                                  }
                                  disabled={
                                    isMinimumQuantity ||
                                    isUpdating
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <FiMinus />
                                </button>

                                <span>{item.quantity}</span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQty(item)
                                  }
                                  disabled={
                                    reachedStockLimit ||
                                    isUpdating
                                  }
                                  aria-label="Increase quantity"
                                >
                                  <FiPlus />
                                </button>
                              </div>

                              <strong className="cart-mobile-total">
                                ₹{formatPrice(itemTotal)}
                              </strong>
                            </div>

                            {reachedStockLimit &&
                              availableStock > 0 && (
                                <small className="cart-stock-limit">
                                  Maximum available quantity
                                  reached
                                </small>
                              )}
                          </div>

                          <div className="cart-right">
                            <div className="cart-item-total">
                              <span>Item Total</span>
                              <h3>
                                ₹{formatPrice(itemTotal)}
                              </h3>
                            </div>

                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() =>
                                deleteItem(item._id)
                              }
                              disabled={isUpdating}
                            >
                              <FiTrash2 />

                              <span>
                                {isUpdating
                                  ? "Updating..."
                                  : "Remove"}
                              </span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </section>

                  <section className="delivery-progress-card">
                    <div className="delivery-progress-heading">
                      <div className="delivery-icon">
                        <FiShoppingBag />
                      </div>

                      <div>
                        {subtotal >= 1000 ? (
                          <>
                            <h3>Free delivery unlocked</h3>
                            <p>
                              Your order qualifies for free
                              delivery.
                            </p>
                          </>
                        ) : (
                          <>
                            <h3>
                              Add ₹
                              {formatPrice(
                                remainingForFreeDelivery
                              )}{" "}
                              more
                            </h3>
                            <p>
                              Get free delivery on orders of
                              ₹1,000 or more.
                            </p>
                          </>
                        )}
                      </div>

                      <strong>{deliveryProgress}%</strong>
                    </div>

                    <div className="delivery-progress-track">
                      <span
                        style={{
                          width: `${deliveryProgress}%`,
                        }}
                      />
                    </div>
                  </section>
                </div>

                <aside className="cart-summary">
                  <div className="cart-summary-heading">
                    <div>
                      <p>Payment Details</p>
                      <h2>Order Summary</h2>
                    </div>

                    <FiShoppingBag />
                  </div>

                  <div className="summary-row">
                    <span>
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"})
                    </span>

                    <strong>
                      ₹{formatPrice(subtotal)}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>Delivery Charge</span>

                    <strong
                      className={
                        deliveryCharge === 0
                          ? "free-delivery-text"
                          : ""
                      }
                    >
                      {deliveryCharge === 0
                        ? "FREE"
                        : `₹${formatPrice(
                            deliveryCharge
                          )}`}
                    </strong>
                  </div>

                  <div className="summary-total">
                    <span>Grand Total</span>

                    <strong>
                      ₹{formatPrice(grandTotal)}
                    </strong>
                  </div>

                  <p className="summary-tax-text">
                    Inclusive of all applicable taxes
                  </p>

                  <button
                    type="button"
                    className="checkout-btn"
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed To Checkout
                    <FiArrowRight />
                  </button>

                  <button
                    type="button"
                    className="continue-shopping-btn"
                    onClick={() => navigate("/products")}
                  >
                    Continue Shopping
                  </button>
                </aside>
              </div>

              <div className="mobile-checkout-bar">
                <div className="mobile-checkout-total">
                  <span>Total</span>
                  <strong>
                    ₹{formatPrice(grandTotal)}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                >
                  Checkout
                  <FiArrowRight />
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Cart;