import { useState } from "react";
import api from "../services/axios";
import { Mail, Send, ArrowLeft, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post(
        "/employees/forgot-password",
        { email }
      );
      toast.success(res.data.message);
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute top-[-80px] right-[-60px] w-[320px] h-[320px] bg-violet-600 opacity-20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] bg-indigo-500 opacity-15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900 opacity-10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(139,92,246,0.15)] overflow-hidden">

          {/* Top accent */}
          <div className="h-[3px] bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500" />

          <div className="p-8">

            {/* Back button */}
            <motion.button
              type="button"
              onClick={() => navigate("/employee-login")}
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150 mb-7 group"
            >
              <ArrowLeft size={14} className="group-hover:text-indigo-400 transition-colors duration-150" />
              Back to login
            </motion.button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="w-14 h-14 bg-violet-500/20 border border-violet-500/30 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <ShieldAlert className="text-violet-400" size={26} strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-bold !text-white tracking-tight">Forgot password?</h2>
              <p className="text-slate-400 text-sm mt-1.5 text-center leading-relaxed px-4">
                Enter your work email and we'll send you a one-time OTP to reset your password.
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="space-y-4"
            >
              <motion.div
                animate={focusedField ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1 tracking-wide uppercase">
                  Work Email
                </label>
                <div
                  className={`flex items-center gap-3 bg-white/[0.04] border rounded-xl px-4 py-3 transition-all duration-200 ${
                    focusedField
                      ? "border-violet-500/70 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Mail
                    size={17}
                    className={`transition-colors duration-200 flex-shrink-0 ${
                      focusedField ? "text-violet-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField(true)}
                    onBlur={() => setFocusedField(false)}
                    className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none"
                  />
                </div>
              </motion.div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                transition={{ duration: 0.15 }}
                className="w-full mt-2 relative flex items-center justify-center gap-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-3.5 transition-colors duration-200 shadow-[0_4px_20px_rgba(139,92,246,0.4)] overflow-hidden group"
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
                      Sending OTP...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Send size={15} />
                      Send OTP
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.form>

            {/* Info note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-6 flex items-start gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Check your spam folder if you don't see the email within a few minutes.
              </p>
            </motion.div>

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

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent mt-0" />
      </motion.div>
    </div>
  );
};

export default ForgotPassword;