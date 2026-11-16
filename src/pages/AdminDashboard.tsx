import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import AdminOverviewSection from "../components/admin/AdminOverviewSection";
import AdminVenuesSection from "../components/admin/AdminVenuesSection";
import AdminSpecialistsSection from "../components/admin/AdminSpecialistsSection";
import AdminBookingsSection from "../components/admin/AdminBookingsSection";
import AdminReviewsSection from "../components/admin/AdminReviewsSection";
import AdminUsersSection from "../components/admin/AdminUsersSection";
import AdminCategoriesSection from "../components/admin/AdminCategoriesSection";
import AdminSettingsSection from "../components/admin/AdminSettingsSection";

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F0F2F8" }}>
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-5">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverviewSection />} />
            <Route path="venues" element={<AdminVenuesSection />} />
            <Route path="specialists" element={<AdminSpecialistsSection />} />
            <Route path="bookings" element={<AdminBookingsSection />} />
            <Route path="reviews" element={<AdminReviewsSection />} />
            <Route path="users" element={<AdminUsersSection />} />
            <Route path="categories" element={<AdminCategoriesSection />} />
            <Route path="settings" element={<AdminSettingsSection />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
