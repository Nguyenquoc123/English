import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/back-button.css'
import './styles/course-breadcrumb.css'
import './components/layout/AppBreadcrumbBar/AppBreadcrumbBar.css'
import './styles/auth-split.css'
import App from './App.jsx'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
