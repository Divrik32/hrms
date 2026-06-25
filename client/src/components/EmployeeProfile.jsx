import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../services/axios";
import { motion } from "framer-motion";
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
} from "lucide-react";
import toast from "react-hot-toast";


const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay,
    },
  },
});

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployee();
  }, []);

  const getEmployee =
    async () => {
      try {
        // const user =
        //   JSON.parse(
        //     localStorage.getItem(
        //       "user"
        //     )
        //   );

        const res =
          await api.get(
            `/employees/profile/me`,
            {
              withCredentials: true,
            }
          );

        setEmployee(
          res.data.employee
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070e] flex justify-center items-center">
        <p className="text-white">
          Loading...
        </p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#07070e] flex flex-col justify-center items-center">
        <AlertCircle className="text-red-500 w-10 h-10" />

        <p className="text-white mt-3">
          Employee not found
        </p>
      </div>
    );
  }

//   const profilePic =
//     employee.profilePic
//       ? `http://localhost:5000/uploads/${employee.profilePic}`
//       : `https://placehold.co/120x120`;

 const profilePic =
  employee.profilePic
    ? `${BACKEND_URL}/uploads/${employee.profilePic}`
    : `https://placehold.co/120x120/2d1160/a78bfa?text=${employee.name?.charAt(0)}`;


  return (
    <div className="min-h-screen bg-[#07070e] text-white">

      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e0d60] via-[#1a0840] to-[#07070e]" />

        <div className="relative max-w-3xl mx-auto px-6 py-8 flex items-center gap-5">

          <motion.div
            {...fadeIn()}
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/15">
              <img
                src={profilePic}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <div>
            <motion.h1
              {...fadeIn(0.1)}
              className="text-3xl font-bold"
            >
              {employee.name}
            </motion.h1>

            <motion.div
              {...fadeIn(0.2)}
              className="flex flex-wrap gap-2 mt-3"
            >
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs">
                {employee.role}
              </span>

              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs">
                EMP ID:
                {" "}
                {employee.empId}
              </span>
              <DetailRow
                icon={
                  <BadgeCheck size={16} />
                }
                label="Status"
                value={employee.status}
              />
            </motion.div>
          </div>

        </div>
      </div>

      {/* DETAILS */}
      <div className="max-w-3xl mx-auto p-5 space-y-4">

        {/* Contact */}
        <motion.div
          {...fadeIn(0.3)}
          className="rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          <SectionHeader
            label="Contact"
          />

          <DetailRow
            icon={<Mail size={16} />}
            label="Email"
            value={employee.email}
          />

          <DetailRow
            icon={<Phone size={16} />}
            label="Phone"
            value={employee.phone}
          />

          <DetailRow
            icon={<MapPin size={16} />}
            label="Address"
            value={employee.presentAddress}
          />
          <DetailRow
  icon={<Users size={16} />}
  label="Gender"
  value={employee.gender}
/>
        </motion.div>

        {/* Company */}
        <motion.div
          {...fadeIn(0.4)}
          className="rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          <SectionHeader
            label="Organization"
          />

          <DetailRow
            icon={
              <Building2 size={16} />
            }
            label="Company"
            value={
              employee.companyId
                ?.companyName
            }
          />

          <DetailRow
            icon={<Users size={16} />}
            label="Department"
            value={
              employee
                .departmentId
                ?.departmentName
            }
          />

<DetailRow
  icon={
    <Briefcase size={16} />
  }
  label="Role"
  value={
    employee.role
  }
/>
        </motion.div>

        {/* Employment */}
        <motion.div
          {...fadeIn(0.5)}
          className="rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          <SectionHeader
            label="Employment"
          />

          <DetailRow
            icon={
              <BadgeCheck size={16} />
            }
            label="Employee ID"
            value={employee.empId}
          />

          <DetailRow
            icon={
              <CalendarDays size={16} />
            }
            label="Joined"
            value={new Date(
              employee.createdAt
            ).toLocaleDateString(
              "en-IN"
            )}
          />
        </motion.div>

      </div>
    </div>
  );
};

const SectionHeader = ({
  label,
}) => (
  <div className="px-5 py-3 border-b border-white/10">
    <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
      {label}
    </p>
  </div>
);

const DetailRow = ({
  icon,
  label,
  value,
}) => (
  <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 last:border-none">
    <div className="flex items-center gap-3">
      {icon}

      <span className="text-slate-400 text-sm">
        {label}
      </span>
    </div>

    <span className="text-white font-medium text-sm ml-2">
      {value || "N/A"}
    </span>
  </div>
);

export default EmployeeProfile;