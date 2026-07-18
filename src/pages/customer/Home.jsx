import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Stats from "../../components/Stats";
import Categories from "../../components/Categories";
import Footer from "../../components/Footer";

import { useEffect } from "react";
import socket from "../../service/socket";
import "../../styles/home.css";

const Home = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <Stats />
      <Categories limit={4} showViewAll={true} />
      <Footer />
    </div>
  );
};

export default Home;