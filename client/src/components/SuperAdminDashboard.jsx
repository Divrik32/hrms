import { useEffect, useMemo, useState } from "react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Building2,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  ChevronRight,
  CalendarClock,
  ClipboardCheck,
  CalendarDays,
  Menu,
  X,
  Users,
  WalletCards,
  BarChart3,
  UserPlus,
  BriefcaseBusiness,
  Sun,
  Moon,
  MonitorCog,
  Check,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";


const LEAVE_COLORS = [
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

/* =========================================================
   THEMES
========================================================= */

const THEMES = {
  dark: {
    name: "Dark",
    icon: Moon,

    page:
      "bg-[#0b1120] text-slate-100",

    main:
      "bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#17134a]",

    sidebar:
      "bg-[#0b1120] border-slate-800",

    topbar:
      "bg-[#0b1120]/95 border-slate-800",

    card:
      "bg-[#111827]/90 border-slate-700/80",

    cardHover:
      "hover:border-slate-600",

    userCard:
      "bg-[#111827] border-slate-700",

    navHover:
      "hover:bg-slate-800",

    navIcon:
      "bg-slate-800 group-hover:bg-indigo-600",

    primaryText:
      "text-slate-100",

    secondaryText:
      "text-slate-300",

    mutedText:
      "text-slate-400",

    subtleText:
      "text-slate-500",

    border:
      "border-slate-700",

    chartGrid:
      "#334155",

    chartText:
      "#cbd5e1",

    tooltip:
      "#020617",
  },

  light: {
    name: "Light",
    icon: Sun,

    page:
      "bg-slate-100 text-slate-900",

    main:
      "bg-gradient-to-br from-slate-100 via-white to-indigo-50",

    sidebar:
      "bg-white border-slate-200",

    topbar:
      "bg-white/95 border-slate-200",

    card:
      "bg-white border-slate-200",

    cardHover:
      "hover:border-slate-300",

    userCard:
      "bg-slate-50 border-slate-200",

    navHover:
      "hover:bg-indigo-50",

    navIcon:
      "bg-slate-100 group-hover:bg-indigo-600",

    primaryText:
      "text-slate-900",

    secondaryText:
      "text-slate-700",

    mutedText:
      "text-slate-600",

    subtleText:
      "text-slate-500",

    border:
      "border-slate-200",

    chartGrid:
      "#e2e8f0",

    chartText:
      "#475569",

    tooltip:
      "#ffffff",
  },

  midnight: {
    name: "Midnight",
    icon: MonitorCog,

    page:
      "bg-[#050816] text-white",

    main:
      "bg-gradient-to-br from-[#050816] via-[#0a1025] to-[#101c3d]",

    sidebar:
      "bg-[#060b19] border-indigo-900/50",

    topbar:
      "bg-[#060b19]/95 border-indigo-900/50",

    card:
      "bg-[#0b1226]/95 border-indigo-900/50",

    cardHover:
      "hover:border-indigo-800",

    userCard:
      "bg-[#0b1226] border-indigo-900/50",

    navHover:
      "hover:bg-indigo-950/70",

    navIcon:
      "bg-indigo-950 group-hover:bg-indigo-600",

    primaryText:
      "text-white",

    secondaryText:
      "text-slate-200",

    mutedText:
      "text-slate-300",

    subtleText:
      "text-slate-400",

    border:
      "border-indigo-900/50",

    chartGrid:
      "#26365f",

    chartText:
      "#cbd5e1",

    tooltip:
      "#020617",
  },
};

/* =========================================================
   SIDEBAR ITEM
========================================================= */

const SidebarAction = ({
  icon: Icon,
  label,
  description,
  onClick,
  badge,
  theme,
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full
        flex
        items-center
        gap-3
        px-3
        py-3
        rounded-xl
        text-left
        transition-all
        group
        ${theme.navHover}
      `}
    >
      <div
        className={`
          w-9
          h-9
          rounded-lg
          flex
          items-center
          justify-center
          shrink-0
          transition
          ${theme.navIcon}
        `}
      >
        <Icon
          className={`
            w-4
            h-4
            ${theme.mutedText}
            group-hover:text-white
          `}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`
            text-sm
            font-semibold
            truncate
            ${theme.secondaryText}
            group-hover:text-indigo-500
          `}
        >
          {label}
        </p>

        {description && (
          <p
            className={`
              text-[11px]
              truncate
              mt-0.5
              ${theme.subtleText}
            `}
          >
            {description}
          </p>
        )}
      </div>

      {badge > 0 && (
        <span
          className="
            bg-red-500
            text-white
            text-[10px]
            font-bold
            min-w-[22px]
            h-5
            px-1.5
            rounded-full
            flex
            items-center
            justify-center
          "
        >
          {badge}
        </span>
      )}

      <ChevronRight
        className={`
          w-4
          h-4
          ${theme.subtleText}
          group-hover:text-indigo-500
          shrink-0
        `}
      />
    </motion.button>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  iconBg,
  theme,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`
        ${theme.card}
        ${theme.cardHover}
        backdrop-blur-xl
        border
        rounded-2xl
        p-5
        transition
        shadow-sm
      `}
    >
      <div className="flex items-center justify-between">
        <div
          className={`
            w-10
            h-10
            rounded-xl
            flex
            items-center
            justify-center
            ${iconBg}
          `}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        <BarChart3
          className={`
            w-4
            h-4
            ${theme.subtleText}
          `}
        />
      </div>

      <p
        className={`
          text-xs
          mt-4
          font-medium
          ${theme.mutedText}
        `}
      >
        {label}
      </p>

      <p
        className={`
          text-2xl
          font-bold
          mt-1
          ${theme.primaryText}
        `}
      >
        {value}
      </p>

      <p
        className={`
          text-[11px]
          mt-1
          ${theme.subtleText}
        `}
      >
        {description}
      </p>
    </motion.div>
  );
};

/* =========================================================
   CHART CARD
========================================================= */

const ChartCard = ({
  title,
  description,
  icon: Icon,
  children,
  className = "",
  theme,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`
        ${theme.card}
        ${theme.cardHover}
        backdrop-blur-xl
        border
        rounded-2xl
        p-5
        sm:p-6
        transition
        shadow-sm
        ${className}
      `}
    >
      <div className="flex items-start gap-3 mb-5">
        <div
          className="
            w-9
            h-9
            rounded-lg
            bg-indigo-500/10
            border
            border-indigo-500/20
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <Icon className="w-4 h-4 text-indigo-500" />
        </div>

        <div>
          <h3
            className={`
              font-semibold
              text-sm
              sm:text-base
              ${theme.primaryText}
            `}
          >
            {title}
          </h3>

          <p
            className={`
              text-xs
              mt-1
              ${theme.mutedText}
            `}
          >
            {description}
          </p>
        </div>
      </div>

      {children}
    </motion.div>
  );
};

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

const EmployeeTooltip = ({
  active,
  payload,
  label,
  theme,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className={`
        rounded-xl
        px-3
        py-2
        shadow-xl
        border
        ${theme.border}
        ${
          theme.name === "Light"
            ? "bg-white"
            : "bg-slate-950"
        }
      `}
    >
      <p
        className={`
          text-xs
          mb-1
          ${theme.mutedText}
        `}
      >
        {label}
      </p>

      <p
        className={`
          text-sm
          font-semibold
          ${theme.primaryText}
        `}
      >
        {payload[0].value} Employees
      </p>
    </div>
  );
};

/* =========================================================
   THEME SWITCHER
========================================================= */

const ThemeSwitcher = ({
  currentTheme,
  setCurrentTheme,
  theme,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`
          flex
          items-center
          gap-2
          px-3
          py-2
          rounded-xl
          border
          transition
          ${theme.border}
          ${
            theme.name === "Light"
              ? "bg-white hover:bg-slate-50"
              : "bg-slate-900/70 hover:bg-slate-800"
          }
        `}
      >
        {(() => {
          const ThemeIcon =
            THEMES[currentTheme].icon;

          return (
            <ThemeIcon
              className={`
                w-4
                h-4
                ${
                  currentTheme === "light"
                    ? "text-amber-500"
                    : "text-indigo-400"
                }
              `}
            />
          );
        })()}

        <span
          className={`
            hidden
            sm:block
            text-xs
            font-semibold
            ${theme.secondaryText}
          `}
        >
          {THEMES[currentTheme].name}
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div
            className={`
              absolute
              right-0
              top-12
              z-50
              w-44
              rounded-xl
              border
              p-2
              shadow-2xl
              ${
                theme.name === "Light"
                  ? "bg-white border-slate-200"
                  : "bg-slate-900 border-slate-700"
              }
            `}
          >
            {Object.entries(THEMES).map(
              ([key, item]) => {
                const Icon = item.icon;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentTheme(key);
                      setOpen(false);
                    }}
                    className={`
                      w-full
                      flex
                      items-center
                      gap-3
                      px-3
                      py-2.5
                      rounded-lg
                      transition
                      ${
                        currentTheme === key
                          ? "bg-indigo-500/10"
                          : "hover:bg-slate-500/10"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-4
                        h-4
                        ${
                          key === "light"
                            ? "text-amber-500"
                            : "text-indigo-400"
                        }
                      `}
                    />

                    <span
                      className={`
                        flex-1
                        text-left
                        text-xs
                        font-semibold
                        ${
                          theme.name === "Light"
                            ? "text-slate-700"
                            : "text-slate-200"
                        }
                      `}
                    >
                      {item.name}
                    </span>

                    {currentTheme === key && (
                      <Check className="w-4 h-4 text-indigo-500" />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SuperAdminDashboard = () => {
const [user, setUser] = useState(null);

const [pendingCount, setPendingCount] =
  useState(0);

const [companyEmployeeData, setCompanyEmployeeData] =
  useState([]);

const [leaveData, setLeaveData] =
  useState([
    {
      name: "Pending",
      value: 0,
    },
    {
      name: "Approved",
      value: 0,
    },
    {
      name: "Rejected",
      value: 0,
    },
  ]);

const [departmentEmployeeData, setDepartmentEmployeeData] =
  useState([]);

const [payrollData, setPayrollData] =
  useState([]);

const [totalEmployees, setTotalEmployees] =
  useState(0);

const [totalCompanies, setTotalCompanies] =
  useState(0);

const [totalDepartments, setTotalDepartments] =
  useState(0);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [currentTheme, setCurrentTheme] =
    useState(() => {
      return (
        localStorage.getItem(
          "superAdminTheme"
        ) || "dark"
      );
    });

  const navigate = useNavigate();

  const theme = THEMES[currentTheme];

  /* =======================================================
     SAVE THEME
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      "superAdminTheme",
      currentTheme
    );
  }, [currentTheme]);

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.log(error);
      localStorage.removeItem("user");
      navigate("/");
    }
  }, [navigate]);

/* =======================================================
   FETCH DASHBOARD DATA
======================================================= */

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [
        companyRes,
        leaveRes,
        departmentRes,
        payrollRes,
        employeeRes,
      ] = await Promise.all([
        api.get(
          "/superadmin-dashboard/company-employee-count",
          {
            withCredentials: true,
          }
        ),

        api.get(
          "/superadmin-dashboard/leave-request-status-count",
          {
            withCredentials: true,
          }
        ),

        api.get(
          "/superadmin-dashboard/department-employee-count",
          {
            withCredentials: true,
          }
        ),

        api.get(
          "/superadmin-dashboard/monthly-payroll-count",
          {
            withCredentials: true,
          }
        ),

        api.get(
          "/superadmin-dashboard/total-employee-count",
          {
            withCredentials: true,
          }
        ),
      ]);

      /* ================================================
         COMPANY EMPLOYEE DATA
      ================================================= */

      const companies =
        companyRes.data.companies || [];

      setCompanyEmployeeData(
        companies.map((company) => ({
          company: company.companyName,
          employees: company.employeeCount,
        }))
      );

      setTotalCompanies(
        companies.length
      );


      /* ================================================
         LEAVE DATA
      ================================================= */

      const leaveResponse =
        leaveRes.data;

      setPendingCount(
        leaveResponse.pending || 0
      );

      setLeaveData([
        {
          name: "Pending",
          value: leaveResponse.pending || 0,
        },
        {
          name: "Approved",
          value: leaveResponse.approved || 0,
        },
        {
          name: "Rejected",
          value: leaveResponse.rejected || 0,
        },
      ]);


      /* ================================================
         DEPARTMENT EMPLOYEE DATA
      ================================================= */

      const departments =
        departmentRes.data.departments || [];

      setDepartmentEmployeeData(
        departments.map((department) => ({
          department:
            `${department.companyName} - ${department.departmentName}`,

          employees:
            department.employeeCount,
        }))
      );

      setTotalDepartments(
        departments.length
      );


      /* ================================================
         PAYROLL DATA
      ================================================= */

      const payroll =
        payrollRes.data.payroll || [];

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      setPayrollData(
        payroll.map((item) => ({
          month:
            `${monthNames[item.month - 1]} ${item.year}`,

          payrolls:
            item.payrollCount,
        }))
      );


      /* ================================================
         TOTAL EMPLOYEE DATA
      ================================================= */

      setTotalEmployees(
        employeeRes.data.employeeCount || 0
      );

    } catch (error) {
      console.error(
        "Dashboard data fetch error:",
        error
      );
    }
  };

  fetchDashboardData();
}, []);

  /* =======================================================
     ATTENDANCE TRACKER
  ======================================================= */

  const handleAttendanceTracker = async () => {
    try {
      const res = await api.get("/companies");

      const companies =
        res.data.companies || [];
      
      if (companies.length > 0) {
        navigate(
          `/${companies[0]._id}/company/attendance-tracker`
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await api.post(
        "/superadmin/logout",
        {},
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  /* =======================================================
     CLOSE SIDEBAR
  ======================================================= */

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div
      className={`
        min-h-screen
        transition-colors
        duration-300
        ${theme.page}
      `}
    >
      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="
            fixed
            inset-0
            bg-black/60
            backdrop-blur-sm
            z-40
            lg:hidden
          "
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed
          top-0
          left-0
          z-50
          h-screen
          w-[280px]
          border-r
          transform
          transition-transform
          duration-300
          ${theme.sidebar}
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:translate-x-0
        `}
      >
        {/* Sidebar Header */}

        <div
          className={`
            h-20
            px-5
            flex
            items-center
            justify-between
            border-b
            ${theme.border}
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-gradient-to-br
                from-indigo-500
                to-violet-600
                flex
                items-center
                justify-center
                shadow-lg
                shadow-indigo-500/20
              "
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>

            <div>
              <p
                className={`
                  font-bold
                  text-sm
                  ${theme.primaryText}
                `}
              >
                Admin Panel
              </p>

              <p
                className={`
                  text-[11px]
                  ${theme.subtleText}
                `}
              >
                HRMS Management
              </p>
            </div>
          </div>

          {/* Mobile Close */}

          <button
            onClick={closeSidebar}
            className="
              lg:hidden
              p-2
              rounded-lg
              hover:bg-slate-800
            "
          >
            <X
              className={`
                w-5
                h-5
                ${theme.mutedText}
              `}
            />
          </button>
        </div>

        {/* =================================================
            USER
        ================================================= */}

        {user && (
          <div
            className={`
              mx-4
              mt-5
              p-3
              rounded-xl
              border
              ${theme.userCard}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-indigo-500/15
                  flex
                  items-center
                  justify-center
                "
              >
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
              </div>

              <div className="min-w-0">
                <p
                  className={`
                    text-sm
                    font-semibold
                    truncate
                    ${theme.primaryText}
                  `}
                >
                  {user.name}
                </p>

                <p
                  className={`
                    text-[11px]
                    truncate
                    ${theme.mutedText}
                  `}
                >
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div
          className="
            px-3
            mt-6
            overflow-y-auto
            h-[calc(100vh-210px)]
            pb-24
          "
        >
          {/* MANAGEMENT */}

          <p
            className={`
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              px-3
              mb-3
              ${theme.subtleText}
            `}
          >
            Management
          </p>

          <div className="space-y-1">
            <SidebarAction
              icon={Building2}
              label="Create Company"
              description="Register new company"
              theme={theme}
              onClick={() => {
                navigate(
                  "/admin/create-company"
                );
                closeSidebar();
              }}
            />

            <SidebarAction
              icon={LayoutGrid}
              label="Create Department"
              description="Add new department"
              theme={theme}
              onClick={() => {
                navigate(
                  "/admin/create-department"
                );
                closeSidebar();
              }}
            />

            <SidebarAction 
              icon={BriefcaseBusiness} 
              label="Create Role" 
              description="Add new role" 
              theme={theme} 
              onClick={() => { 
                navigate(
                  "/admin/create-role"
                ); 
                closeSidebar(); 
              }} 
            />

            <SidebarAction
              icon={UserPlus}
              label="Create Employee"
              description="Add new employee"
              theme={theme}
              onClick={() => {
                navigate(
                  "/admin/create-employee"
                );
                closeSidebar();
              }}
            />

            <SidebarAction
              icon={ClipboardCheck}
              label="Attendance Tracker"
              description="Track employee attendance"
              theme={theme}
              onClick={() => {
                handleAttendanceTracker();
                closeSidebar();
              }}
            />

            <SidebarAction
              icon={CalendarClock}
              label="Pending Leaves"
              description="Manage leave requests"
              badge={pendingCount}
              theme={theme}
              onClick={() => {
                navigate(
                  "/admin/pending-leaves"
                );
                closeSidebar();
              }}
            />

            <SidebarAction
              icon={CalendarDays}
              label="Create Holiday"
              description="Manage holidays"
              theme={theme}
              onClick={() => {
                navigate(
                  "/admin/create-holiday"
                );
                closeSidebar();
              }}
            />
          </div>

          {/* PAYROLL */}

          <p
            className={`
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              px-3
              mb-3
              mt-7
              ${theme.subtleText}
            `}
          >
            Payroll
          </p>

          <div className="space-y-1">
            <SidebarAction
              icon={WalletCards}
              label="Create Employee Salary"
              description="Create salary structure"
              theme={theme}
              onClick={() => {
                navigate(
                  "/admin/create-employee-salary"
                );
                closeSidebar();
              }}
            />

            <SidebarAction
              icon={ClipboardCheck}
              label="Edit Employee Salary"
              description="Update salary structure"
              theme={theme}
              onClick={() => {
                navigate(
                  "/admin/edit-employee-salary"
                );
                closeSidebar();
              }}
            />

            <SidebarAction
              icon={WalletCards}
              label="Payroll Management"
              description="Generate & manage payroll"
              theme={theme}
              onClick={() => {
                navigate(
                  "/admin/payroll-management"
                );
                closeSidebar();
              }}
            />
          </div>

          {/* ADMINISTRATION */}

          <p
            className={`
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              px-3
              mb-3
              mt-7
              ${theme.subtleText}
            `}
          >
            Administration
          </p>

          <div className="space-y-1">
            <SidebarAction
              icon={Building2}
              label="Company Management"
              description="Manage registered companies"
              theme={theme}
              onClick={() => {
                navigate(
                  "/admin/company-management"
                );
                closeSidebar();
              }}
            />
          </div>
        </div>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div
          className={`
            absolute
            bottom-0
            left-0
            right-0
            p-4
            border-t
            ${theme.border}
            ${theme.sidebar}
          `}
        >
          <button
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-3
              rounded-xl
              text-slate-500
              hover:text-red-500
              hover:bg-red-500/5
              transition
            "
          >
            <LogOut className="w-4 h-4" />

            <span className="text-sm font-semibold">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main
        className={`
          lg:ml-[280px]
          min-h-screen
          transition-colors
          duration-300
          ${theme.main}
        `}
      >
        {/* =================================================
            MOBILE TOP BAR
        ================================================= */}

        <div
          className={`
            lg:hidden
            h-16
            border-b
            flex
            items-center
            justify-between
            px-4
            backdrop-blur-xl
            sticky
            top-0
            z-30
            ${theme.topbar}
          `}
        >
          <div className="flex items-center">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="
                p-2
                rounded-lg
                hover:bg-slate-800/50
              "
            >
              <Menu
                className={`
                  w-5
                  h-5
                  ${theme.secondaryText}
                `}
              />
            </button>

            <p
              className={`
                ml-3
                font-semibold
                ${theme.primaryText}
              `}
            >
              Admin Dashboard
            </p>
          </div>

          <ThemeSwitcher
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            theme={theme}
          />
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            max-w-[1500px]
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-8
          "
        >
          {/* =================================================
              DESKTOP HEADER
          ================================================= */}

          <div className="hidden lg:flex justify-end mb-5">
            <ThemeSwitcher
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
              theme={theme}
            />
          </div>

          {/* =================================================
              WELCOME
          ================================================= */}

          {user && (
            <motion.div
              initial={{
                opacity: 0,
                y: -15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-8"
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                  gap-4
                "
              >
                <div>
                  <p
                    className="
                      text-indigo-500
                      text-xs
                      font-bold
                      uppercase
                      tracking-widest
                      mb-2
                    "
                  >
                    Dashboard
                  </p>

<h1
  className={`
    text-3xl
    sm:text-4xl
    font-bold
    leading-tight
    tracking-tight
    break-words
    ${
      currentTheme === "light"
        ? "!text-slate-900"
        : "!text-zinc-100"
    }
  `}
>
  Welcome back,{" "}
  <span
    className="
      text-indigo-500
      break-words
    "
  >
    {user.name}
  </span>
</h1>

                  <p
                    className={`
                      text-sm
                      mt-2
                      ${theme.mutedText}
                    `}
                  >
                    Here's what's happening
                    across your organization.
                  </p>
                </div>

                {/* System Status */}

                <div
                  className={`
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    border
                    px-3
                    py-2
                    rounded-xl
                    w-fit
                    ${theme.border}
                    ${
                      theme.name === "Light"
                        ? "bg-white"
                        : "bg-slate-900/60"
                    }
                    ${theme.secondaryText}
                  `}
                >
                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-emerald-500
                      shadow
                      shadow-emerald-500/50
                    "
                  />

                  System Active
                </div>
              </div>
            </motion.div>
          )}

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-4
              gap-4
              mb-6
            "
          >
            <StatCard
              icon={Users}
              label="Total Employees"
              value={totalEmployees}
              description="Across all companies"
              iconBg="bg-indigo-600"
              theme={theme}
            />

            <StatCard
              icon={Building2}
              label="Total Companies"
              value={totalCompanies}
              description="Registered companies"
              iconBg="bg-violet-600"
              theme={theme}
            />

            <StatCard
              icon={BriefcaseBusiness}
              label="Total Departments"
              value={totalDepartments}
              description="Across all companies"
              iconBg="bg-cyan-600"
              theme={theme}
            />

            <StatCard
              icon={CalendarClock}
              label="Pending Leaves"
              value={pendingCount}
              description="Waiting for approval"
              iconBg="bg-amber-600"
              theme={theme}
            />
          </div>

          {/* =================================================
              CHART ROW 1
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-5
              gap-6
              mb-6
            "
          >
            {/* COMPANY EMPLOYEE */}

            <ChartCard
              title="Employees by Company"
              description="Employee distribution across all companies"
              icon={Building2}
              className="xl:col-span-3"
              theme={theme}
            >
              <div className="h-[340px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={companyEmployeeData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -15,
                      bottom: 55,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.chartGrid}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="company"
                      tick={{
                        fill: theme.chartText,
                        fontSize: 10,
                      }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                    />

                    <YAxis
                      tick={{
                        fill: theme.chartText,
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill:
                          currentTheme ===
                          "light"
                            ? "rgba(99,102,241,0.06)"
                            : "rgba(99,102,241,0.12)",
                      }}
                      content={
                        <EmployeeTooltip
                          theme={theme}
                        />
                      }
                    />

                    <Bar
                      dataKey="employees"
                      name="Employees"
                      fill="#6366f1"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* LEAVE STATUS */}

            <ChartCard
              title="Leave Overview"
              description="Pending, approved and rejected leaves"
              icon={CalendarClock}
              className="xl:col-span-2"
              theme={theme}
            >
              <div className="h-[340px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <RechartsPieChart>
                    <Pie
                      data={leaveData}
                      cx="50%"
                      cy="45%"
                      innerRadius={72}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {leaveData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              LEAVE_COLORS[
                                index
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background:
                          theme.tooltip,
                        border:
                          currentTheme ===
                          "light"
                            ? "1px solid #e2e8f0"
                            : "1px solid #334155",
                        borderRadius: "12px",
                        color:
                          currentTheme ===
                          "light"
                            ? "#0f172a"
                            : "#ffffff",
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value) => (
                        <span
                          className={`
                            text-xs
                            font-medium
                            ${theme.secondaryText}
                          `}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* =================================================
              CHART ROW 2
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-2
              gap-6
            "
          >
            {/* DEPARTMENT EMPLOYEE */}

            <ChartCard
              title="Employees by Department"
              description="Employee count across company departments"
              icon={LayoutGrid}
              theme={theme}
            >
              <div className="h-[430px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={departmentEmployeeData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 20,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.chartGrid}
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      tick={{
                        fill: theme.chartText,
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      type="category"
                      dataKey="department"
                      width={135}
                      tick={{
                        fill: theme.chartText,
                        fontSize: 10,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background:
                          theme.tooltip,
                        border:
                          currentTheme ===
                          "light"
                            ? "1px solid #e2e8f0"
                            : "1px solid #334155",
                        borderRadius: "12px",
                        color:
                          currentTheme ===
                          "light"
                            ? "#0f172a"
                            : "#ffffff",
                      }}
                    />

                    <Bar
                      dataKey="employees"
                      name="Employees"
                      fill="#06b6d4"
                      radius={[
                        0,
                        6,
                        6,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* PAYROLL */}

            <ChartCard
              title="Payroll Generation"
              description="Number of payrolls generated each month"
              icon={WalletCards}
              theme={theme}
            >
              <div className="h-[430px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={payrollData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.chartGrid}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: theme.chartText,
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tick={{
                        fill: theme.chartText,
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background:
                          theme.tooltip,
                        border:
                          currentTheme ===
                          "light"
                            ? "1px solid #e2e8f0"
                            : "1px solid #334155",
                        borderRadius: "12px",
                        color:
                          currentTheme ===
                          "light"
                            ? "#0f172a"
                            : "#ffffff",
                      }}
                    />

                    <Bar
                      dataKey="payrolls"
                      name="Payrolls Generated"
                      fill="#ec4899"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="text-center py-6">
            <p
              className={`
                text-[11px]
                ${theme.subtleText}
              `}
            >
              HRMS Admin Dashboard
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;