import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/DangNhap.jsx"
import Register from "./pages/register/DangKy.jsx"
import XacMinh from "./pages/verifyotp/XacMinh.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Navigate to="/dang-nhap" replace />} />

        
        <Route path="/dang-nhap" element={<Login />} />

        
        <Route path="/dang-ky" element={<Register />} />

        <Route path="/xac-minh" element={<XacMinh />} />

        
        <Route path="/quen-mat-khau" element={<h1>Trang quên mật khẩu</h1>} />

        
        <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
