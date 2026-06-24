import { useEffect, useState } from "react";
import api from "../services/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Stethoscope,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";


const statusConfig = {
  Approved: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    dot: "bg-emerald-400",
  },
  Rejected: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    dot: "bg-red-400",
  },
  Pending: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    dot: "bg-amber-400",
  },
};

const leaveTypeIcon = (type) => {
  if (type === "Sick Leave") return <Stethoscope size={13} />;
  if (type === "Compensatory Off") return <Briefcase size={13} />;
  return <Calendar size={13} />;
};

const accentGradient = (status) => {
  if (status === "Approved") return "linear-gradient(90deg,#10b981,#34d399)";
  if (status === "Rejected") return "linear-gradient(90deg,#ef4444,#f87171)";
  return "linear-gradient(90deg,#f59e0b,#fbbf24)";
};

const LeaveCard = ({ leave, onWithdraw, index }) => {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[leave.status] || statusConfig.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.065, type: "spring", stiffness: 260, damping: 24 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(145deg,#1e293b 0%,#162032 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Accent bar */}
      <div className="h-1 w-full" style={{ background: accentGradient(leave.status) }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg text-slate-300"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            {leaveTypeIcon(leave.leaveType)}
            {leave.leaveType}
          </span>
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${status.color} ${status.bg} ${status.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {leave.status}
          </span>
        </div>

        {/* Date Range */}
        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-4"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-0.5">From</p>
            <p className="text-white text-sm font-semibold">{leave.fromDate}</p>
          </div>
          <div className="w-6 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="flex-1 text-right">
            <p className="text-xs text-slate-500 mb-0.5">To</p>
            <p className="text-white text-sm font-semibold">{leave.toDate}</p>
          </div>
          <div
            className="ml-1 px-2.5 py-1.5 rounded-lg text-center min-w-[44px]"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}
          >
            <p className="text-indigo-300 font-bold text-sm leading-none">{leave.leaveDays}</p>
            <p className="text-indigo-400 mt-0.5" style={{ fontSize: "10px" }}>days</p>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: "Casual Leave", value: leave.remainingCasualLeave },
            { label: "Sick Leave", value: leave.remainingSickLeave },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-slate-500 mb-1" style={{ fontSize: "11px" }}>{label}</p>
              <p className="text-white font-bold text-xl leading-none">{value}</p>
              <p className="text-slate-600 mt-0.5" style={{ fontSize: "10px" }}>remaining</p>
            </div>
          ))}
        </div>

        {/* Expandable */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 mb-1"
        >
          <span>View details</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-3">
                {leave.leaveType === "Compensatory Off" && leave.compOffWorkDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Worked On</span>
                    <span className="text-slate-300">{leave.compOffWorkDate}</span>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Reason</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{leave.reason}</p>
                </div>
                {leave.adminRemark && (
                  <div
                    className="p-3 rounded-xl"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    <p className="text-xs text-indigo-400 mb-1 font-medium">Admin Remark</p>
                    <p className="text-slate-300 text-sm">{leave.adminRemark}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div
          className="flex items-center justify-between mt-auto pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Clock3 size={12} />
            Applied {new Date(leave.createdAt).toLocaleDateString()}
          </div>
          {leave.status === "Pending" && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onWithdraw(leave._id)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-red-400 transition-colors"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <Trash2 size={12} />
              Withdraw
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMyLeaves(); }, []);

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get("/leaves/my-leaves", {
        withCredentials: true,
      });
      setLeaves(res.data.leaves);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const withdrawLeave = async (leaveId) => {
    try {
      const res = await api.delete(
        `/leaves/withdraw/${leaveId}`,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      fetchMyLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const stats = [
    { label: "Total", value: leaves.length, color: "text-slate-200", bg: "rgba(255,255,255,0.05)" },
    { label: "Approved", value: leaves.filter(l => l.status === "Approved").length, color: "text-emerald-400", bg: "rgba(16,185,129,0.08)" },
    { label: "Pending", value: leaves.filter(l => l.status === "Pending").length, color: "text-amber-400", bg: "rgba(245,158,11,0.08)" },
    { label: "Rejected", value: leaves.filter(l => l.status === "Rejected").length, color: "text-red-400", bg: "rgba(239,68,68,0.08)" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent"
        />
        <p className="text-slate-400 text-sm">Loading your leaves...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              <CalendarDays size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Leave History</h1>
              <p className="text-slate-500 text-sm">Track and manage your leave requests</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {stats.map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="p-4 rounded-2xl"
              style={{ background: bg, border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-slate-500 text-xs mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </motion.div>

        {/* Cards or Empty */}
        {leaves.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-16 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <CalendarDays size={40} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No leave records found</p>
            <p className="text-slate-600 text-sm mt-1">Your leave requests will appear here</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {leaves.map((leave, i) => (
              <LeaveCard key={leave._id} leave={leave} onWithdraw={withdrawLeave} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeaves;