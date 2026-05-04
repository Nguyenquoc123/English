import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3 className="footer-brand-name">🎓 EnglishLearn</h3>
          <p className="footer-brand-desc">
            Nền tảng học tiếng Anh trực tuyến
            <br />
            hiệu quả, dễ tiếp cận cho mọi người.
          </p>
        </div>

        <div className="footer-group">
          <h4 className="footer-group-title">Khoá học</h4>
          <Link to="/courses" className="footer-link">
            Tất cả khoá học
          </Link>
          <Link to="/courses?levelId=1" className="footer-link">
            Sơ cấp
          </Link>
          <Link to="/courses?levelId=2" className="footer-link">
            Trung cấp
          </Link>
          <Link to="/courses?levelId=3" className="footer-link">
            Cao cấp
          </Link>
        </div>

        <div className="footer-group">
          <h4 className="footer-group-title">Hỗ trợ</h4>
          <Link to="/about" className="footer-link">
            Về chúng tôi
          </Link>
          <Link to="/contact" className="footer-link">
            Liên hệ
          </Link>
          <Link to="/faq" className="footer-link">
            Câu hỏi thường gặp
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 EnglishLearn. All rights reserved.</p>
      </div>
    </footer>
  );
}
