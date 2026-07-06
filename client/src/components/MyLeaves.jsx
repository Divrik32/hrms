import { useEffect, useMemo, useState } from "react";
import api from "../services/axios";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  Hourglass,
  Sun,
  Moon,
  Palmtree,
  Stethoscope,
  Wallet,
  MessageSquareText,
  Inbox,
  Loader2,
  ListChecks,
} from "lucide-react";

const statusStyle = {
  Pending: "bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/30",
  Approved: "bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30",
  Rejected: "bg-rose-400/10 text-rose-300 ring-1 ring-inset ring-rose-400/30",
};

const statusIcon = {
  Pending: Hourglass,
  Approved: CheckCircle2,
  Rejected: XCircle,
};

const statusBar = {
  Pending: "from-amber-400 to-amber-500",
  Approved: "from-emerald-400 to-emerald-500",
  Rejected: "from-rose-400 to-rose-500",
};

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leaves/my-leaves");
      const data = res.data?.leaves || res.data?.data?.leaves || res.data;
      console.log(res);

      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("API ERROR:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  };

  const withdrawLeave = async (leaveId) => {
    setWithdrawingId(leaveId);
    try {
      const res = await api.delete(`/leaves/withdraw/${leaveId}`);

      toast.success(res.data.message);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Withdraw failed");
    } finally {
      setWithdrawingId(null);
    }
  };

  const summary = useMemo(() => {
    const base = { total: leaves.length, Pending: 0, Approved: 0, Rejected: 0 };
    leaves.forEach((l) => {
      if (base[l.status] !== undefined) base[l.status] += 1;
    });
    return base;
  }, [leaves]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-3 bg-[#0b0a1a]">
        <Loader2 className="animate-spin text-indigo-400" size={32} />
        <p className="text-slate-400 text-sm font-medium">Loading your leaves…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0b0a1a] overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/50">
              <CalendarDays className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold !bg-gradient-to-r !from-[#fb00c5] !via-[#ac0246] !to-[#f70368] bg-clip-text !text-transparent tracking-tight">
                My Leaves
              </h1>
              <p className="text-sm text-slate-400">Track and manage your leave requests</p>
            </div>
          </div>

          {/* Quick stats */}
          {leaves.length > 0 && (
            <div className="grid grid-cols-4 sm:flex sm:items-center gap-2 sm:gap-3">
              <StatPill label="Total" value={summary.total} className="bg-white/10 text-white ring-1 ring-white/10" />
              <StatPill label="Pending" value={summary.Pending} className="bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20" />
              <StatPill label="Approved" value={summary.Approved} className="bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20" />
              <StatPill label="Rejected" value={summary.Rejected} className="bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20" />
            </div>
          )}
        </motion.div>

        {leaves.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-12 ring-1 ring-white/10 text-center flex flex-col items-center gap-3"
          >
            <div className="p-3 rounded-full bg-white/5 ring-1 ring-white/10">
              <Inbox className="text-slate-400" size={28} />
            </div>
            <p className="font-semibold text-slate-200">No leave records found</p>
            <p className="text-sm text-slate-500">Leaves you apply for will show up here.</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {leaves.map((leave, index) => {
                const StatusIcon = statusIcon[leave.status] || Hourglass;
                const dates = leave.leaveDates?.length
                  ? leave.leaveDates
                  : leave.extraLeaveDetails?.extraLeaveDates || [];
                const fallbackType = [
                  leave.extraLeaveDetails?.extraLeaveType?.casualLeave > 0 &&
                    `Casual (${leave.extraLeaveDetails.extraLeaveType.casualLeave})`,
                  leave.extraLeaveDetails?.extraLeaveType?.sickLeave > 0 &&
                    `Sick (${leave.extraLeaveDetails.extraLeaveType.sickLeave})`,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <motion.div
                    key={leave._id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: index * 0.05, duration: 0.35 }}
                    whileHover={{ y: -4 }}
                    className="group relative bg-white/[0.04] backdrop-blur-xl rounded-2xl ring-1 ring-white/10 hover:ring-white/20 shadow-lg shadow-black/30 hover:shadow-indigo-900/30 overflow-hidden transition-all duration-300"
                  >
                    {/* status accent bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${statusBar[leave.status] || "from-slate-500 to-slate-600"}`} />

                    <div className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[leave.status] || "bg-white/5 text-slate-300"}`}
                        >
                          <StatusIcon size={13} />
                          {leave.status}
                        </span>

                        {leave.status === "Pending" && (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={() =>
      withdrawLeave(leave._id)
    }
    disabled={
      withdrawingId === leave._id
    }
    className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
  >
    {withdrawingId === leave._id ? (
      <>
        <Loader2
          size={14}
          className="animate-spin"
        />
        Withdrawing...
      </>
    ) : (
      <>
        <Trash2 size={14} />
        Withdraw Request
      </>
    )}
  </motion.button>
)}
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-100">
                          <ListChecks size={15} className="text-indigo-400" />
                          Total Days: <span className="text-indigo-300">{leave.totalDays}</span>
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed">{leave.reason}</p>
                      </div>

                      {/* Leave dates timeline */}
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                          Leave Dates
                        </h3>
                        <div className="space-y-2 relative">
                          {dates.map((item, idx) => {
                            const isFullDay = item.duration === 1;
                            const DurationIcon = isFullDay ? Sun : Moon;
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-3 border border-white/10 bg-white/[0.03] rounded-xl px-3 py-2 text-sm"
                              >
                                <div className="p-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 shrink-0">
                                  <DurationIcon size={14} className={isFullDay ? "text-amber-400" : "text-indigo-300"} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-200">{item.date}</div>
                                  <div className="text-xs text-slate-500">
                                    {isFullDay ? "Full Day" : "Half Day"}
                                  </div>
                                </div>
                                <div className="text-xs font-medium text-indigo-300 text-right shrink-0">
                                  {item.leaveType || fallbackType}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Remaining balance */}
                      <div className="border-t border-white/10 pt-4 mb-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2.5">
                          Remaining Balance
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          <BalanceItem icon={Palmtree} label="Casual" value={leave.remainingCasualLeave} color="text-emerald-400" />
                          <BalanceItem icon={Stethoscope} label="Sick" value={leave.remainingSickLeave} color="text-sky-400" />
                          <BalanceItem icon={Wallet} label="Paid" value={leave.remainingPaidLeave} color="text-violet-400" />
                        </div>
                      </div>

                      {leave.adminRemark && (
                        <div className="mt-4 bg-white/[0.03] ring-1 ring-white/10 p-3 rounded-xl">
                          <p className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-slate-400">
                            <MessageSquareText size={13} />
                            Admin Remark
                          </p>
                          <p className="text-sm text-slate-300">{leave.adminRemark}</p>
                        </div>
                      )}

                      <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock size={13} />
                        Applied on {new Date(leave.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

const StatPill = ({ label, value, className }) => (
  <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 sm:flex-row sm:gap-1.5 sm:px-3.5 sm:py-1.5 ${className}`}>
    <span className="text-base sm:text-sm font-bold leading-none">{value}</span>
    <span className="text-[10px] sm:text-xs font-medium opacity-80">{label}</span>
  </div>
);

const BalanceItem = ({ icon: Icon, label, value, color }) => (
  <div className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.03] ring-1 ring-white/10 py-2.5">
    <Icon size={16} className={color} />
    <span className="text-sm font-bold text-slate-100">{value}</span>
    <span className="text-[10px] text-slate-500 font-medium">{label}</span>
  </div>
);

export default MyLeaves;