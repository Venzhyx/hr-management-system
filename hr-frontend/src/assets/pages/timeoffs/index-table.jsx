import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh,
  HiOutlineFilter, HiOutlineChevronDown,
  HiOutlineClock, HiOutlinePaperClip, HiOutlineEye,
  HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX,
  HiOutlineChevronDown as HiChevronDown,
} from "react-icons/hi";
import { useTimeOff } from "../../../redux/hooks/useTimeOff";
import { useEmployee } from "../../../redux/hooks/useEmployee";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_CFG = {
  SUBMITTED: { cls: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400",   label: "Submitted"  },
  APPROVED:  { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Approved" },
  REJECTED:  { cls: "bg-red-50 text-red-700 border border-red-200",             dot: "bg-red-400",     label: "Rejected" },
};

/* ── Toast ── */
const Toast = ({ message, type = "success", onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-fade-in
    ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
      ${type === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
      {type === "success"
        ? <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-600" />
        : <HiOutlineX className="w-3.5 h-3.5 text-red-600" />}
    </span>
    {message}
    <button onClick={onClose} className="ml-1 p-0.5 hover:opacity-60">
      <HiOutlineX className="w-3.5 h-3.5" />
    </button>
  </div>
);

const ALL_STATUSES = ["SUBMITTED", "APPROVED", "REJECTED"];

const StatCard = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs text-gray-400 font-medium">{label}</p>
    <p className="text-3xl font-bold text-gray-800">{value ?? 0}</p>
  </div>
);

const FilterDropdown = ({ activeFilters, onChange, counts }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (status) => {
    if (activeFilters.includes(status)) {
      if (activeFilters.length === 1) return;
      onChange(activeFilters.filter((s) => s !== status));
    } else {
      onChange([...activeFilters, status]);
    }
  };

  const isAll = activeFilters.length === ALL_STATUSES.length;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
          !isAll ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}>
        <HiOutlineFilter className="w-4 h-4" />
        <span className="font-medium">All Status</span>
        <HiOutlineChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Status</span>
          </div>
          <div className="py-1.5">
            <button onClick={() => onChange(isAll ? ["SUBMITTED"] : [...ALL_STATUSES])}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 mb-1">
              <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${isAll ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                {isAll && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </span>
              <span className="text-sm text-gray-700 font-medium">All</span>
              <span className="ml-auto text-xs text-gray-400">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
            </button>
            {ALL_STATUSES.map((status) => {
              const cfg     = STATUS_CFG[status];
              const checked = activeFilters.includes(status);
              const isLast  = activeFilters.length === 1 && checked;
              return (
                <button key={status} onClick={() => toggle(status)} disabled={isLast}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${isLast ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}>
                  <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${checked ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                    {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className="text-sm text-gray-700 font-medium">{cfg.label}</span>
                  <span className="ml-auto text-xs text-gray-400">{counts[status] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const TimeOffTablePage = () => {
  const navigate = useNavigate();
  const { timeOffRequests, fetchTimeOffRequests, deleteTimeOffRequest } = useTimeOff();
  const { employees, fetchEmployees } = useEmployee();

  const photoMap = React.useMemo(() => {
    const map = {};
    (employees || []).forEach(e => { map[e.id] = e.photo || null; });
    return map;
  }, [employees]);

  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [activeFilters, setActiveFilters] = useState([...ALL_STATUSES]);
  const [deletingId,    setDeletingId]    = useState(null);
  const [toast,         setToast]         = useState(null); // { message, type }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { await fetchTimeOffRequests(); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); fetchEmployees(); }, [load]);

  const stats = (timeOffRequests || []).reduce(
    (acc, r) => {
      acc.total++;
      if (r.status === "SUBMITTED") acc.pending++;
      if (r.status === "APPROVED")  acc.approved++;
      if (r.status === "REJECTED")  acc.rejected++;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );

  const counts = (timeOffRequests || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = (timeOffRequests || []).filter((r) => {
    if (!activeFilters.includes(r.status)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.employeeName?.toLowerCase().includes(q) ||
        r.timeOffTypeName?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus time off request dari ${name}?`)) return;
    setDeletingId(id);
    try {
      await deleteTimeOffRequest(id);
      await load();
      showToast("Time off request berhasil dihapus.");
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err?.message || "Gagal menghapus.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 py-6">

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Time Off Request</h1>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {stats.total}
          </span>
        </div>
        <button onClick={() => navigate("/time-off/add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
          <HiOutlinePlus className="w-4 h-4" />
          Add Time Off Request
        </button>
      </div>

      {/* Stat Cards */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
            <HiOutlineClock className="w-3 h-3 text-indigo-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Approval Status</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-gray-100">
          <StatCard label="Requested" value={stats.total}    />
          <div className="pl-6"><StatCard label="Approved"   value={stats.approved} /></div>
          <div className="pl-6"><StatCard label="Rejected"   value={stats.rejected} /></div>
          <div className="pl-6"><StatCard label="Pending"    value={stats.pending}  /></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Time Off Request"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <FilterDropdown activeFilters={activeFilters} onChange={setActiveFilters} counts={counts} />
        <div className="flex-1" />
        <button onClick={load} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-40" title="Refresh">
          <HiOutlineRefresh className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400 text-sm">Memuat data…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
          <HiOutlineClock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Tidak ada data time off request</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Employee", "Time Off Type", "Start Date & End Date", "Status", "Attachment", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                    <span className="flex items-center gap-1">{h} <HiChevronDown className="w-3 h-3 opacity-40" /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => {
                const sCfg = STATUS_CFG[r.status] || STATUS_CFG.SUBMITTED;

                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">

                    {/* Employee */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-gray-200">
                          {photoMap[r.employeeId] ? (
                            <img src={photoMap[r.employeeId]} alt={r.employeeName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-[10px]">
                              {r.employeeName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-800 whitespace-nowrap">{r.employeeName || "—"}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.timeOffTypeName || "—"}</td>

                    {/* Date range */}
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      <span>{fmtDate(r.startDate)}</span>
                      <span className="text-gray-300 mx-1.5 text-xs">→</span>
                      <span>{fmtDate(r.endDate)}</span>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sCfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                        {sCfg.label}
                      </span>
                    </td>

                    {/* Attachment */}
                    <td className="px-4 py-3">
                      {r.attachmentUrl ? (
                        <a href={r.attachmentUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium truncate max-w-[130px]">
                          <HiOutlinePaperClip className="w-3.5 h-3.5 flex-shrink-0" />
                          {r.attachmentName || "File"}
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions: Detail | Edit | Delete */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/time-off/${r.id}`)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          title="Detail"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        {r.status === "SUBMITTED" && (
                          <button
                            onClick={() => navigate(`/time-off/edit/${r.id}`)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r.id, r.employeeName)}
                          disabled={deletingId === r.id}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                          title="Hapus"
                        >
                          {deletingId === r.id
                            ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            : <HiOutlineTrash className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimeOffTablePage;
