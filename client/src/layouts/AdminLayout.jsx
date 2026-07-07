import {
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import api from "../services/axios";
import SuperAdminNavbar from "../shared/SuperAdminNavbar";
import SuperAdminProfileModal from "../components/SuperAdminProfileModal";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
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
        onProfileClick={() => setProfileOpen(true)}
      />

      <Outlet />
      <SuperAdminProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
          setUser={setUser}
      />
    </div>
  );
};

export default AdminLayout;