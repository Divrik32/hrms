import { useEffect, useState } from "react";
import api from "../services/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  FileText,
  Mail,
  Phone,
  Globe,
  Briefcase,
  MapPin,
  Upload,
  CheckCircle2,
  X,
  ChevronDown,
  Landmark,
  Sun,
  Moon,
  MonitorCog,
  Check,
} from "lucide-react";
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  LinearProgress,
  Chip,
} from "@mui/material";
import toast from "react-hot-toast";


/* =========================================================
   THEMES
   Dark & Midnight keep the original text colours / sizes.
   Only backgrounds are softened. Light needs dark text.
========================================================= */

const DARK_TEXT = {
  rootText: "text-white",
  sub: "text-white",
  faint: "text-white",
  title: "text-white",
  fileName: "text-white",
  mid: "text-white",
  dropText: "text-white group-hover:text-white",
  dropIcon: "text-white group-hover:text-white",
  accent: "text-white",
  badge: "bg-violet-500/10 border-violet-500/20",
  badgeText: "text-white",
  badgeDot: "bg-violet-400",
  track: "bg-white/15",
  divider: "border-white/20",
  fileRow: "bg-black/20 border-white/25",
  dropBorder: "border-white/30",
  dropzone: "group-hover:border-violet-500/40 group-hover:bg-violet-500/5",
  dropIconWrap: "bg-white/10 group-hover:bg-violet-500/20",
  titleColors: ["#01c875", "#03e712", "#04e13f"],
  chipText: "#ffffff",
  switchBtn: "bg-slate-900/40 hover:bg-slate-700/50 border-white/10 text-white",
  switchMenu: "bg-[#1f2b48] border-white/10",
  switchItemText: "text-white",
  switchIcon: "text-indigo-300",
  input: {
    text: "#ffffff",
    bg: "rgba(0,0,0,0.25)",
    border: "rgba(255,255,255,0.4)",
    hover: "rgba(167,139,250,0.9)",
    focus: "#a78bfa",
    label: "#e2e8f0",          // brighter label (was dim grey)
    labelFocus: "#c4b5fd",
    placeholder: "#b8c4dc",    // grey-blue: visible, but different from typed white text
    asterisk: "#fca5a5",       // soft red for required *
    icon: "#ffffff",
  },
  menuText: "#ffffff",
};

const THEMES = {
  dark: {
    ...DARK_TEXT,
    name: "Dark",
    icon: Moon,
    page: "bg-[#243050]",
    glowA: "hidden",
    glowB: "hidden",
    card: "bg-[#35456b] border-white/25 shadow-lg shadow-black/25",
    menuBg: "#35456b",
  },

  midnight: {
    ...DARK_TEXT,
    name: "Midnight",
    icon: MonitorCog,
    page: "bg-[#1c2559]",
    glowA: "hidden",
    glowB: "hidden",
    card: "bg-[#2c3878] border-indigo-300/40 shadow-lg shadow-black/25",
    divider: "border-indigo-300/25",
    fileRow: "bg-black/20 border-indigo-300/30",
    switchMenu: "bg-[#151b45] border-indigo-300/20",
    menuBg: "#2c3878",
  },

  light: {
    name: "Light",
    icon: Sun,
    rootText: "text-black",
    page: "bg-slate-200",
    glowA: "hidden",
    glowB: "hidden",
    card: "bg-white border-slate-300 shadow-md",
    sub: "text-black",
    faint: "text-black",
    title: "text-black",
    fileName: "text-black",
    mid: "text-black",
    dropText: "text-black group-hover:text-black",
    dropIcon: "text-black group-hover:text-black",
    accent: "text-black",
    badge: "bg-violet-100 border-violet-200",
    badgeText: "text-black",
    badgeDot: "bg-violet-500",
    track: "bg-slate-200",
    divider: "border-slate-300",
    fileRow: "bg-slate-50 border-slate-200",
    dropBorder: "border-slate-400",
    dropzone: "group-hover:border-violet-400 group-hover:bg-violet-50",
    dropIconWrap: "bg-slate-100 group-hover:bg-violet-100",
    titleColors: ["#059669", "#16a34a", "#15803d"],
    chipText: "#000000",
    switchBtn: "bg-white hover:bg-slate-50 border-slate-200 text-black",
    switchMenu: "bg-white border-slate-200",
    switchItemText: "text-black",
    switchIcon: "text-amber-500",
    input: {
      text: "#000000",
      bg: "#f8fafc",
      border: "rgba(0,0,0,0.4)",
      hover: "rgba(109,40,217,0.6)",
      focus: "#7c3aed",
      label: "#374151",         // darker label (was light grey)
      labelFocus: "#6d28d9",
      placeholder: "#6b7280",   // mid grey: clearly lighter than typed black text, still readable
      asterisk: "#dc2626",
      icon: "#000000",
    },
    menuBg: "#ffffff",
    menuText: "#000000",
  },
};


const COMPANY_TYPES = [
  "Private Limited",
  "Public Limited",
  "LLP",
  "Partnership",
  "Proprietorship",
];

const FIELD_GROUPS = [
  {
    label: "Company Identity",
    icon: Building2,
    color: "from-violet-500 to-purple-600",
    fields: ["companyName", "companyType", "industry"],
  },
  {
    label: "Tax & Legal",
    icon: Landmark,
    color: "from-blue-500 to-cyan-500",
    fields: ["gstNumber", "panNumber"],
  },
  {
    label: "Contact",
    icon: Phone,
    color: "from-emerald-500 to-teal-500",
    fields: ["email", "phone", "website"],
  },
  {
    label: "Location",
    icon: MapPin,
    color: "from-orange-500 to-amber-500",
    fields: ["address"],
  },
];

const FIELD_META = {
  companyName: { label: "Company Name", icon: Building2, type: "text", required: true, span: 2 },
  companyType: { label: "Company Type", icon: Briefcase, type: "select", span: 1 },
  industry: { label: "Industry", icon: Briefcase, type: "text", span: 1 },
  gstNumber: { label: "GST Number", icon: FileText, type: "text", span: 1, placeholder: "22AAAAA0000A1Z5" },
  panNumber: { label: "PAN Number", icon: FileText, type: "text", span: 1, placeholder: "ABCDE1234F" },
  email: { label: "Company Email", icon: Mail, type: "email", required: true, span: 1 },
  phone: { label: "Phone Number", icon: Phone, type: "text", required: true, span: 1 },
  website: { label: "Website", icon: Globe, type: "text", span: 2, placeholder: "https://yourcompany.com" },
  address: { label: "Registered Address", icon: MapPin, type: "textarea", required: true, span: 2 },
};

const completionFields = ["companyName", "email", "phone", "address", "gstNumber", "panNumber", "industry", "website"];

/* Theme switcher (sits inside the page, below the app top bar) */

const ThemeSwitcher = ({ currentTheme, setCurrentTheme, t }) => {
  const [open, setOpen] = useState(false);
  const CurrentIcon = THEMES[currentTheme].icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${t.switchBtn}`}
      >
        <CurrentIcon className={`w-4 h-4 ${t.switchIcon}`} />
        {THEMES[currentTheme].name}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className={`absolute right-0 top-11 z-50 w-40 rounded-xl border p-2 shadow-2xl ${t.switchMenu}`}>
            {Object.entries(THEMES).map(([key, item]) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setCurrentTheme(key);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentTheme === key ? "bg-violet-500/15" : "hover:bg-slate-500/10"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${key === "light" ? "text-amber-500" : t.switchIcon}`} />
                  <span className={`flex-1 text-left text-xs font-semibold ${t.switchItemText}`}>
                    {item.name}
                  </span>
                  {currentTheme === key && <Check className="w-4 h-4 text-violet-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default function CreateCompany() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyType: "Private Limited",
    gstNumber: "",
    panNumber: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    address: "",
    logo: null,
    signature: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [ signaturePreview, setSignaturePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("superAdminTheme") || "dark"
  );

  const t = THEMES[currentTheme] || THEMES.dark;
  const muiFieldSx = buildFieldSx(t);

  useEffect(() => {
    localStorage.setItem("superAdminTheme", currentTheme);
  }, [currentTheme]);

  const completion = Math.round(
    (completionFields.filter((f) => formData[f]?.toString().trim()).length / completionFields.length) * 100
  );

const handleChange = (e) => {
  const { name, value, files } = e.target;

  // File input
  if (files && files.length > 0) {
    const file = files[0];

    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

    if (name === "logo") {
      setLogoPreview(URL.createObjectURL(file));
    }

    if (name === "signature") {
      setSignaturePreview(URL.createObjectURL(file));
    }

    return;
  }

  // TextField / Select
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const createCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const companyData = new FormData();
      Object.keys(formData).forEach((key) => companyData.append(key, formData[key]));

      const response = await api.post("/companies", companyData, {
        withCredentials: true,
        headers: {"Content-Type": "multipart/form-data" },
      });

      setSnackbar({ open: true, message: response.data.message, severity: "success" });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          companyName: "", companyType: "Private Limited", gstNumber: "",
          panNumber: "", email: "", phone: "", website: "",
          industry: "", address: "", logo: null, signature: null,
        });
        setLogoPreview(null); setSignaturePreview(null);
      }, 2200);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Something went wrong",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${t.page} ${t.rootText} flex items-start justify-center py-6 px-4 transition-colors duration-300`}
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full ${t.glowA} blur-[120px]`} />
        <div className={`absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full ${t.glowB} blur-[100px]`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className={`inline-flex items-center gap-2 border rounded-full px-4 py-1.5 ${t.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${t.badgeDot}`} />
            <span className={`${t.badgeText} text-xs font-medium tracking-wider uppercase`}>Company Registration</span>
          </motion.div>

          <ThemeSwitcher
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            t={t}
          />
          </div>

          <h1
            className="text-4xl font-bold tracking-tight"
            style={{
              backgroundColor: "transparent",
              backgroundImage: `linear-gradient(to right, ${t.titleColors.join(", ")})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Create New Company
          </h1>
          <p className={`${t.sub} mt-2 text-sm`}>Fill in the details below to register your organization.</p>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs ${t.sub}`}>Profile completion</span>
              <span className={`text-xs font-semibold ${t.accent}`}>{completion}%</span>
            </div>
            <div className={`h-1 ${t.track} rounded-full overflow-hidden`}>
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={createCompany}>
          <div className="space-y-6">
            {FIELD_GROUPS.map((group, gi) => {
              const GroupIcon = group.icon;
              return (
                <motion.div
                  key={group.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + gi * 0.08 }}
                  className={`${t.card} border rounded-2xl overflow-hidden`}
                >
                  {/* Group header */}
                  <div className={`flex items-center gap-3 px-5 py-4 border-b ${t.divider}`}>
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center`}>
                      <GroupIcon size={14} className="text-white" />
                    </div>
                    <span className={`text-sm font-semibold ${t.title}`}>{group.label}</span>
                  </div>

                  <div className="p-5 grid grid-cols-2 gap-4">
                    {group.fields.map((fieldKey) => {
                      const meta = FIELD_META[fieldKey];
                      const Icon = meta.icon;

                      if (meta.type === "select") {
                        return (
                          <div key={fieldKey} className={meta.span === 2 ? "col-span-2" : "col-span-1"}>
                            <FormControl fullWidth size="small" sx={muiFieldSx}>
                              <InputLabel>{meta.label}</InputLabel>
                              <Select
                                name={fieldKey}
                                value={formData[fieldKey]}
                                onChange={handleChange}
                                label={meta.label}
                                MenuProps={{
                                  PaperProps: {
                                    sx: {
                                      bgcolor: t.menuBg,
                                      border: currentTheme === "light"
                                        ? "1px solid rgba(0,0,0,0.12)"
                                        : "1px solid rgba(255,255,255,0.08)",
                                      borderRadius: "12px",
                                      "& .MuiMenuItem-root": {
                                        color: t.menuText,
                                        fontSize: "0.875rem",
                                        "&:hover": { bgcolor: "rgba(124,58,237,0.2)" },
                                        "&.Mui-selected": { bgcolor: "rgba(124,58,237,0.3)" },
                                      },
                                    },
                                  },
                                }}
                              >
                                {COMPANY_TYPES.map((type) => (
                                  <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        );
                      }

                      if (meta.type === "textarea") {
                        return (
                          <div key={fieldKey} className={meta.span === 2 ? "col-span-2" : "col-span-1"}>
                            <TextField
                              multiline
                              rows={3}
                              fullWidth
                              size="small"
                              name={fieldKey}
                              label={meta.label}
                              value={formData[fieldKey]}
                              onChange={handleChange}
                              required={meta.required}
                              placeholder={meta.placeholder}
                              InputLabelProps={meta.placeholder ? { shrink: true } : undefined}
                              sx={muiFieldSx}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={fieldKey} className={meta.span === 2 ? "col-span-2" : "col-span-1"}>
                          <TextField
                            fullWidth
                            size="small"
                            type={meta.type}
                            name={fieldKey}
                            label={meta.label}
                            value={formData[fieldKey]}
                            onChange={handleChange}
                            required={meta.required}
                            placeholder={meta.placeholder}
                            InputLabelProps={meta.placeholder ? { shrink: true } : undefined}
                            sx={muiFieldSx}
                          />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Logo Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className={`${t.card} border rounded-2xl overflow-hidden`}
            >
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${t.divider}`}>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Upload size={14} className="text-white" />
                </div>
                <span className={`text-sm font-semibold ${t.title}`}>Company Logo</span>
                <span className={`text-xs ${t.faint} ml-auto`}>Optional</span>
              </div>

              <div className="p-5">
                <label className="block cursor-pointer group">
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <AnimatePresence mode="wait">
                    {logoPreview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-center gap-4 p-3 ${t.fileRow} rounded-xl border`}
                      >
                        <img src={logoPreview} alt="Logo preview"
                          className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                        <div>
                          <p className={`text-sm font-medium ${t.fileName}`}>{formData.logo?.name}</p>
                          <p className={`text-xs ${t.sub} mt-0.5`}>Click to change logo</p>
                        </div>
                        <Chip
                          label="Uploaded"
                          size="small"
                          sx={{
                            ml: "auto",
                            bgcolor: "rgba(16,185,129,0.15)",
                            color: t.chipText,
                            border: "1px solid rgba(16,185,129,0.3)",
                            fontSize: "0.7rem",
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`flex flex-col items-center justify-center py-8 border-2 border-dashed ${t.dropBorder} rounded-xl ${t.dropzone} transition-all duration-300`}
                      >
                        <div className={`w-10 h-10 rounded-full ${t.dropIconWrap} flex items-center justify-center mb-3 transition-colors`}>
                          <Upload size={18} className={`${t.dropIcon} transition-colors`} />
                        </div>
                        <p className={`text-sm ${t.dropText} transition-colors`}>
                          Drop your logo here, or <span className={`${t.accent} underline underline-offset-2`}>browse</span>
                        </p>
                        <p className={`text-xs ${t.faint} mt-1`}>PNG, JPG, SVG up to 5MB</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </label>
              </div>
            </motion.div>

            {/* Signeture Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${t.card} border rounded-2xl overflow-hidden`}
            >
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${t.divider}`}>

                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Upload
                    size={14}
                    className="text-white"
                  />
                </div>

                <span className={`text-sm font-semibold ${t.title}`}>
                  Authorized Signature
                </span>

                <span className={`text-xs ${t.faint} ml-auto`}>
                  Optional
                </span>

              </div>

              <div className="p-5">

                <label className="block cursor-pointer">

                  <input
                    type="file"
                    name="signature"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />

                  {signaturePreview ? (

                    <div className={`flex items-center gap-4 p-3 ${t.fileRow} rounded-xl border`}>

                      <img
                        src={signaturePreview}
                        alt="Signature"
                        className="h-16 object-contain"
                      />

                      <div>

                        <p className={`text-sm font-medium ${t.fileName}`}>
                          {formData.signature?.name}
                        </p>

                        <p className={`text-xs ${t.sub}`}>
                          Click to change signature
                        </p>

                      </div>

                    </div>

                  ) : (

                    <div className={`flex flex-col items-center justify-center py-8 border-2 border-dashed ${t.dropBorder} rounded-xl`}>

                      <Upload className={`mb-3 ${t.sub}`} />

                      <p className={`text-sm ${t.mid}`}>
                        Upload Authorized Signature
                      </p>

                    </div>

                  )}

                </label>

              </div>
            </motion.div>
          </div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-6"
          >
            {loading && (
              <LinearProgress
                sx={{
                  mb: 3, borderRadius: 4, bgcolor: "rgba(255,255,255,0.05)",
                  "& .MuiLinearProgress-bar": { background: "linear-gradient(to right, #7c3aed, #06b6d4)" },
                }}
              />
            )}

            <motion.button
              type="submit"
              disabled={loading || submitted}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="relative w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide overflow-hidden disabled:cursor-not-allowed transition-all duration-200 text-white"
              style={{
                background: submitted
                  ? "linear-gradient(135deg, #059669, #10b981)"
                  : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: submitted
                  ? "0 0 30px rgba(16,185,129,0.25)"
                  : "0 0 30px rgba(124,58,237,0.3)",
              }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Company Created!
                  </motion.span>
                ) : loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering Company...
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Building2 size={16} />
                    Register Company
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{
            bgcolor: snackbar.severity === "success" ? "rgba(5,150,105,0.95)" : "rgba(220,38,38,0.95)",
            color: "white",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            "& .MuiAlert-icon": { color: "white" },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

// Shared MUI field sx (built from the active theme)
const buildFieldSx = (t) => ({
  "& .MuiOutlinedInput-root": {
    color: t.input.text,
    backgroundColor: t.input.bg,
    borderRadius: "10px",
    fontSize: "0.875rem",
    "& fieldset": { borderColor: t.input.border },
    "&:hover fieldset": { borderColor: t.input.hover },
    "&.Mui-focused fieldset": { borderColor: t.input.focus },
  },
  "& .MuiInputLabel-root": { color: t.input.label, fontSize: "0.875rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: t.input.labelFocus },
  "& .MuiSvgIcon-root": { color: t.input.icon },
  "& textarea": { color: t.input.text },

  // Placeholder: visible grey-blue (dark themes) / mid grey (light).
  // opacity: 1 turns off MUI's default 0.42 fade.
  "& input::placeholder, & textarea::placeholder": {
    color: t.input.placeholder,
    opacity: 1,
  },

  // Required asterisk (*) colour
  "& .MuiFormLabel-asterisk": { color: t.input.asterisk },
});