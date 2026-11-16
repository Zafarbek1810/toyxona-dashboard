import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SellerDashboardSidebar from "../components/SellerDashboardSidebar";
import SellerHeader from "../components/seller/SellerHeader";
import SpecialistOverviewSection from "../components/specialist/SpecialistOverviewSection";
import SpecialistProfileSection from "../components/specialist/SpecialistProfileSection";
import SpecialistReviewsSection from "../components/specialist/SpecialistReviewsSection";
import SpecialistSettingsSection from "../components/specialist/SpecialistSettingsSection";

export default function SpecialistDashboard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F0F2F8" }}>
      <SellerDashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} mode="specialist" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SellerHeader />
        <main className="flex-1 overflow-y-auto p-5">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SpecialistOverviewSection />} />
            <Route path="profile" element={<SpecialistProfileSection />} />
            <Route path="reviews" element={<SpecialistReviewsSection />} />
            <Route path="settings" element={<SpecialistSettingsSection />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
