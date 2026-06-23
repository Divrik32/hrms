import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";


const EmployeeLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/employees/login",
        formData,
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("employee", JSON.stringify(res.data.employee));
      toast.success(res.data.message);
      navigate("/employee/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    focused: { scale: 1.01, transition: { duration: 0.2 } },
    unfocused: { scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient background blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] bg-indigo-600 opacity-20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] bg-violet-500 opacity-15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900 opacity-10 rounded-full blur-[140px] pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Glassmorphism card */}
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.15)] overflow-hidden">

          {/* Top accent line */}
          <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

          <div className="p-8">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <ShieldCheck className="text-indigo-400" size={26} strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to your employee portal</p>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="space-y-4"
            >

              {/* Email Field */}
              <motion.div
                variants={inputVariants}
                animate={focusedField === "email" ? "focused" : "unfocused"}
              >
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1 tracking-wide uppercase">
                  Email Address
                </label>
                <div
                  className={`flex items-center gap-3 bg-white/[0.04] border rounded-xl px-4 py-3 transition-all duration-200 ${
                    focusedField === "email"
                      ? "border-indigo-500/70 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Mail
                    size={17}
                    className={`transition-colors duration-200 flex-shrink-0 ${
                      focusedField === "email" ? "text-indigo-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                variants={inputVariants}
                animate={focusedField === "password" ? "focused" : "unfocused"}
              >
                {/* Label row: Password label + Forgot Password link */}
                <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                  <label className="block text-xs font-medium text-slate-400 tracking-wide uppercase">
                    Password
                  </label>
                  <motion.button
                    type="button"
                    onClick={() => navigate("/employee/forgot-password")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-150 font-medium"
                  >
                    Forgot password?
                  </motion.button>
                </div>

                <div
                  className={`flex items-center gap-3 bg-white/[0.04] border rounded-xl px-4 py-3 transition-all duration-200 ${
                    focusedField === "password"
                      ? "border-indigo-500/70 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Lock
                    size={17}
                    className={`transition-colors duration-200 flex-shrink-0 ${
                      focusedField === "password" ? "text-indigo-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-500 hover:text-slate-300 transition-colors duration-150 flex-shrink-0"
                    tabIndex={-1}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={showPassword ? "hide" : "show"}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                transition={{ duration: 0.15 }}
                className="w-full mt-2 relative flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-3.5 transition-colors duration-200 shadow-[0_4px_20px_rgba(99,102,241,0.4)] overflow-hidden group"
              >
                {/* Shine sweep on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 size={17} className="animate-spin" />
                      Signing in...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <LogIn size={17} />
                      Sign In
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

            </motion.form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="flex items-center gap-3 my-5"
            >
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-slate-600">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </motion.div>

            {/* Can't remember password? full link row */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center justify-center gap-1.5"
            >
              <span className="text-xs text-slate-500">Can't remember your password?</span>
              <motion.button
                type="button"
                onClick={() => navigate("/forgot-password")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 decoration-indigo-500/40 hover:decoration-indigo-400/70 transition-all duration-150"
              >
                Reset it here
              </motion.button>
            </motion.div>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-center text-xs text-slate-600 mt-5"
            >
              Protected by secure session authentication
            </motion.p>

          </div>
        </div>

        {/* Bottom glow reflection */}
        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mt-0" />
      </motion.div>
    </div>
  );
};

export default EmployeeLogin;