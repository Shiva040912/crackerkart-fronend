import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiSearch, FiZap } from "react-icons/fi";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api/axios";
import { addToCart, getMyCart, updateCartItem, removeCartItem } from "../../api/cart";

import "../../styles/quickbuy.css";
import defaultImage from "../../assets/image.jpeg"

const QuickBuy = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");

  
  const loadProducts = async () => {
    const res = await api.get("/products/active");
    setProducts(res.data);
  };

  const loadCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await getMyCart();
    setCartItems(res.data);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadProducts();
    loadCart();
  }, []);

  const categories = [
    ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
  ];

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  const getCartItem = (productId) => {
    return cartItems.find((item) => item.product?._id === productId);
  };

  const qtyChange = async (product, action) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const cartItem = getCartItem(product._id);

    if (action === "plus") {
      if (cartItem) {
        await updateCartItem(cartItem._id, { quantity: cartItem.quantity + 1 });
      } else {
        await addToCart({ productId: product._id, quantity: 1 });
      }
    }

    if (action === "minus" && cartItem) {
      if (cartItem.quantity === 1) {
        await removeCartItem(cartItem._id);
      } else {
        await updateCartItem(cartItem._id, { quantity: cartItem.quantity - 1 });
      }
    }

    loadCart();
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      category === "all" || product.category?.name === category;
    const matchBrand = brand === "all" || product.brand === brand;

    return matchSearch && matchCategory && matchBrand;
  });

  const summary = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const delivery = subtotal >= 1000 || subtotal === 0 ? 0 : 300;
    const grandTotal = subtotal + delivery;

    return {
      totalItems: cartItems.reduce((total, item) => total + item.quantity, 0),
      subtotal,
      delivery,
      grandTotal,
    };
  }, [cartItems]);

  return (
    <>
      <Navbar />

      <main className="quickbuy-page">
        <section className="quickbuy-top">
          <div>
            <p>Fast Order</p>
            <h1>Quick Buy</h1>
            <span>{filteredProducts.length} products loaded</span>
          </div>

          <button onClick={() => navigate("/checkout")}>
            <FiZap />
            Checkout
          </button>
        </section>

        <section className="quickbuy-filters">
          <div className="quickbuy-search">
            <FiSearch />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="all">All Brands</option>
            {brands.map((brandName) => (
              <option key={brandName}>{brandName}</option>
            ))}
          </select>
        </section>

        <section className="quickbuy-layout">
          <div className="quickbuy-table">
            <div className="quickbuy-head">
              <span>Product</span>
              <span>Brand</span>
              <span>Pack</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Total</span>
            </div>

            {filteredProducts.map((product) => {
              const cartItem = getCartItem(product._id);
              const qty = cartItem?.quantity || 0;

              return (
                <div className="quickbuy-row" key={product._id}>
                  <div className="quickbuy-product">
                    <img src={product.imageUrl || defaultImage} alt={product.name} />
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.category?.name || "No Category"}</p>
                    </div>
                  </div>

                  <span>{product.brand || "No Brand"}</span>

                  <span>
                    {product.packQuantity || 1} {product.unit || "Piece"} /{" "}
                    {product.packType || "Single"}
                  </span>

                  <strong>₹{product.price}</strong>

                  <div className="quickbuy-qty">
                    <button onClick={() => qtyChange(product, "minus")}>
                      <FiMinus />
                    </button>
                    <b>{qty}</b>
                    <button onClick={() => qtyChange(product, "plus")}>
                      <FiPlus />
                    </button>
                  </div>

                  <strong>{qty > 0 ? `₹${qty * product.price}` : "-"}</strong>
                </div>
              );
            })}
          </div>

          <aside className="quickbuy-summary">
            <h2>Cart Summary</h2>

            <div>
              <span>Total Items</span>
              <strong>{summary.totalItems}</strong>
            </div>

            <div>
              <span>Subtotal</span>
              <strong>₹{summary.subtotal}</strong>
            </div>

            <div>
              <span>Delivery</span>
              <strong>{summary.delivery === 0 ? "FREE" : `₹${summary.delivery}`}</strong>
            </div>

            <hr />

            <div className="quickbuy-total">
              <span>Grand Total</span>
              <strong>₹{summary.grandTotal}</strong>
            </div>

            <button onClick={() => navigate("/checkout")}>
              Proceed To Checkout
            </button>
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default QuickBuy;