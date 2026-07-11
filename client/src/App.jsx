import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateCompany from "./components/CreateCompany";
import CreateDepartment from "./components/CreateDepartment";
import SuperAdminLogin from "./components/SuperAdminLogin";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import CreateSuperAdmin from "./components/CreateSuperAdmin";
import CreateEmployee from "./components/CreateEmployee";
import EmployeeLogin from "./components/EmployeeLogin";
import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeeDashboard from "./components/EmployeeDashboard";
import ProtectedRoute from "./protected/ProtectedRoute";
import CompanyDashboardLayout from "./layouts/CompanyDashboardLayout";
import EmployeeSection from "./components/EmployeeSection";
import AttendanceTracker from "./components/AttendanceTracker";
import ProfileSection from "./components/ProfileSection";
import ApplyLeaveRequest from "./components/ApplyLeaveRequest";
import AdminLayout from "./layouts/AdminLayout";
import PendingLeaves from "./components/PendingLeaves";
import MyLeaves from "./components/MyLeaves";
import MyRejectedLeaves from "./components/MyRejectedLeaves";
import EmployeeProfile from "./components/EmployeeProfile";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import CreateEmployeeSalary from "./components/CreateEmployeeSalary";
import EditEmployeeSalary from "./components/EditEmployeeSalary";
import LandingPage from "./components/LandingPage";
import ForgotSuperAdmin from "./components/ForgotSuperAdmin";
import ResetSuperAdmin from "./components/ResetSuperAdmin";
import AdminEmployeeProfile from "./components/AdminEmployeeProfile";
import AdminEmployeeLeaves from "./components/AdminEmployeeLeaves";
import AdminRejectedLeaves from "./components/AdminRejectedLeaves";
import CreateHoliday from "./components/CreateHoliday";
import ApprovedLeaves from "./components/ApprovedLeaves";
import RejectedLeaves from "./components/RejectedLeaves";
import EmployeeProtectedRoute from "./protected/EmployeeProtectedRoute";
import MarkAbsent from "./components/MarkAbsent";
import AbsentReport from "./components/AbsentReport";
import PayrollManagement from "./components/PayrollManagement";
import GeneratePayroll from "./components/GeneratePayroll";
import CompanyManagement from "./components/CompanyManagement";
import EditCompany from "./components/EditCompany";
import AllPayrolls from "./components/AllPayrolls";
import UpdatePayroll from "./components/UpdatePayroll";
// import EditCompany from "./components/EditCompany";


const router = createBrowserRouter([
  // landing page
  {
    path: "/",
    element: <LandingPage />,
  },
  // create super admin
  {
    path: "/create-super-admin",
    element: <CreateSuperAdmin />,
  },

// admin login
  {
    path: "/admin-login",
    element: <SuperAdminLogin />,
  },
  {
    path:"/superadmin/forgot-password",
    element: <ForgotSuperAdmin />
  },
  {
    path:"/superadmin/reset-password",
    element: <ResetSuperAdmin/>
  },

  // admin protected routes
  {
    path: "/admin",
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      {
        path: "dashboard",
        element: <SuperAdminDashboard />,
      },
      {
        path: "create-company",
        element: <CreateCompany />,
      },
      {
        path: "create-department",
        element: <CreateDepartment />,
      },
      {
        path: "create-employee",
        element: <CreateEmployee />,
      },
      {
        path: "pending-leaves",
        element: <PendingLeaves />,
      },
      {
        path: "create-employee-salary",
        element: <CreateEmployeeSalary />
      },
      {
        path: "edit-employee-salary",
        element: <EditEmployeeSalary />
      },
      {
        path: "create-holiday",
        element: <CreateHoliday />,
      },
      {
        path: "payroll-management",
        element: <PayrollManagement />
      },
      {
        path: "generate-payroll",
        element: <GeneratePayroll />,
      },
   // {
   //   path: "employee-payroll",
   //   element: <EmployeePayroll />,
   // },
   {
     path: "all-payrolls",
     element: <AllPayrolls />,
   },
   {
     path: "update-payroll/:payrollId",
     element: <UpdatePayroll />,
   },
   // {
   //   path: "delete-payroll",
   //   element: <DeletePayroll />,
   // },
      {
        path: "company-management",
        element: <CompanyManagement />,
      },
      {
        path: "edit-company/:companyId",
        element: <EditCompany />,
      },
    ],
  },

// employee login
  {
    path: "/employee-login",
    element: <EmployeeLogin/>,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword/>,
  },
  {
    path: "/reset-password",
    element: <ResetPassword/>,
  },

// employee protected routes
  {
    path: "/employee",
    element: <EmployeeProtectedRoute><EmployeeLayout /></EmployeeProtectedRoute>,
    children: [
      {
        path: "dashboard",
        element: <EmployeeDashboard />,
      },
      {
        path: "profile",
        element: <EmployeeProfile />,
      },
      {
        path: "apply-leave-request",
        element: <ApplyLeaveRequest/>,
      },
      {
        path: "my-leaves",
        element: <MyLeaves/>,
      },
      // {
      //   path: "my-rejected-leaves",
      //   element: <MyRejectedLeaves/>,
      // },
    ],
  },

  // company routes
  {
    path: "/:companyId/company",
    element: <CompanyDashboardLayout />,
    children: [
      {
        path: "dashboard",
        element: <EmployeeSection />,
      },
      {
        path: "attendance-tracker",
        element: <AttendanceTracker />,
      },
      {
        path: "profile-section",
        element: <ProfileSection />,
      },
      {
        path: "dashboard/:empId",
        element: <AdminEmployeeProfile />,
      },
      {
        path: "leaves/:empId",
        element: <ApprovedLeaves />,
      },
      {
        path: "rejected-leaves/:empId",
        element: <RejectedLeaves/>,
      },
      {
        path: "mark-absent",
        element: <MarkAbsent />,
      },
      {
        path: "absent-report",
        element: <AbsentReport />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;