import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck2,
  CalendarRange,
  Clock3,
  MessageSquareQuote,
  Notebook,
  Sun,
  HeartPulse,
  Wallet,
  RefreshCcw,
  Sparkles,
  Loader2,
  Inbox,
  ServerCrash,
  ShieldCheck,
} from "lucide-react";
import api from "../services/axios";

/* ---------- static config: leave type -> visual identity ---------- */
const LEAVE_TYPE_META = {
  "Casual Leave": {
    icon: Sun,
    color: "#a78bfa",
    bg: "bg-violet-400/10",
    ring: "ring-violet-400/30",
    text: "text-violet-300",
  },
  "Sick Leave": {
    icon: HeartPulse,
    color: "#fb923c",
    bg: "bg-orange-400/10",
    ring: "ring-orange-400/30",
    text: "text-orange-300",
  },
  "Paid Leave": {
    icon: Wallet,
    color: "#60a5fa",
    bg: "bg-blue-400/10",
    ring: "ring-blue-400/30",
    text: "text-blue-300",
  },
  "Comp Off": {
    icon: RefreshCcw,
    color: "#34d399",
    bg: "bg-emerald-400/10",
    ring: "ring-emerald-400/30",
    text: "text-emerald-300",
  },
  "Extra Leave": {
    icon: Sparkles,
    color: "#f472b6",
    bg: "bg-pink-400/10",
    ring: "ring-pink-400/30",
    text: "text-pink-300",
  },
  "Extra Casual Leave": {
    icon: Sparkles,
    color: "#e879f9",
    bg: "bg-fuchsia-400/10",
    ring: "ring-fuchsia-400/30",
    text: "text-fuchsia-300",
  },
  "Extra Sick Leave": {
    icon: Sparkles,
    color: "#f87171",
    bg: "bg-rose-400/10",
    ring: "ring-rose-400/30",
    text: "text-rose-300",
  },
};

const fallbackMeta = {
  icon: CalendarCheck2,
  color: "#94a3b8",
  bg: "bg-slate-400/10",
  ring: "ring-slate-400/30",
  text: "text-slate-300",
};

const getTypeMeta = (leaveType) => {
  const firstType = leaveType?.split(",")[0]?.trim();
  return LEAVE_TYPE_META[firstType] || fallbackMeta;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ---------- container animation variants ---------- */
const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function ApprovedLeaves() {
  const { empId } = useParams();
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchApprovedLeaves = async () => {
      setStatus("loading");
      try {
        const { data } = await api.post("/superadmin/approved-leaves", {
          employeeId: empId,
        });

        if (ignore) return;

        if (data?.success) {
          setLeaves(data.leaves || []);
          setTotal(data.totalLeaves || 0);
          setStatus("success");
        } else {
          setErrorMsg(data?.message || "Could not load approved leaves.");
          setStatus("error");
        }
      } catch (err) {
        if (ignore) return;
        setErrorMsg(
          err?.response?.data?.message ||
            "Something went wrong while fetching approved leaves."
        );
        setStatus("error");
      }
    };

    if (empId) fetchApprovedLeaves();

    return () => {
      ignore = true;
    };
  }, [empId]);

  return (
    <div className="min-h-screen w-full bg-[#05040c] text-slate-100 relative overflow-x-hidden">
      {/* ambient glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-emerald-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[26rem] w-[26rem] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[22rem] w-[22rem] rounded-full bg-violet-600/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-start justify-between gap-4 mb-8 sm:mb-10"
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-emerald-400/90">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-[0.2em]">
                  Leave Records
                </span>
              </div>
<h1 className="mt-1 pb-1.5 text-3xl sm:text-4xl md:text-5xl font-black leading-[1.15] tracking-tight !bg-gradient-to-r !from-[#02c272] !via-[#019017] !to-[#01d6b9] bg-clip-text !text-transparent">
                Approved Leaves
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">
                Every leave request that's been signed off, in one place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
            <CalendarCheck2 className="h-5 w-5 text-emerald-400" />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-wider text-emerald-300/70">
                Total Approved
              </p>
              <p className="text-xl font-bold text-white">{total}</p>
            </div>
          </div>
        </motion.div>

        {/* body states */}
        {status === "loading" && <LoadingState />}
        {status === "error" && <ErrorState message={errorMsg} />}
        {status === "success" && leaves.length === 0 && <EmptyState />}

        {status === "success" && leaves.length > 0 && (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
          >
            <AnimatePresence>
              {leaves.map((leave) => (
                <LeaveCard key={leave._id} leave={leave} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function LeaveCard({ leave }) {
  const meta = getTypeMeta(leave.leaveType);
  const Icon = meta.icon;
  const typeChips = (leave.leaveType || "Extra Leave")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const balances = [
    { label: "Casual", value: leave.remainingCasualLeave },
    { label: "Sick", value: leave.remainingSickLeave },
    { label: "Paid", value: leave.remainingPaidLeave },
  ].filter((b) => b.value !== undefined && b.value !== null);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 transition-colors hover:border-white/20"
    >
      <div
        className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full ${meta.bg} blur-2xl opacity-70`}
      />

      {/* top row: icon + duration */}
      <div className="relative flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${meta.bg} ring-1 ${meta.ring}`}>
          <Icon className="h-5 w-5" style={{ color: meta.color }} />
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
          <Clock3 className="h-3.5 w-3.5 text-emerald-300" />
          <span className="text-xs font-semibold text-emerald-200">
            {leave.leaveDays} {leave.leaveDays === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      {/* leave type chips */}
      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {typeChips.map((chip) => (
          <span
            key={chip}
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${meta.bg} ${meta.text} ring-1 ${meta.ring}`}
          >
            {chip}
          </span>
        ))}
      </div>

      {/* date range */}
      <div className="relative mt-4 flex items-center gap-2 text-sm text-slate-300">
        <CalendarRange className="h-4 w-4 text-slate-500" />
        <span className="font-medium text-white">{formatDate(leave.fromDate)}</span>
        <span className="text-slate-500">→</span>
        <span className="font-medium text-white">{formatDate(leave.toDate)}</span>
      </div>

      {/* normal vs extra day breakdown — only shown when a request mixes both */}
      {leave.normalLeaveDays > 0 && leave.extraLeaveDays > 0 && (
        <div className="relative mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span>
            Regular:{" "}
            <span className="font-semibold text-slate-200">
              {leave.normalLeaveDays}d
            </span>
          </span>
          <span className="text-slate-600">•</span>
          <span>
            Extra:{" "}
            <span className="font-semibold text-pink-300">
              {leave.extraLeaveDays}d
            </span>
          </span>
        </div>
      )}

      {/* reason */}
      {leave.reason && (
        <div className="relative mt-4 flex gap-2 rounded-xl bg-white/[0.03] p-3 text-sm text-slate-300">
          <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p className="line-clamp-3">{leave.reason}</p>
        </div>
      )}

      {/* admin remark */}
      {leave.adminRemark && (
        <div className="relative mt-3 flex gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3 text-sm text-emerald-100/80">
          <Notebook className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p className="line-clamp-3">{leave.adminRemark}</p>
        </div>
      )}

      {/* remaining balances */}
      {balances.length > 0 && (
        <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
          {balances.map((b) => (
            <div key={b.label} className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                {b.label} left
              </p>
              <p className="text-sm font-bold text-white">{b.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* footer: approved date */}
      <div className="relative mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-[11px] text-slate-500">Approved on</span>
        <span className="text-xs font-medium text-slate-300">
          {formatDate(leave.approvedAt)}
        </span>
      </div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      <p className="text-sm">Fetching approved leave records…</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 py-20 text-center">
      <ServerCrash className="h-9 w-9 text-red-400" />
      <p className="text-sm font-medium text-red-200">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] py-24 text-center">
      <Inbox className="h-9 w-9 text-slate-500" />
      <p className="text-sm font-medium text-slate-300">No approved leaves yet</p>
      <p className="max-w-xs text-xs text-slate-500">
        Once a leave request for this employee gets approved, it'll show up here.
      </p>
    </div>
  );
}