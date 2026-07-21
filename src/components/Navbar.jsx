import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiGrid,
  FiHeart,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiMapPin,
  FiMoon,
  FiPackage,
  FiSearch,
  FiShoppingCart,
  FiSun,
  FiTag,
  FiZap,
} from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import toast from "react-hot-toast";

import logoImg from "../assets/logo-go.png";

import { getMyCart } from "../api/cart";
import { getWishlist } from "../api/wishlist";
import { useTheme } from "../context/ThemeContext";

import "../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const profileRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const renderAvatar = (className) => {
    if (user?.profileImage && !profileImageError) {
      return (
        <img
          src={user.profileImage}
          alt={user?.name || "Customer"}
          className={className}
          referrerPolicy="no-referrer"
          onError={() => setProfileImageError(true)}
        />
      );
    }

    return (
      <span className={className}>
        {getInitials(user?.name)}
      </span>
    );
  };

  const loadCartCount = async () => {
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const res = await getMyCart();

      const cartItems = Array.isArray(res.data)
        ? res.data
        : [];

      const totalQuantity = cartItems.reduce(
        (total, item) =>
          total + Number(item?.quantity || 0),
        0
      );

      setCartCount(totalQuantity);
    } catch {
      setCartCount(0);
    }
  };

  const loadWishlistCount = async () => {
    if (!token) {
      setWishlistCount(0);
      return;
    }

    try {
      const res = await getWishlist();

      setWishlistCount(
        Array.isArray(res.data) ? res.data.length : 0
      );
    } catch {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
    loadWishlistCount();
  }, [token, location.pathname]);

  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profileImage]);

  useEffect(() => {
    const updateCounts = () => {
      loadCartCount();
      loadWishlistCount();
    };

    window.addEventListener(
      "cartUpdated",
      updateCounts
    );

    window.addEventListener(
      "wishlistUpdated",
      updateCounts
    );

    window.addEventListener(
      "authUpdated",
      updateCounts
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCounts
      );

      window.removeEventListener(
        "wishlistUpdated",
        updateCounts
      );

      window.removeEventListener(
        "authUpdated",
        updateCounts
      );
    };
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(
      new Event("authUpdated")
    );

    setProfileOpen(false);

    toast.success("Logged out successfully");

    navigate("/");
  };

  const handleChatbotOpen = () => {
    window.dispatchEvent(
      new Event("openJapanPattasuChatbot")
    );
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-main-row">
          <button
            type="button"
            className="nav-brand"
            onClick={() => navigate("/")}
            aria-label="Go to home"
          >
            <img
              src={logoImg}
              alt="Japan Pattasu"
              className="navbar-logo-img"
            />

            <div className="nav-brand-text">
              <h2>Japan Pattasu</h2>
              <p>Premium Fireworks</p>
            </div>
          </button>

          <ul className="nav-links">
            <li>
              <Link
                to="/categories"
                className={
                  isActive("/categories")
                    ? "active-link"
                    : ""
                }
              >
                Categories
              </Link>
            </li>

            <li>
              <Link
                to="/products"
                className={
                  isActive("/products")
                    ? "active-link"
                    : ""
                }
              >
                Products
              </Link>
            </li>

            <li className="desktop-chatbot-item">
              <button
                type="button"
                className="desktop-chatbot-btn"
                onClick={handleChatbotOpen}
                aria-label="Open Japan Pattasu assistant"
                title="Japan Pattasu Assistant"
              >
                <RiRobot2Line />

                <span className="desktop-chatbot-dot" />
              </button>
            </li>

            <li>
              <Link
                to="/brands"
                className={
                  isActive("/brands")
                    ? "active-link"
                    : ""
                }
              >
                Brands
              </Link>
            </li>

            <li>
              <Link
                to="/quick-buy"
                className={
                  isActive("/quick-buy")
                    ? "active-link"
                    : ""
                }
              >
                Quick Buy
              </Link>
            </li>
          </ul>

          <div className="nav-actions">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Change theme"
              title="Change Theme"
            >
              {theme === "dark" ? (
                <FiSun />
              ) : (
                <FiMoon />
              )}
            </button>

            <Link
              className="nav-icon-btn search-nav-btn"
              to="/products"
              aria-label="Search products"
              title="Search Products"
            >
              <FiSearch />
            </Link>

            <Link
              className="nav-icon-btn wishlist-nav-btn"
              to="/wishlist"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <FiHeart />

              {wishlistCount > 0 && (
                <span className="wishlist-count">
                  {wishlistCount > 99
                    ? "99+"
                    : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              className="cart-btn desktop-cart-btn"
              to="/cart"
            >
              <FiShoppingCart />

              <span className="cart-btn-text">
                Cart
              </span>

              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            {!token ? (
              <Link
                className="login-btn"
                to="/login"
                aria-label="Login"
              >
                <FiLogIn />
                <span>Login</span>
              </Link>
            ) : (
              <div
                className="profile-menu"
                ref={profileRef}
              >
                <button
                  type="button"
                  className="profile-btn"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  onClick={() =>
                    setProfileOpen(
                      (current) => !current
                    )
                  }
                >
                  {renderAvatar("avatar-circle")}

                  <FiChevronDown className="profile-arrow" />
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-head">
                      {renderAvatar(
                        "profile-big-avatar"
                      )}

                      <div className="profile-user-details">
                        <h4>
                          {user?.name || "Customer"}
                        </h4>

                        <p>
                          {user?.email ||
                            "customer@japanpattasu.com"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/orders")
                      }
                    >
                      <FiPackage />
                      My Orders
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/checkout")
                      }
                    >
                      <FiMapPin />
                      Address
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/quick-buy")
                      }
                    >
                      <FiZap />
                      Quick Buy
                    </button>

                    <button
                      type="button"
                      className="logout-item"
                      onClick={handleLogout}
                    >
                      <FiLogOut />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile navigation"
      >
        <Link
          to="/"
          className={
            isActive("/")
              ? "mobile-nav-active"
              : ""
          }
        >
          <FiHome />
          <span>Home</span>
        </Link>

        <Link
          to="/categories"
          className={
            isActive("/categories")
              ? "mobile-nav-active"
              : ""
          }
        >
          <FiGrid />
          <span>Category</span>
        </Link>

        <Link
          to="/products"
          className={
            isActive("/products")
              ? "mobile-nav-active"
              : ""
          }
        >
          <FiPackage />
          <span>Products</span>
        </Link>

        <button
          type="button"
          className="mobile-chatbot-btn"
          onClick={handleChatbotOpen}
          aria-label="Open Japan Pattasu assistant"
        >
          <span className="mobile-chatbot-circle">
            <RiRobot2Line />
            <span className="mobile-chatbot-dot" />
          </span>

          <span className="mobile-chatbot-label">
            Assistant
          </span>
        </button>

        <Link
          to="/brands"
          className={
            isActive("/brands")
              ? "mobile-nav-active"
              : ""
          }
        >
          <FiTag />
          <span>Brands</span>
        </Link>

        <Link
          to="/quick-buy"
          className={
            isActive("/quick-buy")
              ? "mobile-nav-active"
              : ""
          }
        >
          <FiZap />
          <span>Quick Buy</span>
        </Link>

        <Link
          to="/cart"
          className={`mobile-cart-link ${
            isActive("/cart")
              ? "mobile-nav-active"
              : ""
          }`}
        >
          <span className="mobile-nav-icon-wrap">
            <FiShoppingCart />

            {cartCount > 0 && (
              <span className="mobile-cart-count">
                {cartCount > 99
                  ? "99+"
                  : cartCount}
              </span>
            )}
          </span>

          <span>Cart</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;