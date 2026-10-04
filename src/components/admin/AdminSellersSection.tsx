import { useEffect, useMemo, useRef, useState } from "react";
import Modal, { FormField, inputClass, selectClass } from "../Modal";
import { adminApi } from "../../lib/api";
import { ApiClientError, mediaUrl } from "../../lib/api/client";
import { normalizePhone } from "../../lib/auth";
import type { Seller } from "../../lib/api/types";
import { formatDateShort, formatPrice } from "../../lib/format";

type SellerForm = {
  firstName: string;
  lastName: string;
  storeName: string;
  location: string;
  phone: string;
  email: string;
  password: string;
  description: string;
  verified: boolean;
};

type SellerErrors = Partial<Record<keyof SellerForm | "logo", string>>;

const initialForm: SellerForm = {
  firstName: "",
  lastName: "",
  storeName: "",
  location: "Toshkent shahri",
  phone: "",
  email: "",
  password: "",
  description: "",
  verified: false,
};

const LOCATIONS = ["Toshkent shahri", "Samarqand", "Buxoro", "Andijon", "Farg'ona", "Namangan"];

const STATUS_LABELS: Record<string, string> = {
  active: "Faol",
  pending: "Kutilayotgan",
  blocked: "Bloklangan",
  suspended: "Bloklangan",
};

type StatusFilter = "all" | "pending" | "active" | "blocked";

function localPhone(phone?: string | null): string {
  return normalizePhone(phone || "").slice(0, 9);
}

function validateSellerForm(form: SellerForm): SellerErrors {
  const errors: SellerErrors = {};
  if (!form.firstName.trim()) errors.firstName = "Ism kiritilishi shart";
  if (!form.lastName.trim()) errors.lastName = "Familiya kiritilishi shart";
  if (!form.storeName.trim()) errors.storeName = "Do'kon nomi kiritilishi shart";
  if (!form.location) errors.location = "Joylashuv tanlanishi shart";
  const phone = localPhone(form.phone);
  if (!phone) errors.phone = "Telefon raqami kiritilishi shart";
  else if (!/^[0-9]{9}$/.test(phone)) errors.phone = "9 raqam kiriting";
  if (!form.email.trim()) errors.email = "Email kiritilishi shart";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "To'g'ri email kiriting";
  if (form.password.trim() && form.password.trim().length < 8) {
    errors.password = "Parol kamida 8 belgidan iborat bo'lishi kerak";
  }
  return errors;
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

export default function AdminSellersSection() {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [viewSeller, setViewSeller] = useState<Seller | null>(null);
  const [deleteSeller, setDeleteSeller] = useState<Seller | null>(null);
  const [form, setForm] = useState<SellerForm>(initialForm);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<SellerErrors>({});
  const [saving, setSaving] = useState(false);
  const logoPreviewRef = useRef(logoPreview);
  logoPreviewRef.current = logoPreview;

  const load = async () => {
    setLoading(true);
    try {
      const query: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") {
        query.status = statusFilter === "blocked" ? "suspended" : statusFilter;
      }
      const list = await adminApi.sellers(query);
      setSellers(list);
    } catch {
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter]);

  useEffect(() => {
    return () => {
      if (logoPreviewRef.current?.startsWith("blob:")) URL.revokeObjectURL(logoPreviewRef.current);
    };
  }, []);

  const clearLogo = (restore?: string | null) => {
    setLogoFile(null);
    setLogoPreview(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return restore ?? null;
    });
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, logo: "Faqat rasm fayli yuklash mumkin" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: "Rasm hajmi 5 MB dan oshmasligi kerak" }));
      return;
    }
    setLogoFile(file);
    setLogoPreview(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setErrors(prev => {
      const next = { ...prev };
      delete next.logo;
      return next;
    });
  };

  const filtered = useMemo(() => sellers, [sellers]);

  const updateField = <K extends keyof SellerForm>(field: K, value: SellerForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const openModal = () => {
    setEditingSeller(null);
    setForm(initialForm);
    setShowPassword(false);
    clearLogo();
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (seller: Seller) => {
    setEditingSeller(seller);
    setForm({
      firstName: seller.firstName || "",
      lastName: seller.lastName || "",
      storeName: seller.name,
      location: seller.location || "Toshkent shahri",
      phone: localPhone(seller.phone),
      email: seller.email || "",
      password: "",
      description: seller.description || "",
      verified: seller.verified,
    });
    setLogoFile(null);
    setLogoPreview(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return seller.logo ? mediaUrl(seller.logo) || seller.logo : null;
    });
    if (logoInputRef.current) logoInputRef.current.value = "";
    setShowPassword(false);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSeller(null);
    setShowPassword(false);
    clearLogo();
    setErrors({});
  };

  const handleSubmit = async () => {
    const validationErrors = validateSellerForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append("firstName", form.firstName.trim());
      body.append("lastName", form.lastName.trim());
      body.append("phone", localPhone(form.phone));
      body.append("email", form.email.trim());
      if (form.password.trim()) body.append("password", form.password.trim());
      body.append("storeName", form.storeName.trim());
      body.append("location", form.location);
      body.append("description", form.description.trim());
      body.append("verified", String(form.verified));
      if (!editingSeller) body.append("status", form.verified ? "active" : "pending");
      if (logoFile) body.append("logo", logoFile);
      if (editingSeller) await adminApi.updateSeller(editingSeller.id, body);
      else await adminApi.createSeller(body);
      closeModal();
      await load();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : editingSeller ? "Sotuvchi saqlanmadi" : "Sotuvchi yaratib bo'lmadi";
      if (message.toLowerCase().includes("telefon")) setErrors({ phone: message });
      else setErrors({ email: message });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteSeller) return;
    await adminApi.deleteSeller(deleteSeller.id);
    setDeleteSeller(null);
    if (viewSeller?.id === deleteSeller.id) setViewSeller(null);
    await load();
  };

  return (
    <>
      <div className="max-w-[1400px]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
              Sotuvchilar
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{sellers.length} ta {"ro'yxatga olingan"}</p>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-white border rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none"
              style={{ borderColor: "#E2E6F0" }}
            >
              <option value="all">Barchasi</option>
              <option value="pending">Kutilayotgan</option>
              <option value="active">Faol</option>
              <option value="blocked">Bloklangan</option>
            </select>
            <button
              type="button"
              onClick={openModal}
              className="bg-[#00A86B] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-[#008F5A]"
            >
              {"+ Sotuvchi qo'shish"}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E2E6F0" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 border-b" style={{ borderColor: "#E2E6F0" }}>
                  {["Sotuvchi", "Joylashuv", "Mahsulotlar", "Buyurtmalar", "Reyting", "Obuna", "Holat", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                      Sotuvchilar topilmadi
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-b hover:bg-blue-50/20 transition-colors ${idx % 2 !== 0 ? "bg-gray-50/20" : ""}`}
                      style={{ borderColor: "#E2E6F0" }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={mediaUrl(s.logo) || ""} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 bg-gray-100" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-xs text-gray-900">{s.name}</p>
                              {s.verified && (
                                <svg className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            {s.email && <p className="text-[10px] text-gray-400 mt-0.5">{s.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{s.location || "—"}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-xs text-gray-800">{s.productCount ?? 0}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{s.ordersCount ?? 0}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-bold text-gray-800">{s.rating || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {s.subscription || s.planId ? (
                          <span
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{
                              background:
                                (s.subscription || s.planId || "").toUpperCase() === "PRO"
                                  ? "#FEF3C7"
                                  : (s.subscription || s.planId || "").toUpperCase() === "BUSINESS"
                                    ? "#EDE9FE"
                                    : "#F3F4F6",
                              color:
                                (s.subscription || s.planId || "").toUpperCase() === "PRO"
                                  ? "#B45309"
                                  : (s.subscription || s.planId || "").toUpperCase() === "BUSINESS"
                                    ? "#6D28D9"
                                    : "#6B7280",
                            }}
                          >
                            {(s.subscription || s.planId || "").toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-gray-400">Tarif tanlanmagan</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            s.status === "active"
                              ? "bg-green-50 text-green-600"
                              : s.status === "blocked" || s.status === "suspended"
                                ? "bg-red-50 text-red-500"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {STATUS_LABELS[s.status || ""] ?? s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewSeller(s)}
                            aria-label={`${s.name} ni ko'rish`}
                            className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            aria-label={`${s.name} ni tahrirlash`}
                            className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteSeller(s)}
                            aria-label={`${s.name} ni o'chirish`}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingSeller ? "Sotuvchini tahrirlash" : "Yangi sotuvchi qo'shish"}
        description={editingSeller ? "Sotuvchi ma'lumotlarini yangilang" : "Sotuvchi ma'lumotlarini kiriting"}
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
              style={{ borderColor: "#E2E6F0" }}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#008F5A] text-white font-semibold text-sm shadow-sm disabled:opacity-60"
            >
              {editingSeller ? "Saqlash" : "Sotuvchi qo'shish"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ism" required error={errors.firstName}>
              <input
                value={form.firstName}
                onChange={e => updateField("firstName", e.target.value)}
                placeholder="Jasur"
                className={inputClass(!!errors.firstName)}
                style={{ borderColor: errors.firstName ? undefined : "#E2E6F0" }}
              />
            </FormField>
            <FormField label="Familiya" required error={errors.lastName}>
              <input
                value={form.lastName}
                onChange={e => updateField("lastName", e.target.value)}
                placeholder="Toshmatov"
                className={inputClass(!!errors.lastName)}
                style={{ borderColor: errors.lastName ? undefined : "#E2E6F0" }}
              />
            </FormField>
          </div>

          <FormField label="Do'kon nomi" required error={errors.storeName}>
            <input
              value={form.storeName}
              onChange={e => updateField("storeName", e.target.value)}
              placeholder="TechPlus Savdo"
              className={inputClass(!!errors.storeName)}
              style={{ borderColor: errors.storeName ? undefined : "#E2E6F0" }}
            />
          </FormField>

          <FormField label="Do'kon logotip rasmi" error={errors.logo}>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoSelect}
            />
            {logoPreview ? (
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={logoPreview}
                    alt="Do'kon logotip rasmi"
                    className="w-20 h-20 rounded-2xl object-cover border"
                    style={{ borderColor: "#E2E6F0" }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      clearLogo(editingSeller?.logo ? mediaUrl(editingSeller.logo) || editingSeller.logo : null)
                    }
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                    aria-label="Rasmni o'chirish"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-sm text-[#00A86B] font-semibold hover:underline"
                >
                  Boshqa rasm tanlash
                </button>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-5 text-center hover:border-[#00A86B] hover:bg-[#E8F8F1]/30 transition-all cursor-pointer"
                style={{ borderColor: errors.logo ? "#f87171" : "#C9D0E0" }}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 text-sm">Do'kon logotip rasmini yuklang</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, SVG — max 5 MB</p>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    logoInputRef.current?.click();
                  }}
                  className="mt-3 text-xs border text-[#00A86B] border-[#00A86B] px-4 py-2 rounded-lg hover:bg-[#E8F8F1] font-medium"
                >
                  Kompyuterdan tanlash
                </button>
              </div>
            )}
          </FormField>

          <FormField label="Joylashuv" required error={errors.location}>
            <select
              value={form.location}
              onChange={e => updateField("location", e.target.value)}
              className={selectClass(!!errors.location)}
              style={{ borderColor: errors.location ? undefined : "#E2E6F0" }}
            >
              {(form.location && !LOCATIONS.includes(form.location) ? [form.location, ...LOCATIONS] : LOCATIONS).map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Telefon" required error={errors.phone}>
              <div className="flex">
                <span
                  className="border border-r-0 rounded-l-xl px-3 flex items-center text-sm text-gray-500 bg-gray-50 shrink-0"
                  style={{ borderColor: errors.phone ? "#f87171" : "#E2E6F0" }}
                >
                  +998
                </span>
                <input
                  value={form.phone}
                  onChange={e => updateField("phone", normalizePhone(e.target.value).slice(0, 9))}
                  placeholder="90 123 45 67"
                  inputMode="tel"
                  className="flex-1 min-w-0 border rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B] focus:ring-2 focus:ring-[#00A86B]/10"
                  style={{ borderColor: errors.phone ? "#f87171" : "#E2E6F0" }}
                />
              </div>
            </FormField>
            <FormField label="Email" required error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={e => updateField("email", e.target.value)}
                placeholder="info@example.uz"
                className={inputClass(!!errors.email)}
                style={{ borderColor: errors.email ? undefined : "#E2E6F0" }}
              />
            </FormField>
          </div>

          <FormField label={editingSeller ? "Yangi parol (ixtiyoriy)" : "Parol (ixtiyoriy)"} error={errors.password}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => updateField("password", e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`${inputClass(!!errors.password)} pr-11`}
                style={{ borderColor: errors.password ? undefined : "#E2E6F0" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700"
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </FormField>

          <FormField label="Tavsif">
            <textarea
              rows={3}
              value={form.description}
              onChange={e => updateField("description", e.target.value)}
              placeholder="Do'kon haqida qisqacha ma'lumot..."
              className={`${inputClass()} resize-none`}
              style={{ borderColor: "#E2E6F0" }}
            />
          </FormField>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.verified}
              onChange={e => updateField("verified", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#00A86B] focus:ring-[#00A86B]"
            />
            <span className="text-sm text-gray-700">Tasdiqlangan sotuvchi sifatida belgilash</span>
          </label>
        </div>
      </Modal>

      <Modal
        open={!!viewSeller}
        onClose={() => setViewSeller(null)}
        title="Sotuvchi ma'lumotlari"
        description={viewSeller ? `#${viewSeller.id}` : undefined}
        maxWidth="max-w-lg"
        footer={
          <button
            type="button"
            onClick={() => setViewSeller(null)}
            className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
            style={{ borderColor: "#E2E6F0" }}
          >
            Yopish
          </button>
        }
      >
        {viewSeller && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img src={mediaUrl(viewSeller.logo) || ""} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-gray-100" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-black text-gray-900">{viewSeller.name}</h3>
                  {viewSeller.verified && (
                    <svg className="w-4 h-4 text-[#F59E0B] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{viewSeller.location}</p>
                <span
                  className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    viewSeller.status === "active"
                      ? "bg-green-50 text-green-600"
                      : viewSeller.status === "blocked" || viewSeller.status === "suspended"
                        ? "bg-red-50 text-red-500"
                        : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {STATUS_LABELS[viewSeller.status || ""] ?? viewSeller.status}
                </span>
              </div>
            </div>

            {viewSeller.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{viewSeller.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Email", value: viewSeller.email || "—" },
                { label: "Telefon", value: viewSeller.phone || "—" },
                { label: "Reyting", value: viewSeller.rating ? `${viewSeller.rating} (${viewSeller.reviewCount ?? 0})` : "—" },
                { label: "Mahsulotlar", value: String(viewSeller.productCount ?? 0) },
                { label: "Obuna", value: viewSeller.subscription || viewSeller.planId || "Tarif tanlanmagan" },
                { label: "Savdo", value: formatPrice(viewSeller.salesTotal ?? viewSeller.sales ?? 0) },
                { label: "Qo'shilgan", value: formatDateShort(viewSeller.joined || viewSeller.createdAt) },
                { label: "Tasdiqlangan", value: viewSeller.verified ? "Ha" : "Yo'q" },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-gray-50 px-3.5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1 break-all">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteSeller}
        onClose={() => setDeleteSeller(null)}
        title="Sotuvchini o'chirish"
        description="Bu amalni bekor qilib bo'lmaydi"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteSeller(null)}
              className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
              style={{ borderColor: "#E2E6F0" }}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmDelete()}
              className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-sm"
            >
              {"O'chirish"}
            </button>
          </>
        }
      >
        {deleteSeller && (
          <div className="flex items-start gap-3">
            <img src={mediaUrl(deleteSeller.logo) || ""} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-100" />
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{deleteSeller.name}</span> sotuvchisini
                {" ro'yxatdan o'chirmoqchimisiz?"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {deleteSeller.productCount ?? 0} ta mahsulot · {deleteSeller.location}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
