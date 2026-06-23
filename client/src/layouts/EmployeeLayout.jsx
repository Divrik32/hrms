import {
  Navigate,
  Outlet,
} from "react-router-dom";
import EmployeeNavbar from "../shared/EmployeeNavbar";
import { useState } from "react";
import EmployeeSidebar from "../shared/EmployeeSidebar";


const EmployeeLayout = () => {
  const employee =
    JSON.parse(
      localStorage.getItem(
        "employee"
      )
    );
      const [sidebarOpen, setSidebarOpen] =
    useState(false);

  if (!employee) {
    return (
      <Navigate
        to="/employee-login"
        replace
      />
    );
  }

  return (
    <div
      className="
      min-h-screen
      bg-slate-950
    "
    >
    <EmployeeNavbar
      employee={employee}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
    <EmployeeSidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
    <Outlet 
      context={{
      sidebarOpen,
      setSidebarOpen,
    }}/>
    </div>
  );
};

export default EmployeeLayout;