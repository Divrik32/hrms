import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Save,
  User,
  Calendar,
  BadgeIndianRupee,
  Wallet,
  TrendingDown,
  TrendingUp,
  Building2,
  Hash,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api, { BACKEND_URL } from "../services/axios";
import toast from "react-hot-toast";

const MONTHS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function UpdatePayroll() {
  const navigate = useNavigate();

  const { payrollId } = useParams();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [payroll, setPayroll] = useState(null);

  const [form, setForm] = useState({
    casualLeave: 0,
    sickLeave: 0,
    paidLeave: 0,
    compOff: 0,

    extraCasualLeave: 0,
    extraSickLeave: 0,

    absentDays: 0,
    workingDays: 0,
  });

  //----------------------------------------------------------
  // Fetch Payroll
  //----------------------------------------------------------

  const fetchPayroll = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        `/payroll/${payrollId}`
      );

      if (!data.success) {
        toast.error("Payroll not found");
        navigate(-1);
        return;
      }

      setPayroll(data.payroll);

      setForm({
        casualLeave:
          data.payroll.paidLeave?.casualLeave || 0,

        sickLeave:
          data.payroll.paidLeave?.sickLeave || 0,

        paidLeave:
          data.payroll.paidLeave?.paidLeave || 0,

        compOff:
          data.payroll.paidLeave?.compOff || 0,

        extraCasualLeave:
          data.payroll.unpaidLeave
            ?.extraCasualLeave || 0,

        extraSickLeave:
          data.payroll.unpaidLeave
            ?.extraSickLeave || 0,

        absentDays:
          data.payroll.absentDays || 0,

        workingDays:
          data.payroll.workingDays || 0,
      });

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
          "Failed to load payroll."
      );

      navigate(-1);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [payrollId]);

  //----------------------------------------------------------

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: Number(e.target.value),
    }));
  };

  //----------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const { data } = await api.put(
        `/payroll/update/${payrollId}`,
        form
      );

      if (data.success) {

        toast.success(data.message);

        setPayroll(data.payroll);

        setForm({
          casualLeave:
            data.payroll.paidLeave.casualLeave,

          sickLeave:
            data.payroll.paidLeave.sickLeave,

          paidLeave:
            data.payroll.paidLeave.paidLeave,

          compOff:
            data.payroll.paidLeave.compOff,

          extraCasualLeave:
            data.payroll.unpaidLeave
              .extraCasualLeave,

          extraSickLeave:
            data.payroll.unpaidLeave
              .extraSickLeave,

          absentDays:
            data.payroll.absentDays,

          workingDays:
            data.payroll.workingDays,
        });
      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
          "Failed to update payroll."
      );

    } finally {

      setSaving(false);

    }
  };

  //----------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-amber-400" />
          <p className="text-sm tracking-wide text-slate-500">
            Loading payroll record…
          </p>
        </div>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-6 text-center text-rose-400">
        Payroll not found.
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-700/70 bg-[#0B0F1A] px-4 py-3 text-[15px] font-medium !text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20";

  const labelClass =
    "mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div className="min-h-screen bg-[#0B0F1A] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      {/* ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
<motion.button
  onClick={() => navigate(-1)}
  initial="rest"
  whileHover="hover"
  whileTap={{ scale: 0.94 }}
  className="mb-5 group relative flex h-10 items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-950/40 px-5 text-sm font-medium !text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-300/80 hover:!text-white"
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

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="overflow-hidden rounded-3xl border border-slate-800/80 bg-[#0F1424] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
        >
          {/* Header */}
          <div className="relative border-b border-slate-800/80 bg-gradient-to-br from-[#151B30] to-[#0F1424] p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <img
                  src={
                    payroll.employeeId.profilePic
                      ? `${BACKEND_URL}/uploads/${payroll.employeeId.profilePic}`
                      : "https://ui-avatars.com/api/?name=" +
                        payroll.employeeId.name
                  }
                  className="h-16 w-16 shrink-0 rounded-2xl border-2 border-amber-400/60 object-cover sm:h-20 sm:w-20"
                />

                <div>
                  <h1 className="text-2xl font-bold tracking-tight !text-white sm:text-3xl">
                    Update Payroll
                  </h1>
                  <p className="mt-1 text-sm text-slate-400">
                    Edit leave &amp; attendance manually
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 self-start rounded-full border border-emerald-800/60 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-400 sm:self-auto">
                <ShieldCheck size={14} />
                {payroll.status}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:space-y-8 sm:p-8">
            {/* Employee Details */}
            <section className="rounded-2xl border border-slate-800/80 bg-[#12182B] p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold !text-[#990099] sm:text-lg">
                <User size={18} className="text-[#990099]" />
                Employee Details
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className={labelClass}>Employee Name</p>
                  <p className="text-[15px] font-semibold !text-white">
                    {payroll.employeeId.name}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>
                    <span className="inline-flex items-center gap-1">
                      <Hash size={11} /> Employee ID
                    </span>
                  </p>
                  <p className="text-[15px] font-semibold !text-white">
                    {payroll.employeeId.empId}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>
                    <span className="inline-flex items-center gap-1">
                      <Building2 size={11} /> Department
                    </span>
                  </p>
                  <p className="text-[15px] font-semibold !text-white">
                    {payroll.employeeId.departmentId?.departmentName}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>Designation</p>
                  <p className="text-[15px] font-semibold !text-white">
                    {payroll.employeeId.role}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>Company</p>
                  <p className="text-[15px] font-semibold !text-white">
                    {payroll.companyId.companyName}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} /> Month
                    </span>
                  </p>
                  <p className="text-[15px] font-semibold !text-white">
                    {MONTHS[payroll.month]}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>Year</p>
                  <p className="text-[15px] font-semibold !text-white">
                    {payroll.year}
                  </p>
                </div>
              </div>
            </section>

            {/* Paid Leave */}
            <section className="rounded-2xl border border-emerald-900/50 bg-[#12182B] p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold !text-[#00cc66] sm:text-lg">
                <TrendingUp size={18} />
                Paid Leave
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={labelClass}>Casual Leave</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    name="casualLeave"
                    value={form.casualLeave}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Sick Leave</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    name="sickLeave"
                    value={form.sickLeave}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Paid Leave</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    name="paidLeave"
                    value={form.paidLeave}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Comp Off</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    name="compOff"
                    value={form.compOff}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Unpaid Leave */}
            <section className="rounded-2xl border border-rose-900/50 bg-[#12182B] p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold !text-[#ff0099] sm:text-lg">
                <TrendingDown size={18} />
                Unpaid Leave
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Extra Casual Leave</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    name="extraCasualLeave"
                    value={form.extraCasualLeave}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Extra Sick Leave</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    name="extraSickLeave"
                    value={form.extraSickLeave}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Attendance */}
            <section className="rounded-2xl border border-orange-900/50 bg-[#12182B] p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold !text-[#ffff00] sm:text-lg">
                <Calendar size={18} />
                Attendance
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Working Days</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    name="workingDays"
                    value={form.workingDays}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Absent Days</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    name="absentDays"
                    value={form.absentDays}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Payroll Summary — payslip stub styling */}
            <section className="relative">
              <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-br from-[#161207] to-[#12182B] p-5 sm:p-6">
                <h2 className="mb-5 flex items-center gap-2 text-base font-semibold !text-[#ff5500] sm:text-lg">
                  <BadgeIndianRupee size={18} />
                  Payroll Summary
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <div className="rounded-xl border border-slate-800 bg-[#0B0F1A] p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <Wallet size={11} /> In Hand Salary
                    </p>
                    <p className="mt-2 text-xl font-bold text-amber-400 sm:text-2xl">
                      ₹ {payroll.inHandSalary.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#0B0F1A] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      CTC
                    </p>
                    <p className="mt-2 text-xl font-bold text-indigo-400 sm:text-2xl">
                      ₹ {payroll.ctc.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#0B0F1A] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Total Days
                    </p>
                    <p className="mt-2 text-xl font-bold !text-white sm:text-2xl">
                      {payroll.totalDays}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#0B0F1A] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Per Day Salary
                    </p>
                    <p className="mt-2 text-xl font-bold text-emerald-400 sm:text-2xl">
                      ₹ {payroll.perDaySalary}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#0B0F1A] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Current Deduction
                    </p>
                    <p className="mt-2 text-xl font-bold text-rose-400 sm:text-2xl">
                      ₹ {payroll.deduction}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#0B0F1A] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Net Salary
                    </p>
                    <p className="mt-2 text-xl font-bold text-green-400 sm:text-2xl">
                      ₹ {payroll.payableSalary}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-800/80 pt-6 sm:flex-row sm:justify-end sm:pt-8">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-700 bg-[#12182B] px-6 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                Cancel
              </motion.button>

<motion.button
  whileTap={{ scale: 0.97 }}
  type="submit"
  disabled={saving}
  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f008f] to-[#7b007b] px-8 py-3 text-sm font-semibold shadow-lg shadow-amber-500/10 transition hover:from-[#850085] hover:to-[#990099] disabled:cursor-not-allowed disabled:opacity-60 brightness-150 hover:brightness-200 disabled:hover:brightness-150"
>
  <style>{`
    @keyframes shimmer-text {
      0% { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    .shimmer-label {
      background-image: linear-gradient(
        100deg,
        #2b0630 0%,
        #2b0630 35%,
        #ffffff 50%,
        #2b0630 65%,
        #2b0630 100%
      );
      background-size: 250% auto;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: shimmer-text 2.2s linear infinite;
    }
  `}</style>

  {saving ? (
    <>
      <Loader2 size={18} className="animate-spin text-slate-950" />
      <span className="shimmer-label">Updating...</span>
    </>
  ) : (
    <>
      <Save size={18} className="text-slate-950" />
      <span className="shimmer-label">Update Payroll</span>
    </>
  )}
</motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}