import { useNavigate, useOutletContext } from "react-router-dom";
import { Users, Building2, UserRound, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const EmployeeCard = ({ employee, onClick, accent = "indigo" }) => {
  const ring =
    accent === "teal"
      ? "group-hover:ring-teal-400/70 group-hover:border-teal-400/70 group-hover:shadow-teal-950/40"
      : "group-hover:ring-indigo-400/60 group-hover:border-indigo-500/60 group-hover:shadow-indigo-950/30";

  const iconWrap =
    accent === "teal"
      ? "from-teal-500/30 to-cyan-500/30 ring-teal-400/40"
      : "from-indigo-500/25 to-violet-500/25 ring-indigo-500/30";

  const iconColor = accent === "teal" ? "text-teal-300" : "text-indigo-300";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 p-4 rounded-xl
        bg-slate-800 border border-slate-600
        cursor-pointer hover:shadow-lg transition-colors duration-300
        ${ring}
      `}
    >
      <div
        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconWrap} flex items-center justify-center shrink-0 ring-1 transition-all`}
      >
        <UserRound className={`w-5 h-5 ${iconColor}`} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-white font-semibold truncate" title={employee.name}>
          {employee.name}
        </h3>

        <p className="text-slate-400 text-xs mt-0.5 truncate">
          {employee.empId}
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
    </motion.div>
  );
};

const EmployeeSection = () => {
  const navigate = useNavigate();

  const { departments, departmentEmployees, withoutDepartmentEmployees } =
    useOutletContext();

  const safeWithoutDepartment = Array.isArray(withoutDepartmentEmployees)
    ? withoutDepartmentEmployees
    : [];

  return (
    <div className="min-h-screen bg-slate-900 p-6 sm:p-8 lg:p-10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Users className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="!text-white text-3xl sm:text-4xl font-bold">
              Employees Details
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Browse employees grouped by department
            </p>
          </div>
        </motion.div>

        {/* Departments */}
        {departments.map((department, dIndex) => {
          const employees = departmentEmployees[department._id] || [];

          return (
            <motion.div
              key={department._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: dIndex * 0.05, ease: "easeOut" }}
              className="mb-10"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <h2 className="!text-indigo-400 text-xl sm:text-2xl font-bold">
                    {department.departmentName}
                  </h2>
                </div>

                <span className="text-xs font-medium text-slate-400 bg-slate-800 border border-slate-600 px-2.5 py-1 rounded-full shrink-0">
                  {employees.length} {employees.length === 1 ? "employee" : "employees"}
                </span>
              </div>

              {employees.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">
                  No employees in this department yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {employees.map((employee) => (
                    <EmployeeCard
                      key={employee._id}
                      employee={employee}
                      onClick={() => navigate(employee._id)}
                      accent="indigo"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Employees without department */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: departments.length * 0.05, ease: "easeOut" }}
          className="mb-10"
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-teal-400 shrink-0" />
              <h2 className="!text-teal-400 text-xl sm:text-2xl font-bold">
                Employees Without Department
              </h2>
            </div>

            <span className="text-xs font-medium text-slate-400 bg-slate-800 border border-slate-600 px-2.5 py-1 rounded-full shrink-0">
              {safeWithoutDepartment.length}{" "}
              {safeWithoutDepartment.length === 1 ? "employee" : "employees"}
            </span>
          </div>

          {safeWithoutDepartment.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              Every employee is assigned to a department.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {safeWithoutDepartment.map((employee) => (
                <EmployeeCard
                  key={employee._id}
                  employee={employee}
                  onClick={() => navigate(employee._id)}
                  accent="teal"
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeSection;