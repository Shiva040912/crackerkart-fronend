import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiTrash2, FiZap } from "react-icons/fi";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getWishlist, removeFromWishlist } from "../../api/wishlist";
import { addToCart } from "../../api/cart";

import "../../styles/wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);

  const loadWishlist = async () => {
    try {
      const res = await getWishlist();
      setWishlist(res.data);
    } catch (error) {
      console.log("Failed to load wishlist", error);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    loadWishlist();
  };

  const handleAddToCart = async (productId) => {
    await addToCart({ productId, quantity: 1 });
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleBuyNow = async (productId) => {
    await addToCart({ productId, quantity: 1 });
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/cart");
  };

  return (
    <>
      <Navbar />

      <main className="wishlist-page">
        <section className="wishlist-header">
          <p>Saved Products</p>
          <h1>My Wishlist</h1>
          <span>Your favourite products are saved here.</span>
        </section>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <FiHeart />
            <h2>No wishlist products</h2>
            <p>Add products to wishlist from the products page.</p>
            <button onClick={() => navigate("/products")}>Shop Products</button>
          </div>
        ) : (
          <section className="wishlist-grid">
            {wishlist.map((item) => {
              const product = item.product;

              return (
                <div className="wishlist-card" key={item._id}>
                  <img
                    src={
                      product?.imageUrl ||
                      "https://dummyimage.com/300x200/f1f5f9/111827&text=Product"
                    }
                    alt={product?.name}
                  />

                  <div className="wishlist-content">
                    <p>{product?.brand || "No Brand"}</p>
                    <h3>{product?.name}</h3>
                    <span>
                      {product?.packQuantity || 1} {product?.unit || "Piece"} /{" "}
                      {product?.packType || "Single"}
                    </span>
                    <h2>₹{product?.price}</h2>

                    <div className="wishlist-actions">
                      <button onClick={() => handleAddToCart(product._id)}>
                        <FiShoppingCart />
                        Add To Cart
                      </button>

                      {product?.price >= 1000 && (
                        <button
                          className="wishlist-buy-btn"
                          onClick={() => handleBuyNow(product._id)}
                        >
                          <FiZap />
                          Buy Now
                        </button>
                      )}

                      <button
                        className="wishlist-remove-btn"
                        onClick={() => handleRemove(product._id)}
                      >
                        <FiTrash2 />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Wishlist;