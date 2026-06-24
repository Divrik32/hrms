import { useEffect, useState } from "react";
import api from "../services/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  XCircle,
  CalendarDays,
  MessageSquare,
  Clock3,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Stethoscope,
  Calendar,
} from "lucide-react";

const leaveTypeIcon = (type) => {
  if (type === "Sick Leave") return <Stethoscope size={13} />;
  if (type === "Compensatory Off") return <Briefcase size={13} />;
  return <Calendar size={13} />;
};

const RejectedCard = ({ leave, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.065, type: "spring", stiffness: 260, damping: 24 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(145deg,#1e1520 0%,#1a1025 100%)",
        border: "1px solid rgba(239,68,68,0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Red accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg,#ef4444,#f87171)" }}
      />

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
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-red-400 border"
            style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Rejected
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
          <div className="w-6 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex-1 text-right">
            <p className="text-xs text-slate-500 mb-0.5">To</p>
            <p className="text-white text-sm font-semibold">{leave.toDate}</p>
          </div>
          <div
            className="ml-1 px-2.5 py-1.5 rounded-lg text-center min-w-[44px]"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <p className="text-red-300 font-bold text-sm leading-none">{leave.leaveDays}</p>
            <p className="text-red-400 mt-0.5" style={{ fontSize: "10px" }}>days</p>
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

        {/* Admin Remark — always visible */}
        <div
          className="p-3 rounded-xl mb-4"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <MessageSquare size={13} className="text-red-400" />
            <p className="text-xs font-semibold text-red-400">Admin Remark</p>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {leave.adminRemark || "No remark provided"}
          </p>
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
                {leave.compOffWorkDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Worked On</span>
                    <span className="text-slate-300">{leave.compOffWorkDate}</span>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Reason</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{leave.reason}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div
          className="flex items-center gap-1.5 text-slate-500 text-xs mt-auto pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Clock3 size={12} />
          Rejected {new Date(leave.rejectedAt).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

const MyRejectedLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRejectedLeaves = async () => {
    try {
      const res = await api.get(
        "/leaves/my-rejected-leaves",
        { withCredentials: true }
      );
      setLeaves(res.data.leaves);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRejectedLeaves(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent"
        />
        <p className="text-slate-400 text-sm">Loading rejected leaves...</p>
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
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <XCircle size={20} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Rejected Leave Requests</h1>
              <p className="text-slate-500 text-sm">
                {leaves.length > 0
                  ? `${leaves.length} request${leaves.length > 1 ? "s" : ""} rejected`
                  : "No rejections on record"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary banner */}
        {leaves.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 p-4 rounded-2xl mb-8"
            style={{
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <XCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-300 text-sm font-medium">
                {leaves.length} leave {leaves.length === 1 ? "request has" : "requests have"} been rejected
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Review admin remarks below to understand the reason for rejection
              </p>
            </div>
          </motion.div>
        )}

        {/* Cards or Empty */}
        {leaves.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-16 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <XCircle size={40} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No rejected leave requests</p>
            <p className="text-slate-600 text-sm mt-1">You have a clean record!</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {leaves.map((leave, i) => (
              <RejectedCard key={leave._id} leave={leave} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRejectedLeaves;