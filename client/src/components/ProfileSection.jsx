import { useEffect, useState } from "react";
import api from "../services/axios";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, MapPin, Globe, Users,
  CalendarDays, Layers, ExternalLink,
  AlertCircle, Briefcase, Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../services/axios";



const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] } },
});

const ProfileSection = () => {
  const { companyId } = useParams();
  console.log(companyId);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getCompany(); }, [companyId]);

  const getCompany = async () => {
    try {
      const res = await api.get(`/companies/${companyId}`);
      setCompany(res.data.company);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#07070e] flex flex-col items-center justify-center gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-fuchsia-500/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-fuchsia-400 animate-spin" />
      </div>
      <p className="text-slate-500 text-xs tracking-[0.25em] uppercase">Loading…</p>
    </div>
  );

  if (!company) return (
    <div className="min-h-screen bg-[#07070e] flex flex-col items-center justify-center gap-3">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-white font-semibold text-lg">Company not found</p>
      <p className="text-slate-500 text-sm">This profile doesn't exist or was removed.</p>
    </div>
  );

  const logoSrc = company.logo
    ? `${BACKEND_URL}/uploads/${company.logo}`
    : `https://placehold.co/80x80/2d1160/a78bfa?text=${encodeURIComponent((company.companyName || "C")[0])}`;

  return (
    <div className="min-h-screen bg-[#07070e] text-white">

      {/* ── HERO — slim height ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e0d60] via-[#1a0840] to-[#07070e]" />
        {/* subtle dot pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="d" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#d)" />
        </svg>

        {/* content — compact py */}
        <div className="relative max-w-2xl mx-auto px-6 py-8 flex items-center gap-5">
          {/* logo */}
          <motion.div {...fadeIn(0)} className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/15 shadow-xl shadow-black/50">
              <img src={logoSrc} alt={company.companyName} className="w-full h-full object-cover" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#07070e]" />
          </motion.div>

          {/* name + tags */}
          <div className="flex-1 min-w-0">
            <motion.h1
              {...fadeIn(0.06)}
              className="text-2xl sm:text-3xl font-extrabold !bg-gradient-to-r !from-[#2563EB] !via-[#3B82F6] !to-[#60A5FA] bg-clip-text !text-transparent leading-tight truncate"
            >
              {company.companyName}
            </motion.h1>

            <motion.div {...fadeIn(0.12)} className="flex flex-wrap gap-2 mt-2">
              {company.industry && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/25">
                  <Briefcase className="w-3 h-3" /> {company.industry}
                </span>
              )}
              {company.totalEmployees && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-300 border border-white/10">
                  <Users className="w-3 h-3" /> {company.totalEmployees} employees
                </span>
              )}
              {company.createdAt && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-300 border border-white/10">
                  <CalendarDays className="w-3 h-3" />
                  Since {new Date(company.createdAt).getFullYear()}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── DETAILS ── */}
      <div className="max-w-2xl mx-auto px-5 pt-5 pb-16 space-y-3">

        <motion.div {...fadeIn(0.18)}
          className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.06]"
        >
          <SectionHeader label="Contact" />
          <DetailRow icon={<Mail className="w-4 h-4" />}   label="Email"   value={company.email} />
          <DetailRow icon={<Phone className="w-4 h-4" />}  label="Phone"   value={company.phone} />
          <DetailRow icon={<MapPin className="w-4 h-4" />} label="Address" value={company.address} />
        </motion.div>

        <motion.div {...fadeIn(0.24)}
          className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.06]"
        >
          <SectionHeader label="Company Info" />
          <DetailRow icon={<Building2 className="w-4 h-4" />}   label="Company Name"    value={company.companyName} />
          <DetailRow icon={<Layers className="w-4 h-4" />}       label="Industry"        value={company.industry} />
          <DetailRow icon={<Users className="w-4 h-4" />}        label="Total Employees" value={company.totalEmployees} />
          <DetailRow icon={<CalendarDays className="w-4 h-4" />} label="Created At"
            value={company.createdAt ? new Date(company.createdAt).toLocaleDateString("en-IN") : null}
          />
        </motion.div>

        <motion.div {...fadeIn(0.30)}
          className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.06]"
        >
          <SectionHeader label="Online" />
          <div className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-xl bg-white/[0.06] text-slate-400"><Globe className="w-4 h-4" /></span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Website</span>
            </div>
            {company.website ? (
              <a href={company.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-fuchsia-400 hover:text-fuchsia-300 text-sm font-semibold transition-colors">
                Visit site <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-slate-600 text-sm">N/A</span>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

const SectionHeader = ({ label }) => (
  <div className="px-5 py-2.5 bg-white/[0.025]">
    <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-slate-500">{label}</p>
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors gap-4">
    <div className="flex items-center gap-3 shrink-0">
      <span className="p-1.5 rounded-xl bg-white/[0.06] text-slate-400">{icon}</span>
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-white text-sm font-semibold text-right break-all">
      {value || <span className="text-slate-600 font-normal">N/A</span>}
    </span>
  </div>
);

export default ProfileSection;