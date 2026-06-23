import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, IndianRupee, Building2, PencilLine, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";

const fieldConfig = [
  { name: "inHandSalary", label: "In-Hand Salary",    placeholder: "e.g. 50000" },
  { name: "pf",           label: "Provident Fund (PF)", placeholder: "e.g. 1800" },
  { name: "esi",          label: "ESI",               placeholder: "e.g. 750" },
  { name: "tax",          label: "Tax Deduction",     placeholder: "e.g. 2000" },
];

const inputVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.32, ease: "easeOut" } }),
};

const EditEmployeeSalary = () => {
  const [companies, setCompanies]       = useState([]);
  const [employees, setEmployees]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [updated, setUpdated]           = useState(false);

  const [formData, setFormData] = useState({
    companyId: "", employeeId: "", inHandSalary: "", pf: "", esi: "", tax: "",
  });

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies");
      setCompanies(res.data.companies);
    } catch (error) { console.log(error); }
  };

  const fetchEmployeesByCompany = async (companyId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/employees/company/${companyId}`);
      setEmployees(res.data.employees);
    } catch (error) { console.log(error); }
  };

  const fetchSalaryStructure = async (employeeId) => {
    try {
      setSalaryLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/payroll/salary-structure/${employeeId}`,
        { withCredentials: true }
      );
      const salary = res.data.salaryStructure;
      setFormData((prev) => ({
        ...prev,
        inHandSalary: salary.inHandSalary,
        pf:           salary.pf,
        esi:          salary.esi,
        tax:          salary.tax,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Salary structure not found");
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "companyId") {
      setFormData({ companyId: value, employeeId: "", inHandSalary: "", pf: "", esi: "", tax: "" });
      fetchEmployeesByCompany(value);
      return;
    }
    if (name === "employeeId") {
      setFormData((prev) => ({ ...prev, employeeId: value }));
      fetchSalaryStructure(value);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const ctc =
    Number(formData.inHandSalary || 0) +
    Number(formData.pf  || 0) +
    Number(formData.esi || 0) +
    Number(formData.tax || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.put(
        `http://localhost:5000/api/payroll/update-salary-structure/${formData.employeeId}`,
        { companyId: formData.companyId, employeeId: formData.employeeId,
          inHandSalary: formData.inHandSalary, pf: formData.pf, esi: formData.esi, tax: formData.tax, ctc },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setUpdated(true);
      setTimeout(() => setUpdated(false), 2500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const salaryLoaded = formData.employeeId && !salaryLoading && formData.inHandSalary !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 p-4 md:p-8 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-3xl"
      >
        {/* Header Card */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-xl shadow-violet-200">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2.5">
              <PencilLine size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Edit Salary Structure</h1>
              <p className="text-violet-100 text-sm mt-0.5">Update an existing employee compensation package</p>
            </div>
          </div>

          {/* Status pill */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
              formData.companyId
                ? "bg-white/20 border-white/30 text-white"
                : "bg-white/10 border-white/10 text-violet-200"
            }`}>
              {formData.companyId ? "✓ Company selected" : "Select company"}
            </span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
              formData.employeeId
                ? "bg-white/20 border-white/30 text-white"
                : "bg-white/10 border-white/10 text-violet-200"
            }`}>
              {formData.employeeId ? "✓ Employee selected" : "Select employee"}
            </span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
              salaryLoaded
                ? "bg-white/20 border-white/30 text-white"
                : "bg-white/10 border-white/10 text-violet-200"
            }`}>
              {salaryLoading ? "⟳ Loading salary…" : salaryLoaded ? "✓ Salary loaded" : "Awaiting salary data"}
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Assignment */}
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
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
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
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Salary Fields */}
            <div className="px-6 py-4 relative">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Compensation Breakdown
              </p>

              {/* Loading overlay */}
              <AnimatePresence>
                {salaryLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"
                  >
                    <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 px-4 py-2.5 rounded-full">
                      <RefreshCw size={15} className="animate-spin text-violet-500" />
                      <span className="text-sm font-medium text-violet-600">Fetching salary data…</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all"
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
                className="flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl px-5 py-4"
              >
                <div>
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Total CTC</p>
                  <p className="text-xs text-slate-400 mt-0.5">Cost to Company (annual)</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-violet-700">
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
                disabled={loading || salaryLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Updating…
                    </motion.span>
                  ) : updated ? (
                    <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <CheckCircle2 size={16} /> Updated successfully!
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <PencilLine size={16} /> Update Salary Structure
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditEmployeeSalary;