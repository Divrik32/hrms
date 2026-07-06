import { useEffect, useState } from "react";
import api from "../../src/services/axios.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CalendarPlus,
  Plus,
  Trash2,
  Send,
  FileText,
  HeartPulse,
  BriefcaseBusiness,
  RotateCcw,
  Sun,
  Sparkles,
  Coffee,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------------------------------------------------------
   Small presentational helper: a radial "leave balance" dial.
   Purely visual — no functional/data logic lives here.
--------------------------------------------------------- */
const BalanceDial = ({ label, value, max = 20, icon: Icon, tone, loading }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, (Number(value) || 0) / max));
  const offset = circumference - pct * circumference;

  const tones = {
    indigo: {
      ring: "stroke-indigo-400",
      track: "stroke-white/10",
      text: "text-indigo-300",
      glow: "shadow-indigo-900/40",
    },
    teal: {
      ring: "stroke-teal-400",
      track: "stroke-white/10",
      text: "text-teal-300",
      glow: "shadow-teal-900/40",
    },
    amber: {
      ring: "stroke-amber-400",
      track: "stroke-white/10",
      text: "text-amber-300",
      glow: "shadow-amber-900/40",
    },
  };
  const t = tones[tone] || tones.indigo;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 shadow-lg hover:shadow-xl ${t.glow} transition-shadow`}
    >
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
          <circle cx="50" cy="50" r={radius} strokeWidth="9" fill="none" className={t.track} />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            className={t.ring}
            style={{ strokeDasharray: circumference }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: loading ? circumference : offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center rounded-full`}>
          <Icon className={`h-6 w-6 ${t.text}`} />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-white">
          {loading ? (
            <span className="inline-block h-6 w-10 animate-pulse rounded bg-white/10 align-middle" />
          ) : (
            value
          )}
        </p>
        <p className="text-[11px] text-slate-500">days remaining</p>
      </div>
    </motion.div>
  );
};

/* ---------------------------------------------------------
   Styled select — same semantics as a plain <select>, just
   wrapped so the chevron sits nicely inside a Tailwind shell.
--------------------------------------------------------- */
const StyledSelect = (props) => (
  <div className="relative">
    <select
      {...props}
      className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 pr-9 text-sm text-slate-200 shadow-sm outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 [&>option]:bg-[#14122a] [&>option]:text-slate-200"
    />
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
  </div>
);

const fieldClasses =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 shadow-sm outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20";

const SectionHeading = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-4 flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-400/20">
      <Icon className="h-4.5 w-4.5" />
    </div>
    <div>
      <h5 className="text-sm font-semibold text-slate-100 sm:text-base">{title}</h5>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [leaveBalance, setLeaveBalance] = useState({
    remainingCasualLeave: 0,
    remainingSickLeave: 0,
    remainingPaidLeave: 0,
  });

  const [leaveDetails, setLeaveDetails] = useState({
    leaveType: {
      casualLeave: 0,
      sickLeave: 0,
      paidLeave: 0,
      compOff: 0,
    },

    leaveDates: [
      {
        date: "",
        duration: 1,
        leaveType: "",
      },
    ],

    compOffWorkDate: "",
  });

  const [extraLeaveDetails, setExtraLeaveDetails] = useState({
    extraLeaveType: {
      casualLeave: 0,
      sickLeave: 0,
    },

    extraLeaveDates: [],
  });

  const [reason, setReason] = useState("");

  useEffect(() => {
    getCurrentLeaveBalance();
  }, []);

  const getCurrentLeaveBalance = async () => {
    try {
      setBalanceLoading(true);

      const { data } = await api.get("/leaves/current-balance");

      if (data.success) {
        setLeaveBalance(data.leaveBalance);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const addLeaveDate = () => {
    setLeaveDetails((prev) => ({
      ...prev,
      leaveDates: [
        ...prev.leaveDates,
        {
          date: "",
          duration: 1,
          leaveType: "",
        },
      ],
    }));
  };

  const removeLeaveDate = (index) => {
    setLeaveDetails((prev) => ({
      ...prev,
      leaveDates: prev.leaveDates.filter((_, i) => i !== index),
    }));
  };

  const updateLeaveDate = (index, field, value) => {
    const updated = [...leaveDetails.leaveDates];

    updated[index][field] = value;

    setLeaveDetails((prev) => ({
      ...prev,
      leaveDates: updated,
    }));
  };

  const updateLeaveCount = (field, value) => {
    setLeaveDetails((prev) => ({
      ...prev,
      leaveType: {
        ...prev.leaveType,
        [field]: Number(value),
      },
    }));
  };

  const updateCompOffDate = (value) => {
    setLeaveDetails((prev) => ({
      ...prev,
      compOffWorkDate: value,
    }));
  };

const handleSubmit = async () => {
  try {
    setLoading(true);

    // normal leave আসলেই select হয়েছে?
    const hasNormalLeave = leaveDetails.leaveDates.some(
      item => item.date && item.leaveType
    );

    // extra leave আসলেই select হয়েছে?
    const hasExtraLeave =
      extraLeaveDetails.extraLeaveDates.length > 0;

    const payload = {
      leaveDetails: hasNormalLeave ? leaveDetails : null,
      extraLeaveDetails: hasExtraLeave
        ? extraLeaveDetails
        : null,
      reason,
    };

    const res = await api.post("/leaves/apply", payload);

    alert(res.data.message);
  } catch (error) {
    alert(error?.response?.data?.message || error.message);
  } finally {
    setLoading(false);
  }
};

  const leaveTypeStats = [
    {
      key: "casualLeave",
      label: "Casual Leave",
      icon: Sun,
      tone: "indigo",
    },
    {
      key: "sickLeave",
      label: "Sick Leave",
      icon: HeartPulse,
      tone: "teal",
    },
    {
      key: "paidLeave",
      label: "Paid Leave",
      icon: BriefcaseBusiness,
      tone: "amber",
    },
    {
      key: "compOff",
      label: "Comp Off",
      icon: RotateCcw,
      tone: "indigo",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0b0a1a] overflow-hidden px-3 py-6 sm:px-6 lg:px-10">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-[110px]" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-96 w-96 rounded-full bg-teal-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-600/15 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mx-auto max-w-5xl"
      >
        {/* Hero header */}
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/90 via-indigo-500/90 to-teal-500/90 p-6 text-white shadow-xl shadow-indigo-950/50 ring-1 ring-white/10 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <CalendarPlus className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold sm:text-2xl">Apply for Leave</h4>
                <p className="text-sm text-indigo-100">
                  Fill in your dates and we'll take care of the rest.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 self-start rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm sm:self-auto">
              <Sparkles className="h-3.5 w-3.5" />
              Quick apply
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl shadow-black/30">
          <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            {/* Balance dials */}
            <div>
              <SectionHeading
                icon={CalendarDays}
                title="Your leave balance"
                subtitle="Updated in real time from your account"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <BalanceDial
                  label="Casual Leave"
                  value={leaveBalance.remainingCasualLeave}
                  icon={Sun}
                  tone="indigo"
                  loading={balanceLoading}
                />
                <BalanceDial
                  label="Sick Leave"
                  value={leaveBalance.remainingSickLeave}
                  icon={HeartPulse}
                  tone="teal"
                  loading={balanceLoading}
                />
                <BalanceDial
                  label="Paid Leave"
                  value={leaveBalance.remainingPaidLeave}
                  icon={BriefcaseBusiness}
                  tone="amber"
                  loading={balanceLoading}
                />
              </div>
            </div>

            {/* Leave summary counts */}
            <div>
              <SectionHeading
                icon={FileText}
                title="Leave summary"
                subtitle="How many days of each type you're applying for"
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {leaveTypeStats.map((item) => (
                  <div key={item.key}>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className={fieldClasses}
                      value={leaveDetails.leaveType[item.key]}
                      onChange={(e) => updateLeaveCount(item.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Leave dates */}
            <div>
              <SectionHeading
                icon={CalendarDays}
                title="Leave dates"
                subtitle="Add each day you'll be away"
              />

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {leaveDetails.leaveDates.map((item, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:p-4"
                    >
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Date
                        </label>
                        <input
                          type="date"
                          className={`${fieldClasses} [color-scheme:dark]`}
                          value={item.date}
                          onChange={(e) => updateLeaveDate(index, "date", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Duration
                        </label>
                        <StyledSelect
                          value={item.duration}
                          onChange={(e) =>
                            updateLeaveDate(index, "duration", Number(e.target.value))
                          }
                        >
                          <option value={1}>Full Day</option>
                          <option value={0.5}>Half Day</option>
                        </StyledSelect>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Leave Type
                        </label>
                        <StyledSelect
                          value={item.leaveType}
                          onChange={(e) => updateLeaveDate(index, "leaveType", e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="casualLeave">Casual</option>
                          <option value="sickLeave">Sick</option>
                          <option value="paidLeave">Paid</option>
                          <option value="compOff">Comp Off</option>
                        </StyledSelect>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeLeaveDate(index)}
                        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20 transition hover:bg-rose-400/20 sm:w-10"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs font-medium sm:hidden">Remove</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addLeaveDate}
                className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-indigo-400/40 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:border-indigo-400/70 hover:bg-indigo-400/10"
              >
                <Plus size={16} />
                Add Date
              </motion.button>
            </div>

            {/* Extra leave */}
            <div>
              <SectionHeading
                icon={Sparkles}
                title="Extra leave"
                subtitle="Additional casual or sick allowance for this request"
              />
              <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Sun className="h-3.5 w-3.5" />
                    Casual
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className={fieldClasses}
                    value={extraLeaveDetails.extraLeaveType.casualLeave}
                    onChange={(e) =>
                      setExtraLeaveDetails((prev) => ({
                        ...prev,
                        extraLeaveType: {
                          ...prev.extraLeaveType,
                          casualLeave: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <HeartPulse className="h-3.5 w-3.5" />
                    Sick
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className={fieldClasses}
                    value={extraLeaveDetails.extraLeaveType.sickLeave}
                    onChange={(e) =>
                      setExtraLeaveDetails((prev) => ({
                        ...prev,
                        extraLeaveType: {
                          ...prev.extraLeaveType,
                          sickLeave: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <p className="mb-3 mt-6 text-xs font-medium text-slate-400">Extra leave dates</p>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {extraLeaveDetails.extraLeaveDates.map((item, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-4"
                    >
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Date
                        </label>
                        <input
                          type="date"
                          className={`${fieldClasses} [color-scheme:dark]`}
                          value={item.date}
                          onChange={(e) => {
                            const updated = [...extraLeaveDetails.extraLeaveDates];
                            updated[index].date = e.target.value;

                            setExtraLeaveDetails((prev) => ({
                              ...prev,
                              extraLeaveDates: updated,
                            }));
                          }}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                          Duration
                        </label>
                        <StyledSelect
                          value={item.duration}
                          onChange={(e) => {
                            const updated = [...extraLeaveDetails.extraLeaveDates];
                            updated[index].duration = Number(e.target.value);

                            setExtraLeaveDetails((prev) => ({
                              ...prev,
                              extraLeaveDates: updated,
                            }));
                          }}
                        >
                          <option value={1}>Full Day</option>
                          <option value={0.5}>Half Day</option>
                        </StyledSelect>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setExtraLeaveDetails((prev) => ({
                            ...prev,
                            extraLeaveDates: prev.extraLeaveDates.filter((_, i) => i !== index),
                          }));
                        }}
                        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20 transition hover:bg-rose-400/20 sm:w-10"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs font-medium sm:hidden">Remove</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setExtraLeaveDetails((prev) => ({
                    ...prev,
                    extraLeaveDates: [
                      ...prev.extraLeaveDates,
                      {
                        date: "",
                        duration: 1,
                      },
                    ],
                  }));
                }}
                className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-indigo-400/40 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:border-indigo-400/70 hover:bg-indigo-400/10"
              >
                <Plus size={16} />
                Add Extra Leave Date
              </motion.button>
            </div>

            {/* Comp off */}
            <div>
              <SectionHeading
                icon={Coffee}
                title="Comp off"
                subtitle="The date you worked in exchange for this comp off"
              />
              <div className="sm:max-w-xs">
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Comp Off Work Date
                </label>
                <input
                  type="date"
                  className={`${fieldClasses} [color-scheme:dark]`}
                  value={leaveDetails.compOffWorkDate}
                  onChange={(e) => updateCompOffDate(e.target.value)}
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <SectionHeading icon={FileText} title="Reason" subtitle="A short note for your manager" />
              <textarea
                rows={5}
                className={`${fieldClasses} resize-none`}
                placeholder="Reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          {/* Sticky submit bar */}
          <div className="sticky bottom-0 flex justify-end border-t border-white/10 bg-[#0b0a1a]/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <motion.button
              type="button"
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              onClick={handleSubmit}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Leave
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ApplyLeave;