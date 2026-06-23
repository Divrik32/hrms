import { useEffect, useState } from "react";
import axios from "axios";
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
  XCircle,
} from "lucide-react";

// ── tiny helpers ──────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

// Floating-label text/email/password input
const FloatingInput = ({ icon: Icon, label, name, type = "text", value, onChange, required }) => (
  <motion.div variants={itemVariants} className="relative group">
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors duration-200 pointer-events-none z-10">
      <Icon size={16} />
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder=" "
      className="peer w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 pt-5 pb-2 text-sm text-slate-100 placeholder-transparent focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 hover:border-slate-600"
    />
    <label className="absolute left-10 top-2 text-[10px] font-medium tracking-wide text-indigo-400 opacity-0 peer-not-placeholder-shown:opacity-100 peer-focus:opacity-100 transition-all duration-200 pointer-events-none uppercase">
      {label}
    </label>
    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-not-placeholder-shown:opacity-0 peer-focus:opacity-0">
      {label}
    </span>
  </motion.div>
);

// Custom styled select
const FloatingSelect = ({ icon: Icon, label, name, value, onChange, children, required }) => (
  <motion.div variants={itemVariants} className="relative group">
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors duration-200 pointer-events-none z-10">
      <Icon size={16} />
    </div>
    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
      <ChevronDown size={15} />
    </div>
    {value && (
      <span className="absolute left-10 top-2 text-[10px] font-medium tracking-wide text-indigo-400 uppercase pointer-events-none z-10">
        {label}
      </span>
    )}
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-9 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 hover:border-slate-600 appearance-none cursor-pointer ${value ? "pt-5 pb-2" : "py-3.5"}`}
    >
      {children}
    </select>
  </motion.div>
);

// Toast notification
const Toast = ({ type, message, onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.95 }}
        className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium max-w-sm ${
          type === "success"
            ? "bg-emerald-950/90 border-emerald-700 text-emerald-300"
            : "bg-red-950/90 border-red-700 text-red-300"
        }`}
      >
        {type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        {message}
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">×</button>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── main component ─────────────────────────────────────────────
const CreateEmployee = () => {
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    phone: "",
    presentAddress: "",
    gender: "Male",
    email: "",
    password: "",
    role: "Intern",
    companyId: "",
    departmentId: "",
    profilePic: null,
  });

  const roles = [
    "Vice President",
    "General Manager",
    "Senior Manager",
    "Project Manager",
    "Team Lead",
    "Senior Software Engineer",
    "Software Engineer",
    "Associate Trainee",
    "Intern",
  ];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/companies")
      .then((res) => setCompanies(res.data.companies || []))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!formData.companyId) return;
    axios
      .get(`http://localhost:5000/api/departments/company/${formData.companyId}`)
      .then((res) => setDepartments(res.data.departments || []))
      .catch((err) => console.log(err));
  }, [formData.companyId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      const res = await axios.post("http://localhost:5000/api/employees", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("success", res.data.message || "Employee created successfully!");
      setFormData({
        name: "", empId: "", phone: "", presentAddress: "",
        gender: "Male", email: "", password: "", role: "Intern",
        companyId: "", departmentId: "", profilePic: null,
      });
      setPreviewUrl(null);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Employee create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      {/* ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl" />
      </div>

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: "", message: "" })} />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg"
      >
        {/* card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

          {/* header strip */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2.5">
                <UserPlus size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg leading-tight">New Employee</h1>
                <p className="text-indigo-200 text-xs mt-0.5">Fill in the details to add a team member</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >

              {/* Avatar upload */}
              <motion.div variants={itemVariants} className="flex justify-center mb-2">
                <label className="relative cursor-pointer group">
                  <div className={`w-20 h-20 rounded-full border-2 border-dashed border-slate-700 group-hover:border-indigo-500 transition-colors duration-200 overflow-hidden flex items-center justify-center bg-slate-800 ${previewUrl ? "border-solid border-indigo-500" : ""}`}>
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500 group-hover:text-indigo-400 transition-colors duration-200">
                        <Camera size={20} />
                        <span className="text-[9px] font-medium uppercase tracking-wider">Photo</span>
                      </div>
                    )}
                  </div>
                  {previewUrl && (
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Camera size={18} className="text-white" />
                    </div>
                  )}
                  <input type="file" name="profilePic" accept="image/*" onChange={handleChange} className="hidden" />
                </label>
              </motion.div>

              {/* section label */}
              <motion.p variants={itemVariants} className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 pt-1">
                Personal Info
              </motion.p>

              <FloatingInput icon={User} label="Full Name" name="name" value={formData.name} onChange={handleChange} required />

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput icon={Hash} label="Employee ID" name="empId" value={formData.empId} onChange={handleChange} required />
                <FloatingInput icon={Phone} label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>

              <FloatingInput icon={MapPin} label="Present Address" name="presentAddress" value={formData.presentAddress} onChange={handleChange} required />

              <FloatingSelect icon={User} label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </FloatingSelect>

              {/* section label */}
              <motion.p variants={itemVariants} className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 pt-2">
                Account
              </motion.p>

              <FloatingInput icon={Mail} label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <FloatingInput icon={Lock} label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />

              {/* section label */}
              <motion.p variants={itemVariants} className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 pt-2">
                Organisation
              </motion.p>

              <FloatingSelect icon={Briefcase} label="Role" name="role" value={formData.role} onChange={handleChange}>
                {roles.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </FloatingSelect>

              <div className="grid grid-cols-2 gap-3">
                <FloatingSelect icon={Building2} label="Company" name="companyId" value={formData.companyId} onChange={handleChange} required>
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.companyName}</option>
                  ))}
                </FloatingSelect>

                <FloatingSelect icon={LayoutGrid} label="Department" name="departmentId" value={formData.departmentId} onChange={handleChange} required>
                  <option value="">Select Dept.</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.departmentName}</option>
                  ))}
                </FloatingSelect>
              </div>

              {/* submit */}
              <motion.div variants={itemVariants} className="pt-3">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.015 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg shadow-indigo-900/40 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Creating…
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Create Employee
                    </>
                  )}
                  {/* shine sweep */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
                  />
                </motion.button>
              </motion.div>

            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateEmployee;