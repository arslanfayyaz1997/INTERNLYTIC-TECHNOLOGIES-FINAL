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
import { ScrollToTop } from "./components/ScrollToTop.jsx";
import VerifyCertificate from "./pages/VerifyCertificate.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import InternPortalPage from "./pages/InternPortalPage.jsx";

import "./styles.css";
import { applyTheme, getTheme } from "./lib/theme.js";
applyTheme(getTheme());

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

    {/* Existing site login and new intern/admin portals */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/admin" element={<AdminDashboardPage />} />
    <Route path="/portal" element={<InternPortalPage />} />
    <Route
      path="/register"
      element={<Navigate to="/login" replace />}
    />

    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/privacy" element={<LegalPage />} />
    <Route path="/terms" element={<LegalPage />} />

    {/* Certificate verification — unchanged */}
    <Route path="/verify" element={<VerifyCertificate />} />

    {/* Unknown URLs return home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>

  </StrictMode>
);
