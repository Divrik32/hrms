import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, UserCircle2, ArrowRight, Sparkles } from "lucide-react";

const cards = [
  {
    key: "employee",
    path: "/employee-login",
    Icon: UserCircle2,
    headline: "Sign in as Employee",
    description: "Access your workspace, tasks, and daily tools.",
    gradFrom: "#00cc66",
    gradTo: "#00f077",
    glowRgb: "0,204,102",
    badgeLabel: "Team Access",
    delay: 0.1,
  },
  {
    key: "admin",
    path: "/admin-login",
    Icon: ShieldCheck,
    headline: "Sign in as Super Admin",
    description: "Manage users, settings, and full system control.",
    gradFrom: "#9900cc",
    gradTo: "#c44de8",
    glowRgb: "153,0,204",
    badgeLabel: "Admin Access",
    delay: 0.2,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-140px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: "rgba(0,204,102,0.10)" }}
        />
        <div
          className="absolute bottom-[-140px] right-[-100px] w-[460px] h-[460px] rounded-full blur-[120px]"
          style={{ background: "rgba(153,0,204,0.11)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[180px] rounded-full blur-[90px]"
          style={{ background: "rgba(60,0,90,0.06)" }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">

        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#00cc66" }} />
          <span className="text-xs text-slate-400 font-medium tracking-wide">Internal Portal</span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-3">
            Welcome back
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-sm mx-auto">
            Choose how you'd like to sign in to continue.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {cards.map(({ key, path, Icon, headline, description, gradFrom, gradTo, glowRgb, badgeLabel, delay }) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay }}
              whileHover={{ y: -5, scale: 1.015 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => navigate(path)}
              className="group relative text-left rounded-2xl p-7 cursor-pointer transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: `0 8px 40px rgba(${glowRgb},0.08)`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.border = `1px solid rgba(${glowRgb},0.35)`;
                e.currentTarget.style.boxShadow = `0 12px 48px rgba(${glowRgb},0.18)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.09)";
                e.currentTarget.style.boxShadow = `0 8px 40px rgba(${glowRgb},0.08)`;
              }}
            >
              {/* Gradient top line */}
              <div
                className="absolute inset-x-0 top-0 h-[1.5px] rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(to right, ${gradFrom}, ${gradTo})` }}
              />

              {/* Icon bubble */}
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
                style={{
                  background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                  boxShadow: `0 4px 20px rgba(${glowRgb},0.35)`,
                }}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Badge */}
              <div className="mb-3">
                <span
                  className="text-[11px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{
                    background: `rgba(${glowRgb},0.1)`,
                    color: gradFrom,
                    border: `1px solid rgba(${glowRgb},0.25)`,
                  }}
                >
                  {badgeLabel}
                </span>
              </div>

              {/* Text */}
              <h2 className="text-lg font-semibold text-white mb-1.5 leading-snug">
                {headline}
              </h2>
              <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed">
                {description}
              </p>

              {/* Arrow CTA */}
              <div
                className="flex items-center gap-1.5 mt-5 text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-700 text-xs mt-10 text-center"
        >
          Authorized access only — all activity is monitored and logged.
        </motion.p>
      </div>
    </div>
  );
};

export default LandingPage;