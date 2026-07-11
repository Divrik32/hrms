import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/axios";
import {
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Type,
  CalendarClock,
  AlignLeft,
  Sparkles,
} from "lucide-react";

const CreateHoliday = () => {
  const [holidayName, setHolidayName] =
    useState("");

  const [holidayDate, setHolidayDate] =
    useState("");

  const [description, setDescription] =
    useState("");

const [loading, setLoading] =
  useState(false);

const [toast, setToast] = useState({
  type: "",
  message: "",
});

    const Toast = ({
  type,
  message,
  onClose,
}) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{
          opacity: 0,
          y: -24,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: -16,
          scale: 0.95,
        }}
        className={`fixed top-5 right-5 left-5 sm:left-auto z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium sm:max-w-sm backdrop-blur-md ${
          type === "success"
            ? "bg-emerald-950/90 border-emerald-700 text-emerald-300"
            : "bg-red-950/90 border-red-700 text-red-300"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 size={18} className="shrink-0" />
        ) : (
          <XCircle size={18} className="shrink-0" />
        )}

        <span className="flex-1">{message}</span>

        <button
          onClick={onClose}
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

const showToast = (type, message) => {
  setToast({ type, message });

  setTimeout(() => {
    setToast({
      type: "",
      message: "",
    });
  }, 4000);
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } =
        await api.post(
          "/superadmin/create-holiday",
          {
            holidayName,
            holidayDate,
            description,
          },
          {
            withCredentials: true,
          }
        );

      showToast('success',data.message);

      setHolidayName("");
      setHolidayDate("");
      setDescription("");
    } catch (error) {
      console.log(error);

      showToast('error',
        error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden px-4 py-10 sm:p-8 md:p-12 flex items-center justify-center">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#de5e08]/10 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#640361]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#ff0000]/10 blur-3xl" />
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() =>
          setToast({
            type: "",
            message: "",
          })
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/40 p-6 sm:p-10">

          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            <div className="shrink-0 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700">
              <CalendarDays
                className="text-indigo-400"
                size={26}
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold !bg-gradient-to-r !from-[#de5e08] !via-[#640361] !to-[#ff0000] bg-clip-text !text-blue-400  leading-tight">
                Create Holiday
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 flex items-center gap-1.5">
                <Sparkles size={13} className="text-slate-600" />
                Add a new holiday to the company calendar
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 sm:space-y-6"
          >

            {/* Holiday Name */}
            <div>
              <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm font-medium">
                <Type size={15} className="text-slate-500" />
                Holiday Name
              </label>

              <input
                type="text"
                value={holidayName}
                onChange={(e) =>
                  setHolidayName(
                    e.target.value
                  )
                }
                required
                placeholder="Enter holiday name"
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 hover:border-slate-600"
              />
            </div>

            {/* Holiday Date */}
            <div>
              <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm font-medium">
                <CalendarClock size={15} className="text-slate-500" />
                Holiday Date
              </label>

              <input
                type="date"
                value={holidayDate}
                onChange={(e) =>
                  setHolidayDate(
                    e.target.value
                  )
                }
                required
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 hover:border-slate-600 [color-scheme:dark]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm font-medium">
                <AlignLeft size={15} className="text-slate-500" />
                Description
              </label>

              <textarea
                rows="4"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Optional description..."
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 hover:border-slate-600 resize-none"
              />
            </div>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-xl py-3.5 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-950/40"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="block w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full"
                />
              ) : (
                <PlusCircle size={18} />
              )}

              {loading
                ? "Creating..."
                : "Create Holiday"}
            </motion.button>

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateHoliday;