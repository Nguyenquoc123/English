import AppShell from "../../components/layout/AppShell/AppShell";
import Footer from "../../components/layout/Footer/Footer";
import HeroSection from "./HeroSection/HeroSection";
import FeaturedCourses from "./FeaturedCourses/FeaturedCourses";
import "./HomePage.css";

export default function HomePage() {
  return (
    <AppShell>
      <div className="homepage">
        <main className="homepage-main">
          <HeroSection />
          <FeaturedCourses />
        </main>
        <Footer />
      </div>
    </AppShell>
  );
}
