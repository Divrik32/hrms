import { useState } from "react";
import api from "../services/axios";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Calendar,
  CalendarPlus,
  Stethoscope,
  Umbrella,
  // ClockBolt,
  Send,
  CheckCircle,
  Sun,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";


const LEAVE_TYPES = [
  {
    value: "Casual Leave",
    label: "Casual leave",
    Icon: Umbrella,
  },
  {
    value: "Sick Leave",
    label: "Sick leave",
    Icon: Stethoscope,
  },
  {
    value: "Compensatory Off",
    label: "Comp. off",
    Icon: Sun,
  },
];

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const ApplyLeaveRequest = () => {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [compOffWorkDate, setCompOffWorkDate] = useState(null);

  const leaveDays =
    fromDate && toDate
      ? Math.floor(
          (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)
        ) + 1
      : 0;

  const stepsDone = [
    leaveType !== "",
    fromDate !== "" && toDate !== "" && toDate >= fromDate,
    reason.trim().length > 0,
  ];
  const allDone = stepsDone.every(Boolean);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post(
        "/leaves/apply",
        {
          leaveType,
          fromDate,
          toDate,
          leaveDays,
          reason,
          compOffWorkDate: compOffWorkDate
            ? compOffWorkDate.toISOString().split("T")[0]
            : "",
        },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
      setCompOffWorkDate(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-start p-6 pt-10">
      <div className="w-full max-w-xl">

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
        >
          {/* Header */}
          <div className="px-7 pt-7 pb-5 border-b border-slate-800 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <CalendarPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Apply Leave Request</h1>
              <p className="text-sm text-slate-400 mt-0.5">Fill in the details to submit your leave</p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="px-7 pt-5 flex gap-2">
            {[...stepsDone, allDone].map((done, i) => (
              <motion.div
                key={i}
                animate={{ backgroundColor: done ? "#6366f1" : "#334155" }}
                transition={{ duration: 0.3 }}
                className="h-1 flex-1 rounded-full"
              />
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="px-7 py-6 space-y-5">

            {/* Leave type */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Leave type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LEAVE_TYPES.map(({ value, label, Icon }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setLeaveType(value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all duration-200
                      ${leaveType === value
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comp-off date picker */}
            <AnimatePresence>
              {leaveType === "Compensatory Off" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Date you worked (weekend only)
                    </label>
                    <DatePicker
                      selected={compOffWorkDate}
                      onChange={(date) => setCompOffWorkDate(date)}
                      filterDate={isWeekend}
                      placeholderText="Select Saturday or Sunday"
                      dateFormat="dd/MM/yyyy"
                      required
                      className="w-full bg-slate-900 text-white text-sm px-3 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                    />
                    <AnimatePresence>
                      {compOffWorkDate && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
                        >
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          {compOffWorkDate.toLocaleDateString("en-IN", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Date range */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Leave period
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">From</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                    className="w-full bg-slate-800 text-white text-sm px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">To</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                    className="w-full bg-slate-800 text-white text-sm px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <AnimatePresence>
                {leaveDays > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5"
                  >
                    <Sun className="w-4 h-4" />
                    {leaveDays} {leaveDays === 1 ? "leave day" : "leave days"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Reason
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                placeholder="Briefly describe the reason for your leave…"
                className="w-full bg-slate-800 text-white text-sm px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 resize-none placeholder-slate-500"
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors duration-200"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit leave request
                </>
              )}
            </motion.button>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ApplyLeaveRequest;