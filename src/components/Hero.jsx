import { useNavigate } from "react-router-dom";

import desktopBackground from "../assets/background.png";
import mobileBackground from "../assets/MM6.png";

import "../styles/hero.css";

const Hero = () => {
  const navigate = useNavigate();

  const dealers = [
    "Sony Fireworks",
    "Standard Fireworks",
    "Ajanta Fireworks",
    "Cock Brand",
    "Kaliswari Fireworks",
    "Shanmuga Fireworks",
    "National Fireworks",
    "Royal Fireworks",
    "Peacock Fireworks",
    "Lion Fireworks",
    "Star Fireworks",
    "Deluxe Fireworks",
    "Meena Fireworks",
    "Anil Fireworks",
    "Classic Fireworks",
  ];

  return (
    <section
      className="hero-section"
      style={{
        "--hero-desktop-image": `url(${desktopBackground})`,
        "--hero-mobile-image": `url(${mobileBackground})`,
      }}
    >
      <div className="hero-content">
        <p className="hero-badge">Festival Sale is Live</p>

        <h1>
          Light Up Your Celebrations With
          <span> Japan Pattasu</span>
        </h1>

        <p className="hero-text">
          Premium crackers, safe fireworks, festival combo packs and
          celebration essentials delivered with trust.
        </p>

        <div className="hero-buttons">
          <button
            className="primary-btn"
            onClick={() => navigate("/products")}
          >
            Shop Now
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/categories")}
          >
            View Categories
          </button>
        </div>
      </div>

      <div className="dealer-ticker-section">
        <p>Our Trusted Dealers</p>

        <div className="dealer-ticker">
          <div className="dealer-track">
            {[...dealers, ...dealers].map((dealer, index) => (
              <span key={index}>{dealer}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;