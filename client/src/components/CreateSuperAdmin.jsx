import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Mail, Lock, Upload, ShieldCheck, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";


const CreateSuperAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profilePic: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setPreview(URL.createObjectURL(files[0]));
    }
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const superAdminData = new FormData();
      Object.keys(formData).forEach((key) => {
        superAdminData.append(key, formData[key]);
      });
      const res = await axios.post(
        "http://localhost:5000/api/superadmin/register",
        superAdminData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res.data.message);
      setFormData({ name: "", email: "", password: "", profilePic: null });
      setPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Super Admin creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/30"
          >
            <ShieldCheck className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Super Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Set up a new privileged administrator account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Profile Pic Upload */}
            <div className="flex flex-col items-center mb-2">
              <label htmlFor="profilePicInput" className="cursor-pointer group">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-indigo-500/60 hover:border-indigo-400 transition-colors bg-slate-700/50 flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      <span className="text-[10px] text-slate-500">Photo</span>
                    </div>
                  )}
                  {preview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <input
                  id="profilePicInput"
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-500 mt-2">Profile Picture</span>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/60 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/60 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/60 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {loading ? "Creating..." : "Create Super Admin"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateSuperAdmin;