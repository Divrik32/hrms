import { useEffect, useState } from "react";
import api from "../services/axios";
import { motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle,
  XCircle,
  User,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";


const PendingLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
const [adminRemark, setAdminRemark] = useState("");
const [actionType, setActionType] = useState(""); // approve / reject


  const fetchPendingLeaves =
    async () => {
      try {
        const res =
          await api.get(
            "/leaves/pending",
            {
              withCredentials: true,
            }
          );

        setLeaves(
          res.data.leaves
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const approveLeave =
    async (leaveId) => {
      try {
        const res =
await api.put(
  `/leaves/approve/${leaveId}`,
  {
    adminRemark,
  },
  {
    withCredentials: true,
  }
);

        toast.success(
          res.data.message
        );

        fetchPendingLeaves();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message
        );
      }
    };

const rejectLeave = async (leaveId) => {
  try {
const res = await api.put(
  `/leaves/reject/${leaveId}`,
  {
    adminRemark,
  },
  {
    withCredentials: true,
  }
);

    toast.success(res.data.message);

    fetchPendingLeaves();

  } catch (error) {
    toast.error(
      error.response?.data?.message
    );
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <CalendarClock className="text-yellow-500" />
          <h1 className="text-3xl font-bold text-white">
            Pending Leave Requests
          </h1>
        </div>

        {leaves.length === 0 ? (
          <div className="bg-slate-900 rounded-xl p-8 text-center text-slate-400">
            No pending leave requests
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {leaves.map(
              (leave) => (
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
                  className="
                    bg-slate-900
                    border
                    border-slate-800
                    rounded-2xl
                    p-5
                  "
                >
                  <div className="space-y-3 overflow-y-auto max-h-[500px]">

                    <div className="flex items-center gap-2 text-white font-semibold">
                      <User size={18} />
                      {
                        leave
                          .employeeId
                          ?.name
                      }
                    </div>

                    <p className="text-slate-400 text-sm">
                      Employee ID :
                      {" "}
                      {
                        leave
                          .employeeId
                          ?.empId
                      }
                    </p>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Building size={16} />
                      {
                        leave
                          .departmentId
                          ?.departmentName
                      }
                    </div>

                    <hr className="border-slate-800" />

<div className="space-y-2">

  <p className="text-slate-300 font-semibold">
    Leave Summary
  </p>

  <ul className="text-slate-400 text-sm">

    {leave.leaveDetails?.leaveType.casualLeave > 0 && (
      <li>
        Casual Leave : {leave.leaveDetails.leaveType.casualLeave}
      </li>
    )}

    {leave.leaveDetails?.leaveType.sickLeave > 0 && (
      <li>
        Sick Leave : {leave.leaveDetails.leaveType.sickLeave}
      </li>
    )}

    {leave.leaveDetails?.leaveType.paidLeave > 0 && (
      <li>
        Paid Leave : {leave.leaveDetails.leaveType.paidLeave}
      </li>
    )}

    {leave.leaveDetails?.leaveType.compOff > 0 && (
      <li>
        Comp Off : {leave.leaveDetails.leaveType.compOff}
      </li>
    )}

  </ul>

</div>

<hr className="border-slate-800" />

<p className="text-slate-300 font-semibold">
  Leave Dates
</p>

<div className="space-y-2">

  {leave.leaveDetails?.leaveDates?.map((item, index) => (
    <div
      key={index}
      className="rounded-lg bg-slate-800 p-3 text-sm text-slate-300"
    >
      <p>Date : {item.date}</p>
      <p>Duration : {item.duration}</p>
      <p>Type : {item.leaveType}</p>
    </div>
  ))}

</div>

{leave.leaveDetails?.compOffWorkDate && (
  <>
    <hr className="border-slate-800" />

    <p className="text-slate-300">
      <span className="font-semibold">
        Comp Off Work Date :
      </span>{" "}
      {leave.leaveDetails.compOffWorkDate}
    </p>
  </>
)}


{leave.extraLeaveDetails?.extraLeaveDates?.length > 0 && (
  <>
    <hr className="border-slate-800" />

    <p className="text-slate-300 font-semibold">
      Extra Leave
    </p>

{leave.extraLeaveDetails.extraLeaveDates.map(
  (item, index) => (
    <div
      key={index}
      className="rounded-lg bg-slate-800 p-3 mt-2 text-sm text-slate-300"
    >
      <p>Date : {item.date}</p>
      <p>Duration : {item.duration}</p>

      <p>
        Type :
        {" "}
        {[
          leave.extraLeaveDetails?.extraLeaveType
            ?.casualLeave > 0 &&
            `Casual (${leave.extraLeaveDetails.extraLeaveType.casualLeave})`,

          leave.extraLeaveDetails?.extraLeaveType
            ?.sickLeave > 0 &&
            `Sick (${leave.extraLeaveDetails.extraLeaveType.sickLeave})`,
        ]
          .filter(Boolean)
          .join(", ")}
      </p>
    </div>
  )
)}
  </>
)}

<hr className="border-slate-800" />

<p className="text-slate-300">
  <span className="font-semibold">
    Reason
  </span>
</p>

<p className="text-slate-400 text-sm whitespace-pre-wrap">
  {leave.reason}
</p>

                    <div className="flex gap-3 mt-5">
                      <button
onClick={() => {
  setSelectedLeaveId(leave._id);
  setActionType("approve");
  setShowRejectModal(true);
}}
                        className="
                          flex-1
                          bg-green-600
                          hover:bg-green-700
                          text-white
                          py-2
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>

                      <button
onClick={() => {
  setSelectedLeaveId(leave._id);
  setActionType("reject");
  setShowRejectModal(true);
}}
                        className="
                          flex-1
                          bg-red-600
                          hover:bg-red-700
                          text-white
                          py-2
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >
                        <XCircle size={18} />
                        Reject
                      </button>

                    </div>

                  </div>
                </motion.div>
              )
            )}
          </div>
        )}
      </div>
{showRejectModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-slate-900 p-6 rounded-2xl w-[450px]">
      <h3 className="text-white text-lg font-semibold mb-3">
        {actionType === "approve"
          ? "Approve Leave Request"
          : "Reject Leave Request"}
      </h3>

      <textarea
        value={adminRemark}
        onChange={(e) =>
          setAdminRemark(e.target.value)
        }
        placeholder="Enter admin remark..."
        className="
          w-full
          h-28
          bg-slate-800
          border
          border-slate-700
          rounded-xl
          p-3
          text-white
          outline-none
          resize-none
          mb-5
        "
      />

      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowRejectModal(false);
            setAdminRemark("");
          }}
          className="flex-1 bg-slate-700 text-white py-2 rounded-xl"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            if (
              actionType === "approve"
            ) {
              approveLeave(
                selectedLeaveId
              );
            } else {
              rejectLeave(
                selectedLeaveId
              );
            }

            setAdminRemark("");
            setShowRejectModal(false);
          }}
          className={`
            flex-1
            text-white
            py-2
            rounded-xl
            ${
              actionType ===
              "approve"
                ? "bg-green-600"
                : "bg-red-600"
            }
          `}
        >
          {actionType === "approve"
            ? "Approve"
            : "Reject"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default PendingLeaves;