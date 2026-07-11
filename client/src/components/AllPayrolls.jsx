import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Search,
  Building2,
  CalendarDays,
  Loader2,
  ArrowLeft,
  Eye,
  Download,
  Trash2,
  SquarePen 
} from "lucide-react";

const MONTHS = [
  { label: "All Months", value: "" },
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const currentYear = new Date().getFullYear();

const YEARS = [
  "",
  currentYear - 2,
  currentYear - 1,
  currentYear,
  currentYear + 1,
];

export default function AllPayrolls() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [payrolls, setPayrolls] = useState([]);

  const [search, setSearch] = useState("");

  const [companyFilter, setCompanyFilter] = useState("");

  const [monthFilter, setMonthFilter] = useState("");

  const [yearFilter, setYearFilter] = useState("");

  // -----------------------
  // Fetch Payrolls
  // -----------------------

  const fetchPayrolls = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/payroll/all");

      if (data.success) {
        setPayrolls(data.payrolls);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load payrolls."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  // -----------------------
  // Company List
  // -----------------------

  const companies = useMemo(() => {
    const unique = [];

    payrolls.forEach((item) => {
      if (
        item.companyId &&
        !unique.find((c) => c._id === item.companyId._id)
      ) {
        unique.push(item.companyId);
      }
    });

    return unique;
  }, [payrolls]);

  // -----------------------
  // Filtered Payrolls
  // -----------------------

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.employeeId?.name?.toLowerCase().includes(keyword) ||
        item.employeeId?.empId?.toLowerCase().includes(keyword);

      const matchesCompany =
        !companyFilter || item.companyId?._id === companyFilter;

      const matchesMonth = !monthFilter || item.month === Number(monthFilter);

      const matchesYear = !yearFilter || item.year === Number(yearFilter);

      return matchesSearch && matchesCompany && matchesMonth && matchesYear;
    });
  }, [payrolls, search, companyFilter, monthFilter, yearFilter]);

  // -----------------------
  // View Payroll
  // -----------------------

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleView = (payrollId) => {
    window.open(`${BACKEND_URL}/api/payroll/pdf/${payrollId}`, "_blank");
  };

  // -----------------------
  // Download Payroll
  // -----------------------

  const handleDownload = (id) => {
    window.open(`${api.defaults.baseURL}/payroll/download/${id}`, "_blank");
  };

  // -----------------------
  // Delete Payroll
  // -----------------------

  const handleDelete = (payrollId) => {
    toast.custom((t) => (
      <div
        className={`w-96 rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-2xl border border-red-500/30 ring-1 ring-black/40 transition-all duration-300 ${
          t.visible
            ? "animate-in fade-in slide-in-from-top-4"
            : "animate-out fade-out slide-out-to-top-4"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Warning icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          <div className="flex-1">
            <p className="font-semibold text-base !text-white">
              Delete Payroll?
            </p>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">
              This action cannot be undone. Are you sure you want to
              permanently delete this payroll record?
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:border-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              toast.dismiss(t.id);

              try {
                const { data } = await api.delete(
                  `/payroll/delete/${payrollId}`
                );

                if (data.success) {
                  toast.success(data.message);
                  fetchPayrolls();
                }
              } catch (error) {
                toast.error(
                  error.response?.data?.message ||
                    "Failed to delete payroll."
                );
              }
            }}
            className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium !text-white shadow-md shadow-red-950/50 transition-all hover:from-red-500 hover:to-red-600 active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleUpdate = (payrollId) => {
    navigate(`/admin/update-payroll/${payrollId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 lg:px-10">

      {/* Back Button */}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 shadow shadow-black/30 hover:bg-slate-800"
      >
        <ArrowLeft size={20} />
      </motion.button>

      {/* Filters */}

      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow shadow-black/30 sm:grid-cols-2 lg:grid-cols-4">

        {/* Search */}

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-3.5 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400"
          />
        </div>

        {/* Company */}

        <div className="relative">
          <Building2
            size={18}
            className="absolute left-3 top-3.5 text-slate-500"
          />

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-slate-100 outline-none focus:border-indigo-400"
          >
            <option value="" className="bg-slate-800">
              All Companies
            </option>

            {companies.map((company) => (
              <option
                key={company._id}
                value={company._id}
                className="bg-slate-800"
              >
                {company.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-indigo-400"
        >
          {MONTHS.map((month) => (
            <option
              key={month.label}
              value={month.value}
              className="bg-slate-800"
            >
              {month.label}
            </option>
          ))}
        </select>

        {/* Year */}

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-indigo-400"
        >
          <option value="" className="bg-slate-800">
            All Years
          </option>

          {YEARS.filter(Boolean).map((year) => (
            <option key={year} value={year} className="bg-slate-800">
              {year}
            </option>
          ))}
        </select>

      </div>

      {/* Total */}

      <div className="mb-5 font-semibold text-slate-300">
        Total Payrolls : {filteredPayrolls.length}
      </div>

      {/* Loading */}

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold !text-white">
            All Payrolls
          </h1>

          <p className="mt-2 text-slate-400">
            View, download, update and manage every generated payroll.
          </p>
        </div>

<motion.button
  onClick={() => navigate(-1)}
  initial="rest"
  whileHover="hover"
  whileTap={{ scale: 0.94 }}
  className="group relative flex h-10 items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-950/40 px-5 text-sm font-medium !text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-300/80 hover:!text-white"
>
  {/* pulsing electric glow */}
  <motion.span
    className="pointer-events-none absolute inset-0 rounded-full"
    variants={{
      rest: { boxShadow: "0 0 0px rgba(34,211,238,0)" },
      hover: {
        boxShadow: [
          "0 0 0px rgba(34,211,238,0)",
          "0 0 16px rgba(34,211,238,0.6)",
          "0 0 3px rgba(34,211,238,0.25)",
        ],
        transition: { duration: 0.55, repeat: Infinity, ease: "easeInOut" },
      },
    }}
  />

  {/* traveling electric wave line under the button */}
  {/* <svg
    className="pointer-events-none absolute -bottom-[3px] left-0 h-3 w-full overflow-visible"
    viewBox="0 0 120 12"
    preserveAspectRatio="none"
  >
    <motion.path
      d="M0,6 Q6,0 12,6 T24,6 T36,6 T48,6 T60,6 T72,6 T84,6 T96,6 T108,6 T120,6"
      fill="none"
      stroke="#22d3ee"
      strokeWidth="1.5"
      strokeLinecap="round"
      variants={{
        rest: { pathLength: 0, opacity: 0 },
        hover: {
          pathLength: [0, 1],
          opacity: [0, 1, 1, 0],
          transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
        },
      }}
    />
  </svg> */}

  <ArrowLeft
    size={16}
    className="relative z-10 transition-transform duration-300 group-hover:-translate-x-0.5"
  />
  <span className="relative z-10">Back</span>
</motion.button>
      </motion.div>

      {/* Summary */}
      <div className="mb-8 grid gap-5 md:grid-cols-4">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow shadow-black/30">
          <p className="text-sm text-slate-400">
            Total Payrolls
          </p>

          <h2 className="mt-2 text-3xl font-bold !text-indigo-400">
            {payrolls.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow shadow-black/30">
          <p className="text-sm text-slate-400">
            Total Employees
          </p>

          <h2 className="mt-2 text-3xl font-bold !text-emerald-400">
            {new Set(payrolls.map((p) => p.employeeId?._id)).size}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow shadow-black/30">
          <p className="text-sm text-slate-400">
            Total Companies
          </p>

          <h2 className="mt-2 text-3xl font-bold !text-orange-400">
            {new Set(payrolls.map((p) => p.companyId?._id)).size}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow shadow-black/30">
          <p className="text-sm text-slate-400">
            Total Amount
          </p>

          <h2 className="mt-2 text-2xl font-bold !text-pink-400">
            ₹
            {payrolls
              .reduce((sum, p) => sum + Number(p.payableSalary || 0), 0)
              .toLocaleString("en-IN")}
          </h2>
        </div>

      </div>

      {/* Payroll Table */}

      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow shadow-black/30">

          {filteredPayrolls.length === 0 ? (

            <div className="py-16 text-center text-slate-400">
              No payrolls found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-slate-800 text-slate-200">

                  <tr>

                    <th className="px-5 py-4 text-left">
                      Employee
                    </th>

                    <th className="px-5 py-4 text-left">
                      Company
                    </th>

                    <th className="px-5 py-4 text-center">
                      Month
                    </th>

                    <th className="px-5 py-4 text-center">
                      Year
                    </th>

                    <th className="px-5 py-4 text-right">
                      Net Salary
                    </th>

                    <th className="px-5 py-4 text-center">
                      Status
                    </th>
                    <th className="px-5 py-4 text-center">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredPayrolls.map((item) => (

                    <tr
                      key={item._id}
                      className="border-b border-slate-800 hover:bg-slate-800/60"
                    >

                      <td className="px-5 py-4">

                        <p className="font-semibold text-slate-100">
                          {item.employeeId?.name}
                        </p>

                        <p className="text-sm text-slate-400">
                          {item.employeeId?.empId}
                        </p>

                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {item.companyId?.companyName}
                      </td>

                      <td className="px-5 py-4 text-center text-slate-300">
                        {MONTHS.find((m) => m.value === item.month)?.label}
                      </td>

                      <td className="px-5 py-4 text-center text-slate-300">
                        {item.year}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-emerald-400">
                        ₹
                        {Number(item.payableSalary).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                          Generated
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(item._id)}
                            className="rounded-lg bg-sky-500/15 p-2 text-sky-400 transition hover:bg-sky-500/25"
                            title="View Payroll"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => handleDownload(item._id)}
                            className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400 transition hover:bg-emerald-500/25"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="rounded-lg bg-red-500/15 p-2 text-red-400 transition hover:bg-red-500/25"
                            title="Delete Payroll"
                          >
                            <Trash2 size={18} />
                          </button>

                          <button
                            onClick={() => handleUpdate(item._id)}
                            className="rounded-lg bg-amber-500/15 p-2 text-amber-400 transition hover:bg-amber-500/25"
                            title="Update Payroll"
                          >
                            <SquarePen size={18} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>
      )}
    </div>
  );
}