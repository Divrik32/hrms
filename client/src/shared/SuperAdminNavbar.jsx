import { motion } from "framer-motion";
import { ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import { BACKEND_URL } from "../services/axios";


const SuperAdminNavbar = ({
  user,
  handleLogout,
}) => {
  return (
    <header className="border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">

        {/* Left - SuperAdmin Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-tight hidden sm:inline">
            SuperAdmin
          </span>
        </div>

        {/* Center - Admin Dashboard Link */}
        <a
          href="/admin/dashboard"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 text-sm font-medium flex-shrink-0"
        >
          <LayoutDashboard className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="hidden sm:inline">Admin Dashboard</span>
        </a>

        {/* Right - User Info & Logout */}
        {user && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Name + role — desktop only */}
            <div className="hidden md:block text-right">
              <p className="text-white text-sm font-medium leading-none">
                {user.name}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {user.role}
              </p>
            </div>

            <img
              src={
                user.profilePic
                  ? `${BACKEND_URL}/uploads/${user.profilePic}`
                  : "https://placehold.co/40x40"
              }
              alt="profile"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-slate-700 hover:border-indigo-500 transition-colors flex-shrink-0"
            />

            <div className="w-px h-5 bg-slate-700 hidden sm:block" />

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 text-sm font-medium transition-all duration-200 flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          </div>
        )}

      </div>
    </header>
  );
};

export default SuperAdminNavbar;