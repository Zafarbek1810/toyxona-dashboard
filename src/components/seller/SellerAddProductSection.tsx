import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { useAppContext } from "../../context/AppContext";
import { catalogApi, sellerApi } from "../../lib/api";
import { mediaUrl } from "../../lib/api/client";
import type { Category } from "../../lib/api/types";
import { paths } from "../../routes/paths";

const TABS = ["Asosiy", "Narx & Ombor", "Rasmlar", "Xususiyatlar", "Chop etish"] as const;
const MAX_IMAGES = 10;
const MAX_DESCRIPTION = 2000;

type ProductImage = {
  id: string;
  file?: File;
  preview: string;
};

type FormDataState = {
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  description: string;
  price: string;
  oldPrice: string;
  stock: string;
  status: string;
  location: string;
  sku: string;
};

type FormErrors = Partial<Record<keyof FormDataState | "images", string>>;

type SpecRow = {
  id: string;
  name: string;
  value: string;
};

function createSpecRow(name = "", value = ""): SpecRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    value,
  };
}

function specsFromProduct(specs?: Record<string, string> | null): SpecRow[] {
  const rows = Object.entries(specs || {})
    .filter(([name]) => name.trim())
    .map(([name, value]) => createSpecRow(name, String(value ?? "")));
  return rows.length > 0 ? rows : [createSpecRow()];
}

function specsToRecord(rows: SpecRow[]): Record<string, string> {
  const record: Record<string, string> = {};
  for (const row of rows) {
    const name = row.name.trim();
    const value = row.value.trim();
    if (name && value) record[name] = value;
  }
  return record;
}

const initialForm: FormDataState = {
  name: "",
  category: "",
  subcategory: "",
  brand: "",
  description: "",
  price: "",
  oldPrice: "",
  stock: "",
  status: "Faol",
  location: "Toshkent shahri",
  sku: "",
};

const STATUS_TO_API: Record<string, string> = {
  Faol: "active",
  "Faol emas": "inactive",
  Arxiv: "archived",
  Qoralama: "draft",
};

const API_TO_STATUS: Record<string, string> = {
  active: "Faol",
  inactive: "Faol emas",
  archived: "Arxiv",
  draft: "Qoralama",
};

function parseNumericInput(value: string): string {
  return value.replace(/\D/g, "");
}

function formatNumericInput(value: string): string {
  const digits = parseNumericInput(value);
  if (!digits) return "";
  return new Intl.NumberFormat("uz-UZ").format(Number(digits));
}

function categorySubcategories(categories: Category[], categoryName: string) {
  return categories.find((c) => c.name === categoryName)?.subcategories || [];
}

function validateTab(
  tab: number,
  form: FormDataState,
  images: ProductImage[],
  isEdit: boolean,
  categories: Category[],
): FormErrors {
  const errors: FormErrors = {};

  if (tab === 0) {
    if (!form.name.trim()) errors.name = "Mahsulot nomi kiritilishi shart";
    if (!form.category) errors.category = "Kategoriya tanlanishi shart";
    else {
      const subs = categorySubcategories(categories, form.category);
      if (subs.length > 0 && !subs.some((sub) => sub.name === form.subcategory)) {
        errors.subcategory = "Subkategoriya tanlanishi shart";
      }
    }
    if (!form.description.trim()) errors.description = "Tavsif kiritilishi shart";
    else if (form.description.length > MAX_DESCRIPTION) errors.description = `Tavsif ${MAX_DESCRIPTION} belgidan oshmasligi kerak`;
  }

  if (tab === 1) {
    const price = Number(form.price);
    const stock = Number(form.stock.replace(/\s/g, ""));
    if (!form.price || Number.isNaN(price) || price <= 0) errors.price = "To'g'ri narx kiriting";
    if (!form.stock.trim() || Number.isNaN(stock) || stock < 0) errors.stock = "Ombordagi soni kiritilishi shart";
  }

  if (tab === 2) {
    if (images.length === 0 && !isEdit) errors.images = "Kamida bitta rasm yuklang";
  }

  return errors;
}

export default function SellerAddProductSection() {
  const navigate = useAppNavigate();
  const { productId } = useParams();
  const editId = productId ? Number(productId) : null;
  const isEdit = Number.isFinite(editId) && (editId as number) > 0;
  const { showToast } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [maxAccessibleTab, setMaxAccessibleTab] = useState(isEdit ? TABS.length - 1 : 0);
  const [form, setForm] = useState<FormDataState>(initialForm);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>(() => [createSpecRow()]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [savedAsDraft, setSavedAsDraft] = useState(false);

  useEffect(() => {
    catalogApi.categories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isEdit || !editId) return;
    let cancelled = false;
    (async () => {
      setLoadingProduct(true);
      try {
        const product = await sellerApi.getProduct(editId);
        if (cancelled) return;
        setForm({
          name: product.name || "",
          category: product.category || "",
          subcategory: product.subCategory || "",
          brand: product.brand || "",
          description: product.description || "",
          price: String(product.price || ""),
          oldPrice: product.oldPrice ? String(product.oldPrice) : "",
          stock: String(product.stock ?? ""),
          status: API_TO_STATUS[product.status || ""] || "Faol",
          location: product.location || "Toshkent shahri",
          sku: product.sku || "",
        });
        const existing = (product.images?.length ? product.images : product.image ? [product.image] : []).map(
          (url, i) => ({
            id: `existing-${i}-${url}`,
            preview: mediaUrl(url) || url,
          }),
        );
        setImages(existing);
        setSpecs(specsFromProduct(product.specs));
        setSavedAsDraft(product.status === "draft");
        setMaxAccessibleTab(TABS.length - 1);
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : "Mahsulot topilmadi", "error");
          navigate(paths.seller.products);
        }
      } finally {
        if (!cancelled) setLoadingProduct(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only re-fetch when the product id changes — navigate/showToast are stable helpers.
  }, [editId, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field: keyof FormDataState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updatePriceField = (field: "price" | "oldPrice", value: string) => {
    updateField(field, parseNumericInput(value));
  };

  const updateSpec = (id: string, field: "name" | "value", value: string) => {
    setSpecs((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addSpec = () => {
    setSpecs((prev) => [...prev, createSpecRow()]);
  };

  const removeSpec = (id: string) => {
    setSpecs((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length > 0 ? next : [createSpecRow()];
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);

    const newImages: ProductImage[] = toAdd.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
    setErrors(prev => {
      const next = { ...prev };
      delete next.images;
      return next;
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target?.file) URL.revokeObjectURL(target.preview);
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const imagesRef = useRef(images);
  imagesRef.current = images;

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(img => {
        if (img.file) URL.revokeObjectURL(img.preview);
      });
    };
  }, []);

  const goToTab = (tab: number) => {
    if (tab <= maxAccessibleTab) {
      setActiveTab(tab);
      setErrors({});
    }
  };

  const selectCategory = (name: string) => {
    setForm((prev) => ({ ...prev, category: name, subcategory: "" }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.category;
      delete next.subcategory;
      return next;
    });
  };

  const handleNext = () => {
    const tabErrors = validateTab(activeTab, form, images, isEdit, categories);
    if (Object.keys(tabErrors).length > 0) {
      setErrors(tabErrors);
      return;
    }

    const nextTab = activeTab + 1;
    if (nextTab < TABS.length) {
      setMaxAccessibleTab(prev => Math.max(prev, nextTab));
      setActiveTab(nextTab);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
      setErrors({});
    }
  };

  const publishProduct = async (asDraft: boolean, forceActive = false) => {
    for (let t = 0; t < TABS.length - 1; t++) {
      const tabErrors = validateTab(t, form, images, isEdit, categories);
      if (Object.keys(tabErrors).length > 0) {
        setActiveTab(t);
        setErrors(tabErrors);
        return;
      }
    }

    const category = categories.find((c) => c.name === form.category);
    if (!category) {
      setErrors({ category: "Kategoriya tanlanishi shart" });
      setActiveTab(0);
      return;
    }
    const subs = category.subcategories || [];
    const subcategory = subs.find((sub) => sub.name === form.subcategory);
    if (subs.length > 0 && !subcategory) {
      setErrors({ subcategory: "Subkategoriya tanlanishi shart" });
      setActiveTab(0);
      return;
    }

    setSaving(true);
    try {
      const fd = new window.FormData();
      fd.append("name", form.name.trim());
      fd.append("categoryId", String(category.id));
      fd.append("subCategoryId", subcategory ? String(subcategory.id) : "");
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      if (form.oldPrice) fd.append("oldPrice", form.oldPrice);
      fd.append("stock", form.stock.replace(/\s/g, "") || "0");
      if (form.brand) fd.append("brand", form.brand);
      if (form.sku) fd.append("sku", form.sku);
      if (form.location) fd.append("location", form.location);
      fd.append("specs", JSON.stringify(specsToRecord(specs)));

      const statusFromForm = STATUS_TO_API[form.status];
      fd.append("status", asDraft ? "draft" : forceActive ? "active" : statusFromForm || "active");

      const newFiles = images.filter((img) => img.file);
      for (const img of newFiles) {
        if (img.file) fd.append("images", img.file);
      }

      if (isEdit && editId) {
        await sellerApi.updateProduct(editId, fd);
        showToast(asDraft ? "Qoralama yangilandi" : forceActive ? "Mahsulot aktivlashtirildi" : "Mahsulot yangilandi");
      } else {
        await sellerApi.createProduct(fd);
        showToast(asDraft ? "Qoralama saqlandi" : forceActive ? "Mahsulot aktivlashtirildi" : "Mahsulot joylandi");
      }
      navigate(paths.seller.products);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Saqlashda xatolik", "error");
    } finally {
      setSaving(false);
    }
  };

  const isLastTab = activeTab === TABS.length - 1;
  const selectedSubs = categorySubcategories(categories, form.category);

  if (loadingProduct) {
    return (
      <div className="max-w-4xl py-16 text-center text-sm text-gray-400">
        Mahsulot yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(paths.seller.products)}
          className="w-8 h-8 rounded-xl border flex items-center justify-center text-gray-500 hover:bg-gray-50"
          style={{ borderColor: "var(--border)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
            {isEdit ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
          </h1>
          <p className="text-sm text-gray-400">
            {isEdit ? "Ma'lumotlarni yangilang va saqlang" : "Mahsulot ma'lumotlarini to'ldiring"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 bg-white rounded-2xl border p-1.5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        {TABS.map((label, i) => {
          const isActive = activeTab === i;
          const isAccessible = i <= maxAccessibleTab;
          const isCompleted = i < activeTab;

          return (
            <button
              key={label}
              type="button"
              onClick={() => goToTab(i)}
              disabled={!isAccessible}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#00A86B] text-white shadow-sm"
                  : isAccessible
                    ? "text-gray-600 hover:bg-gray-50"
                    : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isCompleted
                      ? "bg-green-100 text-green-600"
                      : isAccessible
                        ? "bg-gray-100 text-gray-500"
                        : "bg-gray-50 text-gray-300"
                }`}
              >
                {isCompleted ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm mb-4" style={{ borderColor: "var(--border)" }}>
        {activeTab === 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E8F8F1] flex items-center justify-center text-[#00A86B] text-xs font-black">
                1
              </span>
              Asosiy ma'lumotlar
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Mahsulot nomi *
                </label>
                <input
                  value={form.name}
                  onChange={e => updateField("name", e.target.value)}
                  placeholder="Samsung Galaxy S24 Ultra 12/256GB"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B] focus:ring-2 focus:ring-[#00A86B]/10 ${errors.name ? "border-red-400" : ""}`}
                  style={{ borderColor: errors.name ? undefined : "var(--border)" }}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Kategoriya *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => selectCategory(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B] ${errors.category ? "border-red-400" : ""}`}
                    style={{ borderColor: errors.category ? undefined : "var(--border)" }}
                  >
                    <option value="">Tanlang...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>
                {selectedSubs.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Subkategoriya *
                    </label>
                    <select
                      value={form.subcategory}
                      onChange={e => updateField("subcategory", e.target.value)}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B] ${errors.subcategory ? "border-red-400" : ""}`}
                      style={{ borderColor: errors.subcategory ? undefined : "var(--border)" }}
                    >
                      <option value="">Tanlang...</option>
                      {selectedSubs.map(sub => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    {errors.subcategory && <p className="text-xs text-red-500 mt-1">{errors.subcategory}</p>}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Brend
                  </label>
                  <input
                    value={form.brand}
                    onChange={e => updateField("brand", e.target.value)}
                    placeholder="Samsung"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B]"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Tavsif *
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => updateField("description", e.target.value)}
                  placeholder="Mahsulot haqida batafsil ma'lumot..."
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B] resize-none ${errors.description ? "border-red-400" : ""}`}
                  style={{ borderColor: errors.description ? undefined : "var(--border)" }}
                />
                <p className={`text-xs mt-1 ${form.description.length > MAX_DESCRIPTION ? "text-red-500" : "text-gray-400"}`}>
                  {form.description.length} / {MAX_DESCRIPTION} belgi
                </p>
                {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E8F8F1] flex items-center justify-center text-[#00A86B] text-xs font-black">
                2
              </span>
              Narx va ombor
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Narxi (so'm) *
                </label>
                <input
                  value={formatNumericInput(form.price)}
                  onChange={e => updatePriceField("price", e.target.value)}
                  inputMode="numeric"
                  placeholder="12 500 000"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B] ${errors.price ? "border-red-400" : ""}`}
                  style={{ borderColor: errors.price ? undefined : "var(--border)" }}
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Eski narxi
                </label>
                <input
                  value={formatNumericInput(form.oldPrice)}
                  onChange={e => updatePriceField("oldPrice", e.target.value)}
                  inputMode="numeric"
                  placeholder="14 000 000"
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B]"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Ombordagi soni *
                </label>
                <input
                  value={form.stock}
                  onChange={e => updateField("stock", e.target.value)}
                  placeholder="50"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B] ${errors.stock ? "border-red-400" : ""}`}
                  style={{ borderColor: errors.stock ? undefined : "var(--border)" }}
                />
                {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E8F8F1] flex items-center justify-center text-[#00A86B] text-xs font-black">
                3
              </span>
              Rasmlar
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />

            {images.length < MAX_IMAGES && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-8 text-center hover:border-[#00A86B] hover:bg-[#E8F8F1]/30 transition-all cursor-pointer"
                style={{ borderColor: errors.images ? "#f87171" : "#C9D0E0" }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 text-sm">Rasmlarni bu yerga tashlang</p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WEBP — max 10 MB, {MAX_IMAGES} tagacha
                  {isEdit ? ". Yangi rasm yuklansa, eski rasmlar almashtiriladi." : ""}
                </p>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-3 text-xs border text-[#00A86B] border-[#00A86B] px-4 py-2 rounded-lg hover:bg-[#E8F8F1] font-medium"
                >
                  Kompyuterdan tanlash
                </button>
              </div>
            )}

            {errors.images && <p className="text-xs text-red-500 mt-2">{errors.images}</p>}

            {images.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Yuklangan rasmlar ({images.length}/{MAX_IMAGES})
                  </p>
                  {images.length >= MAX_IMAGES && (
                    <p className="text-xs text-amber-600 font-medium">Maksimal rasm soniga yetildi</p>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border aspect-square" style={{ borderColor: "var(--border)" }}>
                      <img src={img.preview} alt={`Rasm ${index + 1}`} className="w-full h-full object-cover" />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-[#00A86B] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Asosiy
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                        aria-label="Rasmni o'chirish"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[10px] font-medium py-1 text-center">
                        {index + 1}-rasm{img.file ? "" : " (mavjud)"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E8F8F1] flex items-center justify-center text-[#00A86B] text-xs font-black">
                4
              </span>
              Xususiyatlar
            </h2>
            <p className="text-sm text-gray-400 mb-4 ml-8">
              Saytdagi mahsulot sahifasida Xususiyatlar tabida chiqadi. Masalan: Rang, Xotira, Kafolat.
            </p>
            <div className="space-y-3">
              {specs.map((row) => (
                <div key={row.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
                  <input
                    value={row.name}
                    onChange={(e) => updateSpec(row.id, "name", e.target.value)}
                    placeholder="Nomi, masalan Rang"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B]"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <input
                    value={row.value}
                    onChange={(e) => updateSpec(row.id, "value", e.target.value)}
                    placeholder="Qiymati, masalan Qora"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B]"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(row.id)}
                    className="h-12 px-4 rounded-xl border text-gray-500 text-sm font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                    style={{ borderColor: "var(--border)" }}
                  >
                    O'chirish
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSpec}
              className="mt-4 text-sm font-semibold text-[#00A86B] hover:text-[#008F5A]"
            >
              + Xususiyat qo'shish
            </button>
          </div>
        )}

        {activeTab === 4 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E8F8F1] flex items-center justify-center text-[#00A86B] text-xs font-black">
                5
              </span>
              Chop etish
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Holati
                </label>
                <select
                  value={form.status}
                  onChange={e => updateField("status", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <option>Faol</option>
                  <option>Faol emas</option>
                  <option>Arxiv</option>
                  <option>Qoralama</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Joylashuv
                  </label>
                  <select
                    value={form.location}
                    onChange={e => updateField("location", e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <option>Toshkent shahri</option>
                    <option>Samarqand</option>
                    <option>Buxoro</option>
                    <option>Andijon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    SKU
                  </label>
                  <input
                    value={form.sku}
                    onChange={e => updateField("sku", e.target.value)}
                    placeholder="SKU-00001"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B]"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>

              <div className="mt-2 p-4 rounded-xl bg-gray-50 border" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Xulosa</p>
                <p className="font-bold text-gray-900 text-sm">{form.name || "—"}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {[form.category, form.subcategory].filter(Boolean).join(" / ") || "—"} · {form.price ? `${formatNumericInput(form.price)} so'm` : "—"} · {form.stock ? `${form.stock} dona` : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {images.length} ta rasm · {Object.keys(specsToRecord(specs)).length} ta xususiyat
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {activeTab > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-3 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
            style={{ borderColor: "var(--border)" }}
          >
            ← Orqaga
          </button>
        )}
        <div className="flex-1" />
        {!isLastTab ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-xl bg-[#00A86B] hover:bg-[#008F5A] text-white font-semibold text-sm shadow-md shadow-[#00A86B]/20"
          >
            Keyingi →
          </button>
        ) : (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => void publishProduct(true)}
              className="px-5 py-3 rounded-xl border text-gray-500 font-medium text-sm hover:bg-gray-50 disabled:opacity-60"
              style={{ borderColor: "var(--border)" }}
            >
              Qoralama sifatida saqlash
            </button>
            {savedAsDraft && (
              <button
                type="button"
                disabled={saving}
                onClick={() => void publishProduct(false, true)}
                className="px-6 py-3 rounded-xl bg-[#00A86B] hover:bg-[#008F5A] text-white font-semibold text-sm shadow-md shadow-[#00A86B]/20 disabled:opacity-60"
              >
                {saving ? "Saqlanmoqda..." : "Aktivlashtirish"}
              </button>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => void publishProduct(false)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-60 ${
                savedAsDraft
                  ? "border text-gray-600 hover:bg-gray-50"
                  : "bg-[#00A86B] hover:bg-[#008F5A] text-white shadow-md shadow-[#00A86B]/20"
              }`}
              style={savedAsDraft ? { borderColor: "var(--border)" } : undefined}
            >
              {saving ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Saqlash va chop etish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
