import Navbar from "../../components/layout/Navbar/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import HeroSection from "./HeroSection/HeroSection";
import FeaturedCourses from "./FeaturedCourses/FeaturedCourses";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="homepage">
      <Navbar />
      <main className="homepage-main">
        <HeroSection />
        <FeaturedCourses />
      </main>
      <Footer />
    </div>
  );
}
