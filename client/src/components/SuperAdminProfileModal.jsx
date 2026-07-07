import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Pencil,
  Camera,
  X,
  Mail,
  ShieldCheck,
  User,
  Check,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import api, { BACKEND_URL } from "../services/axios";
import toast from "react-hot-toast";

const fieldCardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

const AURORA =
  "conic-gradient(from 0deg,#4ade80,#10b981,#2dd4bf,#84cc16,#4ade80)";

const SuperAdminProfileModal = ({
  open,
  onClose,
  user,
  setUser,
}) => {
  const [editingField, setEditingField] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
    });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);
const handleSaveName = async () => {
  try {
    const { data } = await api.put(
      "/superadmin/profile",
      {
        name: formData.name,
      },
      {
        withCredentials: true,
      }
    );

    if (data.success) {

      setUser(data.superAdmin);

      localStorage.setItem(
        "user",
        JSON.stringify(data.superAdmin)
      );

      setEditingField("");

      toast.success("Name updated successfully");
    }

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Something went wrong"
    );

  }
};
const handleSaveEmail = async () => {
  try {

    const { data } = await api.put(
      "/superadmin/profile",
      {
        email: formData.email,
      },
      {
        withCredentials: true,
      }
    );

    if (data.success) {

      setUser(data.superAdmin);

      localStorage.setItem(
        "user",
        JSON.stringify(data.superAdmin)
      );

      setEditingField("");

      toast.success(
        "Email updated successfully"
      );
    }

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Something went wrong"
    );

  }
};
const handleSaveProfilePicture = async () => {
  if (!selectedImage) {
    return toast.error("Please select an image");
  }

  try {
    const formDataObj = new FormData();

    formDataObj.append(
      "profilePic",
      selectedImage
    );

    const { data } = await api.put(
      "/superadmin/profile",
      formDataObj,
      {
        withCredentials: true,
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    if (data.success) {

      setUser(data.superAdmin);

      localStorage.setItem(
        "user",
        JSON.stringify(data.superAdmin)
      );

      setSelectedImage(null);

      toast.success(
        "Profile picture updated"
      );
    }

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Something went wrong"
    );

  }
};
  return (
    <AnimatePresence>

      {open && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
        >

          {/* Entrance-transform wrapper — no rounding/overflow here (avoids corner clip glitch) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl"
          >

            {/* Rotating aurora border ring (static container — clips the spinning gradient) */}
            <div className="relative overflow-hidden rounded-[28px] p-[1.5px] shadow-[0_25px_90px_rgba(0,0,0,0.7)]">

              <div
                className="absolute -inset-[120%] animate-[spin_7s_linear_infinite]"
                style={{ background: AURORA }}
              />

              {/* Solid content shell — leaves only a thin gradient ring visible */}
              <div className="relative max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[26px] bg-[#07070d]">

                {/* Header banner */}

                <div className="relative h-28 overflow-hidden bg-gradient-to-r from-[#00cc66] via-[#00ff00] to-[#33ff00] sm:h-36">

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />

                  {/* Glint sweep */}
                  <motion.div
                    className="absolute inset-y-0 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    initial={{ x: "-120%" }}
                    animate={{ x: "320%" }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2.5,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Faint star flecks */}
                  <Sparkles
                    size={14}
                    className="absolute left-10 top-6 text-white/40"
                  />
                  <Sparkles
                    size={10}
                    className="absolute right-24 top-10 text-white/30"
                  />

                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur transition-colors hover:bg-black/50 sm:right-5 sm:top-5 sm:h-10 sm:w-10"
                  >
                    <X size={18} />
                  </button>

                </div>

                {/* Profile */}
<div className="relative z-20 -mt-12 px-5 pb-6 sm:-mt-16 sm:px-8 sm:pb-8">

  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                    {/* Avatar with spinning gradient ring */}

                    <div className="relative mx-auto h-24 w-24 shrink-0 sm:mx-0 sm:h-32 sm:w-32">

                      {/* Clipped circle zone — ring + photo only */}
                      <div className="absolute inset-0 overflow-hidden rounded-full">

                        <div
                          className="absolute inset-0 animate-[spin_5s_linear_infinite] rounded-full"
                          style={{ background: AURORA }}
                        />

                        <div className="absolute inset-[3px] rounded-full bg-[#07070d]" />

                        <img
                          src={
                            selectedImage
                              ? URL.createObjectURL(selectedImage)
                              : user?.profilePic
                              ? `${BACKEND_URL}/uploads/${user.profilePic}`
                              : "https://placehold.co/150"
                          }
                          alt={user?.name}
                          className="absolute inset-[3px] rounded-full object-cover"
                          style={{
                            width: "calc(100% - 6px)",
                            height: "calc(100% - 6px)",
                            borderRadius: "9999px",
                            objectFit: "cover",
                            objectPosition: "center",
                          }}
                        />

                      </div>

                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (e) => {

                          if (!e.target.files[0]) return;

                          const file = e.target.files[0];

                          setSelectedImage(file);

                          const formData = new FormData();

                          formData.append(
                            "profilePic",
                            file
                          );

                          try {

                            const { data } = await api.put(
                              "/superadmin/profile",
                              formData,
                              {
                                withCredentials: true,
                                headers: {
                                  "Content-Type":
                                    "multipart/form-data",
                                },
                              }
                            );

                            if (data.success) {

                              setUser(data.superAdmin);

                              localStorage.setItem(
                                "user",
                                JSON.stringify(data.superAdmin)
                              );

                              toast.success(
                                "Profile picture updated"
                              );

                            }

                          } catch (error) {

                            toast.error(
                              error.response?.data?.message ||
                              "Upload failed"
                            );

                            setSelectedImage(null);

                          }

                        }}
                      />

                      {/* Camera button lives OUTSIDE the clipped zone — never cut off */}
                      <label
                        htmlFor="profile-upload"
                        className="absolute bottom-0 right-0 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.7)] ring-2 ring-[#07070d] transition-colors hover:bg-indigo-500 sm:h-9 sm:w-9"
                      >
                        <Camera size={14} />
                      </label>

                    </div>

                    <div className="relative z-30 flex-1 text-center sm:pb-1 sm:text-left">

                      {editingField === "name" ? (
<input
  value={formData.name}
  onChange={(e) =>
    setFormData({
      ...formData,
      name: e.target.value,
    })
  }
  autoFocus
  className="
    relative z-30
    mt-2
    w-full
    rounded-xl
    border border-violet-500/50
    bg-[#07070d]
    px-3 py-2
    text-center sm:text-left
    text-white
    outline-none
    focus:ring-2
    focus:ring-violet-500/40
  "
/>
                      ) : (
<p className="mt-1 translate-y-1 bg-gradient-to-r from-violet-200 via-fuchsia-200 to-cyan-200 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-2xl pl-1.5">
  {user?.name}
</p>
                      )}

                      <span className="relative mt-2 inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                        <ShieldCheck size={13} className="text-violet-300" />
                        Super Administrator
                        <Sparkles size={11} className="text-fuchsia-300" />
                      </span>

                    </div>

                  </div>

                  {/* Details */}

                  <div className="mt-2 grid gap-4 sm:mt-4 sm:grid-cols-2 sm:gap-5">

                    {/* Name */}

                    <motion.div
                      custom={0}
                      variants={fieldCardVariants}
                      initial="hidden"
                      animate="show"
                      className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur transition-all hover:border-indigo-500/40 hover:shadow-[0_0_35px_rgba(99,102,241,0.12)]"
                    >

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/20">
                            <User size={16} className="text-indigo-400" />
                          </div>
                          <span className="text-sm text-slate-400">
                            Name
                          </span>
                        </div>

{!editingField && (
  <button
    onClick={() => setEditingField("name")}
    title="Edit Name"
    className="flex items-center justify-center
               w-7 h-7 rounded-lg
               bg-violet-500/15 active:bg-violet-500/28
               border border-violet-500/20
               text-violet-400
               transition-all duration-150"
  >
    <Pencil size={13} />
  </button>
)}

                      </div>

                      <AnimatePresence mode="wait">
                        {editingField === "name" ? (
                          <motion.div
                            key="edit"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <input
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              autoFocus
                              className="mt-3 w-full rounded-lg border border-indigo-500 bg-slate-950 px-3 py-2 text-white outline-none"
                            />

                            <div className="mt-3 flex gap-2">

                              <button
                                onClick={handleSaveName}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                              >
                                <Check size={15} />
                                Save
                              </button>

                              <button
                                onClick={() => {
                                  setEditingField("");

                                  setFormData({
                                    ...formData,
                                    name: user.name,
                                  });
                                }}
                                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                              >
                                Cancel
                              </button>

                            </div>
                          </motion.div>
                        ) : (
                          <motion.p
                            key="view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 truncate text-base font-semibold text-white sm:text-lg"
                          >
                            {user?.name}
                          </motion.p>
                        )}
                      </AnimatePresence>

                    </motion.div>

                    {/* Email */}

                    <motion.div
                      custom={1}
                      variants={fieldCardVariants}
                      initial="hidden"
                      animate="show"
                      className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur transition-all hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(34,211,238,0.12)]"
                    >

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
                            <Mail size={16} className="text-cyan-400" />
                          </div>
                          <span className="text-sm text-slate-400">
                            Email
                          </span>
                        </div>

{!editingField && (
  <button
    onClick={() => setEditingField("email")}
    title="Edit Email"
    className="flex items-center justify-center
               w-7 h-7 rounded-lg
               bg-violet-500/15 active:bg-violet-500/28
               border border-violet-500/20
               text-violet-400
               transition-all duration-150"
  >
    <Pencil size={13} />
  </button>
)}

                      </div>

                      <AnimatePresence mode="wait">
                        {editingField === "email" ? (
                          <motion.div
                            key="edit"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <input
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              autoFocus
                              className="mt-3 w-full rounded-lg border border-indigo-500 bg-slate-950 px-3 py-2 text-white outline-none"
                            />

                            <div className="mt-3 flex gap-2">

                              <button
                                onClick={handleSaveEmail}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                              >
                                <Check size={15} />
                                Save
                              </button>

                              <button
                                onClick={() => {
                                  setEditingField("");

                                  setFormData({
                                    ...formData,
                                    email: user.email,
                                  });
                                }}
                                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                              >
                                Cancel
                              </button>

                            </div>
                          </motion.div>
                        ) : (
                          <motion.p
                            key="view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 truncate text-base font-semibold text-white sm:text-lg"
                          >
                            {user?.email}
                          </motion.p>
                        )}
                      </AnimatePresence>

                    </motion.div>

                    {/* Role */}

                    <motion.div
                      custom={2}
                      variants={fieldCardVariants}
                      initial="hidden"
                      animate="show"
                      className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur transition-all hover:border-emerald-500/40 hover:shadow-[0_0_35px_rgba(16,185,129,0.12)]"
                    >

                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                          <ShieldCheck size={16} className="text-emerald-400" />
                        </div>
                        <span className="text-sm text-slate-400">
                          Role
                        </span>
                      </div>

                      <p className="mt-3 text-base font-semibold text-white sm:text-lg">
                        {user?.role}
                      </p>

                    </motion.div>

                    {/* Created */}

                    <motion.div
                      custom={3}
                      variants={fieldCardVariants}
                      initial="hidden"
                      animate="show"
                      className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur transition-all hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.12)]"
                    >

                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
                          <CalendarDays size={16} className="text-amber-400" />
                        </div>
                        <span className="text-sm text-slate-400">
                          Account Created
                        </span>
                      </div>

                      <p className="mt-3 text-base font-semibold text-white sm:text-lg">
                        {user?.createdAt &&
                          new Date(user.createdAt).toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                      </p>

                    </motion.div>

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>
  );
};

export default SuperAdminProfileModal;