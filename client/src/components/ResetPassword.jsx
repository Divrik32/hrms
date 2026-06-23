import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/employees/reset-password",
        form
      );
      toast.success(res.data.message);
      navigate("/employee-login");
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "email",
      label: "Email Address",
      type: "email",
      placeholder: "you@company.com",
      icon: Mail,
    },
    {
      key: "otp",
      label: "One-Time Password (OTP)",
      type: "text",
      placeholder: "Enter 6-digit OTP",
      icon: KeyRound,
      maxLength: 6,
    },
  ];

  const steps = ["Enter email", "Enter OTP", "New password"];
  const activeStep = !form.email ? 0 : !form.otp ? 1 : 2;

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute top-[-80px] left-[-60px] w-[320px] h-[320px] bg-emerald-600 opacity-10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] bg-indigo-500 opacity-15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-900 opacity-10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(16,185,129,0.12)] overflow-hidden">

          {/* Top accent */}
          <div className="h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

          <div className="p-8">

            {/* Back button */}
            <motion.button
              type="button"
              onClick={() => navigate("/employee/forgot-password")}
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150 mb-7 group"
            >
              <ArrowLeft size={14} className="group-hover:text-emerald-400 transition-colors duration-150" />
              Back
            </motion.button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-col items-center mb-7"
            >
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <ShieldCheck className="text-emerald-400" size={26} strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Reset password</h2>
              <p className="text-slate-400 text-sm mt-1.5 text-center">
                Enter the OTP sent to your email and set a new password.
              </p>
            </motion.div>

            {/* Progress steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-center justify-between mb-7 px-1"
            >
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-300 ${
                        i < activeStep
                          ? "bg-emerald-500 text-white"
                          : i === activeStep
                          ? "bg-emerald-500/20 border border-emerald-500/60 text-emerald-400"
                          : "bg-white/[0.05] border border-white/10 text-slate-600"
                      }`}
                    >
                      {i < activeStep ? <CheckCircle2 size={13} /> : i + 1}
                    </div>
                    <span
                      className={`text-[10px] whitespace-nowrap transition-colors duration-300 ${
                        i <= activeStep ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-px mb-4 mx-1 transition-all duration-500 ${
                        i < activeStep ? "bg-emerald-500/50" : "bg-white/[0.07]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="space-y-4"
            >
              {/* Email + OTP fields */}
              {fields.map(({ key, label, type, placeholder, icon: Icon, maxLength }) => (
                <motion.div
                  key={key}
                  animate={focusedField === key ? { scale: 1.01 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1 tracking-wide uppercase">
                    {label}
                  </label>
                  <div
                    className={`flex items-center gap-3 bg-white/[0.04] border rounded-xl px-4 py-3 transition-all duration-200 ${
                      focusedField === key
                        ? "border-emerald-500/60 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={`transition-colors duration-200 flex-shrink-0 ${
                        focusedField === key ? "text-emerald-400" : "text-slate-500"
                      }`}
                    />
                    <input
                      type={type}
                      name={key}
                      required
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={handleChange}
                      onFocus={() => setFocusedField(key)}
                      onBlur={() => setFocusedField(null)}
                      maxLength={maxLength}
                      className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none tracking-widest"
                    />
                    {key === "otp" && form.otp.length === 6 && (
                      <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              ))}

              {/* New Password */}
              <motion.div
                animate={focusedField === "newPassword" ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1 tracking-wide uppercase">
                  New Password
                </label>
                <div
                  className={`flex items-center gap-3 bg-white/[0.04] border rounded-xl px-4 py-3 transition-all duration-200 ${
                    focusedField === "newPassword"
                      ? "border-emerald-500/60 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Lock
                    size={17}
                    className={`transition-colors duration-200 flex-shrink-0 ${
                      focusedField === "newPassword" ? "text-emerald-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    required
                    placeholder="Min. 8 characters"
                    value={form.newPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("newPassword")}
                    onBlur={() => setFocusedField(null)}
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

                {/* Password strength indicator */}
                <AnimatePresence>
                  {form.newPassword.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 px-1"
                    >
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => {
                          const strength =
                            form.newPassword.length >= 12 &&
                            /[A-Z]/.test(form.newPassword) &&
                            /[0-9]/.test(form.newPassword) &&
                            /[^a-zA-Z0-9]/.test(form.newPassword)
                              ? 4
                              : form.newPassword.length >= 10 &&
                                /[A-Z]/.test(form.newPassword) &&
                                /[0-9]/.test(form.newPassword)
                              ? 3
                              : form.newPassword.length >= 8
                              ? 2
                              : 1;
                          return (
                            <div
                              key={i}
                              className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                                i <= strength
                                  ? strength === 1
                                    ? "bg-red-500"
                                    : strength === 2
                                    ? "bg-amber-500"
                                    : strength === 3
                                    ? "bg-emerald-400"
                                    : "bg-emerald-500"
                                  : "bg-white/[0.08]"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {form.newPassword.length < 8
                          ? "Too short"
                          : form.newPassword.length < 10
                          ? "Acceptable — add numbers or symbols for a stronger password"
                          : /[A-Z]/.test(form.newPassword) && /[0-9]/.test(form.newPassword)
                          ? /[^a-zA-Z0-9]/.test(form.newPassword)
                            ? "Strong password"
                            : "Good — try adding a special character"
                          : "Add uppercase letters and numbers"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                transition={{ duration: 0.15 }}
                className="w-full mt-2 relative flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-3.5 transition-colors duration-200 shadow-[0_4px_20px_rgba(16,185,129,0.35)] overflow-hidden group"
              >
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
                      <svg className="animate-spin" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Resetting...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <ShieldCheck size={16} />
                      Reset Password
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-center text-xs text-slate-600 mt-6"
            >
              Protected by secure session authentication
            </motion.p>

          </div>
        </div>

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mt-0" />
      </motion.div>
    </div>
  );
};

export default ResetPassword;