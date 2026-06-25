import { ShieldCheck, LogOut } from "lucide-react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
} from "lucide-react";
import { BACKEND_URL } from "../../utils/api";


const EmployeeNavbar = ({ employee, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post(
        "/employees/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("employee");
      navigate("/employee-login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Left — Brand */}
<div className="flex items-center gap-3">
  <button
    onClick={() =>
      setSidebarOpen(!sidebarOpen)
    }
    className="text-white"
  >
    {sidebarOpen ? (
      <X className="w-6 h-6" />
    ) : (
      <Menu className="w-6 h-6" />
    )}
  </button>

  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
    <ShieldCheck className="w-4 h-4 text-white" />
  </div>

  <span className="text-white font-bold text-sm tracking-tight hidden sm:block">
    Employee Portal
  </span>
</div>

        {/* Right — User + Logout */}
        {employee && (
          <div className="flex items-center gap-3">
            {/* User info */}
            <div className="hidden sm:block text-right">
              <p className="text-white text-sm font-medium leading-none">{employee.name}</p>
              <p className="text-slate-500 text-xs mt-0.5 capitalize">{employee.role || "Employee"}</p>
            </div>

            {/* Avatar */}
            <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0">
              <img
                src={
                  employee.profilePic
                    ? `${BACKEND_URL}/uploads/${employee.profilePic}`
                    : "https://placehold.co/40x40"
                }
                alt="profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-700 hover:border-indigo-500 transition-colors"
              />
            </motion.div>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-700/80 flex-shrink-0" />

            {/* Logout button */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 text-sm font-medium transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
};

export default EmployeeNavbar;