import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineX, HiOutlineUser, HiOutlineCheck,
  HiOutlineEye, HiOutlineArrowLeft, HiOutlineClock,
  HiOutlineRefresh, HiOutlineFilter, HiOutlineChevronDown,
} from "react-icons/hi";
import { useReimbursement } from "../../../../redux/hooks/useReimbursement";
import ReimbursementDetailModal from "./ReimbursementApprovalModal";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  SUBMITTED: { cls: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400",   label: "Submitted" },
  PENDING:   { cls: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400",   label: "Pending"   },
  APPROVED:  { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Approved"  },
  REJECTED:  { cls: "bg-red-50 text-red-700 border border-red-200",             dot: "bg-red-400",     label: "Rejected"  },
};

const ALL_STATUSES = ["SUBMITTED", "PENDING", "APPROVED", "REJECTED"];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmt = (n) =>
  n != null ? `Rp ${Number(n).toLocaleString("id-ID")}` : "—";

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, type = "success", onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
    ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}
  >
    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${type === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
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
  const toggleAll   = () => onChange(isAllActive ? ["SUBMITTED"] : [...ALL_STATUSES]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
          activeFilters.length < ALL_STATUSES.length
            ? "bg-indigo-50 border-indigo-300 text-indigo-700"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <HiOutlineFilter className="w-4 h-4" />
        <span className="font-medium">Filter</span>
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
            <button
              onClick={toggleAll}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 mb-1"
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${isAllActive ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"}`}>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${isLast ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${checked ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"}`}>
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

// ══ Main Page ═════════════════════════════════════════════════════════════════
const ApprovalReimbursementPage = () => {
  const navigate = useNavigate();
  const { reimbursements, fetchReimbursements } = useReimbursement();

  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [activeFilters, setActiveFilters] = useState(["SUBMITTED", "PENDING"]);
  const [toast,         setToast]         = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { await fetchReimbursements(); }
    finally { setLoading(false); }
  }, [fetchReimbursements]);

  useEffect(() => { load(); }, []);

  // Sync selected dengan data terbaru setelah refresh
  useEffect(() => {
    if (selected) {
      const updated = (reimbursements || []).find((r) => r.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [reimbursements]);

  // SUBMITTED & PENDING di atas, lainnya di bawah
  const sorted = [
    ...(reimbursements || []).filter((r) => r.status === "SUBMITTED" || r.status === "PENDING"),
    ...(reimbursements || []).filter((r) => r.status !== "SUBMITTED" && r.status !== "PENDING"),
  ];

  const filtered = sorted.filter((r) => activeFilters.includes(r.status));

  const counts = (reimbursements || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const handleActionSuccess = () => {
    showToast("Request berhasil diproses.", "success");
    setSelected(null);
    load();
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/approvals")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-medium">Approval</span>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-semibold text-gray-700">Reimbursement</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mt-0.5">Reimbursement Approvals</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FilterDropdown activeFilters={activeFilters} onChange={setActiveFilters} counts={counts} />
            <button onClick={load} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-40" title="Refresh">
              <HiOutlineRefresh className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-xs text-gray-400">Menampilkan:</span>
          {activeFilters.map((s) => {
            const cfg = STATUS_CFG[s];
            return (
              <span key={s} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
                {counts[s] != null && <span className="opacity-60">({counts[s]})</span>}
              </span>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400 text-sm">Memuat data…</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
            <HiOutlineCheck className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {sorted.length === 0 ? "Tidak ada data reimbursement" : "Tidak ada data untuk filter yang dipilih"}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tanggal</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => {
                  const statusCfg = STATUS_CFG[r.status] || STATUS_CFG.SUBMITTED;
                  // ✅ canAct untuk SUBMITTED dan PENDING (multi-level approval)
                  const canAct    = r.status === "SUBMITTED" || r.status === "PENDING";
                  const isActive  = selected?.id === r.id;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className={`transition-colors cursor-pointer ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 truncate max-w-[160px]">{r.title || "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{r.category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <HiOutlineUser className="w-3 h-3 text-indigo-600" />
                          </div>
                          <span className="text-xs text-gray-700">{r.employeeName || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">{fmt(r.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="w-3 h-3" />{fmtDate(r.expenseDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* ✅ Detail → buka modal */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelected(r); }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 whitespace-nowrap"
                          >
                            <HiOutlineEye className="w-3.5 h-3.5" /> Detail
                          </button>
                          {canAct && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelected(r); }}
                                className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 whitespace-nowrap"
                              >
                                <HiOutlineCheck className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelected(r); }}
                                className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 whitespace-nowrap"
                              >
                                <HiOutlineX className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
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

      {/* Detail Modal */}
      {selected && (
        <ReimbursementDetailModal
          reimbursement={selected}
          onClose={() => setSelected(null)}
          onSuccess={handleActionSuccess}
        />
      )}
    </>
  );
};

export default ApprovalReimbursementPage;
