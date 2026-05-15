import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

export default function HeroSection() {
  const [keyword, setKeyword] = useState("");
  const [levelId, setLevelId] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (levelId) params.set("levelId", levelId);
    navigate(`/courses?${params.toString()}`);
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Học tiếng Anh
          <br />
          <span className="hero-highlight">hiệu quả & dễ dàng</span>
        </h1>

        <p className="hero-subtitle">
          Hơn 100+ khoá học từ cơ bản đến nâng cao
          <br />
          cùng đội ngũ giảng viên chuyên nghiệp
        </p>

        <form className="hero-search" onSubmit={handleSearch}>
          <input
            className="hero-input"
            type="text"
            placeholder="Tìm kiếm khoá học..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select
            className="hero-select"
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
          >
            <option value="">Tất cả cấp độ</option>
            <option value="1">Sơ cấp</option>
            <option value="2">Trung cấp</option>
            <option value="3">Cao cấp</option>
          </select>
          <button type="submit" className="hero-search-btn">
            🔍 Tìm kiếm
          </button>
        </form>

        <div className="hero-stats">
          {[
            { num: "500+", label: "Học viên" },
            { num: "100+", label: "Khoá học" },
            { num: "30+", label: "Giảng viên" },
          ].map((s) => (
            <div key={s.label} className="hero-stat-item">
              <span className="hero-stat-num">{s.num}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
