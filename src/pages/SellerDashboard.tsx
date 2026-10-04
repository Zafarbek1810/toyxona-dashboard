import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SellerDashboardSidebar from "../components/SellerDashboardSidebar";
import SellerHeader from "../components/seller/SellerHeader";
import SellerOverviewSection from "../components/seller/SellerOverviewSection";
import SellerProductsSection from "../components/seller/SellerProductsSection";
import SellerAddProductSection from "../components/seller/SellerAddProductSection";
import SellerOrdersSection from "../components/seller/SellerOrdersSection";
import SellerSubscriptionSection from "../components/seller/SellerSubscriptionSection";
import SellerAnalyticsSection from "../components/seller/SellerAnalyticsSection";
import SellerPaymentsSection from "../components/seller/SellerPaymentsSection";
import SellerMakePaymentSection from "../components/seller/SellerMakePaymentSection";
import SellerReviewsSection from "../components/seller/SellerReviewsSection";
import SellerSettingsSection from "../components/seller/SellerSettingsSection";
import { paths } from "../routes/paths";

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
            <Route path="products" element={<SellerProductsSection />} />
            <Route path="products/new" element={<SellerAddProductSection />} />
            <Route path="products/:productId/edit" element={<SellerAddProductSection />} />
            <Route path="orders" element={<SellerOrdersSection />} />
            <Route path="subscription" element={<SellerSubscriptionSection />} />
            <Route path="subscription/checkout" element={
              <SellerMakePaymentSection
                returnPath={paths.seller.subscription}
                mode="subscribe"
                title="Obunani yangilash"
                description="Obunani uzaytirish uchun to'lov usulini tanlang"
              />
            } />
            <Route path="analytics" element={<SellerAnalyticsSection />} />
            <Route path="payments" element={<SellerPaymentsSection />} />
            <Route path="payments/checkout" element={
              <SellerMakePaymentSection
                returnPath={paths.seller.payments}
                mode="topup"
                title="To'lov qilish"
                description="To'lov usulini tanlang va to'lovni yakunlang"
                paymentLabel="Hisob to'ldirish"
                amount={100000}
              />
            } />
            <Route path="reviews" element={<SellerReviewsSection />} />
            <Route path="settings" element={<SellerSettingsSection />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
