import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ReceiptText,
  Users,
  FileSpreadsheet,
  RefreshCcw,
  Trash2,
  Briefcase,
  ArrowRight,
} from "lucide-react";

// Colors are exactly as given — only how they're used changed, not the values.
const actions = [
  {
    title: "Generate Payroll",
    description:
      "Generate monthly payroll for an employee based on salary, leave and attendance.",
    icon: ReceiptText,
    hex: "#00cc66",
    path: "/admin/generate-payroll",
  },
  // {
  //   title: "Employee Payroll",
  //   description:
  //     "View payroll history of a specific employee.",
  //   icon: Users,
  //   hex: "#990099",
  //   path: "/admin/employee",
  // },
  {
    title: "All Payrolls",
    description:
      "Browse and manage all generated payroll records.",
    icon: FileSpreadsheet,
    hex: "#990099",
    path: "/admin/all-payrolls",
  },
  // {
  //   title: "Update Payroll",
  //   description:
  //     "Recalculate and update existing payroll records.",
  //   icon: RefreshCcw,
  //   hex: "#ff5500",
  //   path: "/admin/payroll-management/update",
  // },
  // {
  //   title: "Delete Payroll",
  //   description:
  //     "Remove payroll records when necessary.",
  //   icon: Trash2,
  //   hex: "#ff0099",
  //   path: "/admin/payroll-management/delete",
  // },
];

// Convert a hex color to an rgba string with a given alpha (0–1).
const withAlpha = (hex, alpha) => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function PayrollManagement() {
  const navigate = useNavigate();

  const goTo = (path) => navigate(path);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070d] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      {/* Ambient background — kept quiet and neutral, no color flooding */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-slate-500/10 blur-[130px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <style>
          {`
            @keyframes payrollTitleShine {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}
        </style>

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4 sm:mb-10"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)] backdrop-blur-xl sm:h-14 sm:w-14">
            <Briefcase size={22} className="sm:hidden" />
            <Briefcase size={26} className="hidden sm:block" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]" />
              Admin · Payroll Suite
            </span>

            <h1
              className="mt-1 !bg-clip-text text-3xl font-bold leading-tight !text-transparent sm:text-4xl"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, #ffffff 25%, #c7d2fe 45%, #ffffff 65%)",
                backgroundSize: "220% 100%",
                animation: "payrollTitleShine 5s linear infinite",
                textShadow: "0 0 40px rgba(255,255,255,0.18)",
              }}
            >
              Payroll Management
            </h1>

            <p className="mt-1.5 text-sm font-medium text-slate-300 sm:text-base">
              Generate, view, update and manage employee payrolls.
            </p>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="mx-auto grid gap-7 max-w-5xl sm:grid-cols-2 sm:gap-24 xl:grid-cols-2">
          {actions.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => goTo(item.path)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goTo(item.path);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = withAlpha(item.hex, 0.55);
                  e.currentTarget.style.boxShadow = `0 12px 40px -16px ${withAlpha(
                    item.hex,
                    0.4
                  )}, 0 0 0 1px ${withAlpha(item.hex, 0.2)} inset`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = withAlpha(item.hex, 0.22);
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${withAlpha(
                    item.hex,
                    0.08
                  )} inset`;
                }}
                className="group relative cursor-pointer rounded-2xl border p-5 outline-none backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070d] sm:p-6"
                style={{
                  borderColor: withAlpha(item.hex, 0.22),
                  backgroundImage: `linear-gradient(165deg, ${withAlpha(
                    item.hex,
                    0.14
                  )}, ${withAlpha(item.hex, 0.03)} 55%, rgba(255,255,255,0.05) 100%)`,
                  boxShadow: `0 0 0 1px ${withAlpha(item.hex, 0.08)} inset`,
                }}
              >
                {/* thin top accent — the only place full color intensity appears */}
                <div
                  className="absolute inset-x-5 top-0 h-[2px] rounded-full opacity-70 transition-opacity duration-300 group-hover:opacity-100 sm:inset-x-6"
                  style={{ backgroundColor: item.hex }}
                />

                <div className="flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: withAlpha(item.hex, 0.2),
                      borderColor: withAlpha(item.hex, 0.5),
                      color: item.hex,
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <ArrowRight
                    size={16}
                    className="mt-1.5 -translate-x-1 text-slate-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    style={{ color: item.hex }}
                  />
                </div>

                <h2 className="mt-4 text-base font-semibold !text-white sm:text-lg">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {item.description}
                </p>

                <button
                  type="button"
                  tabIndex={-1}
                  className="group/btn relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border py-2.5 text-sm font-medium transition-colors duration-300"
                  style={{
                    borderColor: withAlpha(item.hex, 0.35),
                    color: item.hex,
                  }}
                >
                  <span
                    className="absolute inset-0 -translate-x-full transition-transform duration-300 ease-out group-hover/btn:translate-x-0"
                    style={{ backgroundColor: item.hex }}
                  />

                  <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover/btn:text-slate-950">
                    Open
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    />
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}