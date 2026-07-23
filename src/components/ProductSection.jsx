import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiX,
  FiShoppingCart,
  FiZap,
  FiMinus,
  FiPlus,
  FiGrid,
  FiList,
  FiHeart,
  FiFilter,
} from "react-icons/fi";
import api from "../api/axios";
import {
  addToCart,
  getMyCart,
  updateCartItem,
  removeCartItem,
} from "../api/cart";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../api/wishlist";
import defaultImage from "../assets/image.jpeg";
import socket from "../service/socket";
import "../styles/products.css";

const ProductSection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [packFilter, setPackFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 10;

  const fetchProducts = async () => {
    try {
      const categoryFromUrl = searchParams.get("category");
      const brandFromUrl = searchParams.get("brand");
      const quickFromUrl = searchParams.get("quick");

      let url = "/products/active";
      const params = [];

      if (categoryFromUrl) params.push(`category=${categoryFromUrl}`);
      if (brandFromUrl) params.push(`brand=${brandFromUrl}`);
      if (quickFromUrl) params.push(`quick=${quickFromUrl}`);

      if (params.length) url += "?" + params.join("&");

      const res = await api.get(url);
      setProducts(res.data);
    } catch (error) {
      console.log("Failed to load products", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.filter((cat) => cat.isActive === true));
    } catch (error) {
      console.log("Failed to load categories", error);
    }
  };

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      const res = await getMyCart();
      setCartItems(res.data);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      setCartItems([]);
    }
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      const res = await getWishlist();
      setWishlist(res.data);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {
      setWishlist([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCart();
    fetchWishlist();

    socket.on("productUpdated", fetchProducts);

    return () => socket.off("productUpdated");
  }, [searchParams]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const brandFromUrl = searchParams.get("brand");

    setCategoryFilter(categoryFromUrl || "all");
    setBrandFilter(brandFromUrl || "all");
    setCurrentPage(1);
  }, [searchParams]);

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  const getCartItem = (productId) => {
    return cartItems.find((item) => item.product?._id === productId);
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.product?._id === productId);
  };

  const toggleWishlist = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    if (isWishlisted(productId)) {
      await removeFromWishlist(productId);
      setWishlist((prev) =>
        prev.filter((item) => item.product?._id !== productId),
      );
    } else {
      await addToWishlist(productId);
      await fetchWishlist();
    }

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    await addToCart({ productId: product._id, quantity: 1 });
    await fetchCart();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQty = async (cartItem) => {
    await updateCartItem(cartItem._id, {
      quantity: cartItem.quantity + 1,
    });

    setCartItems((prev) =>
      prev.map((item) =>
        item._id === cartItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const decreaseQty = async (cartItem) => {
    if (cartItem.quantity === 1) {
      await removeCartItem(cartItem._id);
      setCartItems((prev) => prev.filter((item) => item._id !== cartItem._id));
    } else {
      await updateCartItem(cartItem._id, {
        quantity: cartItem.quantity - 1,
      });

      setCartItems((prev) =>
        prev.map((item) =>
          item._id === cartItem._id
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        ),
      );
    }

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleBuyNow = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    await addToCart({ productId: product._id, quantity: 1 });
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/cart");
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setBrandFilter("all");
    setPriceFilter("all");
    setStockFilter("all");
    setPackFilter("all");
    setSortBy("latest");
    setCurrentPage(1);
    navigate("/products");
  };

  let filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const productCategoryId = product.category?._id || product.category;

    const matchesCategory =
      categoryFilter === "all" || productCategoryId === categoryFilter;

    const matchesBrand = brandFilter === "all" || product.brand === brandFilter;

    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "under500" && product.price < 500) ||
      (priceFilter === "500to1000" &&
        product.price >= 500 &&
        product.price < 1000) ||
      (priceFilter === "above1000" && product.price >= 1000);

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "instock" && product.stock > 0) ||
      (stockFilter === "outstock" && product.stock === 0);

    const matchesPack = packFilter === "all" || product.packType === packFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesPrice &&
      matchesStock &&
      matchesPack
    );
  });

  if (sortBy === "low") filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === "high") filteredProducts.sort((a, b) => b.price - a.price);
  if (sortBy === "az")
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "za")
    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  const getStockText = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return `Only ${stock} left!`;
    return "In Stock";
  };

  return (
    <section className="product-page">
      <div className="product-hero">
        <p>Japan Pattasu Deluxe Store</p>
        <h1>Explore Firecracker Collections</h1>
        <span>High-visibility, safe, and exciting celebration specials.</span>
      </div>

      <div className="product-filter-panel">
        <div className="product-search-box">
          <FiSearch className="search-icon" />

          <input
            placeholder="Search crackers by name (e.g., Flower Pot, Twinkling Star)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search">
              <FiX />
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="latest">Sort: Latest</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="az">Name: A to Z</option>
          <option value="za">Name: Z to A</option>
        </select>

        <div className="view-toggle">
          <button
            className={viewMode === "grid" ? "active-view" : ""}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <FiGrid />
          </button>

          <button
            className={viewMode === "list" ? "active-view" : ""}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <FiList />
          </button>
        </div>
      </div>

      <div className="mobile-product-toolbar">
        <button
          className="mobile-filter-btn"
          onClick={() => setShowMobileFilters(true)}
        >
          <FiFilter />
          Filters
        </button>

        <p>
          <strong>{filteredProducts.length}</strong> Products Found
        </p>
      </div>

      <div className="product-layout">
        <aside
          className={`filter-sidebar ${
            showMobileFilters ? "mobile-filter-open" : ""
          }`}
        >
          <div className="filter-head">
            <div className="filter-title-row">
              <button
                className="mobile-filter-close"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
              >
                <FiX />
              </button>

              <h3>Filters</h3>
            </div>

            <button className="filter-reset-btn" onClick={resetFilters}>
              Reset All
            </button>
          </div>

          <label>Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option value={cat._id} key={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <label>Brand / Manufacturer</label>
          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option value={brand} key={brand}>
                {brand}
              </option>
            ))}
          </select>

          <label>Price Range</label>
          <select
            value={priceFilter}
            onChange={(e) => {
              setPriceFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Prices</option>
            <option value="under500">Below ₹500</option>
            <option value="500to1000">₹500 - ₹1000</option>
            <option value="above1000">Above ₹1000</option>
          </select>

          <label>Availability</label>
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Stock Status</option>
            <option value="instock">In Stock</option>
            <option value="outstock">Out of Stock</option>
          </select>

          <label>Pack Type</label>
          <select
            value={packFilter}
            onChange={(e) => {
              setPackFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Packs</option>
            <option value="Single">Single</option>
            <option value="Box">Box</option>
            <option value="Bundle">Bundle</option>
          </select>

          <button
            className="mobile-apply-filter-btn"
            onClick={() => setShowMobileFilters(false)}
          >
            Show {filteredProducts.length} Products
          </button>
        </aside>

        {showMobileFilters && (
          <button
            className="mobile-filter-overlay"
            onClick={() => setShowMobileFilters(false)}
            aria-label="Close filters"
          />
        )}

        <div className="products-content">
          <p className="product-result-info">
            Showing <strong>{currentProducts.length}</strong> of{" "}
            <strong>{filteredProducts.length}</strong> available items
          </p>

          <div
            className={
              viewMode === "grid"
                ? "customer-product-grid"
                : "customer-product-grid list-view"
            }
          >
            {currentProducts.length === 0 ? (
              <div className="no-products-box">
                <h3>No crackers found matching your filter</h3>
                <p>Try resetting filters or searching with a different name.</p>
              </div>
            ) : (
              currentProducts.map((product) => {
                const cartItem = getCartItem(product._id);
                const isOutOfStock = product.stock === 0;

                return (
                  <div className="customer-product-card" key={product._id}>
                    <div className="product-image-box">
                      <img
                        src={product.imageUrl || defaultImage}
                        alt={product.name}
                      />

                      <button
                        className={`wishlist-btn ${
                          isWishlisted(product._id) ? "wish-active" : ""
                        }`}
                        onClick={() => toggleWishlist(product._id)}
                        aria-label="Toggle wishlist"
                      >
                        <FiHeart />
                      </button>

                      <span className="stock-chip">
                        {getStockText(product.stock)}
                      </span>

                      {product.discount > 0 && (
                        <span className="discount-chip">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="customer-product-content">
                      <p className="product-category">
                        {product.brand || "Standard Brand"}
                      </p>

                      <h3>{product.name}</h3>

                      <p className="pack-info">
                        Pack: {product.packQuantity || 1}{" "}
                        {product.unit || "Piece"} ({product.packType || "Single"}
                        )
                      </p>

                      <p className="product-price">₹{product.price}</p>

                      <div className="customer-product-actions">
                        {cartItem ? (
                          <div className="qty-action-box">
                            <button
                              onClick={() => decreaseQty(cartItem)}
                              aria-label="Decrease quantity"
                            >
                              <FiMinus />
                            </button>

                            <span>{cartItem.quantity}</span>

                            <button
                              onClick={() => increaseQty(cartItem)}
                              aria-label="Increase quantity"
                            >
                              <FiPlus />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="add-cart-btn"
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(product)}
                          >
                            <FiShoppingCart />
                            {isOutOfStock ? "Sold Out" : "Add To Cart"}
                          </button>
                        )}

                        {product.price >= 1000 && !isOutOfStock && (
                          <button
                            className="buy-now-btn"
                            onClick={() => handleBuyNow(product)}
                          >
                            <FiZap />
                            Quick Buy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                First
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? "active-page" : ""}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;