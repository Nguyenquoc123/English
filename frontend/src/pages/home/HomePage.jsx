import AppShell from "../../components/layout/AppShell/AppShell";
import Footer from "../../components/layout/Footer/Footer";
import HeroSection from "./HeroSection/HeroSection";
import FeaturedCourses from "./FeaturedCourses/FeaturedCourses";
import "./HomePage.css";
import Navbar from "../../components/layout/Navbar/Navbar";

export default function HomePage() {
  return (
    <div className="homepage">
      <main className="homepage-main">
        <Navbar />
        <HeroSection />
        <FeaturedCourses />
      </main>
      <Footer />
    </div>
  );
}
