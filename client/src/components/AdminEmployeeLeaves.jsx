import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  Calendar,
  CalendarDays,
  Clock,
  FileText,
  MessageSquare,
  Loader2,
  Inbox,
  Palmtree,
  Stethoscope,
  Wallet,
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
        { employeeId: empId },
        { withCredentials: true }
      );

      setLeaves(res.data.leaves || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center bg-slate-950">
        <Loader2 className="animate-spin text-green-400" size={35} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <h1 className="text-3xl font-bold text-green-400 mb-8">
        Approved Leaves
      </h1>

      {leaves.length === 0 ? (
        <div className="text-center text-slate-400">
          <Inbox size={40} className="mx-auto mb-3" />
          No approved leaves
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="bg-slate-900 rounded-2xl p-5 border border-slate-800"
            >
              <div className="flex justify-between mb-4">
                <h2 className="text-green-400 font-bold">
                  {leave.leaveType}
                </h2>

                <span className="text-xs bg-green-500/20 px-3 py-1 rounded-full text-green-400">
                  Approved
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex gap-2 items-center">
                  <Calendar size={16} />
                  From: {leave.fromDate}
                </div>

                <div className="flex gap-2 items-center">
                  <Calendar size={16} />
                  To: {leave.toDate}
                </div>

                <div className="flex gap-2 items-center">
                  <CalendarDays size={16} />
                  Days: {leave.leaveDays}
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 mt-4">
                <p className="font-semibold flex gap-2 mb-2">
                  <FileText size={16} />
                  Reason
                </p>
                <p className="text-sm text-slate-400">
                  {leave.reason}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <Balance
                  icon={Palmtree}
                  label="Casual"
                  value={leave.remainingCasualLeave}
                />
                <Balance
                  icon={Stethoscope}
                  label="Sick"
                  value={leave.remainingSickLeave}
                />
                <Balance
                  icon={Wallet}
                  label="Paid"
                  value={leave.remainingPaidLeave}
                />
              </div>

              {leave.adminRemark && (
                <div className="mt-4 p-3 rounded-xl bg-green-500/5 border border-green-900">
                  <p className="flex gap-2 text-green-400 font-semibold mb-1">
                    <MessageSquare size={14} />
                    Admin Remark
                  </p>
                  <p className="text-sm text-slate-300">
                    {leave.adminRemark}
                  </p>
                </div>
              )}

              <div className="mt-4 text-xs text-slate-500 flex gap-2 items-center">
                <Clock size={13} />
                Approved on{" "}
                {new Date(
                  leave.approvedAt
                ).toLocaleDateString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Balance = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl bg-slate-950 p-3 text-center">
    <Icon size={15} className="mx-auto mb-1 text-indigo-400" />
    <p className="text-white font-bold">{value}</p>
    <p className="text-xs text-slate-500">{label}</p>
  </div>
);

export default AdminEmployeeLeaves;