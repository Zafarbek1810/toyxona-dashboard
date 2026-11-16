import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SellerDashboardSidebar from "../components/SellerDashboardSidebar";
import SellerHeader from "../components/seller/SellerHeader";
import SellerOverviewSection from "../components/seller/SellerOverviewSection";
import SellerVenuesSection from "../components/seller/SellerVenuesSection";
import SellerBookingsSection from "../components/seller/SellerBookingsSection";
import SellerReviewsSection from "../components/seller/SellerReviewsSection";
import SellerSettingsSection from "../components/seller/SellerSettingsSection";

export default function SellerDashboard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F0F2F8" }}>
      <SellerDashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SellerHeader />
        <main className="flex-1 overflow-y-auto p-5">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SellerOverviewSection />} />
            <Route path="venues" element={<SellerVenuesSection />} />
            <Route path="bookings" element={<SellerBookingsSection />} />
            <Route path="reviews" element={<SellerReviewsSection />} />
            <Route path="settings" element={<SellerSettingsSection />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
