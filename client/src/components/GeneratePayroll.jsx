import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api, { BACKEND_URL } from "../services/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  CalendarDays,
  BadgeIndianRupee,
  Loader2,
  ShieldAlert,
  UserCircle2,
  Briefcase,
  ArrowLeft,
  Wallet,
  Landmark,
  Receipt,
  CircleDollarSign,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react";

const MONTHS = [
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
  currentYear - 2,
  currentYear - 1,
  currentYear,
  currentYear + 1,
  currentYear + 2,
];

const initialForm = {
  companyId: "",
  employeeId: "",
  month: new Date().getMonth() + 1,
  year: currentYear,
};

// Small formatting helper (Indian digit grouping) — presentation only.
const inr = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return "0";
  return n.toLocaleString("en-IN");
};

export default function GeneratePayroll() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);

  const [companies, setCompanies] = useState([]);

  const [employees, setEmployees] = useState([]);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [salaryStructure, setSalaryStructure] =
    useState(null);

  const [preview, setPreview] = useState(null);

  const [loadingCompanies, setLoadingCompanies] =
    useState(true);

  const [loadingEmployees, setLoadingEmployees] =
    useState(false);

  const [loadingSalary, setLoadingSalary] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  // -------------------------
  // Fetch Companies
  // -------------------------

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);

      const { data } = await api.get("/companies");

      if (data.success) {
        setCompanies(data.companies);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load companies."
      );
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // -------------------------
  // Fetch Employees
  // -------------------------

  const fetchEmployees = async (companyId) => {
    try {
      setLoadingEmployees(true);

      const { data } = await api.get(
        `/employees/company/${companyId}`
      );

      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      setEmployees([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to load employees."
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (!form.companyId) {
      setEmployees([]);
      setSelectedEmployee(null);
      setSalaryStructure(null);
      setPreview(null);
      setForm((prev) => ({
        ...prev,
        employeeId: "",
      }));

      return;
    }

    fetchEmployees(form.companyId);
  }, [form.companyId]);

  // -------------------------
  // Fetch Salary Structure
  // -------------------------

  const fetchSalaryStructure = async (
    employeeId
  ) => {
    try {
      setLoadingSalary(true);

      const { data } = await api.get(
        `/salary/salary-structure/${employeeId}`
      );

      if (data.success) {
        setSalaryStructure(
          data.salaryStructure
        );
      }

    } catch (error) {

      setSalaryStructure(null);

      if (
        error.response?.status !== 404
      ) {
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch salary."
        );
      }

    } finally {
      setLoadingSalary(false);
    }
  };

  const fetchPreview = async (
  employeeId,
  month,
  year
) => {
  try {

    const { data } =
      await api.post(
        "/payroll/preview",
        {
          employeeId,
          month,
          year,
        }
      );

    if (data.success) {
      setPreview(data.preview);
    }

  } catch {

    setPreview(null);

  }
};

  useEffect(() => {
    if (!form.employeeId) {
      setSelectedEmployee(null);
      setSalaryStructure(null);
      setPreview(null);
      return;
    }

    const emp = employees.find(
      (item) =>
        item._id === form.employeeId
    );

    setSelectedEmployee(emp || null);

    fetchSalaryStructure(
      form.employeeId
    );
    fetchPreview(
  form.employeeId,
  form.month,
  form.year
);

  }, [
 form.employeeId,
 form.month,
 form.year,
 employees,
]);

  // -------------------------
  // Handle Change
  // -------------------------

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    if (name === "companyId") {
      setSalaryStructure(null);
      setPreview(null);
      setSelectedEmployee(null);
      setPreview(null)
      setForm({
        ...form,
        companyId: value,
        employeeId: "",
      });

      return;
    }

    setForm({
      ...form,
      [name]:
        name === "month" ||
        name === "year"
          ? Number(value)
          : value,
    });
  };

  // -------------------------
  // Validation
  // -------------------------

  const validate = () => {
    if (!form.companyId) {
      toast.error(
        "Please select a company."
      );
      return false;
    }

    if (!form.employeeId) {
      toast.error(
        "Please select an employee."
      );
      return false;
    }

    if (!form.month) {
      toast.error(
        "Please select a month."
      );
      return false;
    }

    if (!form.year) {
      toast.error(
        "Please select a year."
      );
      return false;
    }

    if (!salaryStructure) {
      toast.error(
        "Salary structure not found."
      );
      return false;
    }

    return true;
  };

  // -------------------------
  // Generate Payroll
  // -------------------------

  const handleGeneratePayroll =
    async (e) => {

      e.preventDefault();

      if (!validate()) return;

      try {

        setGenerating(true);

        const { data } =
          await api.post(
            "/payroll/generate",
            {
              employeeId:
                form.employeeId,

              month:
                form.month,

              year:
                form.year,
            }
          );

if (data.success) {
  toast.success(data.message);

  window.open(
    `${BACKEND_URL}/api/payroll/pdf/${data.payroll._id}`,
    "_blank"
  );

  setForm(initialForm);
  setEmployees([]);
  setSelectedEmployee(null);
  setSalaryStructure(null);
  setPreview(null);
}

      } catch (error) {

        if (
          error.response?.data?.message?.includes(
            "duplicate"
          )
        ) {
          toast.error(
            "Payroll has already been generated for this employee for the selected month and year."
          );
        } else {
          toast.error(
            error.response?.data?.message ||
              "Failed to generate payroll."
          );
        }

      } finally {
        setGenerating(false);
      }
    };

  // -------------------------
  // Helpers
  // -------------------------

  const profileImage = useMemo(() => {

    if (
      !selectedEmployee?.profilePic
    ) {
      return null;
    }

    return `${BACKEND_URL}/uploads/${selectedEmployee.profilePic}`;

  }, [selectedEmployee]);

  const selectedMonth =
    MONTHS.find(
      (m) =>
        m.value === form.month
    )?.label || "";

    const totalDays = useMemo(() => {
  return new Date(
    form.year,
    form.month,
    0
  ).getDate();
}, [form.month, form.year]);

const selectedCompany = useMemo(() => {
  return companies.find(
    (company) => company._id === form.companyId
  );
}, [companies, form.companyId]);

const perDaySalary = useMemo(() => {
  if (!salaryStructure) return 0;

  return (
    salaryStructure.inHandSalary /
    totalDays
  ).toFixed(2);
}, [salaryStructure, totalDays]);

  // Derived, presentation-only flags used to drive the step indicator
  // and the "month not completed" gating that already existed below.
  const stepCompanyDone = !!form.companyId;
  const stepEmployeeDone = !!form.employeeId;
  const monthNotCompleted =
    form.year > currentYear ||
    (form.year === currentYear &&
      form.month >= new Date().getMonth() + 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">

      <div className="mx-auto max-w-7xl">
<motion.button
  type="button"
  onClick={() => navigate(-1)}
  initial="rest"
  whileHover="hover"
  whileTap={{ scale: 0.94 }}
  className="group relative mb-5 flex h-10 items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-colors duration-300 hover:border-[#ffff00] hover:text-[#00cc66]"
>
  {/* pulsing electric glow */}
  <motion.span
    className="pointer-events-none absolute inset-0 rounded-full"
    variants={{
      rest: { boxShadow: "0 0 0px rgba(99,102,241,0)" },
      hover: {
        boxShadow: [
          "0 0 0px rgba(34,211,238,0)",
          "0 0 14px rgba(34,211,238,0.45)",
          "0 0 3px rgba(99,102,241,0.25)",
        ],
        transition: { duration: 0.55, repeat: Infinity, ease: "easeInOut" },
      },
    }}
  />

  <ArrowLeft
    size={16}
    className="relative z-10 transition-transform duration-300 group-hover:-translate-x-0.5"
  />
  <span className="relative z-10">Back</span>
</motion.button>
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200 sm:h-14 sm:w-14">
              <Briefcase size={22} className="sm:hidden" />
              <Briefcase size={26} className="hidden sm:block" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Generate Payroll
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Generate employee payroll based on salary, attendance and
                leave records.
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 self-start rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 backdrop-blur sm:self-auto">
            {[
              { label: "Company", done: stepCompanyDone },
              { label: "Employee", done: stepEmployeeDone },
              { label: "Period", done: true },
            ].map((step, idx, arr) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                    step.done
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step.done ? <Check size={13} /> : idx + 1}
                </div>

                <span
                  className={`hidden text-xs font-medium sm:inline ${
                    step.done ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>

                {idx < arr.length - 1 && (
                  <ChevronRight size={14} className="mx-0.5 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">

          {/* ===========================
                LEFT SECTION — FORM
          ============================ */}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-3"
          >

            <form
              onSubmit={handleGeneratePayroll}
              className="space-y-6"
            >

              {/* Company & Employee */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Building2 size={18} className="text-indigo-600" />
                    Company
                  </label>

                  <div className="relative">
                    <select
                      name="companyId"
                      value={form.companyId}
                      onChange={handleChange}
                      disabled={loadingCompanies}
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">
                        {loadingCompanies ? "Loading companies..." : "Select Company"}
                      </option>

                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.companyName}
                        </option>
                      ))}
                    </select>

                    {loadingCompanies ? (
                      <Loader2
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Users size={18} className="text-indigo-600" />
                    Employee
                  </label>

                  <div className="relative">
                    <select
                      name="employeeId"
                      value={form.employeeId}
                      onChange={handleChange}
                      disabled={!form.companyId || loadingEmployees}
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">
                        {!form.companyId
                          ? "Select Company First"
                          : loadingEmployees
                          ? "Loading Employees..."
                          : "Select Employee"}
                      </option>

                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.empId} - {employee.name}
                        </option>
                      ))}
                    </select>

                    {loadingEmployees ? (
                      <Loader2
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                      />
                    )}
                  </div>
                </div>

              </div>

              {/* Selected employee mini profile */}

              <AnimatePresence>
                {selectedEmployee && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={selectedEmployee.name}
                          className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                          <UserCircle2 size={26} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {selectedEmployee.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedEmployee.empId}
                          {selectedEmployee.designation
                            ? ` · ${selectedEmployee.designation}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Month & Year */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                    <CalendarDays
                      size={18}
                      className="text-indigo-600"
                    />

                    Month

                  </label>

                  <select
                    name="month"
                    value={form.month}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >

                    {MONTHS.map((month) => (

                      <option
                        key={month.value}
                        value={month.value}
                      >
                        {month.label}
                      </option>

                    ))}

                  </select>

                </div>

                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                    <CalendarClock
                      size={18}
                      className="text-indigo-600"
                    />

                    Year

                  </label>

                  <select
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >

                    {YEARS.map((year) => (

                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>

                    ))}

                  </select>

                </div>

              </div>

              {/* Salary Structure loading */}

              {loadingSalary && (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-8 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  Fetching salary structure...
                </div>
              )}

              {/* Salary Structure */}

              <AnimatePresence>
                {!loadingSalary &&
                  selectedEmployee &&
                  salaryStructure && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5"
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800 sm:text-lg">
                        <Wallet className="text-emerald-600" size={20} />
                        Salary Structure
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">

                        <div className="rounded-xl border bg-white p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <BadgeIndianRupee size={18} />
                            <span className="text-sm">In-Hand Salary</span>
                          </div>

                          <p className="mt-2 text-xl font-bold text-slate-800">
                            ₹{inr(salaryStructure.inHandSalary)}
                          </p>
                        </div>

                        <div className="rounded-xl border bg-white p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <CircleDollarSign size={18} />
                            <span className="text-sm">CTC</span>
                          </div>

                          <p className="mt-2 text-xl font-bold text-slate-800">
                            ₹{inr(salaryStructure.ctc)}
                          </p>
                        </div>

                        <div className="rounded-xl border bg-white p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Landmark size={18} />
                            <span className="text-sm">PF</span>
                          </div>

                          <p className="mt-2 font-semibold text-slate-800">
                            ₹{inr(salaryStructure.pf)}
                          </p>
                        </div>

                        <div className="rounded-xl border bg-white p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Receipt size={18} />
                            <span className="text-sm">ESI</span>
                          </div>

                          <p className="mt-2 font-semibold text-slate-800">
                            ₹{inr(salaryStructure.esi)}
                          </p>
                        </div>

                        <div className="rounded-xl border bg-white p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Receipt size={18} />
                            <span className="text-sm">Tax</span>
                          </div>

                          <p className="mt-2 font-semibold text-slate-800">
                            ₹{inr(salaryStructure.tax)}
                          </p>
                        </div>

                        <div className="rounded-xl border bg-white p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <CheckCircle2 size={18} />
                            <span className="text-sm">Status</span>
                          </div>

                          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {salaryStructure.status}
                          </span>
                        </div>

                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              <AnimatePresence>
                {!loadingSalary &&
                  selectedEmployee &&
                  !salaryStructure && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5"
                    >
                      <div className="flex gap-3">
                        <ShieldAlert className="mt-0.5 shrink-0 text-red-600" size={20} />

                        <div>
                          <h3 className="font-semibold text-red-700">
                            Salary structure not found
                          </h3>

                          <p className="mt-1 text-sm text-red-600">
                            Please create salary structure before
                            generating payroll.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedEmployee && monthNotCompleted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5"
                  >
                    <div className="flex gap-3">

                      <ShieldAlert className="mt-0.5 shrink-0 text-amber-600" size={20} />

                      <div>

                        <h3 className="font-semibold text-amber-700">
                          Payroll generation unavailable
                        </h3>

                        <p className="mt-1 text-sm text-amber-700">
                          Payroll can only be generated after the selected month has been completed.
                        </p>

                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={
                  generating ||
                  !salaryStructure ||
                  loadingSalary ||
                  monthNotCompleted
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Payroll...
                  </>
                ) : monthNotCompleted ? (
                  <>
                    <CalendarClock size={20} />
                    Month Not Completed
                  </>
                ) : (
                  <>
                    <Briefcase size={20} />
                    Generate Payroll
                  </>
                )}
              </motion.button>

            </form>

          </motion.div>

          {/* ===========================
                RIGHT SECTION — PAYSLIP PREVIEW
          ============================ */}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="lg:sticky lg:top-6">

              {!selectedEmployee ? (
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                    <Sparkles size={22} />
                  </div>
                  <p className="font-semibold text-slate-600">
                    Pick a company and employee
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Your payslip preview will appear here.
                  </p>
                </div>
              ) : (
                <motion.div
                  key={`${form.employeeId}-${form.month}-${form.year}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm"
                >
                  {/* Payslip header */}
                  <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-500 px-6 py-5 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BadgeIndianRupee size={20} />
                        <span className="font-semibold">Payroll Preview</span>
                      </div>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                        {selectedMonth} {form.year}
                      </span>
                    </div>

                    <p className="mt-3 truncate text-sm text-indigo-100">
                      {selectedCompany?.companyName || "—"}
                    </p>
                  </div>

                  {/* Perforation edge */}
                  <div className="relative">
                    <div className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-slate-100" />
                    <div className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-slate-100" />
                    <div className="border-t-2 border-dashed border-slate-200" />
                  </div>

                  <div className="space-y-3 px-6 py-5 text-sm">

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Employee</span>
                      <span className="font-semibold text-slate-800">
                        {selectedEmployee.empId} · {selectedEmployee.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Days</span>
                      <span className="font-semibold text-slate-800">
                        {totalDays}
                      </span>
                    </div>

                    {salaryStructure && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">In-Hand Salary</span>
                          <span className="font-semibold text-emerald-600">
                            ₹{inr(salaryStructure.inHandSalary)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Per Day Salary</span>
                          <span className="font-semibold text-slate-800">
                            ₹{inr(perDaySalary)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="my-1 border-t border-dashed border-slate-200" />

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Working Days</span>
                      <span className="font-semibold text-slate-800">
                        {preview ? preview.workingDays : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Leave / Absent</span>
                      <span className="font-semibold text-slate-800">
                        {preview ? preview.totalLOPDays : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">LOP Deduction</span>
                      <span className="font-semibold text-red-600">
                        {preview ? `₹${inr(preview.deduction)}` : "—"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                      <span className="text-sm font-medium text-emerald-700">
                        Net Payable Salary
                      </span>
                      <span className="text-lg font-bold text-emerald-700">
                        {preview ? `₹${inr(preview.payableSalary)}` : "—"}
                      </span>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* Compact summary chips (mirrors original "Payroll Summary") */}
              <AnimatePresence>
                {selectedEmployee && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5"
                  >
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-700">
                      <Receipt size={16} />
                      Payroll Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm">
                      <span className="text-slate-500">Company Name</span>
                      <span className="text-right font-semibold text-slate-700">
                        {selectedCompany?.companyName || "-"}
                      </span>

                      <span className="text-slate-500">Employee Name</span>
                      <span className="text-right font-semibold text-slate-700">
                        {selectedEmployee.name}
                      </span>

                      <span className="text-slate-500">Month</span>
                      <span className="text-right font-semibold text-slate-700">
                        {selectedMonth}
                      </span>

                      <span className="text-slate-500">Year</span>
                      <span className="text-right font-semibold text-slate-700">
                        {form.year}
                      </span>

                      <span className="text-slate-500">Total Days</span>
                      <span className="text-right font-semibold text-slate-700">
                        {totalDays}
                      </span>

                      {salaryStructure && (
                        <>
                          <span className="text-slate-500">Per Day Salary</span>
                          <span className="text-right font-semibold text-emerald-600">
                            ₹{inr(perDaySalary)}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}