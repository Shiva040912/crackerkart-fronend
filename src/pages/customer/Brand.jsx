import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiRefreshCw,
  FiSearch,
  FiTag,
} from "react-icons/fi";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getBrands } from "../../api/brand";

import "../../styles/brand.css";

const Brands = () => {
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const res = await getBrands();

      const brandList = Array.isArray(res.data)
        ? res.data.filter(Boolean)
        : [];

      setBrands(brandList);
    } catch (error) {
      console.error("Failed to load brands", error);
      setHasError(true);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return brands;
    }

    return brands.filter((brand) =>
      String(brand).toLowerCase().includes(searchValue)
    );
  }, [brands, search]);

  const scrollingBrands = useMemo(() => {
    if (brands.length === 0) {
      return [];
    }

    return [...brands, ...brands];
  }, [brands]);

  const handleExploreBrand = (brand) => {
    navigate(
      `/products?brand=${encodeURIComponent(brand)}`
    );
  };

  return (
    <>
      <Navbar />

      <main className="brands-page">
        <section className="brands-hero">
          <div className="brands-hero-content">
            <p className="brands-eyebrow">
              Trusted Fireworks Brands
            </p>

            <h1>
              Discover Brands Made For Every Celebration
            </h1>

            <p className="brands-hero-description">
              Explore trusted fireworks brands and find the
              right collection for your celebration.
            </p>

            <div className="brands-search-wrap">
              <FiSearch />

              <input
                type="text"
                value={search}
                placeholder="Search your favourite brand"
                aria-label="Search brands"
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>
        </section>

        {!isLoading &&
          !hasError &&
          brands.length > 0 && (
            <section className="featured-brands-section">
              <div className="brands-section-heading">
                <div>
                  <p>Featured Brands</p>
                  <h2>Popular names in motion</h2>
                </div>

                <span>
                  Hover to pause or swipe on mobile
                </span>
              </div>

              <div className="brands-marquee">
                <div className="brands-marquee-track">
                  {scrollingBrands.map((brand, index) => (
                    <button
                      type="button"
                      className="marquee-brand"
                      key={`${brand}-${index}`}
                      onClick={() =>
                        handleExploreBrand(brand)
                      }
                    >
                      <span className="marquee-brand-icon">
                        {String(brand)
                          .substring(0, 2)
                          .toUpperCase()}
                      </span>

                      <span className="marquee-brand-name">
                        {brand}
                      </span>

                      <FiArrowRight />
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

        <section className="all-brands-section">
          <div className="brands-section-heading brands-grid-heading">
            <div>
              <p>Explore Collection</p>
              <h2>Shop all brands</h2>
            </div>

            {!isLoading && !hasError && (
              <span>
                {filteredBrands.length}{" "}
                {filteredBrands.length === 1
                  ? "brand"
                  : "brands"}{" "}
                available
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="brands-loading-grid">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    className="brand-skeleton"
                    key={index}
                  >
                    <div className="skeleton-brand-icon" />
                    <div className="skeleton-brand-title" />
                    <div className="skeleton-brand-text" />
                    <div className="skeleton-brand-button" />
                  </div>
                )
              )}
            </div>
          ) : hasError ? (
            <div className="brands-status-card">
              <FiRefreshCw />

              <h2>Unable to load brands</h2>

              <p>
                Something went wrong while loading brands.
                Please try again.
              </p>

              <button
                type="button"
                onClick={loadBrands}
              >
                <FiRefreshCw />
                Try Again
              </button>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="brands-status-card">
              <FiTag />

              <h2>
                {brands.length === 0
                  ? "No brands found"
                  : "No matching brands"}
              </h2>

              <p>
                {brands.length === 0
                  ? "Add products with brand names from the admin panel."
                  : "Try searching with a different brand name."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="brands-grid">
              {filteredBrands.map((brand, index) => (
                <article
                  className="brand-card"
                  key={brand}
                  style={{
                    "--brand-card-index": index,
                  }}
                >
                  <div className="brand-card-top">
                    <div className="brand-icon">
                      {String(brand)
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>

                    <span className="brand-card-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="brand-card-content">
                    <h3>{brand}</h3>

                    <p>
                      Explore premium fireworks selected for
                      joyful celebrations.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleExploreBrand(brand)
                    }
                  >
                    Explore Collection
                    <FiArrowRight />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Brands;