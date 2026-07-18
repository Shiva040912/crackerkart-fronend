import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import ProductSection from "../../components/ProductSection";
import Footer from "../../components/Footer";

const Products = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <Navbar />
      <ProductSection />
      <Footer />
    </>
  );
};

export default Products;