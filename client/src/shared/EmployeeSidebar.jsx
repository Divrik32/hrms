import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  User,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/employee/dashboard",
  },
  {
    label: "Attendance History",
    icon: Clock,
    path: null,
  },
  {
    label: "Profile",
    icon: User,
    path: "/employee/profile",
  },
  {
    label: "Apply Leave",
    icon: CalendarPlus,
    path: "/employee/apply-leave-request",
  },
  {
    label: "My Leaves",
    icon: CalendarCheck,
    path: "/employee/my-leaves",
  },
  {
    label: "Rejected Leaves",
    icon: CalendarX,
    path: "/employee/my-rejected-leaves",
  },
];

const EmployeeSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    if (path) {
      navigate(path);
      setSidebarOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-16 left-0 w-72 h-[calc(100vh-64px)] z-50 flex flex-col"
            style={{
              background: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
              borderRight: "1px solid rgba(99,102,241,0.18)",
              boxShadow: "8px 0 40px 0 rgba(0,0,0,0.45)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.18)", border: "1px solid rgba(99,102,241,0.3)" }}
                >
                  <LayoutDashboard size={16} className="text-indigo-400" />
                </div>
                <span className="text-white font-semibold text-base tracking-wide">
                  Employee Portal
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Divider */}
            <div
              className="mx-5 mb-4"
              style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
            />

            {/* Nav Label */}
            <p className="px-5 mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500 select-none">
              Navigation
            </p>

            {/* Nav Items */}
            <nav className="flex-1 px-3 overflow-y-auto space-y-1">
              {navItems.map(({ label, icon: Icon, path }, i) => {
                const isActive = path && location.pathname === path;
                return (
                  <motion.button
                    key={label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.055, type: "spring", stiffness: 280, damping: 24 }}
                    onClick={() => handleNav(path)}
                    disabled={!path}
                    className={`
                      group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                      transition-all duration-150 relative overflow-hidden
                      ${isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                      }
                      ${!path ? "cursor-default opacity-50" : "cursor-pointer"}
                    `}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(90deg, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.08) 100%)",
                            border: "1px solid rgba(99,102,241,0.35)",
                          }
                        : {
                            background: "transparent",
                            border: "1px solid transparent",
                          }
                    }
                    whileHover={path ? { scale: 1.01 } : {}}
                    whileTap={path ? { scale: 0.98 } : {}}
                  >
                    {/* Active left accent */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-indigo-400"
                      />
                    )}

                    <span
                      className={`
                        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
                        ${isActive
                          ? "bg-indigo-500/30 text-indigo-300"
                          : "bg-white/5 group-hover:bg-white/10 text-slate-400 group-hover:text-indigo-300"
                        }
                      `}
                    >
                      <Icon size={16} />
                    </span>

                    <span className="flex-1 text-sm font-medium">{label}</span>

                    {path && !isActive && (
                      <ChevronRight
                        size={14}
                        className="text-slate-600 group-hover:text-slate-400 transition-all duration-150 group-hover:translate-x-0.5"
                      />
                    )}

                    {isActive && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(99,102,241,0.3)",
                          color: "#a5b4fc",
                          border: "1px solid rgba(99,102,241,0.4)",
                        }}
                      >
                        Active
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-5">
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-indigo-300"
                  style={{
                    background: "rgba(99,102,241,0.2)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  EM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">Employee</p>
                  <p className="text-slate-500 text-xs truncate">member@company.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmployeeSidebar;