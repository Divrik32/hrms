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
      }
      // {
      //   path: "create-payroll",
      //   element: <CreatePayroll />
      // }
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
    element: <EmployeeLayout />,
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
      {
        path: "my-rejected-leaves",
        element: <MyRejectedLeaves/>,
      },
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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;