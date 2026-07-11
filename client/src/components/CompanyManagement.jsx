import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api, { BACKEND_URL } from "../services/axios";
import toast from "react-hot-toast";

import {
  Building2,
  Search,
  Pencil,
  Plus,
  Loader2,
  Mail,
  Phone,
  Globe,
  Factory,
  Hash,
  FileBadge2,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function CompanyManagement() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/companies");

      if (data.success) {
        setCompanies(data.companies);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load companies."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    const keyword = search.toLowerCase();

    return companies.filter(
      (company) =>
        company.companyName?.toLowerCase().includes(keyword) ||
        company.email?.toLowerCase().includes(keyword) ||
        company.phone?.toLowerCase().includes(keyword) ||
        company.industry?.toLowerCase().includes(keyword)
    );
  }, [companies, search]);

  return (
    <div className="min-h-screen bg-[#0A0C10] p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#ffff00]/30 bg-[#ffff00]/10 text-[#ffff00]">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#ffff00]/70">
                Company Registry
              </p>
              <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight !text-white sm:text-3xl">
                Company Management
              </h1>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/admin/create-company")}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#ffff00] px-5 py-3 font-semibold !text-[#181405] shadow-lg shadow-[#ffff00]/20 transition hover:bg-[#DBB438]"
          >
            <Plus size={18} />
            Create Company
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-8"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#242938] bg-[#11141B] py-3 pl-11 pr-4 text-sm !text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-[#ffff00]/60 focus:ring-2 focus:ring-[#ffff00]/15"
          />
        </motion.div>

        {/* Company List */}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-[#ffff00]" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="rounded-2xl border border-[#242938] bg-[#11141B] p-16 text-center">
            <Building2 className="mx-auto mb-5 h-14 w-14 text-slate-700" />

            <h3 className="text-xl font-semibold !text-slate-200">
              No Companies Found
            </h3>

            <p className="mt-2 text-slate-500">
              Create your first company to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <AnimatePresence>
              {filteredCompanies.map((company, i) => {
                const isActive = company.status === "active";

                return (
                  <motion.div
                    key={company._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -3 }}
                    className="overflow-hidden rounded-2xl border border-[#242938] bg-[#11141B] shadow-xl shadow-black/40"
                  >
                    <div className="flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center">
                      <div className="flex items-start gap-5">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#242938] bg-[#0D1017]">
                          {company.logo ? (
                            <img
                              src={`${BACKEND_URL}/uploads/${company.logo}`}
                              alt={company.companyName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Building2 className="text-slate-600" size={34} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <button
                            onClick={() =>
                              navigate(`/admin/edit-company/${company._id}`)
                            }
                            className="text-left font-serif text-xl font-semibold !text-white hover:text-[#ffff00] hover:underline"
                          >
                            {company.companyName}
                          </button>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full border border-[#ffff00]/25 bg-[#ffff00]/10 px-3 py-1 text-xs font-medium text-[#ffff00]">
                              <Factory size={11} />
                              {company.companyType}
                            </span>

                            <span
                              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                                isActive
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {isActive ? (
                                <CheckCircle2 size={11} />
                              ) : (
                                <XCircle size={11} />
                              )}
                              {company.status}
                            </span>
                          </div>

                          <div className="mt-4 space-y-1.5 text-sm text-slate-400">
                            <p className="flex items-center gap-2">
                              <Mail size={13} className="text-[#ffff00]/70" />
                              {company.email}
                            </p>

                            <p className="flex items-center gap-2">
                              <Phone size={13} className="text-[#ffff00]/70" />
                              {company.phone}
                            </p>

                            <p className="flex items-center gap-2">
                              <Globe size={13} className="text-[#ffff00]/70" />
                              {company.website || "-"}
                            </p>

                            <p className="flex items-center gap-2">
                              <Factory size={13} className="text-[#ffff00]/70" />
                              {company.industry || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() =>
                            navigate(`/admin/edit-company/${company._id}`)
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#242938] bg-[#181C26] px-5 py-3 font-semibold !text-slate-200 transition hover:border-[#ffff00]/50 hover:!text-[#ffff00] md:w-auto"
                        >
                          <Pencil size={16} />
                          Edit Company
                        </motion.button>
                      </div>
                    </div>

                    <div className="border-t border-[#242938] bg-[#0D1017] px-6 py-4 text-sm text-slate-400">
                      <div className="grid gap-2 md:grid-cols-2">
                        <p className="flex items-center gap-2 font-mono tracking-wide">
                          <Hash size={13} className="text-[#ffff00]/70" />
                          {company.gstNumber || "-"}
                        </p>

                        <p className="flex items-center gap-2 font-mono tracking-wide">
                          <FileBadge2 size={13} className="text-[#ffff00]/70" />
                          {company.panNumber || "-"}
                        </p>

                        <p className="flex items-center gap-2 md:col-span-2">
                          <MapPin size={13} className="shrink-0 text-[#ffff00]/70" />
                          {company.address}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}