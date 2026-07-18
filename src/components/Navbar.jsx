import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiHeart,
  FiLogOut,
  FiMapPin,
  FiPackage,
  FiSearch,
  FiShoppingCart,
  FiZap,
  FiMoon,
  FiSun,
} from "react-icons/fi";
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
  const user = JSON.parse(localStorage.getItem("user"));

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
      setCartCount(res.data.length);
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
      setWishlistCount(res.data.length);
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

    window.addEventListener("cartUpdated", updateCounts);
    window.addEventListener("wishlistUpdated", updateCounts);
    window.addEventListener("authUpdated", updateCounts);

    return () => {
      window.removeEventListener("cartUpdated", updateCounts);
      window.removeEventListener("wishlistUpdated", updateCounts);
      window.removeEventListener("authUpdated", updateCounts);
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

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authUpdated"));

    setProfileOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div
        className="nav-brand"
        onClick={() => navigate("/")}
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
      </div>

      <ul className="nav-links">
        <li>
          <Link
            className={
              isActive("/products") ? "active-link" : ""
            }
            to="/products"
          >
            Products
          </Link>
        </li>

        <li>
          <Link
            className={
              isActive("/categories") ? "active-link" : ""
            }
            to="/categories"
          >
            Categories
          </Link>
        </li>

        <li>
          <Link
            className={
              isActive("/brands") ? "active-link" : ""
            }
            to="/brands"
          >
            Brands
          </Link>
        </li>

        <li>
          <Link
            className={
              isActive("/quick-buy") ? "active-link" : ""
            }
            to="/quick-buy"
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
          title="Change Theme"
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>

        <Link
          className="nav-icon-btn"
          to="/products"
          title="Search Products"
        >
          <FiSearch />
        </Link>

        <Link
          className="nav-icon-btn wishlist-nav-btn"
          to="/wishlist"
          title="Wishlist"
        >
          <FiHeart />

          {wishlistCount > 0 && (
            <span className="wishlist-count">
              {wishlistCount}
            </span>
          )}
        </Link>

        <Link className="cart-btn" to="/cart">
          <FiShoppingCart />
          Cart

          {cartCount > 0 && (
            <span className="cart-count">
              {cartCount}
            </span>
          )}
        </Link>

        {!token ? (
          <Link className="login-btn" to="/login">
            Login
          </Link>
        ) : (
          <div className="profile-menu" ref={profileRef}>
            <button
              type="button"
              className="profile-btn"
              onClick={() =>
                setProfileOpen((current) => !current)
              }
            >
              {renderAvatar("avatar-circle")}
              <FiChevronDown />
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-head">
                  {renderAvatar("profile-big-avatar")}

                  <div className="profile-user-details">
                    <h4>{user?.name || "Customer"}</h4>

                    <p>
                      {user?.email ||
                        "customer@japanpattasu.com"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/orders");
                  }}
                >
                  <FiPackage />
                  My Orders
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/checkout");
                  }}
                >
                  <FiMapPin />
                  Address
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/quick-buy");
                  }}
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
    </nav>
  );
};

export default Navbar;