import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import { ScrollToTop } from "./components/ScrollToTop.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/terms" element={<LegalPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
