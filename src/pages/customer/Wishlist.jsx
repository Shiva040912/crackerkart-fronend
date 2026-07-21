import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiHeart,
  FiRefreshCw,
  FiShoppingCart,
  FiTrash2,
  FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
  getWishlist,
  removeFromWishlist,
} from "../../api/wishlist";

import { addToCart } from "../../api/cart";

import defaultImage from "../../assets/image.jpeg";

import "../../styles/wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [removingProductId, setRemovingProductId] =
    useState(null);

  const [cartProductId, setCartProductId] =
    useState(null);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const res = await getWishlist();

      const validWishlist = Array.isArray(res.data)
        ? res.data.filter((item) => item?.product)
        : [];

      setWishlist(validWishlist);
    } catch (error) {
      console.error("Failed to load wishlist:", error);

      setWishlist([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    loadWishlist();
  }, []);

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  const handleRemove = async (productId) => {
    if (!productId || removingProductId) return;

    try {
      setRemovingProductId(productId);

      await removeFromWishlist(productId);

      setWishlist((previousWishlist) =>
        previousWishlist.filter(
          (item) => item.product?._id !== productId
        )
      );

      window.dispatchEvent(
        new Event("wishlistUpdated")
      );

      toast.success("Product removed from wishlist");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to remove product"
      );
    } finally {
      setRemovingProductId(null);
    }
  };

  const handleAddToCart = async (product) => {
    if (!product?._id || cartProductId) return;

    const stock = Number(product.stock || 0);

    if (stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      setCartProductId(product._id);

      await addToCart({
        productId: product._id,
        quantity: 1,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      toast.success("Product added to cart");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to add product to cart"
      );
    } finally {
      setCartProductId(null);
    }
  };

  const handleBuyNow = async (product) => {
    if (!product?._id || cartProductId) return;

    const stock = Number(product.stock || 0);

    if (stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      setCartProductId(product._id);

      await addToCart({
        productId: product._id,
        quantity: 1,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      navigate("/cart");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to continue with this product"
      );
    } finally {
      setCartProductId(null);
    }
  };

  const totalWishlistItems = useMemo(() => {
    return wishlist.length;
  }, [wishlist]);

  return (
    <>
      <Navbar />

      <main className="wishlist-page">
        <div className="wishlist-container">
          <section className="wishlist-header">
            <div className="wishlist-title-area">
              <p>Saved Products</p>

              <h1>My Wishlist</h1>

              <span>
                Your favourite fireworks are saved here.
              </span>
            </div>

            {!isLoading && totalWishlistItems > 0 && (
              <div className="wishlist-page-count">
                <FiHeart />

                <span>
                  {totalWishlistItems}{" "}
                  {totalWishlistItems === 1
                    ? "Product"
                    : "Products"}
                </span>
              </div>
            )}
          </section>

          {isLoading ? (
            <section className="wishlist-loading-grid">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <article
                    className="wishlist-skeleton-card"
                    key={index}
                  >
                    <div className="wishlist-skeleton-image" />

                    <div className="wishlist-skeleton-content">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </article>
                )
              )}
            </section>
          ) : hasError ? (
            <section className="wishlist-status-card">
              <div className="wishlist-status-icon">
                <FiAlertCircle />
              </div>

              <h2>Unable to load wishlist</h2>

              <p>
                Something went wrong while loading your
                saved products.
              </p>

              <button
                type="button"
                onClick={loadWishlist}
              >
                <FiRefreshCw />
                Try Again
              </button>
            </section>
          ) : wishlist.length === 0 ? (
            <section className="wishlist-status-card">
              <div className="wishlist-status-icon">
                <FiHeart />
              </div>

              <h2>Your wishlist is empty</h2>

              <p>
                Save your favourite fireworks and find
                them quickly later.
              </p>

              <button
                type="button"
                onClick={() => navigate("/products")}
              >
                Shop Products
                <FiArrowRight />
              </button>
            </section>
          ) : (
            <section className="wishlist-grid">
              {wishlist.map((item) => {
                const product = item.product;

                const productStock = Number(
                  product.stock || 0
                );

                const isOutOfStock =
                  productStock <= 0;

                const isRemoving =
                  removingProductId === product._id;

                const isCartUpdating =
                  cartProductId === product._id;

                return (
                  <article
                    className="wishlist-card"
                    key={item._id}
                  >
                    <button
                      type="button"
                      className="wishlist-image-button"
                      onClick={() =>
                        navigate(
                          `/products/${product._id}`
                        )
                      }
                      aria-label={`View ${product.name}`}
                    >
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

                      <span
                        className={`wishlist-stock-badge ${
                          isOutOfStock
                            ? "wishlist-out-stock"
                            : ""
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of stock"
                          : `${productStock} in stock`}
                      </span>
                    </button>

                    <div className="wishlist-content">
                      <div className="wishlist-card-top">
                        <span className="wishlist-brand">
                          {product.brand ||
                            "Japan Pattasu"}
                        </span>

                        <button
                          type="button"
                          className="wishlist-heart-remove"
                          onClick={() =>
                            handleRemove(product._id)
                          }
                          disabled={isRemoving}
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <h2
                        onClick={() =>
                          navigate(
                            `/products/${product._id}`
                          )
                        }
                      >
                        {product.name}
                      </h2>

                      <p className="wishlist-category">
                        {product.category?.name ||
                          "No Category"}
                      </p>

                      <p className="wishlist-pack">
                        {product.packQuantity || 1}{" "}
                        {product.unit || "Piece"}
                        {product.packType
                          ? ` • ${product.packType}`
                          : ""}
                      </p>

                      <div className="wishlist-price-row">
                        <strong>
                          ₹
                          {formatPrice(
                            product.price
                          )}
                        </strong>

                        {Number(product.price) >=
                          1000 && (
                          <span>Free Delivery</span>
                        )}
                      </div>

                      <div className="wishlist-actions">
                        <button
                          type="button"
                          className="wishlist-cart-btn"
                          onClick={() =>
                            handleAddToCart(product)
                          }
                          disabled={
                            isOutOfStock ||
                            isCartUpdating
                          }
                        >
                          <FiShoppingCart />

                          {isCartUpdating
                            ? "Adding..."
                            : isOutOfStock
                              ? "Out of Stock"
                              : "Add To Cart"}
                        </button>

                        {Number(product.price) >=
                          1000 && (
                          <button
                            type="button"
                            className="wishlist-buy-btn"
                            onClick={() =>
                              handleBuyNow(product)
                            }
                            disabled={
                              isOutOfStock ||
                              isCartUpdating
                            }
                          >
                            <FiZap />
                            Buy Now
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        className="wishlist-mobile-remove"
                        onClick={() =>
                          handleRemove(product._id)
                        }
                        disabled={isRemoving}
                      >
                        <FiTrash2 />

                        {isRemoving
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Wishlist;