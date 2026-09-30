import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import api from "../services/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Briefcase,
  FileText,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Search,
  Sun,
  Moon,
  Star,
  X,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Themes: dark (default) · light · midnight                          */
/* ------------------------------------------------------------------ */
const THEMES = {
  dark: {
    label: "Dark",
    icon: Moon,
    vars: {
      "--bg": "#272c3a",
      "--card": "#323849",
      "--card2": "#3c4358",
      "--input": "#2a3040",
      "--border": "rgba(255,255,255,0.12)",
      "--text": "#f2f4fa",
      "--muted": "#b4bbce",
      "--faint": "#6c7489",
      "--accent": "#6366f1",
      "--accent2": "#8b5cf6",
      "--soft": "rgba(99,102,241,0.16)",
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
    vars: {
      "--bg": "#1b2247",
      "--card": "#262f5a",
      "--card2": "#303a6c",
      "--input": "#1e2650",
      "--border": "rgba(160,175,255,0.16)",
      "--text": "#eef1fb",
      "--muted": "#aab3d6",
      "--faint": "#5d6684",
      "--accent": "#7c83ff",
      "--accent2": "#a78bfa",
      "--soft": "rgba(124,131,255,0.16)",
      "--glow1": "rgba(99,102,241,0.18)",
      "--glow2": "rgba(56,189,248,0.08)",
      "--shadow": "rgba(4,6,25,0.45)",
      "--danger": "#fb7185",
      "--ok": "#4ade80",
    },
  },
};

const THEME_KEY = "department-page-theme";

/* shared class strings */
const surface =
  "bg-[var(--card)] border border-[color:var(--border)] rounded-2xl shadow-[0_24px_60px_-28px_var(--shadow)]";
const fieldWrap =
  "flex gap-3 items-center bg-[var(--input)] border border-[color:var(--border)] rounded-xl px-4 py-3 transition-all duration-200 hover:border-[color:var(--faint)] focus-within:!border-[color:var(--accent)] focus-within:ring-4 focus-within:ring-[color:var(--soft)]";
const labelCls =
  "block text-xs font-semibold text-[color:var(--muted)] mb-1.5 tracking-wide";

const CreateDepartment = () => {
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
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [fetchingDepartments, setFetchingDepartments] = useState(false);
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");

  const [formData, setFormData] = useState({
    departmentName: "",
    companyId: "",
    description: "",
  });

  const selectRef = useRef(null);
  const toastTimer = useRef(null);

  /* ---------------- helpers ---------------- */
  const showToast = useCallback((type, message) => {
    clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
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
  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(
        Array.isArray(res.data.companies) ? res.data.companies : []
      );
    } catch (error) {
      console.log("Fetch companies error:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      setFetchingDepartments(true);
      const res = await api.get("/departments");
      setDepartments(
        Array.isArray(res.data.departments) ? res.data.departments : []
      );
    } catch (error) {
      console.error("Fetch departments error:", error);
      setDepartments([]);
      showToast(
        "error",
        error.response?.data?.message || "Failed to fetch departments"
      );
    } finally {
      setFetchingDepartments(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchDepartments();
    return () => clearTimeout(toastTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* close company dropdown on outside click / Esc */
  useEffect(() => {
    const onDown = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsSelectOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsSelectOpen(false);
        setDeleteTarget(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* ---------------- handlers ---------------- */
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSelectCompany = (id) => {
    setFormData((prev) => ({ ...prev, companyId: id }));
    setIsSelectOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyId) {
      showToast("error", "Please select a company");
      return;
    }

    setCreatingDepartment(true);
    try {
      const res = await api.post("/departments", formData);
      showToast(
        "success",
        res.data.message || "Department created successfully"
      );
      setFormData({ departmentName: "", companyId: "", description: "" });
      setIsSelectOpen(false);
      await fetchDepartments();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setCreatingDepartment(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/departments/${deleteTarget._id}`);
      setDepartments((prev) =>
        prev.filter((d) => d._id !== deleteTarget._id)
      );
      showToast("success", "Department deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete department error:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete department"
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- derived ---------------- */
  const safeCompanies = Array.isArray(companies) ? companies : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];

  const selectedCompany = safeCompanies.find(
    (c) => c._id === formData.companyId
  );

  const filteredDepartments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return safeDepartments.filter((d) => {
      const cid = d.companyId?._id || d.companyId;
      const matchCompany = companyFilter === "all" || cid === companyFilter;
      const matchQuery =
        !q ||
        d.departmentName?.toLowerCase().includes(q) ||
        d.companyId?.companyName?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q);
      return matchCompany && matchQuery;
    });
  }, [safeDepartments, query, companyFilter]);

  /* ---------------- render ---------------- */
  return (
    <div
      style={THEMES[theme].vars}
      className="dept-root relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[color:var(--text)] transition-colors duration-500 font-sans antialiased"
    >
      {/* Force heading colour/margin so global h1/h2/h3 styles can't override the theme */}
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

      {/* Soft ambient glow (kept subtle so the background stays calm) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 32rem at 12% -8%, var(--glow1), transparent 60%), radial-gradient(48rem 28rem at 100% 0%, var(--glow2), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        {/* ============ Header ============ */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] shadow-lg shadow-[color:var(--soft)]">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Departments
              </h1>
              <p className="mt-1 max-w-md text-sm text-[color:var(--muted)]">
                Create departments and manage which company each one belongs
                to.
              </p>
            </div>
          </div>

          {/* Theme switcher */}
          <div
            role="radiogroup"
            aria-label="Theme"
            className="relative inline-flex self-start rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-1 sm:self-auto"
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
                      layoutId="theme-pill"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]"
                    />
                  )}
                  <Icon size={14} className="relative" />
                  <span className="relative hidden xs:inline sm:inline">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.header>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5 lg:gap-4">
          {/* ============ Create form ============ */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={`${surface} h-fit lg:sticky lg:top-6 lg:col-span-2`}
          >
            <div className="px-4 pb-0 pt-4 sm:px-5">
              <h2 className="text-lg font-semibold">New department</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Name it, pick a company, and add a short description.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-3.5 px-4 pb-4 pt-3.5 sm:px-5"
            >
              {/* Name */}
              <div>
                <label htmlFor="departmentName" className={labelCls}>
                  Department name
                </label>
                <div className={fieldWrap}>
                  <Briefcase
                    size={16}
                    className="shrink-0 text-[color:var(--faint)]"
                  />
                  <input
                    id="departmentName"
                    type="text"
                    name="departmentName"
                    placeholder="e.g. Engineering, Marketing"
                    value={formData.departmentName}
                    onChange={handleChange}
                    required
                    className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--text)] outline-none placeholder:text-[color:var(--faint)]"
                  />
                </div>
              </div>

              {/* Company */}
              <div ref={selectRef}>
                <label className={labelCls}>Company</label>
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isSelectOpen}
                    onClick={() => setIsSelectOpen((v) => !v)}
                    className={`${fieldWrap} w-full text-left ${
                      isSelectOpen
                        ? "!border-[color:var(--accent)] ring-4 ring-[color:var(--soft)]"
                        : ""
                    }`}
                  >
                    <Building2
                      size={16}
                      className="shrink-0 text-[color:var(--faint)]"
                    />
                    <span
                      className={`flex-1 truncate text-sm ${
                        selectedCompany
                          ? "text-[color:var(--text)]"
                          : "text-[color:var(--faint)]"
                      }`}
                    >
                      {selectedCompany
                        ? selectedCompany.companyName
                        : "Select a company"}
                    </span>
                    <motion.span
                      animate={{ rotate: isSelectOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown
                        size={16}
                        className="text-[color:var(--faint)]"
                      />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {isSelectOpen && (
                      <motion.ul
                        role="listbox"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[var(--card2)] p-1.5 shadow-[0_20px_50px_-15px_var(--shadow)]"
                      >
                        {safeCompanies.length === 0 ? (
                          <li className="px-3 py-3 text-sm text-[color:var(--faint)]">
                            No companies found
                          </li>
                        ) : (
                          safeCompanies.map((company) => {
                            const active = formData.companyId === company._id;
                            return (
                              <li key={company._id} role="option" aria-selected={active}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectCompany(company._id)}
                                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--soft)] ${
                                    active
                                      ? "bg-[var(--soft)] text-[color:var(--accent)]"
                                      : "text-[color:var(--text)]"
                                  }`}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--soft)] text-[10px] font-bold text-[color:var(--accent)]">
                                    {company.companyName?.[0]?.toUpperCase()}
                                  </span>
                                  <span className="flex-1 truncate">
                                    {company.companyName}
                                  </span>
                                  {active && <Check size={15} />}
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

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelCls}>
                  Description{" "}
                  <span className="font-normal text-[color:var(--faint)]">
                    (optional)
                  </span>
                </label>
                <div className={`${fieldWrap} !items-start`}>
                  <FileText
                    size={16}
                    className="mt-0.5 shrink-0 text-[color:var(--faint)]"
                  />
                  <textarea
                    id="description"
                    name="description"
                    placeholder="What does this department do?"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    maxLength={200}
                    className="min-w-0 flex-1 resize-none bg-transparent text-sm leading-relaxed text-[color:var(--text)] outline-none placeholder:text-[color:var(--faint)]"
                  />
                </div>
                <p className="mt-1 text-right text-[11px] text-[color:var(--faint)]">
                  {formData.description.length}/200
                </p>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={creatingDepartment}
                whileHover={{ y: creatingDepartment ? 0 : -1 }}
                whileTap={{ scale: creatingDepartment ? 1 : 0.98 }}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--soft)] transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                {creatingDepartment ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create department
                  </>
                )}
              </motion.button>
            </form>
          </motion.section>

          {/* ============ Department list ============ */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={`${surface} p-4 sm:p-5 lg:col-span-3`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Existing departments</h2>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  {filteredDepartments.length === safeDepartments.length
                    ? `${safeDepartments.length} department${
                        safeDepartments.length !== 1 ? "s" : ""
                      }`
                    : `${filteredDepartments.length} of ${safeDepartments.length} shown`}
                </p>
              </div>

              <motion.button
                type="button"
                onClick={fetchDepartments}
                disabled={fetchingDepartments}
                whileTap={{ scale: 0.92 }}
                title="Refresh departments"
                aria-label="Refresh departments"
                className="rounded-xl border border-[color:var(--border)] bg-[var(--card2)] p-2.5 text-[color:var(--muted)] transition-colors hover:text-[color:var(--text)] disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={fetchingDepartments ? "animate-spin" : ""}
                />
              </motion.button>
            </div>

            {/* Search */}
            <div className={`${fieldWrap} mb-2.5 !py-2`}>
              <Search size={16} className="shrink-0 text-[color:var(--faint)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search departments or companies"
                className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--text)] outline-none placeholder:text-[color:var(--faint)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="text-[color:var(--faint)] hover:text-[color:var(--text)]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Company filter chips */}
            {safeCompanies.length > 0 && (
              <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[{ _id: "all", companyName: "All" }, ...safeCompanies].map(
                  (c) => {
                    const active = companyFilter === c._id;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => setCompanyFilter(c._id)}
                        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                          active
                            ? "border-transparent bg-[var(--accent)] text-white shadow-md shadow-[color:var(--soft)]"
                            : "border-[color:var(--border)] bg-[var(--card2)] text-[color:var(--muted)] hover:text-[color:var(--text)]"
                        }`}
                      >
                        {c.companyName}
                      </button>
                    );
                  }
                )}
              </div>
            )}

            {/* List states */}
            {fetchingDepartments && safeDepartments.length === 0 ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[88px] animate-pulse rounded-xl border border-[color:var(--border)] bg-[var(--card2)]"
                  />
                ))}
              </div>
            ) : filteredDepartments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center rounded-xl border border-dashed border-[color:var(--border)] px-4 py-8 text-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--soft)]">
                  <Briefcase size={22} className="text-[color:var(--accent)]" />
                </div>
                <p className="text-sm font-semibold !text-[color:var(--text)]">
                  {safeDepartments.length === 0
                    ? "No departments yet"
                    : "No matching departments"}
                </p>
                <p className="mt-1 max-w-xs text-xs text-[color:var(--muted)]">
                  {safeDepartments.length === 0
                    ? "Use the form to create your first department."
                    : "Try a different search or pick another company."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {filteredDepartments.map((department, index) => (
                    <motion.article
                      layout
                      key={department._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
                      whileHover={{ y: -3 }}
                      className="group relative flex flex-col gap-2 rounded-xl border border-[color:var(--border)] bg-[var(--card2)] p-3.5 transition-colors duration-300 hover:border-[color:var(--accent)] hover:shadow-[0_16px_36px_-20px_var(--accent)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] text-sm font-bold text-white">
                            {department.departmentName?.[0]?.toUpperCase() || "D"}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-semibold !text-[color:var(--text)]"
                              title={department.departmentName}
                            >
                              {department.departmentName}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[color:var(--accent)]">
                              <Building2 size={11} className="shrink-0" />
                              <span className="truncate">
                                {department.companyId?.companyName ||
                                  "Company not found"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(department)}
                          title="Delete department"
                          aria-label={`Delete ${department.departmentName}`}
                          className="shrink-0 rounded-lg p-1.5 text-[color:var(--faint)] transition-colors hover:bg-red-500/10 hover:text-[color:var(--danger)] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {department.description ? (
                        <p className="line-clamp-2 text-xs leading-relaxed text-[color:var(--muted)]">
                          {department.description}
                        </p>
                      ) : (
                        <p className="text-xs italic text-[color:var(--faint)]">
                          No description
                        </p>
                      )}
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.section>
        </div>
      </div>

      {/* ============ Delete confirm modal ============ */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setDeleteTarget(null)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={THEMES[theme].vars}
              className={`${surface} w-full max-w-sm p-6`}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2 size={20} className="text-[color:var(--danger)]" />
              </div>
              <h3 className="text-base font-semibold text-[color:var(--text)]">
                Delete department?
              </h3>
              <p className="mt-1.5 text-sm text-[color:var(--muted)]">
                “{deleteTarget.departmentName}” will be permanently removed.
                This can’t be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl border border-[color:var(--border)] bg-[var(--card2)] py-2.5 text-sm font-medium text-[color:var(--text)] transition-colors hover:border-[color:var(--faint)] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={confirmDelete}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-70"
                >
                  {deleting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            style={THEMES[theme].vars}
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
            <span className="flex-1 text-[color:var(--text)]">
              {toast.message}
            </span>
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

export default CreateDepartment;