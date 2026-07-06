import { Navigate } from "react-router-dom";

const EmployeeProtectedRoute = ({ children }) => {
  const employee = localStorage.getItem("employee");

  if (!employee) {
    return <Navigate to="/employee-login" replace />;
  }

  return children;
};

export default EmployeeProtectedRoute;