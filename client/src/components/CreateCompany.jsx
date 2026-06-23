import { useState } from "react";
import axios from "axios";
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
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const completion = Math.round(
    (completionFields.filter((f) => formData[f]?.toString().trim()).length / completionFields.length) * 100
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setLogoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const createCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const companyData = new FormData();
      Object.keys(formData).forEach((key) => companyData.append(key, formData[key]));

      const response = await axios.post("http://localhost:5000/api/companies", companyData, {
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
          industry: "", address: "", logo: null,
        });
        setLogoPreview(null);
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
    <div className="min-h-screen bg-[#0f0f13] text-white flex items-start justify-center py-12 px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-xs font-medium tracking-wider uppercase">Company Registration</span>
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Create New Company
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Fill in the details below to register your organization.</p>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-500">Profile completion</span>
              <span className="text-xs font-semibold text-violet-400">{completion}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
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
                  className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
                >
                  {/* Group header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center`}>
                      <GroupIcon size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300">{group.label}</span>
                  </div>

                  <div className="p-5 grid grid-cols-2 gap-4">
                    {group.fields.map((fieldKey) => {
                      const meta = FIELD_META[fieldKey];
                      const Icon = meta.icon;

                      if (meta.type === "select") {
                        return (
                          <div key={fieldKey} className={meta.span === 2 ? "col-span-2" : "col-span-1"}>
                            <FormControl fullWidth size="small"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  color: "white",
                                  backgroundColor: "rgba(255,255,255,0.04)",
                                  borderRadius: "10px",
                                  fontSize: "0.875rem",
                                  "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                                  "&:hover fieldset": { borderColor: "rgba(139,92,246,0.5)" },
                                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                                },
                                "& .MuiInputLabel-root": { color: "rgba(156,163,175,1)", fontSize: "0.875rem" },
                                "& .MuiInputLabel-root.Mui-focused": { color: "#a78bfa" },
                                "& .MuiSvgIcon-root": { color: "rgba(156,163,175,0.8)" },
                              }}
                            >
                              <InputLabel>{meta.label}</InputLabel>
                              <Select
                                name={fieldKey}
                                value={formData[fieldKey]}
                                onChange={handleChange}
                                label={meta.label}
                                MenuProps={{
                                  PaperProps: {
                                    sx: {
                                      bgcolor: "#1a1a24",
                                      border: "1px solid rgba(255,255,255,0.08)",
                                      borderRadius: "12px",
                                      "& .MuiMenuItem-root": {
                                        color: "rgba(229,231,235,1)",
                                        fontSize: "0.875rem",
                                        "&:hover": { bgcolor: "rgba(124,58,237,0.2)" },
                                        "&.Mui-selected": { bgcolor: "rgba(124,58,237,0.3)" },
                                      },
                                    },
                                  },
                                }}
                              >
                                {COMPANY_TYPES.map((t) => (
                                  <MenuItem key={t} value={t}>{t}</MenuItem>
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
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Upload size={14} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-300">Company Logo</span>
                <span className="text-xs text-gray-600 ml-auto">Optional</span>
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
                        className="flex items-center gap-4 p-3 bg-white/[0.04] rounded-xl border border-white/[0.08]"
                      >
                        <img src={logoPreview} alt="Logo preview"
                          className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                        <div>
                          <p className="text-sm font-medium text-gray-200">{formData.logo?.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Click to change logo</p>
                        </div>
                        <Chip
                          label="Uploaded"
                          size="small"
                          sx={{
                            ml: "auto",
                            bgcolor: "rgba(16,185,129,0.15)",
                            color: "#34d399",
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
                        className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/[0.08] rounded-xl group-hover:border-violet-500/40 group-hover:bg-violet-500/5 transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-violet-500/10 transition-colors">
                          <Upload size={18} className="text-gray-500 group-hover:text-violet-400 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                          Drop your logo here, or <span className="text-violet-400 underline underline-offset-2">browse</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-1">PNG, JPG, SVG up to 5MB</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              className="relative w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide overflow-hidden disabled:cursor-not-allowed transition-all duration-200"
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

// Shared MUI TextField sx
const muiFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: "10px",
    fontSize: "0.875rem",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(139,92,246,0.5)" },
    "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
  },
  "& .MuiInputLabel-root": { color: "rgba(156,163,175,1)", fontSize: "0.875rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#a78bfa" },
  "& textarea": { color: "white" },
};