import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiGrid } from "react-icons/fi";
import api from "../api/axios";
import socket from "../service/socket";
import "../styles/categories.css";

const Categories = ({ limit = null, showViewAll = false }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");

      let activeCategories = res.data.filter(
        (category) => category.isActive === true
      );

      if (limit) {
        activeCategories = activeCategories.slice(0, limit);
      }

      setCategories(activeCategories);
    } catch (error) {
      console.log("Failed to load categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();

    socket.on("categoryUpdated", fetchCategories);

    return () => {
      socket.off("categoryUpdated");
    };
  }, []);

  const handleExplore = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <section className="category-section">
      <div className="section-title">
        <p>Collections</p>
        <h2>Shop By Category</h2>
        <span>Choose your favorite fireworks collection</span>
      </div>

      <div className="category-grid">
        {categories.length === 0 ? (
          <p className="empty-category-text">No categories available</p>
        ) : (
          categories.map((item) => (
            <div className="category-card" key={item._id}>
              <div className="category-icon">
                <FiGrid />
              </div>

              <h3>{item.name}</h3>
              <p>{item.description || "Explore festival crackers"}</p>

              <button onClick={() => handleExplore(item._id)}>Explore</button>
            </div>
          ))
        )}
      </div>

      {showViewAll && (
        <div className="category-more-box">
          <button onClick={() => navigate("/categories")}>
            View All Categories
          </button>
        </div>
      )}
    </section>
  );
};

export default Categories;