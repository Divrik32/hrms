import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import api, { BACKEND_URL } from "../services/axios";
import toast from "react-hot-toast";

import {
  Building2,
  Upload,
  Loader2,
  Save,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Factory,
  MapPin,
  FileBadge2,
  Hash,
  Image as ImageIcon,
  PenTool,
  ShieldCheck,
} from "lucide-react";

export default function EditCompany() {
  const navigate = useNavigate();
  const { companyId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logoPreview, setLogoPreview] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    companyType: "",
    gstNumber: "",
    panNumber: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    address: "",
    status: "active",
    logo: null,
    signature: null,
  });

  const fetchCompany = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/companies/${companyId}`);

      if (!data.success) {
        toast.error("Company not found");
        navigate("/admin/company-management");
        return;
      }

      const company = data.company;

      setFormData({
        companyName: company.companyName || "",
        companyType: company.companyType || "",
        gstNumber: company.gstNumber || "",
        panNumber: company.panNumber || "",
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        industry: company.industry || "",
        address: company.address || "",
        status: company.status || "active",
        logo: null,
        signature: null,
      });

      if (company.logo) {
        setLogoPreview(`${BACKEND_URL}/uploads/${company.logo}`);
      }

      if (company.signature) {
        setSignaturePreview(`${BACKEND_URL}/uploads/${company.signature}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load company."
      );

      navigate("/admin/company-management");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (!files.length) return;

    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));

    if (name === "logo") {
      setLogoPreview(URL.createObjectURL(files[0]));
    }

    if (name === "signature") {
      setSignaturePreview(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          payload.append(key, formData[key]);
        }
      });

      const { data } = await api.put(`/companies/${companyId}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success("Company updated successfully");
        navigate("/admin/company-management");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update company."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm !text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

  const labelClass =
    "mb-2 flex items-center gap-2 text-sm font-semibold !text-slate-200";

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <motion.button
          type="button"
          onClick={() => navigate("/admin/company-management")}
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.94 }}
          className="group relative mb-5 flex h-10 items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-900/60 px-5 text-sm font-medium !text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-300/80 hover:!text-white"
        >
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full"
            variants={{
              rest: { boxShadow: "0 0 0px rgba(34,211,238,0)" },
              hover: {
                boxShadow: [
                  "0 0 0px rgba(34,211,238,0)",
                  "0 0 16px rgba(34,211,238,0.6)",
                  "0 0 3px rgba(34,211,238,0.25)",
                ],
                transition: { duration: 0.55, repeat: Infinity, ease: "easeInOut" },
              },
            }}
          />
          {/* <svg
            className="pointer-events-none absolute -bottom-[3px] left-0 h-3 w-full overflow-visible"
            viewBox="0 0 120 12"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,6 Q6,0 12,6 T24,6 T36,6 T48,6 T60,6 T72,6 T84,6 T96,6 T108,6 T120,6"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeLinecap="round"
              variants={{
                rest: { pathLength: 0, opacity: 0 },
                hover: {
                  pathLength: [0, 1],
                  opacity: [0, 1, 1, 0],
                  transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
                },
              }}
            />
          </svg> */}
          <ArrowLeft
            size={16}
            className="relative z-10 transition-transform duration-300 group-hover:-translate-x-0.5"
          />
          <span className="relative z-10">Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/40"
        >
          {/* Header — registry dossier plate */}
          <div className="relative border-b border-slate-800 px-6 py-7 sm:px-9">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 22px)",
              }}
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#C9A227]/30 bg-[#C9A227]/10 text-[#C9A227]">
                  <Building2 size={26} />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C9A227]/70">
                    Company Registry — Edit Mode
                  </p>
                  <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight !text-white sm:text-4xl">
                    {formData.companyName || "Edit Company"}
                  </h1>
                </div>
              </div>

              {/* Status seal */}
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed ${
                    formData.status === "active"
                      ? "border-emerald-500/50 text-emerald-400"
                      : "border-rose-500/50 text-rose-400"
                  }`}
                >
                  {formData.status === "active" ? (
                    <ShieldCheck size={22} />
                  ) : (
                    <ShieldCheck size={22} className="opacity-40" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-widest ${
                    formData.status === "active"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {formData.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-5 sm:p-8">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid gap-5 sm:grid-cols-2"
            >
              <div>
                <label className={labelClass}>
                  <Building2 size={16} className="text-cyan-400" />
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Factory size={16} className="text-cyan-400" />
                  Company Type
                </label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleChange}
                  className={fieldClass}
                >
                  <option className="bg-slate-800">Private Limited</option>
                  <option className="bg-slate-800">Public Limited</option>
                  <option className="bg-slate-800">LLP</option>
                  <option className="bg-slate-800">Partnership</option>
                  <option className="bg-slate-800">Proprietorship</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  <Hash size={16} className="text-cyan-400" />
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <FileBadge2 size={16} className="text-cyan-400" />
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Mail size={16} className="text-cyan-400" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Phone size={16} className="text-cyan-400" />
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Globe size={16} className="text-cyan-400" />
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Factory size={16} className="text-cyan-400" />
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className={labelClass}>
                <MapPin size={16} className="text-cyan-400" />
                Address
              </label>
              <textarea
                rows={4}
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`${fieldClass} resize-none`}
              />
            </motion.div>

            {/* Logo & Signature */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid gap-6 sm:grid-cols-2"
            >
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                <label className={labelClass}>
                  <ImageIcon size={16} className="text-cyan-400" />
                  Company Logo
                </label>

                <AnimatePresence mode="wait">
                  {logoPreview && (
                    <motion.img
                      key={logoPreview}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={logoPreview}
                      alt=""
                      className="mb-4 h-24 rounded-lg border border-slate-700 bg-white object-contain p-2"
                    />
                  )}
                </AnimatePresence>

                <label
                  htmlFor="logo-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium !text-slate-300 transition hover:border-cyan-400/60 hover:!text-white"
                >
                  <Upload size={16} className="text-cyan-400" />
                  Choose logo file
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                <label className={labelClass}>
                  <PenTool size={16} className="text-cyan-400" />
                  Signature
                </label>

                <AnimatePresence mode="wait">
                  {signaturePreview && (
                    <motion.img
                      key={signaturePreview}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={signaturePreview}
                      alt=""
                      className="mb-4 h-20 rounded-lg border border-slate-700 bg-white object-contain p-2"
                    />
                  )}
                </AnimatePresence>

                <label
                  htmlFor="signature-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium !text-slate-300 transition hover:border-cyan-400/60 hover:!text-white"
                >
                  <Upload size={16} className="text-cyan-400" />
                  Choose signature file
                </label>
                <input
                  id="signature-upload"
                  type="file"
                  name="signature"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </motion.div>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className={labelClass}>
                <ShieldCheck size={16} className="text-cyan-400" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="active" className="bg-slate-800">
                  Active
                </option>
                <option value="inactive" className="bg-slate-800">
                  Inactive
                </option>
              </select>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end"
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/admin/company-management")}
                className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-semibold !text-slate-200 transition hover:bg-slate-700"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-3 font-semibold !text-white shadow-lg shadow-indigo-950/40 transition hover:from-indigo-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Update Company
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}