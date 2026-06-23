import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext  } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, LogOut, Mail, Tag, Clock } from "lucide-react";
import { AnimatePresence } from "framer-motion";
// import EmployeeSidebar from "../shared/EmployeeSidebar";
import toast from "react-hot-toast";


const InfoCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-white text-sm font-medium mt-0.5 truncate">{value}</p>
    </div>
  </motion.div>
);

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  // const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const navigate = useNavigate();
  const now = new Date();

  const [currentTime, setCurrentTime] =
  useState(new Date());

useEffect(() => {
  const interval =
    setInterval(() => {
      setCurrentTime(
        new Date()
      );
    }, 1000);

  return () =>
    clearInterval(interval);
}, []);

  useEffect(() => {
    const stored = localStorage.getItem("employee");
    if (!stored) {
      navigate("/employee-login");
      return;
    }
    setEmployee(JSON.parse(stored));
  }, []);

  const checkIn = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/attendance/checkin",
        {},
        { withCredentials: true }
      );
      setLastAction({ type: "in", message: res.data.message, timing: res.data.attendance?.timing });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Check In failed");
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/attendance/checkout",
        {},
        { withCredentials: true }
      );
      setLastAction({ type: "out", message: res.data.message });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Check Out failed");
    } finally {
      setLoading(false);
    }
  };

  const timeStr = currentTime.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
{/* <EmployeeSidebar
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
/> */}
      {/* Welcome */}
      {employee && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">
            Good day, <span className="text-indigo-400">{employee.name}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">{dateStr}</p>
        </motion.div>
      )}

      {/* Info Cards */}
      {employee && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <InfoCard icon={Mail}  label="Email"  value={employee.email}              color="bg-blue-600/80" />
          <InfoCard icon={Tag}   label="Role"   value={employee.role || "Employee"} color="bg-indigo-600/80" />
          <InfoCard icon={Clock} label="Time"   value={timeStr}                     color="bg-violet-600/80" />
        </div>
      )}

      {/* Attendance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8"
      >
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
          Attendance
        </p>
        <h2 className="text-white text-xl font-bold mb-1">Mark your presence</h2>
        <p className="text-slate-500 text-sm mb-8">
          Tap Check In when you arrive, Check Out when you leave.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Check In */}
          <motion.button
            onClick={checkIn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center justify-center gap-3 py-7 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 hover:bg-emerald-600/25 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 group-hover:bg-emerald-600/30 flex items-center justify-center transition-colors">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">Check In</p>
              <p className="text-xs text-emerald-600 mt-0.5">Start your shift</p>
            </div>
          </motion.button>

          {/* Check Out */}
          <motion.button
            onClick={checkOut}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center justify-center gap-3 py-7 rounded-2xl bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/15 group-hover:bg-red-500/25 flex items-center justify-center transition-colors">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">Check Out</p>
              <p className="text-xs text-red-600 mt-0.5">End your shift</p>
            </div>
          </motion.button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-500 text-xs mt-5"
          >
            Processing...
          </motion.p>
        )}
      </motion.div>

      <AnimatePresence>
  {lastAction && (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 10,
      }}
      className="mt-5 p-4 rounded-xl bg-slate-900 border border-slate-700"
    >
      <p className="text-white text-sm">
        {lastAction.message}
      </p>

      {lastAction.timing && (
        <p className="text-indigo-400 text-xs mt-1">
          Timing:
          {" "}
          {lastAction.timing}
        </p>
      )}
    </motion.div>
  )}
</AnimatePresence>


    </div>
  );
};

export default EmployeeDashboard;