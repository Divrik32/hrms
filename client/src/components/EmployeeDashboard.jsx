import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  LogOut,
  Mail,
  Tag,
  Clock,
  Sun,
  Sunset,
  Moon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── tiny reusable pieces ─────────────────────────────────────────── */

const InfoPill = ({ icon: Icon, label, value, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
  >
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${accent}`}>
      <Icon className="h-3.5 w-3.5 text-white" />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-medium text-slate-200">{value}</p>
    </div>
  </motion.div>
);

const shifts = [
  { value: "day",       label: "Day",       sub: "10:00 – 19:00", Icon: Sun,    ring: "ring-amber-400/60",  bg: "bg-amber-400/10",  text: "text-amber-300",  iconActive: "text-amber-300",  glowColor: "rgba(251,191,36,0.55)",  glowColorSoft: "rgba(251,191,36,0.25)",  iconInactive: "#94a3b8" },
  { value: "afternoon", label: "Afternoon", sub: "12:00 – 22:00", Icon: Sunset, ring: "ring-orange-400/60", bg: "bg-orange-400/10", text: "text-orange-300", iconActive: "text-orange-300", glowColor: "rgba(249,115,22,0.55)",  glowColorSoft: "rgba(249,115,22,0.25)",  iconInactive: "#94a3b8" },
  { value: "night",     label: "Night",     sub: "06:00 – 02:00", Icon: Moon,   ring: "ring-indigo-400/60", bg: "bg-indigo-400/10", text: "text-indigo-300", iconActive: "text-indigo-300", glowColor: "rgba(139,92,246,0.55)",  glowColorSoft: "rgba(139,92,246,0.25)",  iconInactive: "#94a3b8" },
];

/* ─── main component ────────────────────────────────────────────────── */

const EmployeeDashboard = () => {
  const [employee,          setEmployee]          = useState(null);
  const [loading,           setLoading]           = useState(false);
  const [lastAction,        setLastAction]        = useState(null);
  const [selectedShift,     setSelectedShift]     = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [currentTime,       setCurrentTime]       = useState(new Date());
  const navigate = useNavigate();

  /* live clock */
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* auth guard */
  useEffect(() => {
    const stored = localStorage.getItem("employee");
    if (!stored) { navigate("/employee-login"); return; }
    setEmployee(JSON.parse(stored));
  }, []);

  /* ── api helpers ── */
  const checkIn = async () => {
    try {
      setLoading(true);
      const urlMap = {
        day:       "http://localhost:5000/api/attendance/checkin",
        afternoon: "http://localhost:5000/api/attendance/afternoon-checkin",
        night:     "http://localhost:5000/api/attendance/night-checkin",
      };
      const res = await axios.post(urlMap[selectedShift] ?? urlMap.day, {}, { withCredentials: true });
      setLastAction({ type: "in", message: res.data.message, timing: res.data.attendance?.timing });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Check in failed");
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async () => {
    try {
      setLoading(true);
      const urlMap = {
        day:       "http://localhost:5000/api/attendance/checkout",
        afternoon: "http://localhost:5000/api/attendance/afternoon-checkout",
        night:     "http://localhost:5000/api/attendance/night-checkout",
      };
      const res = await axios.post(urlMap[selectedShift] ?? urlMap.day, {}, { withCredentials: true });
      setLastAction({ type: "out", message: res.data.message });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Check out failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── derived strings ── */
  const timeStr = currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = currentTime.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  /* ────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0a0c14] text-white">

      {/* ── ambient gradient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-violet-700/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 pb-20 pt-12 sm:px-6">

        {/* ── header ── */}
        <AnimatePresence>
          {employee && (
            <motion.header
              key="header"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold shadow-lg shadow-indigo-500/30">
                  {employee.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">{greeting()}</p>
                  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
                  <h1
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "2rem",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background: "linear-gradient(110deg, #bbf7d0 0%, #4ade80 20%, #16a34a 40%, #86efac 60%, #22c55e 80%, #bbf7d0 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "drop-shadow(0 0 8px rgba(74,222,128,0.6)) drop-shadow(0 0 22px rgba(34,197,94,0.35))",
                      backgroundSize: "200% auto",
                      animation: "shimmerName 3s linear infinite",
                    }}
                  >
                    {employee.name}
                  </h1>
                  <style>{`
                    @keyframes shimmerName {
                      0%   { background-position: 0% center; }
                      100% { background-position: 200% center; }
                    }
                  `}</style>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">{dateStr}</p>
            </motion.header>
          )}
        </AnimatePresence>

        {/* ── info pills ── */}
        {employee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <InfoPill icon={Mail}  label="Email" value={employee.email}              accent="bg-blue-600/80"   />
            <InfoPill icon={Tag}   label="Role"  value={employee.role || "Employee"} accent="bg-violet-600/80" />
            <InfoPill icon={Clock} label="Time"  value={timeStr}                     accent="bg-indigo-600/80" />
          </motion.div>
        )}

        {/* ── shift selector ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Select shift
          </p>
          <div className="grid grid-cols-3 gap-3">
            {shifts.map(({ value, label, sub, Icon, ring, bg, text, glowColor, glowColorSoft }) => {
              const active = selectedShift === value;
              return (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedShift(value)}
                  style={{
                    boxShadow: active
                      ? `0 0 0 2px ${glowColor}, 0 0 28px ${glowColorSoft}, 0 0 55px ${glowColorSoft}`
                      : "none",
                    transition: "box-shadow 0.35s ease",
                  }}
                  className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border px-3 py-5 transition-all duration-300
                    ${active
                      ? `border-white/25 bg-white/[0.10]`
                      : "border-white/[0.14] bg-white/[0.07] hover:border-white/[0.22] hover:bg-white/[0.11]"
                    }`}
                >
                  {active && (
                    <motion.span
                      layoutId="shiftPill"
                      className={`absolute inset-0 ${bg} opacity-60`}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}

                  {/* icon wrapper */}
                  <span
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${active ? bg : "bg-white/[0.10]"}`}
                    style={{
                      boxShadow: active ? `0 0 14px ${glowColor}` : "none",
                    }}
                  >
                    <Icon
                      className={`h-5 w-5 transition-all duration-300 ${active ? text : "text-slate-300"}`}
                      style={{
                        filter: active ? `drop-shadow(0 0 5px ${glowColor})` : "none",
                      }}
                    />
                  </span>

                  <span className="relative z-10 text-center">
                    <span className={`block text-sm font-semibold transition-colors duration-300 ${active ? "text-white" : "text-slate-300"}`}>
                      {label}
                    </span>
                    <span className={`block text-[10px] transition-colors duration-300 ${active ? "text-slate-300" : "text-slate-400"}`}>
                      {sub}
                    </span>
                  </span>

                  {/* active glowing dot */}
                  {active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative z-10 h-1.5 w-1.5 rounded-full"
                      style={{ background: glowColor, boxShadow: `0 0 6px ${glowColor}` }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* ── attendance card ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-3xl border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-sm"
        >
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Attendance</p>
          <h2 className="mb-1 text-lg font-bold text-white">Mark your presence</h2>
          <p className="mb-6 text-sm text-slate-500">Select a shift above, then tap the action below.</p>

          {/* disabled hint */}
          <AnimatePresence>
            {!selectedShift && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-400"
              >
                ↑ Choose a shift first to enable check-in / check-out
              </motion.p>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">

            {/* check in */}
            <motion.button
              onClick={checkIn}
              disabled={loading || !selectedShift}
              whileHover={selectedShift ? { scale: 1.02 } : {}}
              whileTap={selectedShift ? { scale: 0.97 } : {}}
              style={{
                boxShadow: selectedShift && !loading
                  ? "0 0 22px rgba(16,185,129,0.35), 0 0 45px rgba(16,185,129,0.15)"
                  : "none",
                transition: "box-shadow 0.35s ease, opacity 0.3s",
              }}
              className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.10] py-8 transition-all duration-300 hover:border-emerald-400/60 hover:bg-emerald-500/[0.16] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/25 transition-colors group-hover:bg-emerald-500/35"
                style={{
                  boxShadow: selectedShift ? "0 0 18px rgba(16,185,129,0.5)" : "none",
                }}
              >
                <LogIn
                  className="h-6 w-6 text-emerald-300"
                  style={{
                    filter: selectedShift ? "drop-shadow(0 0 6px rgba(16,185,129,0.9))" : "none",
                  }}
                />
              </span>
              <span className="text-center">
                <span className="block text-sm font-semibold text-emerald-200">Check In</span>
                <span className="block text-[11px] text-emerald-500">Start shift</span>
              </span>
              {/* bottom glow line */}
              <div
                className="absolute inset-x-0 bottom-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.7), transparent)" }}
              />
            </motion.button>

            {/* check out */}
            <motion.button
              onClick={() => setShowCheckoutModal(true)}
              disabled={loading || !selectedShift}
              whileHover={selectedShift ? { scale: 1.02 } : {}}
              whileTap={selectedShift ? { scale: 0.97 } : {}}
              style={{
                boxShadow: selectedShift && !loading
                  ? "0 0 22px rgba(244,63,94,0.35), 0 0 45px rgba(244,63,94,0.15)"
                  : "none",
                transition: "box-shadow 0.35s ease, opacity 0.3s",
              }}
              className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-500/[0.10] py-8 transition-all duration-300 hover:border-rose-400/60 hover:bg-rose-500/[0.16] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/25 transition-colors group-hover:bg-rose-500/35"
                style={{
                  boxShadow: selectedShift ? "0 0 18px rgba(244,63,94,0.5)" : "none",
                }}
              >
                <LogOut
                  className="h-6 w-6 text-rose-300"
                  style={{
                    filter: selectedShift ? "drop-shadow(0 0 6px rgba(244,63,94,0.9))" : "none",
                  }}
                />
              </span>
              <span className="text-center">
                <span className="block text-sm font-semibold text-rose-200">Check Out</span>
                <span className="block text-[11px] text-rose-500">End shift</span>
              </span>
              {/* bottom glow line */}
              <div
                className="absolute inset-x-0 bottom-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.7), transparent)" }}
              />
            </motion.button>
          </div>

          {/* loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500"
              >
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
                Processing…
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── last action banner ── */}
        <AnimatePresence>
          {lastAction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 ${
                lastAction.type === "in"
                  ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                  : "border-rose-500/20 bg-rose-500/[0.06]"
              }`}
            >
              {lastAction.type === "in"
                ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                : <XCircle      className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"    />
              }
              <div>
                <p className="text-sm font-medium text-slate-200">{lastAction.message}</p>
                {lastAction.timing && (
                  <p className="mt-0.5 text-xs text-indigo-400">Timing: {lastAction.timing}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── checkout confirmation modal ── */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setShowCheckoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit={{    scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#12141f] p-7 shadow-2xl"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 ring-1 ring-rose-500/30">
                <AlertTriangle className="h-8 w-8 text-rose-400" />
              </div>

              <h3 className="mb-2 text-center text-xl font-bold text-white">End your shift?</h3>

              <p className="mb-1 text-center text-sm leading-relaxed text-slate-400">
                For short breaks — lunch, tea, or a quick pause — please <span className="font-semibold text-slate-300">do not</span> check out.
              </p>
              <p className="mb-7 text-center text-sm font-medium text-rose-400">
                Checking out marks your shift as completed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => { setShowCheckoutModal(false); await checkOut(); }}
                  className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 transition-colors hover:bg-rose-700 active:scale-95"
                >
                  End shift
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeDashboard;