import { useEffect, useState } from "react";
import api from "../services/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Briefcase, FileText, ChevronDown, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const CreateDepartment = () => {
  const [companies, setCompanies] = useState([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const [formData, setFormData] = useState({
    departmentName: "",
    companyId: "",
    description: "",
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/companies");
        setCompanies(res.data.companies || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectCompany = (id) => {
    setFormData((prev) => ({ ...prev, companyId: id }));
    setIsSelectOpen(false);
  };

  const selectedCompany = companies.find((c) => c._id === formData.companyId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await api.post("/departments", formData);
      setStatus("success");
      setStatusMessage(res.data.message);
      setFormData({ departmentName: "", companyId: "", description: "" });
      setTimeout(() => setStatus(null), 3500);
    } catch (error) {
      setStatus("error");
      setStatusMessage(error.response?.data?.message || "Something went wrong");
      setTimeout(() => setStatus(null), 3500);
    }
  };

  const fieldVariants = {
    rest: { scale: 1 },
    focused: { scale: 1.005 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 font-sans">

      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg"
      >
        {/* Card */}
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25">
                <Building2 size={18} className="text-indigo-400" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400/80">
                Organization
              </span>
            </div>
            <h1 className="text-2xl font-bold !bg-gradient-to-r !from-[#de086c] !via-[#640361] !to-[#ffd500] bg-clip-text !text-blue-400  mt-3 tracking-tight">
              New Department
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Add a department and link it to a company.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mx-8 bg-white/[0.06]" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

            {/* Department Name */}
            <motion.div
              variants={fieldVariants}
              animate={focusedField === "departmentName" ? "focused" : "rest"}
              transition={{ duration: 0.15 }}
            >
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Department Name
              </label>
              <div className={`flex items-center gap-3 bg-slate-800/60 border rounded-xl px-4 py-3 transition-all duration-200 ${
                focusedField === "departmentName"
                  ? "border-indigo-500/60 ring-1 ring-indigo-500/20 bg-slate-800/80"
                  : "border-white/[0.08] hover:border-white/[0.14]"
              }`}>
                <Briefcase size={16} className={`flex-shrink-0 transition-colors duration-200 ${focusedField === "departmentName" ? "text-indigo-400" : "text-slate-500"}`} />
                <input
                  type="text"
                  name="departmentName"
                  placeholder="e.g. Engineering, Marketing…"
                  value={formData.departmentName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("departmentName")}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </motion.div>

            {/* Company Select */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Company
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSelectOpen((v) => !v)}
                  className={`w-full flex items-center gap-3 bg-slate-800/60 border rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                    isSelectOpen
                      ? "border-indigo-500/60 ring-1 ring-indigo-500/20 bg-slate-800/80"
                      : "border-white/[0.08] hover:border-white/[0.14]"
                  }`}
                >
                  <Building2 size={16} className={`flex-shrink-0 transition-colors duration-200 ${isSelectOpen ? "text-indigo-400" : "text-slate-500"}`} />
                  <span className={`flex-1 text-sm ${selectedCompany ? "text-white" : "text-slate-500"}`}>
                    {selectedCompany ? selectedCompany.companyName : "Select a company"}
                  </span>
                  <motion.div animate={{ rotate: isSelectOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={15} className="text-slate-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isSelectOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 top-full mt-2 w-full bg-slate-800 border border-white/[0.1] rounded-xl shadow-xl overflow-hidden"
                    >
                      {companies.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">No companies found</div>
                      ) : (
                        companies.map((company, i) => (
                          <motion.button
                            key={company._id}
                            type="button"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => handleSelectCompany(company._id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-indigo-500/10 ${
                              formData.companyId === company._id ? "text-indigo-300 bg-indigo-500/10" : "text-slate-200"
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${formData.companyId === company._id ? "bg-indigo-400" : "bg-slate-600"}`} />
                            {company.companyName}
                          </motion.button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Description */}
            <motion.div
              variants={fieldVariants}
              animate={focusedField === "description" ? "focused" : "rest"}
              transition={{ duration: 0.15 }}
            >
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Description
                <span className="ml-2 normal-case text-slate-600 tracking-normal font-normal">(optional)</span>
              </label>
              <div className={`flex gap-3 bg-slate-800/60 border rounded-xl px-4 py-3 transition-all duration-200 ${
                focusedField === "description"
                  ? "border-indigo-500/60 ring-1 ring-indigo-500/20 bg-slate-800/80"
                  : "border-white/[0.08] hover:border-white/[0.14]"
              }`}>
                <FileText size={16} className={`flex-shrink-0 mt-0.5 transition-colors duration-200 ${focusedField === "description" ? "text-indigo-400" : "text-slate-500"}`} />
                <textarea
                  name="description"
                  placeholder="What does this department do?"
                  value={formData.description}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none leading-relaxed"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ scale: status === "loading" ? 1 : 1.01 }}
              whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
              className="w-full relative flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-3.5 mt-2 transition-colors duration-200 overflow-hidden group"
            >
              {/* Shimmer */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Create Department
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {(status === "success" || status === "error") && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`mt-3 flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium ${
                status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                  : "bg-red-500/10 border-red-500/25 text-red-300"
              }`}
            >
              {status === "success"
                ? <CheckCircle2 size={16} className="flex-shrink-0" />
                : <AlertCircle size={16} className="flex-shrink-0" />}
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CreateDepartment;