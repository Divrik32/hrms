import { useEffect, useState } from "react";
import api from "../services/axios";
import { BriefcaseBusiness, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const CreateRole = () => {
  const [roleName, setRoleName] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(false);

  const fetchRoles = async () => {
    try {
      setFetchingRoles(true);

      const res = await api.get("/roles", {
        withCredentials: true,
      });

      setRoles(res.data.roles || []);
    } catch (error) {
      console.error("Fetch roles error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch roles"
      );
    } finally {
      setFetchingRoles(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      toast.error("Please enter role name");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/roles",
        {
          roleName: roleName.trim(),
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Role created successfully");

      setRoleName("");

      fetchRoles();
    } catch (error) {
      console.error("Create role error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to create role"
      );
    } finally {
      setLoading(false);
    }
  };

const handleDeleteRole = async (id) => {
  const role = roles.find((role) => role._id === id);

  const confirmed = window.confirm(
    `Are you sure you want to delete "${role?.roleName || "this"}" role?`
  );

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/roles/${id}`, {
      withCredentials: true,
    });

    setRoles((prev) =>
      prev.filter((role) => role._id !== id)
    );

    toast.success("Role deleted successfully");
  } catch (error) {
    console.error("Delete role error:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to delete role"
    );
  }
};

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <BriefcaseBusiness className="w-5 h-5 !text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold !text-white">
                Create Role
              </h1>

              <p className="text-sm text-slate-300 mt-1">
                Create and manage employee roles
              </p>
            </div>
          </div>
        </motion.div>

        {/* Create Role */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className="bg-slate-800 border border-slate-600 rounded-2xl shadow-xl shadow-black/30 p-5 sm:p-6 mb-6"
        >
          <h2 className="text-lg font-semibold !text-white mb-1">
            Add New Role
          </h2>

          <p className="text-sm text-slate-300 mb-5">
            Enter a role name such as Vice President, Project Manager,
            HR Manager, etc.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
              className="
                flex-1
                px-4
                py-3
                rounded-xl
                border
                border-slate-600
                bg-slate-900
                !text-white
                placeholder:text-slate-400
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/30
              "
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-gradient-to-br
                from-indigo-500
                to-indigo-700
                hover:from-indigo-400
                hover:to-indigo-600
                !text-white
                font-semibold
                shadow-lg
                shadow-indigo-950/50
                transition
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              <Plus className="w-4 h-4" />

              {loading ? "Creating..." : "Create Role"}
            </motion.button>
          </form>
        </motion.div>

        {/* Existing Roles */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="bg-slate-800 border border-slate-600 rounded-2xl shadow-xl shadow-black/30 p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold !text-white">
                Existing Roles
              </h2>

              <p className="text-sm text-slate-300 mt-1">
                {roles.length} role{roles.length !== 1 ? "s" : ""}
                {" "}available
              </p>
            </div>

            <motion.button
              onClick={fetchRoles}
              disabled={fetchingRoles}
              whileHover={{ scale: fetchingRoles ? 1 : 1.05 }}
              whileTap={{ scale: fetchingRoles ? 1 : 0.95 }}
              className="
                p-2.5
                rounded-lg
                border
                border-slate-600
                text-slate-300
                hover:bg-slate-800/60
                hover:!text-white
                transition
                disabled:opacity-50
              "
              title="Refresh roles"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  fetchingRoles ? "animate-spin" : ""
                }`}
              />
            </motion.button>
          </div>

          {fetchingRoles ? (
            <div className="py-10 text-center text-sm text-slate-200">
              Loading roles...
            </div>
          ) : roles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="py-10 text-center"
            >
              <BriefcaseBusiness className="w-8 h-8 mx-auto text-slate-400 mb-2" />

              <p className="text-sm font-medium text-slate-200">
                No roles created yet
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Create your first role above.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence initial={false}>
                {roles.map((role, index) => (
<motion.div
  key={role._id}
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.25, delay: index * 0.03 }}
  className="
    flex 
    items-center 
    gap-3 
    p-4 
    rounded-xl 
    border 
    border-slate-600 
    bg-slate-900 
    hover:border-indigo-600/50 
    transition
  "
>
  <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
    <BriefcaseBusiness className="w-4 h-4 text-indigo-400" />
  </div>

  <p className="text-sm font-semibold !text-white flex-1 truncate">
    {role.roleName}
  </p>

  <button
    type="button"
    onClick={() => handleDeleteRole(role._id)}
    title="Delete role"
    className="
      shrink-0
      p-1.5
      rounded-md
      text-slate-500
      hover:text-red-400
      hover:bg-red-500/10
      transition-colors
    "
  >
    <Trash2 className="w-4 h-4" />
  </button>
</motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default CreateRole;