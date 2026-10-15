import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import App from "./App.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import VerifyCertificate from "./pages/VerifyCertificate.jsx";

// Dashboard pages
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import InternPortalPage from "./pages/InternPortalPage.jsx";

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

        {/* Internship login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminDashboardPage />} />

        {/* Intern portal */}
        <Route path="/portal" element={<InternPortalPage />} />

        {/* Public registration disabled */}
        <Route
          path="/register"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/terms" element={<LegalPage />} />

        {/* Certificate verification remains available */}
        <Route path="/verify" element={<VerifyCertificate />} />

        {/* Unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
