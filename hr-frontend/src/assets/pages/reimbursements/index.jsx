import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlus, HiOutlineSearch, HiOutlineEye,
  HiOutlinePencil, HiOutlineTrash, HiOutlineCurrencyDollar,
  HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineFilter, HiOutlineChevronDown, HiOutlineCheck,
} from "react-icons/hi";
import { useReimbursement } from "../../../redux/hooks/useReimbursement";

const STATUS_CFG = {
  SUBMITTED: { label: "Submitted", cls: "bg-amber-50 text-amber-700 border-amber-200",     dot: "bg-amber-400"   },
  APPROVED:  { label: "Approved",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  REJECTED:  { label: "Rejected",  cls: "bg-red-50 text-red-700 border-red-200",           dot: "bg-red-400"     },
};

const ALL_STATUSES = ["SUBMITTED", "APPROVED", "REJECTED"];

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const Badge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { label: status, cls: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ── Filter Dropdown ───────────────────────────────────────────────────────────
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

  const isAllActive = activeFilters.length === ALL_STATUSES.length;

  const toggleAll = () => {
    onChange(isAllActive ? ["SUBMITTED"] : [...ALL_STATUSES]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
          activeFilters.length < ALL_STATUSES.length
            ? "bg-indigo-50 border-indigo-300 text-indigo-700"
            : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <HiOutlineFilter className="w-4 h-4" />
        <span className="font-medium">Status</span>
        {activeFilters.length < ALL_STATUSES.length && (
          <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {activeFilters.length}
          </span>
        )}
        <HiOutlineChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Status</span>
          </div>

          <div className="py-1.5">
            {/* All row */}
            <button
              onClick={toggleAll}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 mb-1"
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                isAllActive ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
              }`}>
                {isAllActive && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="flex items-center gap-2 flex-1 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-400" />
                <span className="text-sm text-gray-700 font-medium">All</span>
              </span>
              <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                {Object.values(counts).reduce((a, b) => a + b, 0)}
              </span>
            </button>

            {ALL_STATUSES.map((status) => {
              const cfg     = STATUS_CFG[status];
              const checked = activeFilters.includes(status);
              const isLast  = activeFilters.length === 1 && checked;
              return (
                <button
                  key={status}
                  onClick={() => toggle(status)}
                  disabled={isLast}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                    ${isLast ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                    checked ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
                  }`}>
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className="text-sm text-gray-700 font-medium">{cfg.label}</span>
                  </span>
                  {counts[status] != null && (
                    <span className="text-xs text-gray-400 font-medium flex-shrink-0">{counts[status]}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ReimbursementIndex = () => {
  const navigate = useNavigate();
  const { reimbursements, fetchReimbursements, deleteReimbursement, loading } = useReimbursement();

  const [search,        setSearch]        = useState("");
  // default: tampilkan semua
  const [activeFilters, setActiveFilters] = useState([...ALL_STATUSES]);
  const [page,          setPage]          = useState(1);
  const [toast,         setToast]         = useState(null);
  const PER_PAGE = 10;

  useEffect(() => { fetchReimbursements(); }, []);

  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.toast) {
      setToast(state.toast);
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  // count per status (unfiltered)
  const counts = (reimbursements || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = (reimbursements || []).filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      r.title?.toLowerCase().includes(q)    ||
      r.category?.toLowerCase().includes(q) ||
      r.employeeName?.toLowerCase().includes(q);
    const matchStatus = activeFilters.includes(r.status);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reimbursement?")) return;
    try {
      await deleteReimbursement(id);
      setToast({ type: "success", message: "Reimbursement deleted." });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ type: "error", message: "Failed to delete." });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 py-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium border ${
          toast.type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reimbursements</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} records found</p>
        </div>
        <button
          onClick={() => navigate("/reimbursements/add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Reimbursement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search title, category, employee…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <FilterDropdown
          activeFilters={activeFilters}
          onChange={handleFilterChange}
          counts={counts}
        />
      </div>

      {/* Active filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-gray-400">Menampilkan:</span>
        {activeFilters.map((s) => {
          const cfg = STATUS_CFG[s];
          return (
            <span key={s} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
              {counts[s] != null && <span className="opacity-60">({counts[s]})</span>}
            </span>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Loading…</td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <HiOutlineCurrencyDollar className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No reimbursements found</p>
                      <p className="text-gray-400 text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : paged.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(r.expenseDate)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">{r.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                    {fmt(r.total)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {r.employeeName || "—"}
                  </td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => navigate(`/reimbursements/detail/${r.id}`)}
                        className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600" title="View">
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                      {r.status === "SUBMITTED" && (
                        <button
                          onClick={() => navigate(`/reimbursements/edit/${r.id}`)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors text-amber-600" title="Edit">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500" title="Delete">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReimbursementIndex;
