import { useEffect, useState } from "react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, LayoutGrid, LogOut, ShieldCheck, Mail, Tag, ChevronRight, CalendarClock, ClipboardCheck, CalendarDays } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4`}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-white font-semibold text-sm mt-0.5">{value}</p>
    </div>
  </motion.div>
);

const ActionButton = ({ icon: Icon, label, description, onClick, color, badge }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, x: 2 }}
    whileTap={{ scale: 0.98 }}
    className="w-full bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600/70 rounded-2xl p-5 flex items-center gap-4 text-left transition-all group"
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-white font-semibold text-sm">{label}</p>
        {badge > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            {badge} pending
          </span>
        )}
      </div>
      <p className="text-slate-500 text-xs mt-0.5">{description}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
  </motion.button>
);

const SuperAdminDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
  const fetchPendingLeaves =
    async () => {
      try {
        const res =
          await api.get(
            "/leaves/pending",
            {
              withCredentials: true,
            }
          );

        setPendingCount(
          res.data.totalLeaves
        );
      } catch (error) {
        console.log(error);
      }
    };

  fetchPendingLeaves();
}, []);

  const handleAttendanceTracker = async () => {
  try {
    const res = await api.get(
      "/companies"
    );

    const companies = res.data.companies;

    if (companies.length > 0) {
      navigate(
        `/${companies[0]._id}/company/attendance-tracker`
      );
    }
  } catch (error) {
    console.log(error);
  }
};

  const handleLogout = async () => {
    try {
      await api.post(
        "/superadmin/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      {/* Navbar */}


      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Welcome */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="text-indigo-400">{user.name}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage your platform from here.</p>
          </motion.div>
        )}

        {/* Stats */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={Mail} label="Email" value={user.email} color="bg-blue-600/80" />
            <StatCard icon={Tag} label="Role" value={user.role} color="bg-indigo-600/80" />
            <StatCard icon={ShieldCheck} label="Status" value="Active" color="bg-emerald-600/80" />
          </div>
        )}

        {/* Actions */}
        <div className="mb-6">
<div className="flex items-center justify-between mb-3">
  <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
    Quick Actions
  </h2>
</div>
          <div className="space-y-3">
            <ActionButton
              icon={Building2}
              label="Create Company"
              description="Register a new company to the platform"
              onClick={() => navigate("/admin/create-company")}
              color="bg-violet-600/80"
            />
            <ActionButton
              icon={LayoutGrid}
              label="Create Department"
              description="Add a new department under a company"
              onClick={() => navigate("/admin/create-department")}
              color="bg-cyan-600/80"
            />
            <ActionButton
              icon={Mail}
              label="Create Employee"
              description="Add a new employee under company & department"
              onClick={() => navigate("/admin/create-employee")}
              color="bg-emerald-600/80"
            />
            
            <ActionButton
              icon={ClipboardCheck}
              label="Attendance Tracker"
              description="Track employee attendance"
              onClick={handleAttendanceTracker}
              color="bg-orange-600/80"
            />
            
            <div className="relative">
            <ActionButton
              icon={CalendarClock}
              label="Pending Leaves"
              description="View and manage pending leave requests"
              onClick={() => navigate("/admin/pending-leaves")}
              color="bg-yellow-600/80"
              badge={pendingCount}
            />
              {pendingCount > 0 && (
                <div className="absolute top-3 right-12 bg-red-500 text-white text-xs font-bold min-w-[24px] h-6 px-2 rounded-full flex items-center justify-center">
                  {pendingCount}
                </div>
              )}
            </div>
            <ActionButton
              icon={CalendarDays}
              label="Create Holiday"
              description="Create upcoming holidays for employees"
              onClick={() => navigate("/admin/create-holiday")}
              color="bg-purple-600/80"
            />
            <ActionButton
              icon={Tag}
              label="Create Employee Salary"
              description="Create salary structure for employees"
              onClick={() => navigate("/admin/create-employee-salary")}
              color="bg-pink-600/80"
            /> 
            <ActionButton
              icon={ClipboardCheck}
              label="Edit Employee Salary"
              description="Update existing employee salary structure"
              onClick={() => navigate("/admin/edit-employee-salary")}
              color="bg-teal-600/80"
            />
          </div>
        </div>

        {/* Logout */}
        {/* <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 border border-red-500/30 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-2xl py-3.5 text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button> */}
              </main>
    </div>
  );
};

export default SuperAdminDashboard;