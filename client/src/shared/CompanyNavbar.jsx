import { useState } from "react";
import { Users, ArrowLeft, ChevronDown, Building2, LayoutDashboard, UserSquare2, CalendarClock, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "../../utils/api";


const NAV_LINKS = (id) => [
  {
    to: `/${id}/company/profile-section`,
    label: "Profile Section",
    icon: UserSquare2,
  },
  {
    to: `/${id}/company/dashboard`,
    label: "Employees",
    icon: LayoutDashboard,
  },
  {
    to: `/${id}/company/attendance-tracker`,
    label: "Track Attendance",
    icon: CalendarClock,
  },
];

const CompanyNavbar = ({ companies, selectedCompany, onCompanyChange }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCompanySelect = (company) => {
    onCompanyChange(company);
    navigate(`/${company._id}/company/dashboard`);
    setDropdownOpen(false);
  };

  return (
    <>
      {/* backdrop blur when dropdown open */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDropdownOpen(false)}
            className="fixed inset-0 z-30"
          />
        )}
      </AnimatePresence>

      <nav className="relative z-40 bg-[#0b1120]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-8 py-0 flex items-center justify-between h-[68px]">

        {/* subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* ── LEFT: back + nav links ── */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* back button */}
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400
              hover:text-white hover:bg-white/8 transition-all mr-2"
          >
            <ArrowLeft size={18} />
          </motion.button>

          {/* divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-700/60 mr-2" />

          {/* nav links */}
          {NAV_LINKS(selectedCompany?._id).map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} icon={Icon} label={label} />
          ))}
        </div>

        {/* ── RIGHT: company info + switcher ── */}
        <div className="flex items-center gap-3">

          {/* company identity */}
          <div className="hidden sm:flex items-center gap-2.5 pr-3 border-r border-slate-700/50">
            <div className="relative">
              <img
                src={
                  selectedCompany?.logo
                    ? `${BACKEND_URL}/uploads/${selectedCompany.logo}`
                    : "https://placehold.co/60"
                }
                alt={selectedCompany?.companyName}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30 ring-offset-1 ring-offset-[#0b1120]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0b1120]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                {selectedCompany?.companyName}
              </p>
              <p className="text-slate-500 text-[10px] leading-tight">Active workspace</p>
            </div>
          </div>

          {/* company switcher dropdown */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl
                bg-slate-800/70 border border-slate-700/60 hover:border-indigo-500/50
                hover:bg-slate-800 text-white text-sm font-medium transition-all"
            >
              <Building2 size={14} className="text-indigo-400 shrink-0" />
              <span className="hidden sm:inline max-w-[120px] truncate text-slate-200 text-sm">
                {selectedCompany?.companyName}
              </span>
              <motion.span
                animate={{ rotate: dropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} className="text-slate-400" />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 bg-[#111827] border border-slate-700/60
                    rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
                >
                  <div className="px-3 py-2.5 border-b border-slate-700/50">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Switch Company</p>
                  </div>
                  <div className="py-1.5 max-h-60 overflow-y-auto">
                    {companies.map((company) => {
                      const isActive = company._id === selectedCompany?._id;
                      return (
                        <motion.button
                          key={company._id}
                          whileHover={{ x: 2 }}
                          onClick={() => handleCompanySelect(company)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all
                            ${isActive
                              ? "text-indigo-300 bg-indigo-500/10"
                              : "text-slate-300 hover:text-white hover:bg-white/5"
                            }`}
                        >
                          <img
                            src={
                              company?.logo
                                ? `${BACKEND_URL}/uploads/${company.logo}`
                                : "https://placehold.co/40"
                            }
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover shrink-0"
                          />
                          <span className="truncate font-medium">{company.companyName}</span>
                          {isActive && (
                            <Check size={13} className="ml-auto text-indigo-400 shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </>
  );
};

/* ── NavLink with active indicator ── */
function NavLink({ to, icon: Icon, label }) {
  const isActive = window.location.pathname === to;
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium
        transition-all duration-200 group
        ${isActive
          ? "text-white bg-indigo-600/20 border border-indigo-500/30"
          : "text-slate-400 hover:text-white hover:bg-white/6"
        }`}
    >
      <Icon size={15} className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} />
      <span className="hidden md:inline">{label}</span>
      {isActive && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl bg-indigo-600/15 border border-indigo-500/25"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

export default CompanyNavbar;