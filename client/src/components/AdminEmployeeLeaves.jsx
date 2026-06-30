import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Calendar,
  CalendarDays,
  FileText,
  MessageSquare,
  Sun,
  Stethoscope,
  Loader2,
  Inbox,
} from "lucide-react";
import api from "../services/axios";

const AdminEmployeeLeaves = () => {
  const { empId } = useParams();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, [empId]);

  const fetchLeaves = async () => {
    try {
      const res = await api.post(
        "/superadmin/approved-leaves",
        {
          employeeId: empId,
        },
        {
          withCredentials: true,
        }
      );

      setLeaves(res.data.leaves);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-green-400" />
          <span className="text-sm font-medium text-slate-400">
            Loading approved leaves...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-2 sm:mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/10 ring-1 ring-green-500/20">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight !text-green-400 sm:text-3xl lg:text-4xl">
                Approved Leaves
              </h1>
              <p className="text-sm text-slate-500">
                Overview of all approved leave requests
              </p>
            </div>
          </div>
        </motion.div>

        {/* Empty state */}
        {leaves.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-16 text-center backdrop-blur-sm"
          >
            <Inbox className="mb-4 h-10 w-10 text-slate-600" />
            <p className="text-slate-400">No approved leaves found</p>
          </motion.div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <AnimatePresence>
              {leaves.map((leave, index) => (
                <motion.div
                  key={leave._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition-colors hover:border-green-700/50 sm:p-6"
                >
                  {/* Glow accent */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-500/10 blur-3xl transition-opacity group-hover:opacity-80" />

                  <div className="relative flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-lg font-bold !text-green-400 sm:text-xl">
                      {leave.leaveType}
                    </h2>

                    <span className="flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approved
                    </span>
                  </div>

                  <div className="relative mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
                      <span>
                        <span className="text-slate-500">From:</span>{" "}
                        {leave.fromDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
                      <span>
                        <span className="text-slate-500">To:</span>{" "}
                        {leave.toDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
                      <span>
                        <span className="text-slate-500">
                          Leave Days:
                        </span>{" "}
                        {leave.leaveDays}
                      </span>
                    </div>
                  </div>

                  <div className="relative mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white">
                      <FileText className="h-4 w-4 text-slate-400" />
                      Reason
                    </p>
                    <p className="text-sm text-slate-400">{leave.reason}</p>
                  </div>

                  <div className="relative mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                      <Sun className="h-4 w-4 shrink-0 text-amber-400" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Casual left
                        </p>
                        <p className="text-sm font-semibold text-slate-200">
                          {leave.remainingCasualLeave}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                      <Stethoscope className="h-4 w-4 shrink-0 text-sky-400" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Sick left
                        </p>
                        <p className="text-sm font-semibold text-slate-200">
                          {leave.remainingSickLeave}
                        </p>
                      </div>
                    </div>
                  </div>

                  {leave.adminRemark && (
                    <div className="relative mt-4 rounded-xl border border-green-900/40 bg-green-500/5 p-4">
                      <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-green-400">
                        <MessageSquare className="h-4 w-4" />
                        Admin Remark
                      </p>
                      <p className="text-sm text-slate-300">
                        {leave.adminRemark}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmployeeLeaves;