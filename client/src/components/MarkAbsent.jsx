import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  CalendarDays,
  UserX,
  ChevronDown,
  Loader2,
  Users,
  Fingerprint,
  CheckCircle2,
  CalendarX2,
} from "lucide-react";
import toast from "react-hot-toast";

const MarkAbsent = () => {
  const { companyId } = useParams();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [absentDate, setAbsentDate] = useState("");
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get(
        `/employees/company/${companyId}`,
        {
          withCredentials: true,
        }
      );

      setEmployees(res.data.employees);
    } catch (error) {
      toast.error(
        error.response?.data?.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      return toast.error("Please select employee");
    }

    if (!absentDate) {
      return toast.error("Please select date");
    }

    try {
      setSaving(true);

      const res = await api.post(
        "/absent/mark-absent",
        {
          companyId,
          employeeId: selectedEmployee,
          absentDate,
          duration,
        },
        {
          withCredentials: true,
        }
      );

      toast.success(res.data.message);

      setSelectedEmployee("");
      setAbsentDate("");
      setDuration(1);
    } catch (error) {
      toast.error(
        error.response?.data?.message
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedEmployeeData = employees.find(
    (emp) => emp._id === selectedEmployee
  );

  const formattedDate = absentDate
    ? new Date(absentDate + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const getInitials = (name = "") =>
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-2 border-t-rose-500 border-r-rose-500/40 border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-slate-400 text-sm tracking-wide">
            Loading employees…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-rose-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.035)_1px,transparent_0)] [background-size:26px_26px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 sm:mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/5 border border-rose-500/30 flex items-center justify-center"
          >
            <UserX className="text-rose-400" size={24} />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight !bg-gradient-to-r !from-[#990099] !to-[#ff0099] bg-clip-text !text-transparent
">
              Mark Employee Absent
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Record an absence for any employee in a few clicks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl shadow-black/20"
          >
            <div className="space-y-6">
              {/* Employee select */}
              <div>
                <label className="text-slate-300 mb-2 block text-sm font-medium">
                  Employee
                </label>

                <div className="relative group">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-400 transition-colors"
                    size={18}
                  />

                  <select
                    value={selectedEmployee}
                    onChange={(e) =>
                      setSelectedEmployee(e.target.value)
                    }
                    className="w-full appearance-none bg-slate-800/80 hover:bg-slate-800 rounded-xl py-3.5 pl-10 pr-10 outline-none border border-slate-700/60 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all text-slate-100"
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {employees.map((emp) => (
                      <option
                        key={emp._id}
                        value={emp._id}
                      >
                        {emp.name} ({emp.empId})
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    size={18}
                  />
                </div>

                {employees.length === 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Users size={13} />
                    No employees found for this company
                  </p>
                )}
              </div>

              {/* Date picker */}
              <div>
                <label className="text-slate-300 mb-2 block text-sm font-medium">
                  Absent Date
                </label>

                <div className="relative group">
                  <CalendarDays
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-400 transition-colors"
                    size={18}
                  />

                  <input
                    type="date"
                    value={absentDate}
                    onChange={(e) =>
                      setAbsentDate(e.target.value)
                    }
                    className="w-full bg-slate-800/80 hover:bg-slate-800 rounded-xl py-3.5 pl-10 pr-4 outline-none border border-slate-700/60 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all text-slate-100 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Duration */}
<div>
  <label className="text-slate-300 mb-2 block text-sm font-medium">
    Absent Duration
  </label>

  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => setDuration(1)}
      className={`py-3 rounded-xl border transition-all font-medium ${
        duration === 1
          ? "bg-rose-600 border-rose-500 text-white"
          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-rose-400"
      }`}
    >
      Full Day
    </button>

    <button
      type="button"
      onClick={() => setDuration(0.5)}
      className={`py-3 rounded-xl border transition-all font-medium ${
        duration === 0.5
          ? "bg-[#ffff00] border-[#ffff00] text-black"
          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-400"
      }`}
    >
      Half Day
    </button>
  </div>
</div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving}
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#8f008f] to-[#a300a3] hover:from-[#7b007b] hover:to-[#8f008f] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3.5 font-semibold transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 brightness-125"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving…
                  </>
                ) : (
                  <>
                    <CalendarX2 size={18} />
                    Mark Absent
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Live preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-800 shadow-2xl shadow-black/20 lg:sticky lg:top-8"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-5">
              Summary
            </p>

            <AnimatePresence mode="wait">
              {selectedEmployeeData ? (
                <motion.div
                  key={selectedEmployeeData._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-rose-500/20 border border-slate-700 flex items-center justify-center text-sm font-semibold text-slate-100 shrink-0">
                    {getInitials(selectedEmployeeData.name) || (
                      <User size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {selectedEmployeeData.name}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Fingerprint size={12} />
                      {selectedEmployeeData.empId}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 mb-6 text-slate-500"
                >
                  <div className="h-12 w-12 rounded-full bg-slate-800/70 border border-dashed border-slate-700 flex items-center justify-center shrink-0">
                    <User size={18} />
                  </div>
                  <p className="text-sm">No employee selected yet</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-px bg-slate-800 mb-5" />

            <div className="flex items-start gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  formattedDate
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-slate-800/70 border-slate-700 text-slate-500"
                }`}
              >
                <CalendarDays size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Date
                </p>
                <p
                  className={`text-sm mt-0.5 ${
                    formattedDate ? "text-slate-100" : "text-slate-500"
                  }`}
                >
                  {formattedDate || "No date chosen"}
                </p>
              </div>
            </div>
            {formattedDate && (
  <div className="mt-3 flex items-center gap-2">
    <span className="text-xs text-slate-500">
      Duration :
    </span>

    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        duration === 1
          ? "bg-rose-500/20 text-rose-300"
          : "bg-amber-500/20 text-amber-300"
      }`}
    >
      {duration === 1 ? "Full Day" : "Half Day"}
    </span>
  </div>
)}

            {selectedEmployeeData && formattedDate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 flex items-center gap-2 text-xs text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 px-3"
              >
                <CheckCircle2 size={14} />
                Ready to mark absent
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MarkAbsent;