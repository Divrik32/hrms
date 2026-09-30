import { useEffect, useRef, useState, useCallback } from "react";
import api from "../services/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Hash,
  Phone,
  MapPin,
  Mail,
  Lock,
  Briefcase,
  Building2,
  LayoutGrid,
  Camera,
  ChevronDown,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Star,
  X,
  Trash2,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Themes: dark (default) · light · midnight                          */
/* ------------------------------------------------------------------ */
const THEMES = {
  dark: {
    label: "Dark",
    icon: Moon,
    scheme: "dark",
    vars: {
      "--bg": "#272c3a",
      "--card": "#323849",
      "--card2": "#3c4358",
      "--input": "#2a3040",
      "--border": "rgba(255,255,255,0.12)",
      "--text": "#f2f4fa",
      "--muted": "#b4bbce",
      "--faint": "#7d859b",
      "--accent": "#6366f1",
      "--accent2": "#8b5cf6",
      "--soft": "rgba(99,102,241,0.18)",
      "--glow1": "rgba(99,102,241,0.16)",
      "--glow2": "rgba(139,92,246,0.11)",
      "--shadow": "rgba(0,0,0,0.35)",
      "--danger": "#f87171",
      "--ok": "#34d399",
    },
  },
  light: {
    label: "Light",
    icon: Sun,
    scheme: "light",
    vars: {
      "--bg": "#f3f5fa",
      "--card": "#ffffff",
      "--card2": "#f6f7fc",
      "--input": "#f6f7fb",
      "--border": "rgba(15,23,42,0.10)",
      "--text": "#0f172a",
      "--muted": "#4b5568",
      "--faint": "#8792a6",
      "--accent": "#4f46e5",
      "--accent2": "#7c3aed",
      "--soft": "rgba(79,70,229,0.12)",
      "--glow1": "rgba(99,102,241,0.15)",
      "--glow2": "rgba(167,139,250,0.14)",
      "--shadow": "rgba(30,41,90,0.16)",
      "--danger": "#dc2626",
      "--ok": "#059669",
    },
  },
  midnight: {
    label: "Midnight",
    icon: Star,
    scheme: "dark",
    vars: {
      "--bg": "#1b2247",
      "--card": "#262f5a",
      "--card2": "#303a6c",
      "--input": "#1e2650",
      "--border": "rgba(160,175,255,0.16)",
      "--text": "#eef1fb",
      "--muted": "#aab3d6",
      "--faint": "#7580aa",
      "--accent": "#7c83ff",
      "--accent2": "#a78bfa",
      "--soft": "rgba(124,131,255,0.18)",
      "--glow1": "rgba(99,102,241,0.18)",
      "--glow2": "rgba(56,189,248,0.08)",
      "--shadow": "rgba(4,6,25,0.45)",
      "--danger": "#fb7185",
      "--ok": "#4ade80",
    },
  },
};

const THEME_KEY = "department-page-theme"; // shared with the other pages

/* shared class strings */
const surface =
  "bg-[var(--card)] border border-[color:var(--border)] rounded-2xl shadow-[0_24px_60px_-28px_var(--shadow)]";
const fieldWrap =
  "flex gap-3 items-center bg-[var(--input)] border border-[color:var(--border)] rounded-xl px-4 py-3 transition-all duration-200 hover:border-[color:var(--faint)] focus-within:!border-[color:var(--accent)] focus-within:ring-4 focus-within:ring-[color:var(--soft)]";
const inputCls =
  "min-w-0 flex-1 bg-transparent text-sm text-[color:var(--text)] outline-none placeholder:text-[color:var(--faint)] disabled:cursor-not-allowed disabled:opacity-50";
const labelCls = "block text-xs font-semibold text-[color:var(--muted)] mb-1.5 tracking-wide";

/* ---------------- small building blocks ---------------- */
const Field = ({ icon: Icon, label, name, required, className = "", children, trailing }) => (
  <div className={className}>
    <label htmlFor={name} className={labelCls}>
      {label}
      {required && <span className="text-[color:var(--accent)]"> *</span>}
    </label>
    <div className={fieldWrap}>
      <Icon size={16} className="shrink-0 text-[color:var(--faint)]" />
      {children}
      {trailing}
    </div>
  </div>
);

const CustomSelect = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  loading,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [place, setPlace] = useState({ up: false, maxH: 240 });
  const ref = useRef(null);

  // Open upward when there is not enough room below the field
  const measure = () => {
    const btn = ref.current?.querySelector("button");
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 16;
    const above = r.top - 16;
    const want = Math.min(240, options.length * 44 + 12);
    const up = below < want && above > below;
    setPlace({ up, maxH: Math.max(120, Math.min(240, up ? above : below)) });
  };

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const selected = options.find((o) => o.value === value);

  const choose = (v) => {
    onChange({ target: { name, value: v } });
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        measure();
        setOpen(true);
        setActive(Math.max(0, options.findIndex((o) => o.value === value)));
        return;
      }
      setActive((i) =>
        e.key === "ArrowDown"
          ? Math.min(options.length - 1, i + 1)
          : Math.max(0, i - 1)
      );
    } else if (e.key === "Enter" && open && active >= 0 && options[active]) {
      e.preventDefault();
      choose(options[active].value);
    }
  };

  return (
    <div ref={ref} className={`${className} ${open ? "relative z-30" : ""}`}>
      <span className={labelCls}>
        {label}
        {required && <span className="text-[color:var(--accent)]"> *</span>}
      </span>

      <div className="relative">
        <button
          type="button"
          id={name}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (!open) measure();
            setOpen((v) => !v);
          }}
          onKeyDown={onKeyDown}
          className={`${fieldWrap} w-full text-left disabled:cursor-not-allowed disabled:opacity-50 ${
            open ? "!border-[color:var(--accent)] ring-4 ring-[color:var(--soft)]" : ""
          }`}
        >
          <Icon size={16} className="shrink-0 text-[color:var(--faint)]" />
          <span
            className={`flex-1 truncate text-sm ${
              selected
                ? "font-medium text-[color:var(--text)]"
                : "text-[color:var(--faint)]"
            }`}
          >
            {selected ? selected.label : placeholder}
          </span>
          {loading ? (
            <Loader2 size={15} className="shrink-0 animate-spin text-[color:var(--faint)]" />
          ) : (
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={15} className="text-[color:var(--faint)]" />
            </motion.span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: place.up ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: place.up ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{ maxHeight: place.maxH }}
              className={`absolute left-0 right-0 z-40 overflow-y-auto rounded-xl ${
                place.up ? "bottom-full mb-2" : "top-full mt-2"
              } border border-[color:var(--border)] bg-[var(--card2)] p-1.5 shadow-[0_20px_50px_-15px_var(--shadow)]`}
            >
              {options.length === 0 ? (
                <li className="px-3 py-3 text-xs text-[color:var(--faint)]">
                  Nothing to choose from yet
                </li>
              ) : (
                options.map((o, i) => {
                  const isSel = o.value === value;
                  return (
                    <li key={o.value} role="option" aria-selected={isSel}>
                      <button
                        type="button"
                        onClick={() => choose(o.value)}
                        onMouseEnter={() => setActive(i)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm transition-colors ${
                          isSel
                            ? "bg-[var(--soft)] font-medium text-[color:var(--accent)]"
                            : active === i
                            ? "bg-[var(--soft)] text-[color:var(--text)]"
                            : "text-[color:var(--text)] hover:bg-[var(--soft)]"
                        }`}
                      >
                        <span className="flex-1 truncate">{o.label}</span>
                        {isSel && <Check size={15} className="shrink-0" />}
                      </button>
                    </li>
                  );
                })
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title, hint }) => (
  <div className="mb-3 flex items-center gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--soft)]">
      <Icon size={16} className="text-[color:var(--accent)]" />
    </div>
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-[color:var(--muted)]">{hint}</p>
    </div>
  </div>
);

const emptyForm = {
  name: "",
  empId: "",
  phone: "",
  presentAddress: "",
  gender: "Male",
  email: "",
  password: "",
  role: "",
  companyId: "",
  departmentId: "",
  profilePic: null,
};

const CreateEmployee = () => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return THEMES[saved] ? saved : "dark";
    } catch {
      return "dark";
    }
  });

  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [toast, setToast] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const toastTimer = useRef(null);
  const fileRef = useRef(null);

  const showToast = useCallback((type, message) => {
    clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const changeTheme = (key) => {
    setTheme(key);
    try {
      localStorage.setItem(THEME_KEY, key);
    } catch {
      /* ignore */
    }
  };

  /* ---------------- data ---------------- */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [companyRes, roleRes] = await Promise.all([
          api.get("/companies"),
          api.get("/roles"),
        ]);
        setCompanies(
          Array.isArray(companyRes.data.companies) ? companyRes.data.companies : []
        );
        setRoles(Array.isArray(roleRes.data.roles) ? roleRes.data.roles : []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchInitialData();
    return () => clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!formData.companyId) {
      setDepartments([]);
      return;
    }
    let cancelled = false;
    setLoadingDepts(true);
    api
      .get(`/departments/company/${formData.companyId}`)
      .then((res) => !cancelled && setDepartments(res.data.departments || []))
      .catch((err) => console.log(err))
      .finally(() => !cancelled && setLoadingDepts(false));
    return () => {
      cancelled = true;
    };
  }, [formData.companyId]);

  /* free the preview object URL */
  useEffect(() => {
    return () => previewUrl && URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  /* ---------------- handlers ---------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (!file) return;
      setFormData((prev) => ({ ...prev, [name]: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else if (name === "companyId") {
      // changing company invalidates the chosen department
      setFormData((prev) => ({ ...prev, companyId: value, departmentId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePic: null }));
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role || !formData.companyId || !formData.departmentId) {
      showToast("error", "Please select role, company and department");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) data.append(key, formData[key]);
      });
      const res = await api.post("/employees", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("success", res.data.message || "Employee created successfully!");
      setFormData(emptyForm);
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (error) {
      showToast("error", error.response?.data?.message || "Employee create failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- derived (live summary) ---------------- */
  const roleName = roles.find((r) => r._id === formData.role)?.roleName;
  const companyName = companies.find((c) => c._id === formData.companyId)?.companyName;
  const deptName = departments.find((d) => d._id === formData.departmentId)?.departmentName;
  const initial = formData.name?.trim()?.[0]?.toUpperCase();

  const genders = ["Male", "Female", "Other"];

  return (
    <div
      style={{ ...THEMES[theme].vars, colorScheme: THEMES[theme].scheme }}
      className="dept-root relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[color:var(--text)] transition-colors duration-500 font-sans antialiased"
    >
      {/* Global h1/h2/h3 styles must not override the theme */}
      <style>{`
        .dept-root h1, .dept-root h2, .dept-root h3 {
          color: var(--text) !important;
          margin: 0 !important;
          line-height: 1.2 !important;
          background: none !important;
          -webkit-text-fill-color: currentColor !important;
        }
        .dept-root p { margin-bottom: 0; }
      `}</style>

      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 32rem at 12% -8%, var(--glow1), transparent 60%), radial-gradient(48rem 28rem at 100% 0%, var(--glow2), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-6">
        {/* ============ Header ============ */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] shadow-lg shadow-[color:var(--soft)]">
              <UserPlus size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                New Employee
              </h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Fill in the details to add a team member.
              </p>
            </div>
          </div>

          {/* Theme switcher */}
          <div
            role="radiogroup"
            aria-label="Theme"
            className="inline-flex self-start rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-1 sm:self-auto"
          >
            {Object.entries(THEMES).map(([key, t]) => {
              const Icon = t.icon;
              const active = theme === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => changeTheme(key)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "text-white"
                      : "text-[color:var(--muted)] hover:text-[color:var(--text)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="theme-pill-emp"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]"
                    />
                  )}
                  <Icon size={14} className="relative" />
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
        </motion.header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4"
        >
          {/* ============ Left: photo + live summary ============ */}
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={`${surface} h-fit p-4 sm:p-5 lg:sticky lg:top-6`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Upload profile photo"
                  className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[color:var(--faint)] bg-[var(--input)] transition-all duration-200 hover:border-[color:var(--accent)] hover:ring-4 hover:ring-[color:var(--soft)]"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : initial ? (
                    <span className="text-3xl font-bold text-[color:var(--accent)]">
                      {initial}
                    </span>
                  ) : (
                    <Camera size={28} className="text-[color:var(--faint)]" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={22} className="text-white" />
                  </span>
                </button>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    aria-label="Remove photo"
                    className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border)] bg-[var(--card2)] text-[color:var(--danger)] shadow-md transition-transform hover:scale-110"
                  >
                    <Trash2 size={13} />
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </div>

              <p className="mt-3 text-xs text-[color:var(--muted)]">
                {previewUrl ? "Tap the photo to change it" : "Tap to add a profile photo"}
              </p>

              <div className="mt-4 w-full rounded-xl border border-[color:var(--border)] bg-[var(--card2)] p-3.5 text-left">
                <p className="truncate text-sm font-semibold !text-[color:var(--text)]">
                  {formData.name || "Full name"}
                </p>
                <p className="mt-0.5 truncate text-xs text-[color:var(--accent)]">
                  {roleName || "Role not selected"}
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-[color:var(--muted)]">
                  <p className="flex items-center gap-2 truncate">
                    <Hash size={12} className="shrink-0 text-[color:var(--faint)]" />
                    {formData.empId || "Employee ID"}
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Building2 size={12} className="shrink-0 text-[color:var(--faint)]" />
                    {companyName || "Company"}
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <LayoutGrid size={12} className="shrink-0 text-[color:var(--faint)]" />
                    {deptName || "Department"}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* ============ Right: form sections ============ */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3 lg:col-span-2 lg:space-y-4"
          >
            {/* Personal */}
            <section className={`${surface} p-4 sm:p-5`}>
              <SectionTitle icon={User} title="Personal info" hint="Basic details about the employee" />
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Field icon={User} label="Full name" name="name" required className="sm:col-span-2">
                  <input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Rahim Uddin" className={inputCls} />
                </Field>

                <Field icon={Hash} label="Employee ID" name="empId" required>
                  <input id="empId" name="empId" value={formData.empId} onChange={handleChange} required placeholder="e.g. EMP-001" className={inputCls} />
                </Field>

                <Field icon={Phone} label="Phone" name="phone" required>
                  <input id="phone" name="phone" type="tel" inputMode="tel" value={formData.phone} onChange={handleChange} required placeholder="01XXXXXXXXX" className={inputCls} />
                </Field>

                <Field icon={MapPin} label="Present address" name="presentAddress" required className="sm:col-span-2">
                  <input id="presentAddress" name="presentAddress" value={formData.presentAddress} onChange={handleChange} required placeholder="House, road, area, city" className={inputCls} />
                </Field>

                {/* Gender segmented control */}
                <div className="sm:col-span-2">
                  <span className={labelCls}>Gender</span>
                  <div role="radiogroup" aria-label="Gender" className="grid grid-cols-3 gap-1 rounded-xl border border-[color:var(--border)] bg-[var(--input)] p-1">
                    {genders.map((g) => {
                      const active = formData.gender === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setFormData((p) => ({ ...p, gender: g }))}
                          className={`relative rounded-lg py-2 text-sm font-medium transition-colors ${
                            active ? "text-white" : "text-[color:var(--muted)] hover:text-[color:var(--text)]"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="gender-pill"
                              transition={{ type: "spring", stiffness: 420, damping: 34 }}
                              className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]"
                            />
                          )}
                          <span className="relative">{g}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Account */}
            <section className={`${surface} p-4 sm:p-5`}>
              <SectionTitle icon={Lock} title="Account" hint="Login credentials for this employee" />
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Field icon={Mail} label="Email address" name="email" required>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="name@company.com" className={inputCls} />
                </Field>

                <Field
                  icon={Lock}
                  label="Password"
                  name="password"
                  required
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="shrink-0 text-[color:var(--faint)] transition-colors hover:text-[color:var(--text)]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                >
                  <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required placeholder="Create a password" autoComplete="new-password" className={inputCls} />
                </Field>
              </div>
            </section>

            {/* Organisation */}
            <section className={`${surface} p-4 sm:p-5`}>
              <SectionTitle icon={Briefcase} title="Organisation" hint="Where this employee works" />
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <CustomSelect
                  icon={Briefcase}
                  label="Role"
                  name="role"
                  required
                  className="sm:col-span-2"
                  placeholder="Select role"
                  value={formData.role}
                  onChange={handleChange}
                  options={roles.map((r) => ({ value: r._id, label: r.roleName }))}
                />

                <CustomSelect
                  icon={Building2}
                  label="Company"
                  name="companyId"
                  required
                  placeholder="Select company"
                  value={formData.companyId}
                  onChange={handleChange}
                  options={companies.map((c) => ({ value: c._id, label: c.companyName }))}
                />

                <CustomSelect
                  icon={LayoutGrid}
                  label="Department"
                  name="departmentId"
                  required
                  placeholder={formData.companyId ? "Select department" : "Choose a company first"}
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={!formData.companyId}
                  loading={loadingDepts}
                  options={departments.map((d) => ({ value: d._id, label: d.departmentName }))}
                />
              </div>
            </section>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: loading ? 0 : -1 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[color:var(--soft)] transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create employee
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>

      {/* ============ Toast ============ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.message}
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed bottom-4 left-4 right-4 z-[60] flex items-center gap-3 rounded-xl border bg-[var(--card)] px-4 py-3.5 text-sm font-medium shadow-[0_20px_50px_-15px_var(--shadow)] sm:left-auto sm:w-96 ${
              toast.type === "success"
                ? "border-emerald-500/40 text-[color:var(--ok)]"
                : "border-red-500/40 text-[color:var(--danger)]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span className="flex-1 text-[color:var(--text)]">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="text-[color:var(--faint)] hover:text-[color:var(--text)]"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateEmployee;