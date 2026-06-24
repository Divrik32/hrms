import { useEffect, useState } from "react";
import api from "../services/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, IndianRupee, Building2, CheckCircle2, Loader2, Sparkles } from "lucide-react";

const fieldConfig = [
  { name: "inHandSalary", label: "In-Hand Salary", placeholder: "e.g. 50000" },
  { name: "pf",           label: "Provident Fund (PF)", placeholder: "e.g. 1800" },
  { name: "esi",          label: "ESI",           placeholder: "e.g. 750" },
  { name: "tax",          label: "Tax Deduction", placeholder: "e.g. 2000" },
];

const inputVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" } }),
};

const CreateEmployeeSalary = () => {
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    companyId: "",
    employeeId: "",
    inHandSalary: "",
    pf: "",
    esi: "",
    tax: "",
  });

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data.companies);
    } catch (error) { console.log(error); }
  };

  const fetchEmployeesByCompany = async (companyId) => {
    try {
      const res = await api.get(`/employees/company/${companyId}`);
      setEmployees(res.data.employees);
    } catch (error) { console.log(error); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "companyId") {
      setFormData((prev) => ({ ...prev, companyId: value, employeeId: "" }));
      fetchEmployeesByCompany(value);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inHandSalary = Number(formData.inHandSalary || 0);
  const ctc = inHandSalary + Number(formData.pf || 0) + Number(formData.esi || 0) + Number(formData.tax || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post(
        "/payroll/create-salary-structure",
        { ...formData, ctc },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
      setFormData({ companyId: "", employeeId: "", inHandSalary: "", pf: "", esi: "", tax: "" });
      setEmployees([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const completionPercent = Math.round(
    (Object.values(formData).filter(Boolean).length / Object.keys(formData).length) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-3xl"
      >
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 shadow-xl shadow-blue-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white/20 rounded-xl p-2.5">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Create Salary Structure</h1>
              <p className="text-blue-100 text-sm mt-0.5">Set up a new employee compensation package</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-blue-100 text-xs font-medium">Form completion</span>
              <span className="text-white text-xs font-semibold">{completionPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 overflow-hidden"
        >
          <form onSubmit={handleSubmit}>
            {/* Section: Assignment */}
            <div className="px-6 pt-6 pb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Assignment</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company */}
                <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Company</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select company…</option>
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>{c.companyName}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>

                {/* Employee */}
                <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Employee</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                      disabled={!formData.companyId}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select employee…</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.empId})</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="mx-6 border-t border-dashed border-slate-100" />

            {/* Section: Compensation */}
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Compensation Breakdown</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldConfig.map(({ name, label, placeholder }, i) => (
                  <motion.div key={name} custom={i + 2} variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mx-6 border-t border-dashed border-slate-100" />

            {/* CTC Summary */}
            <div className="px-6 py-4">
              <motion.div
                animate={{ scale: ctc > 0 ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-5 py-4"
              >
                <div>
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Total CTC</p>
                  <p className="text-xs text-slate-400 mt-0.5">Cost to Company (annual)</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-700">
                    ₹{ctc.toLocaleString("en-IN")}
                  </p>
                  {ctc > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      ≈ ₹{Math.round(ctc).toLocaleString("en-IN")}/mo
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Submit */}
            <div className="px-6 pb-6">
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Saving structure…
                    </motion.span>
                  ) : submitted ? (
                    <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <CheckCircle2 size={16} /> Saved successfully!
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Sparkles size={16} /> Create Salary Structure
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreateEmployeeSalary;