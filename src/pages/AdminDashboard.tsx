import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import AdminOverviewSection from "../components/admin/AdminOverviewSection";
import AdminSellersSection from "../components/admin/AdminSellersSection";
import AdminSubscriptionsSection from "../components/admin/AdminSubscriptionsSection";
import AdminProductsSection from "../components/admin/AdminProductsSection";
import AdminPaymentsSection from "../components/admin/AdminPaymentsSection";
import AdminAnalyticsSection from "../components/admin/AdminAnalyticsSection";
import AdminUsersSection from "../components/admin/AdminUsersSection";
import AdminCategoriesSection from "../components/admin/AdminCategoriesSection";
import AdminOrdersSection from "../components/admin/AdminOrdersSection";
import AdminPromotionsSection from "../components/admin/AdminPromotionsSection";
import AdminSettingsSection from "../components/admin/AdminSettingsSection";
import AdminPlaceholderSection from "../components/admin/AdminPlaceholderSection";

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
            <Route path="sellers" element={<AdminSellersSection />} />
            <Route path="subscriptions" element={<AdminSubscriptionsSection />} />
            <Route path="products" element={<AdminProductsSection />} />
            <Route path="payments" element={<AdminPaymentsSection />} />
            <Route path="analytics" element={<AdminAnalyticsSection />} />
            <Route path="users" element={<AdminUsersSection />} />
            <Route path="categories" element={<AdminCategoriesSection />} />
            <Route path="orders" element={<AdminOrdersSection />} />
            <Route path="promotions" element={<AdminPromotionsSection />} />
            <Route path="settings" element={<AdminSettingsSection />} />
            <Route path="*" element={<AdminPlaceholderSection />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
