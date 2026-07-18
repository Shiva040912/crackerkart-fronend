import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from "react-icons/fi";

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

  const fetchCart = async () => {
    try {
      const res = await getMyCart();
      setCart(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to load cart");
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchCart();
  }, []);

  const increaseQty = async (item) => {
    await updateCartItem(item._id, { quantity: item.quantity + 1 });
    fetchCart();
  };

  const decreaseQty = async (item) => {
    if (item.quantity === 1) return;
    await updateCartItem(item._id, { quantity: item.quantity - 1 });
    fetchCart();
  };

  const deleteItem = async (id) => {
    await removeCartItem(id);
    fetchCart();
  };

  const clearAll = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    await clearCart();
    fetchCart();
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const delivery = subtotal >= 1000 ? 0 : subtotal === 0 ? 0 : 300;
  const grandTotal = subtotal + delivery;

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <div className="cart-title-row">
          <div>
            <p>Your Shopping Bag</p>
            <h1>Cart</h1>
          </div>

          {cart.length > 0 && (
            <button className="clear-cart-btn" onClick={clearAll}>
              Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <FiShoppingBag className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Add your favourite fireworks and come back here.</p>
            <button onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-card" key={item._id}>
                  <img
                    src={
                      item.product.imageUrl ||
                      "https://dummyimage.com/140x140/f1f5f9/111827&text=Product"
                    }
                    alt={item.product.name}
                  />

                  <div className="cart-info">
                    <h2>{item.product.name}</h2>
                    <p>₹{item.product.price}</p>

                    <div className="qty-box">
                      <button onClick={() => decreaseQty(item)}>
                        <FiMinus />
                      </button>

                      <span>{item.quantity}</span>

                      <button onClick={() => increaseQty(item)}>
                        <FiPlus />
                      </button>
                    </div>
                  </div>

                  <div className="cart-right">
                    <h3>₹{item.product.price * item.quantity}</h3>

                    <button
                      className="delete-btn"
                      onClick={() => deleteItem(item._id)}
                    >
                      <FiTrash2 />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <strong>{delivery === 0 ? "FREE" : `₹${delivery}`}</strong>
              </div>

              <div className="summary-note">
                Free delivery on orders above ₹1000
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>₹{grandTotal}</strong>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed To Checkout
              </button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Cart;