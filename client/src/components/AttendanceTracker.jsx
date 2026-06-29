import { useState, useEffect, useRef, useCallback } from "react";
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
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── animation presets ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.32, ease: "easeOut" },
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

const DAYS_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const NAME_COL_MIN = 90;
const NAME_COL_MAX = 280;
const NAME_COL_DEFAULT = 160;

/* ─── shared input classes ──────────────────────────── */
const inputCls =
  "w-full bg-[#111827] border border-[#1f2f47] rounded-xl px-4 py-3 text-sm text-white " +
  "placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 " +
  "focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200";

const selectCls =
  "w-full appearance-none bg-[#111827] border border-[#1f2f47] rounded-xl pl-10 pr-8 py-3 " +
  "text-sm text-white focus:outline-none focus:border-indigo-500 " +
  "focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200";

/* ─── sub-components ────────────────────────────────── */

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#111827] border border-[#1f2f47]">
      <span className={`p-2 rounded-xl ${color}`}>
        <Icon size={15} className="text-white" />
      </span>
      <div>
        <p className="text-[11px] text-slate-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3"
    >
      <div className="w-14 h-14 rounded-full bg-slate-800/60 flex items-center justify-center">
        <AlertCircle size={24} className="opacity-40" />
      </div>
      <p className="text-sm text-center max-w-xs">{message}</p>
    </motion.div>
  );
}

function ShiftBadge({ shift }) {
  const map = {
    day:       "bg-amber-500/15 text-amber-300 border border-amber-500/25",
    afternoon: "bg-orange-500/15 text-orange-300 border border-orange-500/25",
    night:     "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[12px] font-semibold capitalize ${map[shift] || map.night}`}>
      {shift || "—"}
    </span>
  );
}

function TableRow({ children, index }) {
  return (
    <motion.tr
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="border-b border-[#1a2535] hover:bg-white/[0.02] transition-colors"
    >
      {children}
    </motion.tr>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <Icon size={17} className="text-indigo-400" />
      </span>
      <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
    </div>
  );
}

function SelectWrapper({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
      <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
      {children}
    </div>
  );
}

function SearchBtn({ onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500
        disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold
        transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-900/30"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
      {loading ? "Fetching…" : "Search"}
    </button>
  );
}

/* ─── Attendance Cell (reused in weekly + all-month) ── */
function AttCell({ entry, compact = false }) {
  if (!entry?.checkInTime) {
    return (
      <div className="flex items-center justify-center h-full min-h-[56px]">
        <span className="w-5 h-5 rounded-full bg-[#111827] border border-[#1f2f47] flex items-center justify-center text-slate-600 text-[10px]">
          —
        </span>
      </div>
    );
  }
  return (
    <div className={`rounded-xl bg-[#111827] border border-[#1a2d3d] px-2 py-2 flex flex-col gap-1 ${compact ? "min-w-[80px]" : "min-w-[96px]"}`}>
      <span className="flex items-center gap-1 text-emerald-400 text-[14px] font-semibold tabular-nums">
        <LogIn size={9} /> {entry.checkInTime}
      </span>
      <span className="flex items-center gap-1 text-rose-400 text-[14px] font-semibold tabular-nums">
        <LogOut size={9} /> {entry.checkOutTime || "—"}
      </span>
      <ShiftBadge shift={entry.shift} />
    </div>
  );
}

/* ─── Resizable Column Hook ─────────────────────────── */
function useResizableColumn(defaultWidth = NAME_COL_DEFAULT) {
  const [colWidth, setColWidth] = useState(defaultWidth);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(defaultWidth);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = colWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [colWidth]);

  const onTouchStart = useCallback((e) => {
    dragging.current = true;
    startX.current = e.touches[0].clientX;
    startW.current = colWidth;
  }, [colWidth]);

  useEffect(() => {
    const onMove = (clientX) => {
      if (!dragging.current) return;
      const delta = clientX - startX.current;
      const newW = Math.min(NAME_COL_MAX, Math.max(NAME_COL_MIN, startW.current + delta));
      setColWidth(newW);
    };
    const onMouseMove = (e) => onMove(e.clientX);
    const onTouchMove = (e) => onMove(e.touches[0].clientX);
    const stop = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    };
  }, []);

  return { colWidth, onMouseDown, onTouchStart };
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const AttendanceTracker = () => {
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
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weeklyAttendance, setWeeklyAttendance] = useState({ days: [], tableData: [] });
  const [loading, setLoading] = useState(false);
  const [empSearch, setEmpSearch] = useState("");
  const tableScrollRef = useRef(null);

  const { colWidth, onMouseDown, onTouchStart } = useResizableColumn(NAME_COL_DEFAULT);

  useEffect(() => { getEmployees(); }, []);

  useEffect(() => {
    const loadWeeks = async () => {
      if (!month || !year) return;
      try {
        const res = await api.post("superadmin/month-weeks", { month, year }, { withCredentials: true });
        setAvailableWeeks(res.data.weeks || []);
        setSelectedWeek("");
      } catch (e) { console.log(e); }
    };
    loadWeeks();
  }, [month, year]);

  const getEmployees = async () => {
    try {
      const res = await api.get(`/employees/company/${companyId}`);
      setEmployees(res.data.employees || []);
    } catch (e) { console.log(e); }
  };

  const getAttendanceByDate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/superadmin/date", { date }, { withCredentials: true });
      setDayAttendance(res.data.attendance);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const getMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.post("/superadmin/monthly", { employeeId, month, year }, { withCredentials: true });
      setSelectedEmployee(res.data.employee);
      setMonthlyAttendance(res.data.attendance);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const getAllMonthlyAttendance = async () => {
    setLoading(true);
    setEmpSearch("");
    try {
      const res = await api.post("/superadmin/all-monthly", { companyId, month, year }, { withCredentials: true });
      setCompanyMonthlyData(res.data.tableData);
      setTotalDays(res.data.totalDays);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load data");
    } finally { setLoading(false); }
  };

  const getWeeklyAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.post("/superadmin/weekly-attendance", {
        companyId, month, year, weekNo: Number(selectedWeek),
      }, { withCredentials: true });
      setWeeklyAttendance({ days: res.data.days || [], tableData: res.data.tableData || [] });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load weekly attendance");
    } finally { setLoading(false); }
  };

  const presentDays = monthlyAttendance.filter(r => r.checkInTime).length;

  const filteredMonthlyData = empSearch
    ? companyMonthlyData.filter(e =>
        e.employeeName?.toLowerCase().includes(empSearch.toLowerCase()) ||
        (e.empId || "").toLowerCase().includes(empSearch.toLowerCase())
      )
    : companyMonthlyData;

  const allMonthStats = (() => {
    let totalPresent = 0;
    filteredMonthlyData.forEach(emp => {
      for (let d = 1; d <= totalDays; d++) {
        if (emp[d]?.checkInTime) totalPresent++;
      }
    });
    const possible = filteredMonthlyData.length * totalDays;
    return {
      employees: filteredMonthlyData.length,
      totalPresent,
      rate: possible ? Math.round((totalPresent / possible) * 100) : 0,
    };
  })();

  const scrollTable = (dir) => {
    tableScrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  const stickyBg = "#080f1c";

  /* weekly summary stats */
  const weeklyStats = (() => {
    const td = weeklyAttendance.tableData;
    if (!td.length) return null;
    let total = 0;
    td.forEach(emp => {
      weeklyAttendance.days.forEach(day => { if (emp[day]?.checkInTime) total++; });
    });
    const possible = td.length * weeklyAttendance.days.length;
    return { present: total, rate: possible ? Math.round((total / possible) * 100) : 0 };
  })();

  const TABS = [
    { key: "day",      icon: Calendar,   label: "By Day"       },
    { key: "month",    icon: BarChart3,  label: "By Month"     },
    { key: "allmonth", icon: Users,      label: "All Month"    },
    { key: "week",     icon: TrendingUp, label: "Weekly"       },
  ];

  return (
    <div className="min-h-screen bg-[#060b14] text-white">
      {/* ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-[140px]" />
        <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full bg-violet-900/15 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-10">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30">
              <Activity size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Attendance Tracker
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm">
                View and analyse employee attendance records
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {/* Mobile: 2×2 grid */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {TABS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200
                  ${tab === key
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                    : "bg-[#111827] border border-[#1f2f47] text-slate-400 hover:text-slate-200 hover:border-indigo-500/40"
                  }`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Desktop: horizontal pill */}
          <div className="hidden sm:flex gap-1.5 p-1.5 bg-[#0d1624] border border-[#1f2f47] rounded-2xl w-fit">
            {TABS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${tab === key ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                {tab === key && (
                  <motion.span
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/50"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={15} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── PANELS ── */}
        <AnimatePresence mode="wait">

          {/* ══ DAY TAB ══ */}
          {tab === "day" && (
            <motion.div
              key="day"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0d1624]/80 border border-[#1f2f47] rounded-3xl p-5 sm:p-7 backdrop-blur-sm"
            >
              <SectionHeader icon={Calendar} title="Daily Attendance" />

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputCls + " pl-9"}
                  />
                </div>
                <SearchBtn onClick={getAttendanceByDate} disabled={!date} loading={loading} />
              </div>

              <AnimatePresence>
                {!loading && dayAttendance.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-xs text-slate-400">
                        <span className="text-white font-bold">{dayAttendance.length}</span> records found
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-[#1f2f47]">
                      <table className="w-full text-sm min-w-[500px]">
                        <thead>
                          <tr className="bg-[#111827] text-slate-400 text-xs uppercase tracking-wider">
                            {["#", "Employee", "ID", "Check In", "Check Out", "Shift"].map(h => (
                              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dayAttendance.map((item, i) => (
                            <TableRow key={item._id} index={i}>
                              <td className="px-4 py-3.5 text-slate-600 text-xs">{i + 1}</td>
                              <td className="px-4 py-3.5 font-medium text-white">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30
                                    flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                                    {item.employeeId?.name?.[0] || "?"}
                                  </span>
                                  <span className="truncate">{item.employeeId?.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{item.employeeId?.empId}</td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                                  <Clock size={11} />{item.checkInTime || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                                  <Clock size={11} />{item.checkOutTime || "—"}
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
                  <EmptyState message="No records found for this date." />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══ MONTH TAB ══ */}
          {tab === "month" && (
            <motion.div
              key="month"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0d1624]/80 border border-[#1f2f47] rounded-3xl p-5 sm:p-7 backdrop-blur-sm"
            >
              <SectionHeader icon={BarChart3} title="Monthly Attendance" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <SelectWrapper icon={User}>
                  <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={selectCls}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name} ({emp.empId})</option>
                    ))}
                  </select>
                </SelectWrapper>

                <SelectWrapper icon={Calendar}>
                  <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls}>
                    <option value="">Select Month</option>
                    {MONTHS.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </SelectWrapper>

                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
                    className={inputCls + " pl-9"} placeholder="Year" />
                </div>
              </div>

              <button
                onClick={getMonthlyAttendance}
                disabled={!employeeId || !month || loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                  disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all active:scale-95
                  shadow-lg shadow-indigo-900/30"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                {loading ? "Fetching…" : "View Report"}
              </button>

              <AnimatePresence>
                {!loading && monthlyAttendance.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40
                          flex items-center justify-center text-indigo-300 font-bold shrink-0">
                          {selectedEmployee?.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-white">{selectedEmployee?.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{selectedEmployee?.empId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <StatPill icon={CheckCircle2} label="Present" value={`${presentDays} days`} color="bg-emerald-600/80" />
                        <StatPill icon={Calendar} label="Total records" value={monthlyAttendance.length} color="bg-indigo-600/80" />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#1f2f47]">
                      <table className="w-full text-sm min-w-[480px]">
                        <thead>
                          <tr className="bg-[#111827] text-slate-400 text-xs uppercase tracking-wider">
                            {["#", "Date", "Check In", "Check Out", "Shift", "Status"].map(h => (
                              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyAttendance.map((item, i) => (
                            <TableRow key={item._id} index={i}>
                              <td className="px-4 py-3.5 text-slate-600 text-xs">{i + 1}</td>
                              <td className="px-4 py-3.5 text-slate-300 font-medium">{item.date}</td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                                  <Clock size={11} />{item.checkInTime || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                                  <Clock size={11} />{item.checkOutTime || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5"><ShiftBadge shift={item.shift} /></td>
                              <td className="px-4 py-3.5">
                                {item.checkInTime ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                    bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Present
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                    bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />Absent
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
                  <EmptyState message="No records found for this period." />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══ ALL MONTH TAB ══ */}
          {tab === "allmonth" && (
            <motion.div
              key="allmonth"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0d1624]/80 border border-[#1f2f47] rounded-3xl p-5 sm:p-7 backdrop-blur-sm"
            >
              <SectionHeader icon={Users} title="Company Monthly Attendance" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <SelectWrapper icon={Calendar}>
                  <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls}>
                    <option value="">Select Month</option>
                    {MONTHS.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </SelectWrapper>

                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
                    className={inputCls + " pl-9"} placeholder="Year" />
                </div>
              </div>

              <button
                onClick={getAllMonthlyAttendance}
                disabled={!month || loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                  disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all active:scale-95
                  shadow-lg shadow-indigo-900/30 mb-6"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                {loading ? "Fetching…" : "Load Attendance"}
              </button>

              <AnimatePresence>
                {!loading && companyMonthlyData.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    {/* stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                      <StatPill icon={Users}        label="Employees"       value={allMonthStats.employees}      color="bg-indigo-600/80" />
                      <StatPill icon={CheckCircle2} label="Total present"   value={allMonthStats.totalPresent}   color="bg-emerald-600/80" />
                      <StatPill icon={TrendingUp}   label="Attendance rate" value={`${allMonthStats.rate}%`}    color="bg-violet-600/80" />
                      <StatPill icon={Calendar}     label="Working days"    value={totalDays}                    color="bg-slate-600/80" />
                    </div>

                    {/* search + scroll */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-3 items-start sm:items-center">
                      <div className="relative flex-1 w-full">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <input
                          type="text"
                          value={empSearch}
                          onChange={(e) => setEmpSearch(e.target.value)}
                          placeholder="Search employee…"
                          className={inputCls + " pl-9"}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                        <button onClick={() => scrollTable(-1)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#111827] border border-[#1f2f47] hover:border-indigo-500/50 transition">
                          <ChevronLeft size={12} /> Left
                        </button>
                        <button onClick={() => scrollTable(1)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#111827] border border-[#1f2f47] hover:border-indigo-500/50 transition">
                          Right <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>

                    {/* resize hint */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                      <GripVertical size={11} className="text-indigo-400" />
                      Drag handle to resize Name column
                    </div>

                    {/* table */}
                    <div className="rounded-2xl border border-[#1f2f47] overflow-hidden">
                      <div ref={tableScrollRef} className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                        <table className="border-collapse" style={{ minWidth: "max-content", width: "100%" }}>
                          <thead>
                            <tr className="bg-[#111827] border-b border-[#1f2f47]">
                              <th
                                className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 border-r border-[#1f2f47]"
                                style={{ position: "sticky", left: 0, background: "#0e1929", zIndex: 10, width: colWidth, minWidth: colWidth, maxWidth: colWidth }}
                              >
                                <div className="flex items-center justify-between px-4 py-3 gap-1">
                                  <span>Employee</span>
                                  <span
                                    onMouseDown={onMouseDown}
                                    onTouchStart={onTouchStart}
                                    className="flex items-center justify-center w-5 h-6 rounded cursor-col-resize text-slate-500
                                      hover:text-indigo-400 hover:bg-indigo-500/10 active:text-indigo-300 transition shrink-0 touch-none"
                                    style={{ touchAction: "none" }}
                                    title="Drag to resize"
                                  >
                                    <GripVertical size={12} />
                                  </span>
                                </div>
                              </th>
                              {Array.from({ length: totalDays }, (_, i) => (
                                <th key={i + 1} className="px-1.5 py-3 text-center text-xs font-semibold text-slate-400" style={{ minWidth: 110 }}>
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1a2535] text-slate-300 font-bold text-xs">
                                    {i + 1}
                                  </span>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMonthlyData.length === 0 ? (
                              <tr><td colSpan={totalDays + 1}><EmptyState message="No employees match your search." /></td></tr>
                            ) : (
                              filteredMonthlyData.map((employee, rowIdx) => {
                                const initials = (employee.employeeName || "?")
                                  .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                                return (
                                  <motion.tr
                                    key={employee.employeeId}
                                    custom={rowIdx}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="show"
                                    className="border-b border-[#1a2535] hover:bg-white/[0.015] transition-colors"
                                  >
                                    <td
                                      className="py-3 border-r border-[#1f2f47]"
                                      style={{ position: "sticky", left: 0, zIndex: 5, backgroundColor: stickyBg, width: colWidth, minWidth: colWidth, maxWidth: colWidth, overflow: "hidden" }}
                                    >
                                      <div className="flex items-center gap-2 px-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30
                                          flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                                          {initials}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium text-white truncate">{employee.employeeName}</p>
                                          {employee.empId && (
                                            <p className="text-[10px] text-slate-500 font-mono truncate">{employee.empId}</p>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    {Array.from({ length: totalDays }, (_, i) => (
                                      <td key={i + 1} className="px-1.5 py-2 align-middle" style={{ minWidth: 110 }}>
                                        <AttCell entry={employee[i + 1]} />
                                      </td>
                                    ))}
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

          {/* ══ WEEKLY TAB ══ — fully rebuilt, mobile-first */}
          {tab === "week" && (
            <motion.div
              key="week"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0d1624]/80 border border-[#1f2f47] rounded-3xl p-5 sm:p-7 backdrop-blur-sm"
            >
              <SectionHeader icon={TrendingUp} title="Weekly Attendance" />

              {/* filters: stacked on mobile, row on desktop */}
              <div className="flex flex-col gap-3 mb-4">
                {/* Row 1: month + year side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <SelectWrapper icon={Calendar}>
                    <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls}>
                      <option value="">Month</option>
                      {MONTHS.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </SelectWrapper>

                  <div className="relative">
                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className={inputCls + " pl-9"}
                      placeholder="Year"
                    />
                  </div>
                </div>

                {/* Row 2: week picker (full width) */}
                <SelectWrapper icon={Calendar}>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className={selectCls}
                    disabled={!availableWeeks.length}
                  >
                    <option value="">{availableWeeks.length ? "Select Week" : "Choose month first"}</option>
                    {availableWeeks.map(w => (
                      <option key={w.weekNo} value={w.weekNo}>
                        Week {w.weekNo} — {w.startDay} to {w.endDay}
                      </option>
                    ))}
                  </select>
                </SelectWrapper>

                {/* Row 3: button (full width on mobile) */}
                <button
                  onClick={getWeeklyAttendance}
                  disabled={!month || !year || !selectedWeek || loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500
                    disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold
                    transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-900/30"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <TrendingUp size={15} />}
                  {loading ? "Fetching…" : "Load Weekly Attendance"}
                </button>
              </div>

              <AnimatePresence>
                {!loading && weeklyAttendance.tableData.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

                    {/* weekly summary pills */}
                    {weeklyStats && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        <StatPill icon={Users}        label="Employees"  value={weeklyAttendance.tableData.length} color="bg-indigo-600/80" />
                        <StatPill icon={CheckCircle2} label="Present"    value={weeklyStats.present}               color="bg-emerald-600/80" />
                        <StatPill icon={TrendingUp}   label="Rate"       value={`${weeklyStats.rate}%`}            color="bg-violet-600/80" />
                        <StatPill icon={Calendar}     label="Days"       value={weeklyAttendance.days.length}       color="bg-slate-600/80" />
                      </div>
                    )}

                    {/* legend */}
                    <div className="flex flex-wrap gap-2 text-[11px] font-medium mb-4">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111827] border border-[#1f2f47]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-slate-400">Check-in</span>
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111827] border border-[#1f2f47]">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="text-slate-400">Check-out</span>
                      </span>
                    </div>

                    {/* table — horizontally scrollable */}
                    <div className="rounded-2xl border border-[#1f2f47] overflow-hidden">
                      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                        <table className="border-collapse" style={{ minWidth: "max-content", width: "100%" }}>
                          <thead>
                            <tr className="bg-[#111827] border-b border-[#1f2f47]">
                              {/* Sticky Employee column header */}
                              <th
                                className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 border-r border-[#1f2f47] px-4 py-3"
                                style={{ position: "sticky", left: 0, background: "#0e1929", zIndex: 10, minWidth: 140 }}
                              >
                                Employee
                              </th>

                              {/* Day headers */}
                              {weeklyAttendance.days.map((day, i) => {
                                const d = new Date(day);
                                const dayName = DAYS_LABEL[d.getDay()];
                                const dayNum = d.getDate();
                                return (
                                  <th key={i} className="px-2 py-3 text-center min-w-[100px]">
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{dayName}</span>
                                      <span className="w-7 h-7 rounded-full bg-[#1a2535] flex items-center justify-center text-slate-300 font-bold text-xs">
                                        {dayNum}
                                      </span>
                                    </div>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>

                          <tbody>
                            {weeklyAttendance.tableData.map((employee, rowIdx) => {
                              const initials = (employee.employeeName || "?")
                                .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

                              // count present days
                              let presentCount = 0;
                              weeklyAttendance.days.forEach(d => { if (employee[d]?.checkInTime) presentCount++; });

                              return (
                                <motion.tr
                                  key={employee.employeeId}
                                  custom={rowIdx}
                                  variants={fadeUp}
                                  initial="hidden"
                                  animate="show"
                                  className="border-b border-[#1a2535] hover:bg-white/[0.015] transition-colors"
                                >
                                  {/* Sticky employee cell */}
                                  <td
                                    className="py-3 border-r border-[#1f2f47]"
                                    style={{ position: "sticky", left: 0, zIndex: 5, backgroundColor: stickyBg, minWidth: 140 }}
                                  >
                                    <div className="flex items-center gap-2.5 px-3">
                                      <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30
                                        flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                                        {initials}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-white truncate leading-tight">
                                          {employee.employeeName}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-mono truncate">{employee.empId}</p>
                                        {/* mini present bar */}
                                        <div className="flex items-center gap-1.5 mt-1">
                                          <div className="flex-1 h-1 bg-[#1a2535] rounded-full overflow-hidden" style={{ maxWidth: 52 }}>
                                            <div
                                              className={`h-full rounded-full transition-all ${
                                                presentCount / weeklyAttendance.days.length >= 0.8
                                                  ? "bg-emerald-500"
                                                  : presentCount / weeklyAttendance.days.length >= 0.5
                                                  ? "bg-amber-500"
                                                  : "bg-rose-500"
                                              }`}
                                              style={{ width: `${(presentCount / weeklyAttendance.days.length) * 100}%` }}
                                            />
                                          </div>
                                          <span className="text-[9px] text-slate-500 tabular-nums">{presentCount}/{weeklyAttendance.days.length}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Day cells */}
                                  {weeklyAttendance.days.map((day, i) => (
                                    <td key={i} className="px-1.5 py-2 align-middle min-w-[100px]">
                                      <AttCell entry={employee[day]} compact />
                                    </td>
                                  ))}
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 text-center">
                      {weeklyAttendance.tableData.length} employees · {weeklyAttendance.days.length} days shown
                    </p>
                  </motion.div>
                )}

                {!loading && selectedWeek && weeklyAttendance.tableData.length === 0 && (
                  <EmptyState message="No attendance data found for this week." />
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