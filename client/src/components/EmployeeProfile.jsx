import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../services/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  CalendarDays,
  BadgeCheck,
  Users,
  AlertCircle,
  Pencil,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay },
  },
});

/* ─── Editable Row ────────────────────────────────────────────── */
const EditableRow = ({
  icon,
  label,
  value,
  field,
  editField,
  setEditField,
  editValue,
  setEditValue,
  updateField,
}) => {
  const isEditing = editField === field;

  return (
    <div
      className={`relative flex flex-col px-4 py-3 border-b border-white/5 transition-colors duration-200 ${
        isEditing ? "bg-violet-500/5" : ""
      }`}
    >
      {/* Active editing left-border accent */}
      {isEditing && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-violet-500" />
      )}

      {/* Top row: icon + label + pencil (always visible on mobile) */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-slate-500 flex-shrink-0">{icon}</span>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {label}
          </span>
        </div>

        {/* Pencil — always visible (no hover dependency) */}
        {!isEditing && (
          <button
            onClick={() => {
              setEditField(field);
              setEditValue(value);
            }}
            title={`Edit ${label}`}
            className="flex items-center justify-center w-7 h-7 rounded-md bg-violet-500/15 active:bg-violet-500/30 text-violet-400 border border-violet-500/20 transition-all duration-150"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {/* Bottom row: value or edit controls */}
      <AnimatePresence mode="wait" initial={false}>
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 flex-wrap mt-1"
          >
            {field === "gender" ? (
              <div className="relative flex-1 min-w-0">
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full appearance-none bg-[#1a0f35] border border-violet-500/40 text-white text-sm pl-3 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/60 cursor-pointer transition"
                >
                  {["Male", "Female", "Other"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none"
                />
              </div>
            ) : (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateField(field);
                  if (e.key === "Escape") setEditField(null);
                }}
                className="flex-1 min-w-0 bg-[#1a0f35] border border-violet-500/40 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/60 placeholder:text-slate-600 transition"
                placeholder={`Edit ${label.toLowerCase()}`}
              />
            )}

            {/* Save */}
            <button
              onClick={() => updateField(field)}
              title="Save"
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/15 active:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 transition"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>

            {/* Cancel */}
            <button
              onClick={() => setEditField(null)}
              title="Cancel"
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 active:bg-red-500/20 text-red-400 border border-red-500/20 transition"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <span className="text-white font-medium text-sm break-all">
              {value || "—"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────── */
const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    getEmployee();
  }, []);

  const getEmployee = async () => {
    try {
      const res = await api.get(`/employees/profile/me`, {
        withCredentials: true,
      });
      setEmployee(res.data.employee);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (field) => {
    try {
      const res = await api.put(
        "/employees/edit-profile",
        { [field]: editValue },
        { withCredentials: true }
      );
      setEmployee(res.data.employee);
      setEditField(null);
      toast.success("Updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleProfilePicChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("profilePic", file);
      const res = await api.put("/employees/edit-profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEmployee(res.data.employee);
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070e] flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/40 border-t-violet-400 animate-spin" />
          <p className="text-slate-500 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#07070e] flex flex-col justify-center items-center gap-3 px-4">
        <AlertCircle className="text-red-500 w-10 h-10" />
        <p className="text-white mt-1">Employee not found</p>
      </div>
    );
  }

  const profilePic = employee.profilePic
    ? `${BACKEND_URL}/uploads/${employee.profilePic}`
    : `https://placehold.co/120x120/2d1160/a78bfa?text=${employee.name?.charAt(0)}`;

  const editableProps = { editField, setEditField, editValue, setEditValue, updateField };

  return (
    <div className="min-h-screen bg-[#07070e] text-white">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e0d60] via-[#1a0840] to-[#07070e]" />
        <div className="relative max-w-3xl mx-auto px-4 py-6 flex items-start gap-4">

          {/* Avatar */}
          <motion.div {...fadeIn()} className="flex-shrink-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-white/15">
              <img
                src={profilePic}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 flex items-end justify-end p-1 bg-black/0 active:bg-black/40 transition-all cursor-pointer">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600">
                  <Pencil size={11} />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              </label>
            </div>
          </motion.div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">

            {/* Name — editable */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-1">
                Full name
              </p>

              <AnimatePresence mode="wait" initial={false}>
                {editField === "name" ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 flex-wrap"
                  >
                    <div className="relative flex-1 min-w-0">
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-violet-500" />
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateField("name");
                          if (e.key === "Escape") setEditField(null);
                        }}
                        className="w-full bg-[#1a0f35]/90 border-[1.5px] border-violet-500/50 focus:border-violet-400
                        text-white text-base font-semibold px-3 py-2 pl-4 rounded-xl
                        outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                        placeholder="Enter full name"
                      />
                    </div>

                    <button
                      onClick={() => updateField("name")}
                      aria-label="Save name"
                      className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-[9px]
                                 bg-emerald-500/12 active:bg-emerald-500/22 border border-emerald-500/25
                                 text-emerald-400 transition-all"
                    >
                      <Check size={16} strokeWidth={2.5} />
                    </button>

                    <button
                      onClick={() => setEditField(null)}
                      aria-label="Cancel"
                      className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-[9px]
                                 bg-red-500/10 active:bg-red-500/20 border border-red-500/20
                                 text-red-400 transition-all"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-2"
                  >
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight !text-white truncate">
                      {employee.name}
                    </h1>
                    <button
                      onClick={() => {
                        setEditField("name");
                        setEditValue(employee.name);
                      }}
                      aria-label="Edit name"
                      className="flex-shrink-0 flex items-center justify-center
                                 w-7 h-7 rounded-lg bg-violet-500/15 active:bg-violet-500/28
                                 border border-violet-500/20 text-violet-400
                                 transition-all duration-150"
                    >
                      <Pencil size={13} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div {...fadeIn(0.2)} className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs">
                {employee.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs">
                EMP ID: {employee.empId}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs ${
                  employee.status === "Active"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-slate-500/15 text-slate-400"
                }`}
              >
                {employee.status}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── DETAILS ── */}
      <div className="max-w-3xl mx-auto px-3 sm:px-5 pb-8 pt-2 space-y-4">

        {/* Contact */}
        <motion.div
          {...fadeIn(0.3)}
          className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
        >
          <SectionHeader label="Contact" hint="Tap ✏️ to edit" />

          <EditableRow
            icon={<Mail size={15} />}
            label="Email"
            value={employee.email}
            field="email"
            {...editableProps}
          />
          <EditableRow
            icon={<Phone size={15} />}
            label="Phone"
            value={employee.phone}
            field="phone"
            {...editableProps}
          />
          <EditableRow
            icon={<MapPin size={15} />}
            label="Address"
            value={employee.presentAddress}
            field="presentAddress"
            {...editableProps}
          />
          <EditableRow
            icon={<Users size={15} />}
            label="Gender"
            value={employee.gender}
            field="gender"
            {...editableProps}
          />
        </motion.div>

        {/* Organization */}
        <motion.div
          {...fadeIn(0.4)}
          className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
        >
          <SectionHeader label="Organization" />

          <DetailRow
            icon={<Building2 size={15} />}
            label="Company"
            value={employee.companyId?.companyName}
          />
          <DetailRow
            icon={<Users size={15} />}
            label="Department"
            value={employee.departmentId?.departmentName}
          />
          <DetailRow
            icon={<Briefcase size={15} />}
            label="Role"
            value={employee.role}
          />
        </motion.div>

        {/* Employment */}
        <motion.div
          {...fadeIn(0.5)}
          className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
        >
          <SectionHeader label="Employment" />

          <DetailRow
            icon={<BadgeCheck size={15} />}
            label="Employee ID"
            value={employee.empId}
          />
          <DetailRow
            icon={<CalendarDays size={15} />}
            label="Joined"
            value={new Date(employee.createdAt).toLocaleDateString("en-IN")}
          />
        </motion.div>

      </div>
    </div>
  );
};

/* ─── Section Header ──────────────────────────────────────────── */
const SectionHeader = ({ label, hint }) => (
  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
    <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
      {label}
    </p>
    {hint && (
      <p className="text-[10px] text-slate-600 italic">{hint}</p>
    )}
  </div>
);

/* ─── Read-only Detail Row ────────────────────────────────────── */
const DetailRow = ({ icon, label, value }) => (
  <div className="flex justify-between items-center px-4 py-3.5 border-b border-white/5 last:border-none gap-3">
    <div className="flex items-center gap-2 text-slate-500 flex-shrink-0">
      {icon}
      <span className="text-slate-400 text-sm">{label}</span>
    </div>
    <span className="text-white font-medium text-sm text-right break-all ml-2">
      {value || "N/A"}
    </span>
  </div>
);

export default EmployeeProfile;