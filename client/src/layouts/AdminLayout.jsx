import {
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

import api from "../services/axios";
import SuperAdminNavbar from "../shared/SuperAdminNavbar";

const AdminLayout = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

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

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <SuperAdminNavbar
        user={user}
        handleLogout={handleLogout}
      />

      <Outlet />
    </div>
  );
};

export default AdminLayout;