import { useState, useEffect, useRef } from "react";
import api from "../services/axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  BarChart3,
  Search,
  Clock,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Monitor,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── tiny helpers ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

const MONTHS = [
  { v: "01", l: "January" },  { v: "02", l: "February" },
  { v: "03", l: "March" },    { v: "04", l: "April" },
  { v: "05", l: "May" },      { v: "06", l: "June" },
  { v: "07", l: "July" },     { v: "08", l: "August" },
  { v: "09", l: "September"}, { v: "10", l: "October" },
  { v: "11", l: "November" }, { v: "12", l: "December" },
];

/* ─── sub-components ───────────────────────────────── */
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
      <span className={`p-2 rounded-xl ${color}`}>
        <Icon size={16} className="text-white" />
      </span>
      <div>
        <p className="text-xs text-slate-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function TableRow({ children, index }) {
  return (
    <motion.tr
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="border-b border-slate-800/70 hover:bg-slate-800/40 transition-colors group"
    >
      {children}
    </motion.tr>
  );
}

function EmptyState({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-slate-500"
    >
      <AlertCircle size={36} className="mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </motion.div>
  );
}

/* ─── shift badge ───────────────────────────────────── */
function ShiftBadge({ shift }) {
  const map = {
    day:       "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    afternoon: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    night:     "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${map[shift] || map.night}`}>
      {shift}
    </span>
  );
}

/* ─── attendance rate mini bar ──────────────────────── */
function RateBar({ present, total }) {
  const pct = total ? Math.round((present / total) * 100) : 0;
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";
  const textColor = pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-rose-400";
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-1 min-w-[60px]">
      <span className={`text-sm font-bold ${textColor}`}>{present}</span>
      <span className="text-[10px] text-slate-500">{pct}%</span>
      <div className="w-10 h-1 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── main component ───────────────────────────────── */
const AttendanceTracker = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [tab, setTab] = useState("day");

  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [dayAttendance, setDayAttendance] = useState([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [companyMonthlyData, setCompanyMonthlyData] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(false);

  /* all-month extras */
  const [empSearch, setEmpSearch] = useState("");
  const tableScrollRef = useRef(null);

  useEffect(() => { getEmployees(); }, []);

  const getEmployees = async () => {
    try {
      const res = await api.get(`/employees/company/${companyId}`);
      setEmployees(res.data.employees || []);
    } catch (error) { console.log(error); }
  };

  const getAttendanceByDate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/superadmin/date", { date }, { withCredentials: true });
      setDayAttendance(res.data.attendance);
    } catch (error) { console.log(error); }
    finally { setLoading(false); }
  };

  const getMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.post(
        "/superadmin/monthly",
        { employeeId, month, year },
        { withCredentials: true }
      );
      setSelectedEmployee(res.data.employee);
      setMonthlyAttendance(res.data.attendance);
    } catch (error) { console.log(error); }
    finally { setLoading(false); }
  };

  const getAllMonthlyAttendance = async () => {
    setLoading(true);
    setEmpSearch("");
    try {
      const res = await api.post(
        "/superadmin/all-monthly",
        { companyId, month, year },
        { withCredentials: true }
      );
      setCompanyMonthlyData(res.data.tableData);
      setTotalDays(res.data.totalDays);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const presentDays = monthlyAttendance.filter(r => r.checkInTime).length;

  /* filtered rows for all-month */
  const filteredMonthlyData = empSearch
    ? companyMonthlyData.filter(
        e =>
          e.employeeName?.toLowerCase().includes(empSearch.toLowerCase()) ||
          (e.empId || "").toLowerCase().includes(empSearch.toLowerCase())
      )
    : companyMonthlyData;

  /* all-month summary stats */
  const allMonthStats = (() => {
    const rows = filteredMonthlyData;
    let totalPresent = 0;
    rows.forEach(emp => {
      for (let d = 1; d <= totalDays; d++) {
        if (emp[d] && emp[d].checkInTime) totalPresent++;
      }
    });
    const possible = rows.length * totalDays;
    return {
      employees: rows.length,
      totalPresent,
      rate: possible ? Math.round((totalPresent / possible) * 100) : 0,
    };
  })();

  /* scroll helpers */
  const scrollTable = (dir) => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white p-4 sm:p-8">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-900/15 blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto">

        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
              <BarChart3 size={20} className="text-indigo-400" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Tracker</h1>
          </div>
          <p className="text-slate-500 text-sm ml-12">View and analyse employee attendance records</p>
        </motion.div>

        {/* ── tabs ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 p-1.5 bg-slate-900/70 border border-slate-800 rounded-2xl w-fit"
        >
          {[
            { key: "day",      icon: Calendar,  label: "By Day"        },
            { key: "month",    icon: BarChart3,  label: "By Month"      },
            { key: "allmonth", icon: Users,      label: "All By Month"  },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${tab === key ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              {tab === key && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-indigo-600 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={15} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </motion.div>

        {/* ── panels ── */}
        <AnimatePresence mode="wait">

          {/* DAY TAB */}
          {tab === "day" && (
            <motion.div
              key="day"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6"
            >
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-400" /> Daily Attendance
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white text-sm
                      focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
                  />
                </div>
                <button
                  onClick={getAttendanceByDate}
                  disabled={!date || loading}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                    disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all active:scale-95"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                  {loading ? "Fetching…" : "Search"}
                </button>
              </div>

              <AnimatePresence>
                {!loading && dayAttendance.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-7"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span className="text-sm text-slate-400">
                        <span className="text-white font-semibold">{dayAttendance.length}</span> records found
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left font-medium">#</th>
                            <th className="px-4 py-3 text-left font-medium">Employee</th>
                            <th className="px-4 py-3 text-left font-medium">ID</th>
                            <th className="px-4 py-3 text-left font-medium">
                              <span className="flex items-center gap-1"><LogIn size={12}/>Check In</span>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              <span className="flex items-center gap-1"><LogOut size={12}/>Check Out</span>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">Shift</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayAttendance.map((item, i) => (
                            <TableRow key={item._id} index={i}>
                              <td className="px-4 py-3.5 text-slate-500 text-xs">{i + 1}</td>
                              <td className="px-4 py-3.5 font-medium text-white">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30
                                    flex items-center justify-center text-indigo-300 text-xs font-bold">
                                    {item.employeeId?.name?.[0] || "?"}
                                  </span>
                                  {item.employeeId?.name}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{item.employeeId?.empId}</td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                  <Clock size={12}/>{item.checkInTime || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                                  <Clock size={12}/>{item.checkOutTime || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <ShiftBadge shift={item.shift} />
                              </td>
                            </TableRow>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
                {!loading && date && dayAttendance.length === 0 && (
                  <EmptyState message="No attendance records found for this date." />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* MONTH TAB */}
          {tab === "month" && (
            <motion.div
              key="month"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6"
            >
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-400" /> Monthly Attendance
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="relative sm:col-span-1">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full appearance-none bg-slate-800/80 border border-slate-700 rounded-xl
                      pl-9 pr-8 py-3 text-sm text-white focus:outline-none focus:border-indigo-500
                      focus:ring-1 focus:ring-indigo-500/40 transition"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.empId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full appearance-none bg-slate-800/80 border border-slate-700 rounded-xl
                      pl-9 pr-8 py-3 text-sm text-white focus:outline-none focus:border-indigo-500
                      focus:ring-1 focus:ring-indigo-500/40 transition"
                  >
                    <option value="">Select Month</option>
                    {MONTHS.map(({ v, l }) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl
                      pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500
                      focus:ring-1 focus:ring-indigo-500/40 transition"
                    placeholder="Year"
                  />
                </div>
              </div>

              <button
                onClick={getMonthlyAttendance}
                disabled={!employeeId || !month || loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                  disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all active:scale-95"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                {loading ? "Fetching…" : "View Report"}
              </button>

              <AnimatePresence>
                {!loading && monthlyAttendance.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-7"
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/25 border border-indigo-500/40
                          flex items-center justify-center text-indigo-300 font-bold text-base shrink-0">
                          {selectedEmployee?.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">{selectedEmployee?.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{selectedEmployee?.empId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <StatPill icon={CheckCircle2} label="Present" value={`${presentDays} days`} color="bg-emerald-600/80" />
                        <StatPill icon={Calendar} label="Total" value={`${monthlyAttendance.length} records`} color="bg-indigo-600/80" />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left font-medium">#</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-left font-medium">
                              <span className="flex items-center gap-1"><LogIn size={12}/>Check In</span>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              <span className="flex items-center gap-1"><LogOut size={12}/>Check Out</span>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">Shift</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyAttendance.map((item, i) => (
                            <TableRow key={item._id} index={i}>
                              <td className="px-4 py-3.5 text-slate-500 text-xs">{i + 1}</td>
                              <td className="px-4 py-3.5 text-slate-300 font-medium">{item.date}</td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                  <Clock size={12}/>{item.checkInTime || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                                  <Clock size={12}/>{item.checkOutTime || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <ShiftBadge shift={item.shift} />
                              </td>
                              <td className="px-4 py-3.5">
                                {item.checkInTime ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                    bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Present
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                    bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    Absent
                                  </span>
                                )}
                              </td>
                            </TableRow>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
                {!loading && employeeId && month && monthlyAttendance.length === 0 && (
                  <EmptyState message="No attendance records found for this period." />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ALL MONTH TAB */}
          {tab === "allmonth" && (
            <motion.div
              key="allmonth"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6"
            >
              {/* heading */}
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <Users size={18} className="text-indigo-400" />
                Company Monthly Attendance
              </h2>

              {/* filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full appearance-none bg-slate-800/80 border border-slate-700 rounded-xl
                      pl-9 pr-8 py-3 text-sm text-white focus:outline-none focus:border-indigo-500
                      focus:ring-1 focus:ring-indigo-500/40 transition"
                  >
                    <option value="">Select Month</option>
                    {MONTHS.map(({ v, l }) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl
                      pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500
                      focus:ring-1 focus:ring-indigo-500/40 transition"
                    placeholder="Year"
                  />
                </div>
              </div>

              <button
                onClick={getAllMonthlyAttendance}
                disabled={!month || loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                  disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all active:scale-95 mb-6"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                {loading ? "Fetching…" : "Load Attendance"}
              </button>

              {/* results */}
              <AnimatePresence>
                {!loading && companyMonthlyData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* summary stats */}
                    <div className="flex flex-wrap gap-3 mb-5">
                      <StatPill icon={Users}      label="Employees"      value={allMonthStats.employees} color="bg-indigo-600/80" />
                      <StatPill icon={CheckCircle2} label="Total present" value={allMonthStats.totalPresent} color="bg-emerald-600/80" />
                      <StatPill icon={TrendingUp}  label="Attendance rate" value={`${allMonthStats.rate}%`} color="bg-violet-600/80" />
                      <StatPill icon={Calendar}    label="Working days"   value={totalDays} color="bg-slate-600/80" />
                    </div>

                    {/* search + legend row */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">
                      {/* search */}
                      <div className="relative flex-1 w-full sm:w-auto">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <input
                          type="text"
                          value={empSearch}
                          onChange={(e) => setEmpSearch(e.target.value)}
                          placeholder="Search employee…"
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl
                            pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500
                            focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
                        />
                      </div>

                      {/* legend pills */}
                      <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-slate-400">Check-in</span>
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          <span className="text-slate-400">Check-out</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400">Day</span>
                        <span className="px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/20 text-orange-400">Afternoon</span>
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">Night</span>
                      </div>
                    </div>

                    {/* scroll nav for mobile */}
                    <div className="flex sm:hidden justify-between items-center mb-2 text-xs text-slate-500">
                      <button
                        onClick={() => scrollTable(-1)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition"
                      >
                        <ChevronLeft size={13} /> Scroll left
                      </button>
                      <span className="text-slate-600">swipe or tap</span>
                      <button
                        onClick={() => scrollTable(1)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition"
                      >
                        Scroll right <ChevronRight size={13} />
                      </button>
                    </div>

                    {/* table */}
                    <div className="rounded-2xl border border-slate-800 overflow-hidden">
                      <div
                        ref={tableScrollRef}
                        className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        <table className="border-collapse" style={{ minWidth: "max-content", width: "100%" }}>
                          <thead>
                            <tr className="bg-slate-800/80 border-b border-slate-700">
                              {/* sticky employee header */}
                              <th
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 border-r border-slate-700/80"
                                style={{
                                  position: "sticky",
                                  left: 0,
                                  background: "#1a2235",
                                  zIndex: 10,
                                  minWidth: 180,
                                }}
                              >
                                Employee
                              </th>
                              {Array.from({ length: totalDays }, (_, i) => (
                                <th
                                  key={i + 1}
                                  className="px-1.5 py-3 text-center text-xs font-semibold text-slate-400"
                                  style={{ minWidth: 110 }}
                                >
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700/50 text-slate-300 font-bold text-xs">
                                    {i + 1}
                                  </span>
                                </th>
                              ))}

                            </tr>
                          </thead>

                          <tbody>
                            {filteredMonthlyData.length === 0 ? (
                              <tr>
                                <td colSpan={totalDays + 1}>
                                  <EmptyState message="No employee matches your search." />
                                </td>
                              </tr>
                            ) : (
                              filteredMonthlyData.map((employee, rowIdx) => {
                                let presentCount = 0;
                                for (let d = 1; d <= totalDays; d++) {
                                  if (employee[d] && employee[d].checkInTime) presentCount++;
                                }
                                const initials = (employee.employeeName || "?")
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase();

                                return (
                                  <motion.tr
                                    key={employee.employeeId}
                                    custom={rowIdx}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="show"
                                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group"
                                  >
                                    {/* sticky employee name cell */}
                                    <td
                                      className="px-3 py-3 border-r border-slate-700/50"
                                      style={{
                                        position: "sticky",
                                        left: 0,
                                        background: "inherit",
                                        zIndex: 5,
                                        minWidth: 180,
                                        backgroundColor: "#0d1526",
                                      }}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30
                                          flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                                          {initials}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium text-white truncate leading-tight">
                                            {employee.employeeName}
                                          </p>
                                          {employee.empId && (
                                            <p className="text-[10px] text-slate-500 font-mono leading-tight">
                                              {employee.empId}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    {/* day cells */}
                                    {Array.from({ length: totalDays }, (_, i) => {
                                      const day = employee[i + 1];
                                      return (
                                        <td key={i + 1} className="px-1.5 py-2 align-middle" style={{ minWidth: 110 }}>
                                          {day && day.checkInTime ? (
                                            <div className="rounded-xl bg-slate-800/70 border border-slate-700/60 px-2 py-2 flex flex-col gap-1.5">
                                              {/* check-in */}
                                              <div className="flex items-center gap-1.5">
                                                <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 7V1M1 4l3-3 3 3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                </span>
                                                <span className="text-xs font-semibold text-emerald-400 leading-none tabular-nums">
                                                  {day.checkInTime}
                                                </span>
                                              </div>
                                              {/* check-out */}
                                              <div className="flex items-center gap-1.5">
                                                <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                                                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 1v6M1 4l3 3 3-3" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                </span>
                                                <span className="text-xs font-semibold text-rose-400 leading-none tabular-nums">
                                                  {day.checkOutTime || "—"}
                                                </span>
                                              </div>
                                              {/* shift */}
                                              <div className="pt-0.5">
                                                <ShiftBadge shift={day.shift} />
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center h-[72px]">
                                              <span className="w-6 h-6 rounded-full bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-600 text-xs font-bold select-none">—</span>
                                            </div>
                                          )}
                                        </td>
                                      );
                                    })}


                                  </motion.tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {filteredMonthlyData.length > 0 && (
                      <p className="text-xs text-slate-600 mt-3 text-center">
                        Showing {filteredMonthlyData.length} of {companyMonthlyData.length} employees
                      </p>
                    )}
                  </motion.div>
                )}

                {!loading && month && companyMonthlyData.length === 0 && (
                  <EmptyState message="No attendance data found for this month." />
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AttendanceTracker;