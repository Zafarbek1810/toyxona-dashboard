import { useCallback, useEffect, useRef, useState, Fragment } from "react";
import Modal, { FormField, inputClass, selectClass } from "../Modal";
import { adminApi } from "../../lib/api";
import { mediaUrl } from "../../lib/api/client";
import type { Category, SubCategory as ApiSubCategory } from "../../lib/api/types";

type SubCategory = {
  id: number;
  name: string;
  icon: string;
  active: boolean;
  count: number;
};

type CategoryRow = {
  id: number;
  icon: string;
  name: string;
  color: string;
  bg: string;
  count: number;
  active: boolean;
  subcategories: SubCategory[];
};

function mapCategory(c: Category): CategoryRow {
  return {
    id: c.id,
    icon: c.icon || "📦",
    name: c.name,
    color: c.color || "#00A86B",
    bg: c.bg || "#E8F8F1",
    count: c.count ?? 0,
    active: c.active !== false,
    subcategories: (c.subcategories || []).map((s: ApiSubCategory) => ({
      id: s.id,
      name: s.name,
      icon: s.icon || "📦",
      active: s.active !== false,
      count: s.count ?? 0,
    })),
  };
}

function categoryFormData(
  fields: { name: string; color?: string; bg?: string; active: boolean },
  file: File | null,
  preview: string | null,
) {
  const fd = new FormData();
  fd.append("name", fields.name);
  if (fields.color) fd.append("color", fields.color);
  if (fields.bg) fd.append("bg", fields.bg);
  fd.append("active", String(fields.active));
  if (file) fd.append("icon", file);
  else if (preview && !preview.startsWith("blob:")) fd.append("icon", preview);
  return fd;
}

const COLOR_PRESETS = [
  { color: "#00A86B", bg: "#E8F8F1" },
  { color: "#7C3AED", bg: "#F5F3FF" },
  { color: "#DC2626", bg: "#FEF2F2" },
  { color: "#D97706", bg: "#FFFBEB" },
  { color: "#0284C7", bg: "#EFF6FF" },
  { color: "#DB2777", bg: "#FDF2F8" },
  { color: "#374151", bg: "#F3F4F6" },
];

function isImageSource(value: string): boolean {
  return (
    value.startsWith("http") ||
    value.startsWith("blob:") ||
    value.startsWith("data:") ||
    value.startsWith("/")
  );
}

function CategoryLogo({ icon, bg, size = "md" }: { icon: string; bg: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-16 h-16 rounded-2xl text-2xl" : size === "sm" ? "w-7 h-7 rounded-lg text-sm" : "w-8 h-8 rounded-xl text-lg";

  if (icon && isImageSource(icon)) {
    const src = mediaUrl(icon) || icon;
    return <img src={src} alt="" className={`${sizeClass} object-cover shrink-0`} />;
  }

  return (
    <span className={`${sizeClass} flex items-center justify-center shrink-0`} style={{ background: bg }}>
      {icon || "📦"}
    </span>
  );
}

type CategoryForm = {
  name: string;
  colorIndex: number;
  active: boolean;
};

type CategoryErrors = {
  name?: string;
  icon?: string;
};

type SubCategoryForm = {
  name: string;
  active: boolean;
};

type SubCategoryErrors = {
  name?: string;
  icon?: string;
};

const initialForm: CategoryForm = {
  name: "",
  colorIndex: 0,
  active: true,
};

const initialSubForm: SubCategoryForm = {
  name: "",
  active: true,
};

function findColorIndex(color: string): number {
  const idx = COLOR_PRESETS.findIndex(p => p.color === color);
  return idx >= 0 ? idx : 0;
}

function validateCategoryForm(
  form: CategoryForm,
  iconPreview: string | null,
  existing: CategoryRow[],
  editingId: number | null,
): CategoryErrors {
  const errors: CategoryErrors = {};
  if (!form.name.trim()) errors.name = "Kategoriya nomi kiritilishi shart";
  else if (
    existing.some(
      c => c.id !== editingId && c.name.toLowerCase() === form.name.trim().toLowerCase(),
    )
  ) {
    errors.name = "Bu nomli kategoriya allaqachon mavjud";
  }
  if (!iconPreview) errors.icon = "Kategoriya ikonkasi kerak";
  return errors;
}

function validateSubCategoryForm(
  form: SubCategoryForm,
  iconPreview: string | null,
  existing: SubCategory[],
  editingId: number | null,
): SubCategoryErrors {
  const errors: SubCategoryErrors = {};
  if (!form.name.trim()) errors.name = "Subkategoriya nomi kiritilishi shart";
  else if (
    existing.some(
      s => s.id !== editingId && s.name.toLowerCase() === form.name.trim().toLowerCase(),
    )
  ) {
    errors.name = "Bu nomli subkategoriya allaqachon mavjud";
  }
  if (!iconPreview) errors.icon = "Subkategoriya ikonkasi kerak";
  return errors;
}

export default function AdminCategoriesSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subFileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<CategoryErrors>({});

  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subParent, setSubParent] = useState<CategoryRow | null>(null);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [deleteSub, setDeleteSub] = useState<{ parent: CategoryRow; sub: SubCategory } | null>(null);
  const [subForm, setSubForm] = useState<SubCategoryForm>(initialSubForm);
  const [subIconPreview, setSubIconPreview] = useState<string | null>(null);
  const [subIconFile, setSubIconFile] = useState<File | null>(null);
  const [subErrors, setSubErrors] = useState<SubCategoryErrors>({});

  const iconPreviewRef = useRef(iconPreview);
  iconPreviewRef.current = iconPreview;
  const subIconPreviewRef = useRef(subIconPreview);
  subIconPreviewRef.current = subIconPreview;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminApi.categories();
      const mapped = list.map(mapCategory);
      setCategories(mapped);
      setExpandedIds(prev => {
        if (prev.length) return prev.filter(id => mapped.some(c => c.id === id));
        return mapped.slice(0, 3).map(c => c.id);
      });
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (iconPreviewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(iconPreviewRef.current);
      }
      if (subIconPreviewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(subIconPreviewRef.current);
      }
    };
  }, []);

  const clearIconPreview = useCallback(() => {
    setIconFile(null);
    setIconPreview(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const clearSubIconPreview = useCallback(() => {
    setSubIconFile(null);
    setSubIconPreview(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    if (subFileInputRef.current) subFileInputRef.current.value = "";
  }, []);

  const updateField = <K extends keyof CategoryForm>(field: K, value: CategoryForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      if (field === "name") delete next.name;
      return next;
    });
  };

  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, icon: "Faqat rasm fayli yuklash mumkin" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, icon: "Rasm hajmi 5 MB dan oshmasligi kerak" }));
      return;
    }

    setIconFile(file);
    setIconPreview(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setErrors(prev => {
      const next = { ...prev };
      delete next.icon;
      return next;
    });
  };

  const handleSubIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSubErrors(prev => ({ ...prev, icon: "Faqat rasm fayli yuklash mumkin" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubErrors(prev => ({ ...prev, icon: "Rasm hajmi 5 MB dan oshmasligi kerak" }));
      return;
    }

    setSubIconFile(file);
    setSubIconPreview(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setSubErrors(prev => {
      const next = { ...prev };
      delete next.icon;
      return next;
    });
  };

  const resetCategoryForm = () => {
    setForm(initialForm);
    clearIconPreview();
    setErrors({});
    setEditingCategory(null);
  };

  const openCreateModal = () => {
    resetCategoryForm();
    setIconFile(null);
    setIconPreview("📦");
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryRow) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      colorIndex: findColorIndex(cat.color),
      active: cat.active,
    });
    setIconFile(null);
    setIconPreview(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return cat.icon;
    });
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetCategoryForm();
  };

  const handleSubmitCategory = async () => {
    const validationErrors = validateCategoryForm(
      form,
      iconPreview,
      categories,
      editingCategory?.id ?? null,
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const preset = COLOR_PRESETS[form.colorIndex];
    const body = categoryFormData(
      {
        name: form.name.trim(),
        color: preset.color,
        bg: preset.bg,
        active: form.active,
      },
      iconFile,
      iconPreview,
    );

    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, body);
      } else {
        await adminApi.createCategory(body);
      }
      closeModal();
      await load();
    } catch {
      setErrors({ name: "Saqlashda xatolik" });
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCategory) return;
    await adminApi.deleteCategory(deleteCategory.id);
    setExpandedIds(prev => prev.filter(id => id !== deleteCategory.id));
    setDeleteCategory(null);
    await load();
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const openCreateSubModal = (parent: CategoryRow) => {
    setSubParent(parent);
    setEditingSub(null);
    setSubForm(initialSubForm);
    clearSubIconPreview();
    setSubIconFile(null);
    setSubIconPreview("📦");
    setSubErrors({});
    setSubModalOpen(true);
    if (!expandedIds.includes(parent.id)) {
      setExpandedIds(prev => [...prev, parent.id]);
    }
  };

  const openEditSubModal = (parent: CategoryRow, sub: SubCategory) => {
    setSubParent(parent);
    setEditingSub(sub);
    setSubForm({ name: sub.name, active: sub.active });
    setSubIconFile(null);
    setSubIconPreview(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return sub.icon;
    });
    setSubErrors({});
    if (subFileInputRef.current) subFileInputRef.current.value = "";
    setSubModalOpen(true);
  };

  const closeSubModal = () => {
    setSubModalOpen(false);
    setSubParent(null);
    setEditingSub(null);
    setSubForm(initialSubForm);
    clearSubIconPreview();
    setSubErrors({});
  };

  const handleSubmitSub = async () => {
    if (!subParent) return;
    const validationErrors = validateSubCategoryForm(
      subForm,
      subIconPreview,
      subParent.subcategories,
      editingSub?.id ?? null,
    );
    if (Object.keys(validationErrors).length > 0) {
      setSubErrors(validationErrors);
      return;
    }

    const body = categoryFormData(
      { name: subForm.name.trim(), active: subForm.active },
      subIconFile,
      subIconPreview,
    );

    try {
      if (editingSub) {
        await adminApi.updateSubcategory(subParent.id, editingSub.id, body);
      } else {
        await adminApi.createSubcategory(subParent.id, body);
      }
      closeSubModal();
      await load();
    } catch {
      setSubErrors({ name: "Saqlashda xatolik" });
    }
  };

  const handleConfirmDeleteSub = async () => {
    if (!deleteSub) return;
    await adminApi.deleteSubcategory(deleteSub.parent.id, deleteSub.sub.id);
    setDeleteSub(null);
    await load();
  };

  const selectedPreset = COLOR_PRESETS[form.colorIndex];
  const isEditing = !!editingCategory;

  return (
    <>
      <div className="max-w-[1400px] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
              Kategoriyalar
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{categories.length} ta asosiy kategoriya</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="bg-[#00A86B] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-[#008F5A] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Kategoriya qo'shish
          </button>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E2E6F0" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b" style={{ borderColor: "#E2E6F0" }}>
                {["Kategoriya", "Mahsulotlar", "Sotuvchilar", "Oylik savdo", "Holat", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    Kategoriyalar topilmadi
                  </td>
                </tr>
              ) : (
              categories.map(cat => {
                const expanded = expandedIds.includes(cat.id);
                return (
                  <Fragment key={cat.id}>
                    <tr
                      className="border-b hover:bg-gray-50/40 transition-colors"
                      style={{ borderColor: "#E2E6F0" }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(cat.id)}
                            className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"
                            aria-label={expanded ? "Yopish" : "Ochish"}
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <CategoryLogo icon={cat.icon} bg={cat.bg} />
                          <div>
                            <span className="font-semibold text-sm text-gray-900">{cat.name}</span>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {cat.subcategories.length} ta subkategoriya
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-xs text-gray-800">
                        {cat.count.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">—</td>
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-700">—</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            cat.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {cat.active ? "Faol" : "Yashirin"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => openCreateSubModal(cat)}
                            aria-label="Subkategoriya qo'shish"
                            title="Subkategoriya qo'shish"
                            className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-gray-400 hover:text-[#00A86B] transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            aria-label="Tahrirlash"
                            className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCategory(cat)}
                            aria-label="O'chirish"
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded &&
                      cat.subcategories.map(sub => (
                        <tr
                          key={`${cat.id}-sub-${sub.id}`}
                          className="border-b bg-gray-50/40 hover:bg-gray-50/80 transition-colors"
                          style={{ borderColor: "#E2E6F0" }}
                        >
                          <td className="px-5 py-2.5 pl-14">
                            <div className="flex items-center gap-2.5">
                              <CategoryLogo icon={sub.icon} bg={cat.bg} size="sm" />
                              <span className="text-sm text-gray-700">{sub.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-2.5 font-mono text-xs text-gray-500">
                            {sub.count.toLocaleString()}
                          </td>
                          <td className="px-5 py-2.5 text-xs text-gray-400">—</td>
                          <td className="px-5 py-2.5 text-xs text-gray-400">—</td>
                          <td className="px-5 py-2.5">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                sub.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {sub.active ? "Faol" : "Yashirin"}
                            </span>
                          </td>
                          <td className="px-5 py-2.5">
                            <div className="flex gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => openEditSubModal(cat, sub)}
                                aria-label="Subkategoriyani tahrirlash"
                                className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteSub({ parent: cat, sub })}
                                aria-label="Subkategoriyani o'chirish"
                                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {expanded && cat.subcategories.length === 0 && (
                      <tr className="border-b bg-gray-50/30" style={{ borderColor: "#E2E6F0" }}>
                        <td colSpan={6} className="px-5 py-3 pl-14">
                          <button
                            type="button"
                            onClick={() => openCreateSubModal(cat)}
                            className="text-xs text-[#00A86B] font-semibold hover:underline"
                          >
                            + Birinchi subkategoriyani qo'shish
                          </button>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit category */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? "Kategoriyani tahrirlash" : "Yangi kategoriya qo'shish"}
        description={isEditing ? "Kategoriya ma'lumotlarini yangilang" : "Kategoriya ma'lumotlarini kiriting"}
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
              onClick={() => void handleSubmitCategory()}
              className="px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#008F5A] text-white font-semibold text-sm shadow-sm"
            >
              {isEditing ? "Saqlash" : "Kategoriya qo'shish"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Kategoriya nomi" required error={errors.name}>
            <input
              value={form.name}
              onChange={e => updateField("name", e.target.value)}
              placeholder="Elektronika"
              className={inputClass(!!errors.name)}
              style={{ borderColor: errors.name ? undefined : "#E2E6F0" }}
            />
          </FormField>

          <FormField label="Kategoriya logosi" required error={errors.icon}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleIconSelect}
            />

            {iconPreview ? (
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {isImageSource(iconPreview) ? (
                    <img
                      src={iconPreview}
                      alt="Logo preview"
                      className="w-20 h-20 rounded-2xl object-cover border"
                      style={{ borderColor: "#E2E6F0" }}
                    />
                  ) : (
                    <span
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border"
                      style={{ background: selectedPreset.bg, borderColor: "#E2E6F0" }}
                    >
                      {iconPreview}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearIconPreview}
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
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-[#00A86B] font-semibold hover:underline"
                >
                  Boshqa rasm tanlash
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-6 text-center hover:border-[#00A86B] hover:bg-[#E8F8F1]/30 transition-all cursor-pointer"
                style={{ borderColor: errors.icon ? "#f87171" : "#C9D0E0" }}
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
                <p className="font-semibold text-gray-700 text-sm">Logoni bu yerga yuklang</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, SVG — max 5 MB</p>
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
          </FormField>

          <FormField label="Rang">
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => updateField("colorIndex", i)}
                  className={`w-10 h-10 rounded-xl border-2 transition-all ${
                    form.colorIndex === i ? "border-gray-900 scale-110" : "border-transparent"
                  }`}
                  style={{ background: preset.bg }}
                  aria-label={`Rang ${i + 1}`}
                >
                  <span className="block w-4 h-4 rounded-full mx-auto" style={{ background: preset.color }} />
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Holat">
            <select
              value={form.active ? "active" : "hidden"}
              onChange={e => updateField("active", e.target.value === "active")}
              className={selectClass()}
              style={{ borderColor: "#E2E6F0" }}
            >
              <option value="active">Faol</option>
              <option value="hidden">Yashirin</option>
            </select>
          </FormField>

          <div className="p-4 rounded-xl border bg-gray-50/50" style={{ borderColor: "#E2E6F0" }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ko'rinishi</p>
            <div className="flex items-center gap-3">
              {iconPreview ? (
                <CategoryLogo icon={iconPreview} bg={selectedPreset.bg} />
              ) : (
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs text-gray-400 shrink-0"
                  style={{ background: selectedPreset.bg }}
                >
                  Logo
                </span>
              )}
              <span className="font-semibold text-sm text-gray-900">{form.name || "Kategoriya nomi"}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete category */}
      <Modal
        open={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        title="Kategoriyani o'chirish"
        description="Bu amalni bekor qilib bo'lmaydi"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteCategory(null)}
              className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
              style={{ borderColor: "#E2E6F0" }}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmDeleteCategory()}
              className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-sm"
            >
              O'chirish
            </button>
          </>
        }
      >
        {deleteCategory && (
          <div className="flex items-start gap-3">
            <CategoryLogo icon={deleteCategory.icon} bg={deleteCategory.bg} size="lg" />
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{deleteCategory.name}</span> kategoriyasini
                o'chirmoqchimisiz?
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {deleteCategory.subcategories.length} ta subkategoriya ham o'chiriladi
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit subcategory */}
      <Modal
        open={subModalOpen}
        onClose={closeSubModal}
        title={editingSub ? "Subkategoriyani tahrirlash" : "Subkategoriya qo'shish"}
        description={subParent ? `${subParent.name} ichida` : undefined}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={closeSubModal}
              className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
              style={{ borderColor: "#E2E6F0" }}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={() => void handleSubmitSub()}
              className="px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#008F5A] text-white font-semibold text-sm shadow-sm"
            >
              {editingSub ? "Saqlash" : "Qo'shish"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Subkategoriya nomi" required error={subErrors.name}>
            <input
              value={subForm.name}
              onChange={e => {
                setSubForm(prev => ({ ...prev, name: e.target.value }));
                setSubErrors(prev => {
                  const next = { ...prev };
                  delete next.name;
                  return next;
                });
              }}
              placeholder="Smartfonlar"
              className={inputClass(!!subErrors.name)}
              style={{ borderColor: subErrors.name ? undefined : "#E2E6F0" }}
            />
          </FormField>

          <FormField label="Subkategoriya rasmi" required error={subErrors.icon}>
            <input
              ref={subFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleSubIconSelect}
            />

            {subIconPreview ? (
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {isImageSource(subIconPreview) ? (
                    <img
                      src={subIconPreview}
                      alt="Logo preview"
                      className="w-16 h-16 rounded-2xl object-cover border"
                      style={{ borderColor: "#E2E6F0" }}
                    />
                  ) : (
                    <span
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border"
                      style={{ background: subParent?.bg ?? "#F3F4F6", borderColor: "#E2E6F0" }}
                    >
                      {subIconPreview}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearSubIconPreview}
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
                  onClick={() => subFileInputRef.current?.click()}
                  className="text-sm text-[#00A86B] font-semibold hover:underline"
                >
                  Boshqa rasm tanlash
                </button>
              </div>
            ) : (
              <div
                onClick={() => subFileInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-5 text-center hover:border-[#00A86B] hover:bg-[#E8F8F1]/30 transition-all cursor-pointer"
                style={{ borderColor: subErrors.icon ? "#f87171" : "#C9D0E0" }}
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 text-sm">Rasmni yuklang</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, SVG — max 5 MB</p>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    subFileInputRef.current?.click();
                  }}
                  className="mt-3 text-xs border text-[#00A86B] border-[#00A86B] px-4 py-2 rounded-lg hover:bg-[#E8F8F1] font-medium"
                >
                  Kompyuterdan tanlash
                </button>
              </div>
            )}
          </FormField>

          <FormField label="Holat">
            <select
              value={subForm.active ? "active" : "hidden"}
              onChange={e => setSubForm(prev => ({ ...prev, active: e.target.value === "active" }))}
              className={selectClass()}
              style={{ borderColor: "#E2E6F0" }}
            >
              <option value="active">Faol</option>
              <option value="hidden">Yashirin</option>
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Delete subcategory */}
      <Modal
        open={!!deleteSub}
        onClose={() => setDeleteSub(null)}
        title="Subkategoriyani o'chirish"
        description="Bu amalni bekor qilib bo'lmaydi"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteSub(null)}
              className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
              style={{ borderColor: "#E2E6F0" }}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmDeleteSub()}
              className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-sm"
            >
              O'chirish
            </button>
          </>
        }
      >
        {deleteSub && (
          <div className="flex items-start gap-3">
            <CategoryLogo icon={deleteSub.sub.icon} bg={deleteSub.parent.bg} size="lg" />
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{deleteSub.parent.name}</span> ichidagi{" "}
                <span className="font-semibold text-gray-900">{deleteSub.sub.name}</span> subkategoriyasini
                o'chirmoqchimisiz?
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
