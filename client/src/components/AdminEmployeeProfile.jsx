import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  CalendarDays,
  BadgeCheck,
  UserRound,
  CheckCircle2,
  XCircle,
  Sun,
  Stethoscope,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";

import toast from "react-hot-toast";
import api, { BACKEND_URL } from "../services/axios";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const AdminEmployeeProfile = () => {
  const { empId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [editingRole, setEditingRole] = useState(false);
const [selectedRole, setSelectedRole] = useState("");

const roles = [
  "Vice President",
  "General Manager",
  "Senior Manager",
  "Project Manager",
  "Team Lead",
  "Senior Software Engineer",
  "Software Engineer",
  "Associate Trainee",
  "Intern",
];

  useEffect(() => {
    loadEmployeeData();
  }, [empId]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      // employee details
      const employeeRes =
        await api.post(
          "/superadmin/get-by-id",
          {
            employeeId: empId,
          },
          {
            withCredentials: true,
          }
        );

      const employeeData =
        employeeRes.data.employee;

      setEmployee(employeeData);
      setSelectedDepartment(employeeData.departmentId?._id || "");
      setSelectedRole(employeeData.role || "");

      const depRes = await api.get(
        `/departments/company/${employeeData.companyId._id}`,
        {
          withCredentials: true,
        }
      );

setDepartments(depRes.data.departments);
      const leaveStatsRes =
        await api.post(
          "/superadmin/employee-leave-stats",
          {
            employeeId: empId,
          },
          {
            withCredentials: true,
          }
        );

      setLeaveSummary(
        leaveStatsRes.data
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const updateDepartment = async () => {
  try {
    const res = await api.put(
      "/superadmin/edit-employee",
      {
        employeeId: employee._id,
        departmentId: selectedDepartment,
      },
      {
        withCredentials: true,
      }
    );

    setEmployee(res.data.employee);
    setEditingDepartment(false);

    toast.success("Department updated");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Update failed"
    );
  }
};

const updateRole = async () => {
  try {
    const res = await api.put(
      "/superadmin/edit-employee",
      {
        employeeId: employee._id,
        role: selectedRole,
      },
      {
        withCredentials: true,
      }
    );

    setEmployee(res.data.employee);
    setEditingRole(false);

    toast.success("Role updated");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Update failed"
    );
  }
};

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-950 text-white gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm tracking-wide">Loading profile…</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <p className="text-red-400 text-lg font-medium">Employee not found</p>
      </div>
    );
  }

  const profilePic = employee.profilePic
    ? `${BACKEND_URL}/uploads/${employee.profilePic}`
    : `https://placehold.co/120x120/2d1160/a78bfa?text=${employee.name?.charAt(0)}`;

  const statusStyles = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    inactive: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    default: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  };
  const statusClass =
    statusStyles[employee.status?.toLowerCase()] || statusStyles.default;

  const infoItems = [
    { icon: Mail, label: "Email", value: employee.email },
    { icon: Phone, label: "Phone", value: employee.phone },
    { icon: UserRound, label: "Gender", value: employee.gender },
    // { icon: Briefcase, label: "Role", value: employee.role },
    { icon: MapPin, label: "Address", value: employee.presentAddress },
    {
      icon: CalendarDays,
      label: "Joined On",
      value: new Date(employee.createdAt).toLocaleDateString("en-IN"),
    },
  ];

const stats = [
  {
    icon: CheckCircle2,
    label: "Approved Leaves",
    value:
      leaveSummary?.approvedLeaveCount || 0,
    color: "text-emerald-400",
    glow: "from-emerald-500/10",
    onClick: () =>
      navigate(
        `../leaves/${empId}`
      ),
  },

  {
    icon: XCircle,
    label: "Rejected Leaves",
    value: leaveSummary?.rejectedLeaveCount || 0,
    color: "text-red-400",
    glow: "from-red-500/10",
    onClick: () =>
      navigate(
        `../rejected-leaves/${empId}`
      ),
  },

  {
    icon: Sun,
    label: "Remaining Casual Leave",
    value:leaveSummary?.remainingCasualLeave || 0,
    color: "text-sky-400",
    glow: "from-sky-500/10",
  },

  {
    icon: Stethoscope,
    label: "Remaining Sick Leave",
    value:
      leaveSummary?.remainingSickLeave || 0,
    color: "text-amber-400",
    glow: "from-amber-500/10",
  },
  {
  icon: CalendarDays,
  label: "Remaining Paid Leave",
  value:
    leaveSummary?.remainingPaidLeave || 0,
  color: "text-violet-400",
  glow: "from-violet-500/10",
},
];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* ambient background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold !text-white mb-8 tracking-tight"
        >
          Employee Profile
        </motion.h1>

        {/* Employee Info */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-xl shadow-black/20"
        >
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left">
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="relative shrink-0"
            >
              <img
                src={profilePic}
                alt="profile"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/20"
              />
              <span className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-700">
                <BadgeCheck className="w-5 h-5 text-indigo-400" />
              </span>
            </motion.div>

            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                <div>
                  <h2 className="text-2xl font-bold !text-white">
                    {employee.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    ID: {employee.empId}
                  </p>
                </div>
                <span
                  className={`inline-flex self-center sm:self-auto w-fit mx-auto sm:mx-0 items-center px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}
                >
                  {employee.status}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-left">
                {infoItems.map(({ icon: Icon, label, value }, i) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-indigo-400" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        {label}
                      </p>
                      <p className="text-slate-200 text-sm font-medium break-words">
                        {value || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company & Department */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-indigo-400">Company</h3>
            </div>
            <p className="text-white text-base">
              {employee.companyId?.companyName || "—"}
            </p>
          </motion.div>

<motion.div
  custom={2}
  initial="hidden"
  animate="show"
  variants={fadeUp}
  className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-colors"
>
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Briefcase className="w-5 h-5 text-indigo-400" />
      <h3 className="text-lg font-bold text-indigo-400">
        Department
      </h3>
    </div>

    {!editingDepartment && (
      <button
        onClick={() => setEditingDepartment(true)}
        className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition"
      >
        <Pencil className="w-4 h-4 text-white" />
      </button>
    )}
  </div>

  {editingDepartment ? (
    <div className="flex items-center gap-2">
      <select
        value={selectedDepartment}
        onChange={(e) =>
          setSelectedDepartment(e.target.value)
        }
        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
      >
        {departments.map((dept) => (
          <option key={dept._id} value={dept._id}>
            {dept.departmentName}
          </option>
        ))}
      </select>

      <button
        onClick={updateDepartment}
        className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
      >
        <Check className="w-4 h-4 text-white" />
      </button>

      <button
        onClick={() => {
          setEditingDepartment(false);
          setSelectedDepartment(employee.departmentId?._id);
        }}
        className="p-2 rounded-lg bg-red-600 hover:bg-red-700"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  ) : (
    <p className="text-white text-base">
      {employee.departmentId?.departmentName || "—"}
    </p>
  )}
</motion.div>

<motion.div
  custom={3}
  initial="hidden"
  animate="show"
  variants={fadeUp}
  className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-colors"
>
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Briefcase className="w-5 h-5 text-indigo-400" />
      <h3 className="text-lg font-bold text-indigo-400">
        Role
      </h3>
    </div>

    {!editingRole && (
      <button
        onClick={() => setEditingRole(true)}
        className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition"
      >
        <Pencil className="w-4 h-4 text-white" />
      </button>
    )}
  </div>

  {editingRole ? (
    <div className="flex items-center gap-2">
      <select
        value={selectedRole}
        onChange={(e) =>
          setSelectedRole(e.target.value)
        }
        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      <button
        onClick={updateRole}
        className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
      >
        <Check className="w-4 h-4 text-white" />
      </button>

      <button
        onClick={() => {
          setEditingRole(false);
          setSelectedRole(employee.role);
        }}
        className="p-2 rounded-lg bg-red-600 hover:bg-red-700"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  ) : (
    <p className="text-white text-base">
      {employee.role}
    </p>
  )}
</motion.div>

        </div>

        {/* Leave Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
{stats.map(
  ({
    icon: Icon,
    label,
    value,
    color,
    glow,
    onClick,
  }, i) => (
    <motion.div
      key={label}
      custom={i + 3}
      initial="hidden"
      animate="show"
      variants={fadeUp}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`relative overflow-hidden bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg shadow-black/10 ${
        onClick
          ? "cursor-pointer hover:border-indigo-500"
          : ""
      }`}
    >
              <div
                className={`pointer-events-none absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br ${glow} to-transparent rounded-full blur-2xl`}
              />
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <h4 className="text-slate-400 text-xs sm:text-sm">{label}</h4>
              <p className={`text-3xl sm:text-4xl font-bold ${color} mt-2`}>
                {value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeeProfile;