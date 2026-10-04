import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DocumentTitle from "./components/DocumentTitle";
import ScrollToTop from "./components/ScrollToTop";
import AuthPage from "./pages/AuthPage";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { GuestOnly, RequireRole } from "./routes/guards";
import { dismissBootLoader } from "./lib/bootLoader";

export default function App() {
  useEffect(() => dismissBootLoader(1100), []);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", fontFamily: "var(--font-body)" }}>
      <DocumentTitle />
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <GuestOnly>
              <AuthPage />
            </GuestOnly>
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={<Navigate to="/" replace />} />

        <Route
          path="/seller/*"
          element={
            <RequireRole role="seller">
              <SellerDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/admin/*"
          element={
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
