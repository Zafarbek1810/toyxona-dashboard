import { useState, type CSSProperties, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import logoImg from "../assets/logo1.png";
import ringsImg from "../assets/rings.png";
import { useAppNavigate } from "../hooks/useAppNavigate";
import { useAppContext } from "../context/AppContext";
import {
  loginByPhone,
  logout,
  normalizePhone,
  registerAuthUser,
  type AuthRole,
} from "../lib/auth";
import { paths } from "../routes/paths";
import { storeUrl } from "../lib/site";

const fieldClass =
  "w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-[#10231c] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-gray-400 focus:border-[#00A86B] focus:shadow-[0_0_0_4px_rgba(0,168,107,0.12)]";

const PETALS: { left: string; delay: string; duration: string; size: number; drift: string }[] = [
  { left: "8%", delay: "0s", duration: "13s", size: 11, drift: "18px" },
  { left: "22%", delay: "3.2s", duration: "16s", size: 8, drift: "-14px" },
  { left: "38%", delay: "1.4s", duration: "15s", size: 13, drift: "22px" },
  { left: "54%", delay: "5s", duration: "18s", size: 7, drift: "-10px" },
  { left: "70%", delay: "2.1s", duration: "14s", size: 10, drift: "16px" },
  { left: "86%", delay: "6.4s", duration: "17s", size: 9, drift: "-20px" },
];

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

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${fieldClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8a8478] transition-colors hover:text-[#063528]"
        aria-label={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function AuthStage({ onLogoClick }: { onLogoClick: () => void }) {
  return (
    <aside className="auth-stage">
      <div className="auth-stage-logo">
        <button
          type="button"
          onClick={onLogoClick}
          aria-label="Tuyhona"
          className="inline-flex items-center rounded-2xl bg-white px-2.5 py-1.5 shadow-sm"
        >
          <img src={logoImg} alt="" className="h-8 w-auto object-contain sm:h-9" />
        </button>
      </div>
      <div className="auth-orb auth-orb-a" />
      <div className="auth-orb auth-orb-b" />
      <div className="auth-mark" aria-hidden="true">
        <img src={ringsImg} alt="" className="auth-brand-mark" />
      </div>
      {PETALS.map(petal => (
        <span
          key={petal.left}
          className="auth-petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size * 1.45,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            ["--drift" as string]: petal.drift,
          } as CSSProperties}
        />
      ))}
    </aside>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium text-[#3d4a44]">{children}</label>;
}

function PhoneField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition focus-within:shadow-[0_0_0_4px_rgba(0,168,107,0.12)]">
      <span className="flex items-center bg-[#f3efe6] px-3 text-sm text-[#5c675f]">+998</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="90 123 45 67"
        inputMode="tel"
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#10231c] outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

export default function AuthPage() {
  const navigate = useAppNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, refreshCartFav } = useAppContext();
  const [mode, setMode] = useState<"login" | "register" | "forgot">(
    searchParams.get("register") === "1" ? "register" : "login",
  );
  const role: AuthRole = "seller";
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [storeName, setStoreName] = useState("");
  const [businessType, setBusinessType] = useState("Jismoniy shaxs");
  const [city, setCity] = useState("Toshkent shahri");
  const [storeDescription, setStoreDescription] = useState("");

  const [forgotPhone, setForgotPhone] = useState("");

  const resetError = () => setError("");

  const handleLogin = async () => {
    resetError();
    const phone = normalizePhone(loginPhone);
    if (!phone) {
      setError("Telefon raqamini kiriting");
      return;
    }
    if (!loginPassword.trim()) {
      setError("Parolni kiriting");
      return;
    }

    setLoading(true);
    try {
      const user = await loginByPhone(phone, loginPassword);
      if (user.role === "customer") {
        await logout();
        setUser(null);
        setError("Xaridorlar sayt orqali o'z akkauntiga kiradi.");
        return;
      }
      setUser(user);
      if (user.role === "admin") {
        navigate(paths.admin.dashboard);
        return;
      }
      if (user.role === "seller") {
        navigate(paths.seller.dashboard);
        return;
      }
      await refreshCartFav();
      navigate(paths.account.root);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirish muvaffaqiyatsiz");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = async () => {
    resetError();
    const phone = normalizePhone(registerPhone);
    if (!firstName.trim() || !lastName.trim()) {
      setError("Ism va familiyani kiriting");
      return;
    }
    if (phone.length < 9) {
      setError("To'g'ri telefon raqam kiriting");
      return;
    }
    if (registerPassword.trim().length < 8) {
      setError("Parol kamida 8 belgidan iborat bo'lishi kerak");
      return;
    }

    if (role === "seller") {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const user = await registerAuthUser({
        phone,
        password: registerPassword,
        role: "customer",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setUser(user);
      await refreshCartFav();
      navigate(paths.account.root);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tish muvaffaqiyatsiz");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSeller = async () => {
    resetError();
    const phone = normalizePhone(registerPhone);
    if (!storeName.trim()) {
      setError("Do'kon nomini kiriting");
      return;
    }

    setLoading(true);
    try {
      const user = await registerAuthUser({
        phone,
        password: registerPassword,
        role: "seller",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        storeName: storeName.trim(),
        businessType,
        city,
        description: storeDescription.trim() || undefined,
      });
      setUser(user);
      await refreshCartFav();
      navigate(paths.seller.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tish muvaffaqiyatsiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthStage onLogoClick={() => window.location.assign(storeUrl("/"))} />

      <div className="auth-panel">
        <div className="w-full max-w-md">
          {mode === "login" && (
            <form
              className="auth-card"
              onSubmit={event => {
                event.preventDefault();
                void handleLogin();
              }}
            >
              <div>
                <span className="mb-4 block h-1 w-10 rounded-full bg-gradient-to-r from-[#E5A818] to-[#00A86B]" />
                <h1 className="text-[1.7rem] font-extrabold tracking-tight text-[#10231c]">Kabinetga kirish</h1>
                <p className="mt-1 text-sm text-[#6d776f]">Sotuvchi va admin uchun</p>
              </div>

              <div className="mt-7 space-y-4">
                <div>
                  <FieldLabel>Telefon raqam</FieldLabel>
                  <PhoneField
                    value={loginPhone}
                    onChange={value => { setLoginPhone(value); resetError(); }}
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3d4a44]">Parol</span>
                    <button type="button" onClick={() => { setMode("forgot"); resetError(); }} className="text-xs font-medium text-[#008F5A] hover:underline">
                      Parolni unutdingizmi?
                    </button>
                  </div>
                  <PasswordInput
                    value={loginPassword}
                    onChange={value => { setLoginPassword(value); resetError(); }}
                    placeholder="Parolingiz"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && <p className="auth-error mt-3 text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={loading} className="auth-submit mt-6 w-full rounded-2xl bg-[#063528] py-3.5 text-sm font-semibold text-white transition hover:bg-[#0a4634] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Kutilmoqda..." : "Kirish"}
              </button>

              <p className="mt-5 text-center text-sm text-[#6d776f]">
                Hisob yo&apos;qmi?{" "}
                <button type="button" onClick={() => { setMode("register"); setStep(1); resetError(); }} className="font-semibold text-[#008F5A] hover:underline">
                  Ro&apos;yxatdan o&apos;tish
                </button>
              </p>
              <p className="mt-3 text-center text-xs text-[#8a8478]">
                <a href={storeUrl("/")} className="font-semibold text-[#008F5A] hover:underline">
                  Saytga qaytish
                </a>
              </p>
            </form>
          )}

          {mode === "register" && step === 1 && (
            <form
              className="auth-card"
              onSubmit={event => {
                event.preventDefault();
                void handleRegisterStep1();
              }}
            >
              <div>
                <span className="mb-4 block h-1 w-10 rounded-full bg-gradient-to-r from-[#E5A818] to-[#00A86B]" />
                <h1 className="text-[1.7rem] font-extrabold tracking-tight text-[#10231c]">Ro&apos;yxatdan o&apos;tish</h1>
                <p className="mt-1 text-sm text-[#6d776f]">Sotuvchi sifatida ro&apos;yxatdan o&apos;ting</p>
              </div>

              <div className="mt-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Ism</FieldLabel>
                    <input
                      value={firstName}
                      onChange={e => { setFirstName(e.target.value); resetError(); }}
                      placeholder="Jasur"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <FieldLabel>Familiya</FieldLabel>
                    <input
                      value={lastName}
                      onChange={e => { setLastName(e.target.value); resetError(); }}
                      placeholder="Toshmatov"
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Telefon raqam</FieldLabel>
                  <PhoneField
                    value={registerPhone}
                    onChange={value => { setRegisterPhone(value); resetError(); }}
                  />
                </div>
                <div>
                  <FieldLabel>Parol</FieldLabel>
                  <PasswordInput
                    value={registerPassword}
                    onChange={value => { setRegisterPassword(value); resetError(); }}
                    placeholder="Kamida 8 belgi"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && <p className="auth-error mt-3 text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={loading} className="auth-submit mt-6 w-full rounded-2xl bg-[#063528] py-3.5 text-sm font-semibold text-white transition hover:bg-[#0a4634] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Kutilmoqda..." : "Davom etish →"}
              </button>
              <p className="mt-4 text-center text-sm text-[#6d776f]">
                Hisob bor?{" "}
                <button type="button" onClick={() => { setMode("login"); resetError(); }} className="font-semibold text-[#008F5A] hover:underline">Kirish</button>
              </p>
            </form>
          )}

          {mode === "register" && step === 2 && (
            <form
              className="auth-card"
              onSubmit={event => {
                event.preventDefault();
                void handleRegisterSeller();
              }}
            >
              <button type="button" onClick={() => { setStep(1); resetError(); }} className="text-sm text-[#6d776f] transition hover:text-[#10231c]">
                ← Orqaga
              </button>
              <div className="mt-4">
                <span className="mb-4 block h-1 w-10 rounded-full bg-gradient-to-r from-[#E5A818] to-[#00A86B]" />
                <h1 className="text-[1.7rem] font-extrabold tracking-tight text-[#10231c]">Biznes ma&apos;lumotlari</h1>
                <p className="mt-1 text-sm text-[#6d776f]">Do&apos;koningiz haqida ma&apos;lumot bering</p>
              </div>

              <div className="mt-7 space-y-4">
                <div>
                  <FieldLabel>Do&apos;kon nomi</FieldLabel>
                  <input
                    value={storeName}
                    onChange={e => { setStoreName(e.target.value); resetError(); }}
                    placeholder="TechPlus Savdo"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <FieldLabel>Biznes turi</FieldLabel>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className={fieldClass}
                  >
                    <option>Jismoniy shaxs</option>
                    <option>Yakka tartibdagi tadbirkor (YaTT)</option>
                    <option>Mas&apos;uliyati cheklangan jamiyat (MChJ)</option>
                    <option>Aksiyadorlik jamiyati (AJ)</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Shahar/Viloyat</FieldLabel>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className={fieldClass}
                  >
                    <option>Toshkent shahri</option>
                    <option>Samarqand</option>
                    <option>Buxoro</option>
                    <option>Andijon</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Do&apos;kon tavsifi</FieldLabel>
                  <textarea
                    rows={3}
                    value={storeDescription}
                    onChange={e => setStoreDescription(e.target.value)}
                    placeholder="Do'koningiz haqida qisqacha..."
                    className={`${fieldClass} resize-none`}
                  />
                </div>
              </div>

              {error && <p className="auth-error mt-3 text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={loading} className="auth-submit mt-6 w-full rounded-2xl bg-[#E5A818] py-3.5 text-sm font-semibold text-[#063528] transition hover:bg-[#d39a12] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Kutilmoqda..." : "Obunani tanlash →"}
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <div className="auth-card">
              <button type="button" onClick={() => { setMode("login"); resetError(); }} className="text-sm text-[#6d776f] transition hover:text-[#10231c]">
                ← Orqaga
              </button>
              <div className="mt-4">
                <span className="mb-4 block h-1 w-10 rounded-full bg-gradient-to-r from-[#E5A818] to-[#00A86B]" />
                <h1 className="text-[1.7rem] font-extrabold tracking-tight text-[#10231c]">Parolni tiklash</h1>
                <p className="mt-1 text-sm text-[#6d776f]">Telefon raqamingizni kiriting, SMS kod yuboramiz</p>
              </div>
              <div className="mt-7">
                <FieldLabel>Telefon raqam</FieldLabel>
                <PhoneField value={forgotPhone} onChange={setForgotPhone} />
              </div>
              <button type="button" className="auth-submit mt-6 w-full rounded-2xl bg-[#063528] py-3.5 text-sm font-semibold text-white transition hover:bg-[#0a4634]">
                SMS kod yuborish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
