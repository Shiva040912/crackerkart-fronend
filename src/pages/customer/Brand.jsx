import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiTag } from "react-icons/fi";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getBrands } from "../../api/brand";

import "../../styles/brand.css";

const Brands = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);

  const loadBrands = async () => {
    try {
      const res = await getBrands();
      setBrands(res.data);
    } catch (error) {
      console.log("Failed to load brands", error);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  return (
    <>
      <Navbar />

      <main className="brands-page">
        <section className="brands-header">
          <p>Our Brands</p>
          <h1>Shop By Fireworks Brand</h1>
          <span>Choose your favourite brand and explore its collections.</span>
        </section>

        <section className="brands-grid">
          {brands.length === 0 ? (
            <div className="empty-brands">
              <FiTag />
              <h2>No brands found</h2>
              <p>Add products with brand names from admin panel.</p>
            </div>
          ) : (
            brands.map((brand) => (
              <div className="brand-card" key={brand}>
                <div className="brand-icon">
                  {brand.substring(0, 2).toUpperCase()}
                </div>

                <h3>{brand}</h3>
                <p>Premium fireworks collection</p>

                <button onClick={() => navigate(`/products?brand=${brand}`)}>
                  Explore
                  <FiArrowRight />
                </button>
              </div>
            ))
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Brands;