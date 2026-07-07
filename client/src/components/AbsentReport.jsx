import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  CalendarX2,
  Search,
  Users,
  User,
  ChevronDown,
  Trash2,
  AlertTriangle,
  Building2,
  X,
} from "lucide-react";

import api, { BACKEND_URL } from "../services/axios";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const CURRENT_DATE = new Date();

// =====================================================
// Motion Variants
// =====================================================

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
};

export default function AbsentReport() {
  const { companyId } = useParams();

  // =====================================================
  // Tabs
  // =====================================================

  const [activeTab, setActiveTab] =
    useState("employee");

  // =====================================================
  // Month & Year
  // =====================================================

  const [month, setMonth] = useState(
    CURRENT_DATE.getMonth() + 1
  );

  const [year, setYear] = useState(
    CURRENT_DATE.getFullYear()
  );

  // =====================================================
  // Employee List
  // =====================================================

  const [employees, setEmployees] =
    useState([]);

  const [loadingEmployees, setLoadingEmployees] =
    useState(false);

  // =====================================================
  // Particular Employee Tab
  // =====================================================

  const [selectedEmployee, setSelectedEmployee] =
    useState("");

  const [employeeAbsentDates, setEmployeeAbsentDates] =
    useState([]);

  const [loadingEmployeeReport, setLoadingEmployeeReport] =
    useState(false);

  // =====================================================
  // All Employees Tab
  // =====================================================

  const [monthlyAbsents, setMonthlyAbsents] =
    useState([]);

  const [loadingMonthlyReport, setLoadingMonthlyReport] =
    useState(false);

  // =====================================================
  // Search (Only 2nd Tab)
  // =====================================================

  const [searchEmployee, setSearchEmployee] =
    useState("");

  // =====================================================
  // Delete Modal
  // =====================================================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteEmployeeId, setDeleteEmployeeId] =
    useState("");

  const [deleteAbsentDate, setDeleteAbsentDate] =
    useState("");

  // =====================================================
  // Initial Employee Load
  // =====================================================

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =====================================================
  // Employee Dropdown Data
  // =====================================================

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);

      const { data } =
        await api.get(
          `/employees/company/${companyId}`
        );

      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // =====================================================
  // Live Search (Only 2nd Tab)
  // =====================================================

  const filteredMonthlyEmployees =
    useMemo(() => {
      if (!searchEmployee.trim())
        return monthlyAbsents;

      return monthlyAbsents.filter((item) => {
        const keyword =
          searchEmployee.toLowerCase();

        return (
          item.employeeId?.name
            ?.toLowerCase()
            .includes(keyword) ||
          item.employeeId?.empId
            ?.toLowerCase()
            .includes(keyword)
        );
      });
    }, [monthlyAbsents, searchEmployee]);

    // ==========================================================
// LOAD PARTICULAR EMPLOYEE ABSENT DATES
// ==========================================================

const loadEmployeeAbsentDates = async () => {
  if (!selectedEmployee) {
    setEmployeeAbsentDates([]);
    return;
  }

  try {
    setLoadingEmployeeReport(true);

    const { data } = await api.post(
      "/absent/employee-absent-dates",
      {
        employeeId: selectedEmployee,
        month,
        year,
      }
    );
    console.log(data);
    

    if (data.success) {
      setEmployeeAbsentDates(
  data.absentDates || []
);
    }
  } catch (error) {
    console.log(error);
    setEmployeeAbsentDates([]);
  } finally {
    setLoadingEmployeeReport(false);
  }
};

// ==========================================================
// LOAD ALL EMPLOYEE ABSENTS
// ==========================================================

const loadMonthlyAbsents = async () => {
  try {
    setLoadingMonthlyReport(true);

    const { data } = await api.post(
      "/absent/monthly-absents",
      {
        companyId,
        month,
        year,
      }
    );

    if (data.success) {

      // --------------------------------------------
      // Group same employee together
      // --------------------------------------------

      const grouped = {};

      data.absents.forEach((item) => {

        const empId = item.employeeId._id;

        if (!grouped[empId]) {

          grouped[empId] = {
            _id: empId,

            employeeId: item.employeeId,

            absentDates: [],
          };

        }

grouped[empId].absentDates.push({
  absentDate: item.absentDate,
  absentId: item._id,
  duration: item.duration,
});

      });

      setMonthlyAbsents(
        Object.values(grouped)
      );

    }

  } catch (error) {
    console.log(error);
    setMonthlyAbsents([]);
  } finally {
    setLoadingMonthlyReport(false);
  }
};

// ==========================================================
// LOAD REPORTS
// ==========================================================

useEffect(() => {

  if (
    activeTab === "employee"
  ) {

    loadEmployeeAbsentDates();

  }

}, [
  selectedEmployee,
  month,
  year,
  activeTab,
]);

useEffect(() => {

  if (
    activeTab === "all"
  ) {

    loadMonthlyAbsents();

  }

}, [
  month,
  year,
  activeTab,
]);

// ==========================================================
// REMOVE ABSENT
// ==========================================================

const handleRemoveAbsent =
  async () => {
    try {
      await api.delete(
        "/absent/remove-absent",
        {
          data: {
            employeeId:
              deleteEmployeeId,

            absentDate:
              deleteAbsentDate,
          },
        }
      );

      setShowDeleteModal(false);

      if (
        activeTab ===
        "employee"
      ) {

        loadEmployeeAbsentDates();

      } else {

        loadMonthlyAbsents();

      }

    } catch (error) {

      console.log(error);

    }

  };

  // =====================================================
  // Derived
  // =====================================================

  const selectedEmployeeObj = employees.find(
    (e) => e._id === selectedEmployee
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05070d] text-slate-100">

      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-[110px]" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

        {/* ==========================================================
            HEADER
        ========================================================== */}

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-end lg:justify-between"
        >

          <div className="flex items-start gap-3">

            <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/50">
              <CalendarX2 size={22} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight !bg-gradient-to-r !from-[#ff5500] !via-[#ff5500] !to-[#ff5500] bg-clip-text !text-transparent sm:text-3xl">
                Absent Report
              </h1>
              <p className="mt-1 text-sm text-slate-400 sm:text-base">
                Track and manage employee absences at a glance
              </p>
            </div>

          </div>

          {/* Month / Year */}

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">

            <div className="relative">
              <Calendar
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <select
                value={month}
                onChange={(e) =>
                  setMonth(Number(e.target.value))
                }
                className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/70 py-3 pl-10 pr-9 text-sm font-medium text-slate-200 outline-none backdrop-blur transition-colors focus:border-indigo-500 sm:w-40"
              >
                {MONTHS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            <div className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="number"
                value={year}
                onChange={(e) =>
                  setYear(Number(e.target.value))
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 py-3 pl-10 pr-3 text-sm font-medium text-slate-200 outline-none backdrop-blur transition-colors focus:border-indigo-500 sm:w-28"
              />
            </div>

          </div>

        </motion.div>

        {/* ==========================================================
            TABS
        ========================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-1.5 backdrop-blur sm:mb-8 sm:inline-flex sm:w-auto">

          <button
            onClick={() => setActiveTab("employee")}
            className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:px-6 sm:py-3 ${
              activeTab === "employee"
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {activeTab === "employee" && (
              <motion.span
                layoutId="tab-pill"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-950/40"
              />
            )}
            <User size={17} className="relative z-10" />
            <span className="relative z-10">Particular Employee</span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:px-6 sm:py-3 ${
              activeTab === "all"
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {activeTab === "all" && (
              <motion.span
                layoutId="tab-pill"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-950/40"
              />
            )}
            <Users size={17} className="relative z-10" />
            <span className="relative z-10">All Employees</span>
          </button>

        </div>

        {/* ==========================================================
            CONTENT
        ========================================================== */}

        <AnimatePresence mode="wait">

          {/* ==========================================================
              PARTICULAR EMPLOYEE TAB
          ========================================================== */}

          {activeTab === "employee" && (

            <motion.div
              key="employee"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 sm:space-y-6"
            >

              {/* Employee Dropdown */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur sm:p-6">

                <label className="mb-3 block text-sm font-medium text-slate-300">
                  Employee Name ( Employee ID )
                </label>

                <div className="relative">

                  <User
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <select
                    value={selectedEmployee}
                    onChange={(e) =>
                      setSelectedEmployee(e.target.value)
                    }
                    disabled={loadingEmployees}
                    className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0d1220] py-3.5 pl-11 pr-10 text-white outline-none transition-colors focus:border-indigo-500 disabled:opacity-60"
                  >

                    <option value="">
                      {loadingEmployees ? "Loading employees…" : "Select Employee"}
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
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                </div>

                {selectedEmployeeObj && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-xs text-slate-500"
                  >
                    Showing records for{" "}
                    <span className="font-semibold text-indigo-400">
                      {selectedEmployeeObj.name}
                    </span>{" "}
                    · {MONTHS.find((m) => m.value === month)?.label} {year}
                  </motion.p>
                )}

              </div>

              {/* Employee Absent List */}

<div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur sm:p-6">

                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold !text-white sm:text-xl">
                    Absent Dates
                  </h2>
                  {employeeAbsentDates.length > 0 && (
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                      {employeeAbsentDates.length} day
                      {employeeAbsentDates.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {loadingEmployeeReport ? (

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-lg bg-slate-800/50"
                      />
                    ))}
                  </div>

                ) : !selectedEmployee ? (

                  <div className="py-14 text-center text-slate-500">
                    <User className="mx-auto mb-3 opacity-60" size={42} />
                    Select an employee to view their absent record.
                  </div>

                ) : employeeAbsentDates.length === 0 ? (

                  <div className="py-14 text-center text-slate-500">
                    <CalendarDays className="mx-auto mb-3 opacity-60" size={42} />
                    No absent record found.
                  </div>

                ) : (

                  <motion.div
                    variants={listContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
                  >

                    <AnimatePresence>
                      {employeeAbsentDates.map((item) => (

                        <motion.div
                          key={item.absentDate}
                          variants={listItemVariants}
                          exit="exit"
                          layout
                          className="group flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#0d1220] px-4 py-3 transition-colors hover:border-indigo-500/40"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                item.duration === 0.5
                                  ? "bg-orange-400"
                                  : "bg-emerald-400"
                              }`}
                            />

                            <div className="flex min-w-0 flex-col">

                              <p className="truncate text-sm font-medium text-white">
                                {new Date(item.absentDate).toLocaleDateString(undefined, {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>

                              <span
                                className={`text-[11px] font-medium ${
                                  item.duration === 0.5
                                    ? "text-orange-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {item.duration === 0.5 ? "Half Day" : "Full Day"}
                              </span>

                            </div>

                          </div>

                          <button
                            onClick={() => {
                              setDeleteEmployeeId(selectedEmployee);
                              setDeleteAbsentDate(item.absentDate);
                              setShowDeleteModal(true);
                            }}
                            className="flex shrink-0 items-center justify-center rounded-md bg-red-600/90 p-1.5 text-white transition-colors hover:bg-red-600"
                          >
                            <Trash2 size={13} />
                          </button>

                        </motion.div>

                      ))}
                    </AnimatePresence>

                  </motion.div>

                )}

              </div>

            </motion.div>

          )}

          {/* ==========================================================
              ALL EMPLOYEES TAB
          ========================================================== */}

          {activeTab === "all" && (

            <motion.div
              key="all"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 sm:space-y-6"
            >

              {/* Search */}

              <div className="relative">

                <Search
                  size={18}
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  placeholder="Search employee name or employee ID…"
                  value={searchEmployee}
                  onChange={(e) =>
                    setSearchEmployee(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 py-3.5 pl-14 pr-11 text-white outline-none backdrop-blur transition-colors placeholder:text-slate-500 focus:border-indigo-500"
                />

                {searchEmployee && (
                  <button
                    onClick={() => setSearchEmployee("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X size={17} />
                  </button>
                )}

              </div>

              {/* Employee Cards */}

              {loadingMonthlyReport ? (

                <div className="grid gap-5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-40 animate-pulse rounded-2xl bg-slate-800/40"
                    />
                  ))}
                </div>

              ) : filteredMonthlyEmployees.length === 0 ? (

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 py-16 text-center text-slate-500 backdrop-blur">
                  <Users size={45} className="mx-auto mb-3 opacity-60" />
                  No absent report found.
                </div>

              ) : (

                <motion.div
                  variants={listContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid gap-5"
                >

                  <AnimatePresence>
                    {filteredMonthlyEmployees.map((item) => (

                      <motion.div
                        key={item._id}
                        variants={listItemVariants}
                        exit="exit"
                        layout
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur transition-colors hover:border-slate-700 sm:p-6"
                      >

{/* Employee */}

                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

                          <div className="flex items-center gap-4">

                            <img
                              src={
                                item.employeeId?.profilePic
                                  ? `${BACKEND_URL}/uploads/${item.employeeId.profilePic}`
                                  : "https://placehold.co/60"
                              }
                              alt={item.employeeId?.name}
                              className="h-14 w-14 shrink-0 rounded-full border-2 border-slate-700 object-cover"
                            />

                            <div>

                              <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-white sm:text-lg">
                                {item.employeeId?.name}
                                <span className="text-sm font-medium text-indigo-400">
                                  ({item.employeeId?.empId})
                                </span>
                              </h3>

                              {item.employeeId?.departmentId?.departmentName && (
                                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
                                  <Building2 size={13} />
                                  {item.employeeId.departmentId.departmentName}
                                </p>
                              )}

                            </div>

                          </div>

                          <span className="shrink-0 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                            {item.absentDates.length} absent
                            {item.absentDates.length > 1 ? "s" : ""}
                          </span>

                        </div>

                        {/* Dates */}

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">

                          <AnimatePresence>
                            {item.absentDates.map((date) => (

                              <motion.div
                                key={date.absentDate}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#0d1220] px-4 py-3 transition-colors hover:border-indigo-500/40"
                              >

                                <div className="flex items-center gap-3 min-w-0">

                                  <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${
                                      date.duration === 0.5
                                        ? "bg-orange-400"
                                        : "bg-emerald-400"
                                    }`}
                                  />

                                  <div className="flex min-w-0 flex-col">

                                    <p className="truncate text-sm font-medium text-white">
                                      {new Date(date.absentDate).toLocaleDateString(
                                        undefined,
                                        {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        }
                                      )}
                                    </p>

                                    <span
                                      className={`text-[11px] font-medium ${
                                        date.duration === 0.5
                                          ? "text-orange-400"
                                          : "text-emerald-400"
                                      }`}
                                    >
                                      {date.duration === 0.5 ? "Half Day" : "Full Day"}
                                    </span>

                                  </div>

                                </div>

                                <button
                                  onClick={() => {
                                    setDeleteEmployeeId(item.employeeId._id);
                                    setDeleteAbsentDate(date.absentDate);
                                    setShowDeleteModal(true);
                                  }}
                                  className="flex shrink-0 items-center justify-center rounded-md bg-red-600/90 p-1.5 text-white transition-colors hover:bg-red-600"
                                >
                                  <Trash2 size={13} />
                                </button>

                              </motion.div>

                            ))}
                          </AnimatePresence>

                        </div>

                      </motion.div>

                    ))}
                  </AnimatePresence>

                </motion.div>

              )}

            </motion.div>

          )}

        </AnimatePresence>

        {/* ==========================================================
            DELETE MODAL
        ========================================================== */}

        <AnimatePresence>

          {showDeleteModal && (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >

              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.85, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="w-full max-w-md overflow-hidden rounded-3xl border border-red-500/20 bg-[#0d1220] shadow-[0_0_50px_rgba(0,0,0,0.6)]"
              >

                {/* Header */}

<div className="flex flex-col items-center justify-center px-8 py-8">

                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
                    <AlertTriangle size={30} className="text-red-500" />
                  </div>

                  <h2 className="text-xl font-bold !text-white sm:text-2xl">
                    Remove Absent?
                  </h2>

                  <p className="mt-3 text-center text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
                    Are you sure you want to remove the absent record on{" "}
                    <span className="font-semibold text-red-400">
                      {deleteAbsentDate &&
                        new Date(deleteAbsentDate).toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                    </span>
                    ?
                    <br />
                    This action cannot be undone.
                  </p>

                </div>

                {/* Footer */}

<div className="flex justify-between border-t border-slate-800 px-6 py-5">

  <button
    onClick={() => setShowDeleteModal(false)}
    className="rounded-xl bg-slate-800 px-5 py-3 font-medium text-slate-200 transition-colors hover:bg-slate-700 sm:px-6"
  >
    Cancel
  </button>

  <button
    onClick={handleRemoveAbsent}
    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-700 sm:px-6"
  >
    <Trash2 size={18} />
    Delete
  </button>

</div>

              </motion.div>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </div>
  );
}