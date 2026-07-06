import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  XCircle,
  Calendar,
  CalendarDays,
  Clock,
  FileText,
  MessageSquareWarning,
  Loader2,
  Inbox,
} from "lucide-react";
import api from "../services/axios";

const AdminRejectedLeaves = () => {
  const { empId } = useParams();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRejectedLeaves();
  }, [empId]);

  const fetchRejectedLeaves = async () => {
    try {
      setLoading(true);

      const res = await api.post(
        "/superadmin/employee-rejected-leaves",
        {
          employeeId: empId,
        },
        {
          withCredentials: true,
        }
      );

      console.log(res.data);

      setLeaves(
        res.data?.rejectedLeaves || []
      );
    } catch (error) {
      console.log(
        error.response?.data || error
      );
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-400" />
          <p className="text-slate-400">
            Loading rejected leaves...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Rejected Leaves
              </h1>
              <p className="text-slate-500 text-sm">
                Employee rejected leave history
              </p>
            </div>
          </div>
        </motion.div>

        {leaves.length === 0 ? (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 flex flex-col items-center gap-4">
            <Inbox className="w-10 h-10 text-slate-600" />
            <p className="text-slate-400">
              No rejected leaves found
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {leaves.map((leave, index) => (
              <motion.div
                key={leave._id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="bg-slate-900 border border-red-900/40 rounded-2xl p-6"
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-red-400 font-bold text-lg">
                    {leave.leaveType ||
                      "Unknown Leave"}
                  </h2>

                  <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                    Rejected
                  </span>
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    From:
                    <span>
                      {leave.fromDate ||
                        "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    To:
                    <span>
                      {leave.toDate || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-500" />
                    Days:
                    <span>
                      {leave.leaveDays || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Rejected At:
                    <span>
                      {leave.rejectedAt
                        ? new Date(
                            leave.rejectedAt
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <p className="flex items-center gap-2 text-white font-semibold mb-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Reason
                  </p>

                  <p className="text-slate-400 text-sm">
                    {leave.reason}
                  </p>
                </div>

                {leave.adminRemark && (
                  <div className="mt-4 bg-red-500/5 border border-red-900/40 rounded-xl p-4">
                    <p className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                      <MessageSquareWarning className="w-4 h-4" />
                      Admin Remark
                    </p>

                    <p className="text-slate-300 text-sm">
                      {leave.adminRemark}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRejectedLeaves;