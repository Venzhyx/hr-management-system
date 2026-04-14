// src/pages/approvals/attendance/index.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineX, HiOutlineUser, HiOutlineCheck,
  HiOutlineEye, HiOutlineArrowLeft, HiOutlineClock,
  HiOutlineRefresh, HiOutlineFilter, HiOutlineChevronDown,
  HiOutlineCalendar, HiOutlineOfficeBuilding,
  HiOutlineAnnotation, HiOutlineShieldCheck,
  HiOutlineSearch,
} from "react-icons/hi";
import { useAttendanceCorrection } from "../../../redux/hooks/useAttendanceCorrection";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING:  { cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400", label: "Pending" },
  APPROVED: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Approved" },
  REJECTED: { cls: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-400", label: "Rejected" },
};

const TYPE_LABELS = {
  CHECKIN:  "Check-in",
  CHECKOUT: "Check-out",
  BOTH:     "Check-in & Out",
};

const ALL_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

const fmtDate = (d) => {
  if (!d) return "—";
  try { return format(new Date(d), "dd MMM yyyy", { locale: localeId }); }
  catch { return "—"; }
};

const fmtDateTime = (dt) => {
  if (!dt) return "—";
  try { return format(new Date(dt), "dd MMM yyyy, HH:mm", { locale: localeId }); }
  catch { return "—"; }
};

const fmtTime = (dt) => {
  if (!dt) return "—";
  try { return format(new Date(dt), "HH:mm"); }
  catch { return "—"; }
};

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
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (s) => {
    if (activeFilters.includes(s)) {
      if (activeFilters.length === 1) return;
      onChange(activeFilters.filter((x) => x !== s));
    } else {
      onChange([...activeFilters, s]);
    }
  };
  const isAll = activeFilters.length === ALL_STATUSES.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
          !isAll ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <HiOutlineFilter className="w-4 h-4" />
        <span className="font-medium">Status</span>
        <HiOutlineChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Status</span>
          </div>
          <div className="py-1.5">
            <button
              onClick={() => onChange(isAll ? ["PENDING"] : [...ALL_STATUSES])}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 mb-1"
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${isAll ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                {isAll && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-gray-700 font-medium">All</span>
              <span className="ml-auto text-xs text-gray-400">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                    isLast ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${checked ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
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

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ cls = "w-4 h-4" }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ cfg }) =>
  cfg ? (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  ) : null;

// ─── InfoRow ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium break-words">{value || "—"}</p>
    </div>
  </div>
);

// ─── Section ──────────────────────────────────────────────────────────────────
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</span>
        <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 py-4 bg-white space-y-4">{children}</div>}
    </div>
  );
};

// ─── ApprovalStep ─────────────────────────────────────────────────────────────
const ApprovalStep = ({ ar, isLast }) => {
  const cfg = STATUS_CFG[ar.status] || {
    cls: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
    label: ar.status,
  };
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
            ar.status === "APPROVED"
              ? "bg-emerald-50 border-emerald-300"
              : ar.status === "REJECTED"
              ? "bg-red-50 border-red-300"
              : "bg-amber-50 border-amber-300"
          }`}
        >
          {ar.status === "APPROVED" ? (
            <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : ar.status === "REJECTED" ? (
            <HiOutlineX className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <HiOutlineClock className="w-3.5 h-3.5 text-amber-500" />
          )}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
      </div>
      <div className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-semibold text-gray-800">{ar.approverName || "—"}</span>
          <Badge cfg={cfg} />
          {(ar.approvedAt || ar.actionAt) && (
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <HiOutlineCalendar className="w-3 h-3" />
              {fmtDateTime(ar.approvedAt || ar.actionAt)}
            </span>
          )}
        </div>
        {ar.notes && (
          <div className="mt-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
            <HiOutlineAnnotation className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed italic">"{ar.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ActionModal - tanpa notes karena backend tidak support
const ActionModal = ({ correction, action, onClose, onSuccess, onRefresh }) => {
  const { handleApprove, handleReject, actionLoading, actionError, clearError } = useAttendanceCorrection({ role: "admin" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isApprove = action === "APPROVED";
  const btnCls = isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600";
  const iconBgCls = isApprove ? "bg-green-100" : "bg-red-100";
  const iconCls = isApprove ? "text-green-600" : "text-red-500";
  const wrapCls = isApprove ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    if (clearError) clearError();
    
    try {
      if (isApprove) {
        await handleApprove(correction.id);
      } else {
        await handleReject(correction.id);
      }
      
      if (onRefresh) await onRefresh();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Gagal memproses approval.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`px-6 py-5 border-b ${wrapCls}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgCls}`}>
              {isApprove
                ? <HiOutlineCheck className={`w-5 h-5 ${iconCls}`} />
                : <HiOutlineX className={`w-5 h-5 ${iconCls}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-800">
                {isApprove ? "Approve Attendance Correction" : "Reject Attendance Correction"}
              </h3>
              {correction?.employeeName && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {correction.employeeName} · {fmtDate(correction.date)}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/70 rounded-lg">
              <HiOutlineX className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {(error || actionError) && (
            <div className="mb-4 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg leading-relaxed">
              {error || actionError}
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">
            Apakah Anda yakin ingin {isApprove ? "menyetujui" : "menolak"} koreksi ini?
          </p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${btnCls}`}
          >
            {loading ? (
              <><Spinner /> Memproses…</>
            ) : isApprove ? (
              <><HiOutlineCheck className="w-4 h-4" /> Konfirmasi Approve</>
            ) : (
              <><HiOutlineX className="w-4 h-4" /> Konfirmasi Reject</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Modal Attendance Correction ───────────────────────────────────────
const AttendanceCorrectionDetailModal = ({ correction, onClose, onSuccess, onRefresh }) => {
  const sCfg = STATUS_CFG[correction.status] || STATUS_CFG.PENDING;
  const canAct = correction.status === "PENDING";
  const [actionModal, setActionModal] = useState(null);
  const initials = correction.employeeName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  console.log("[DetailModal] correction:", correction);
  console.log("[DetailModal] canAct:", canAct);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleActionSuccess = () => {
    console.log("[DetailModal] handleActionSuccess called");
    if (onSuccess) onSuccess();
    if (onRefresh) onRefresh();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge cfg={sCfg} />
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {TYPE_LABELS[correction.type] || correction.type}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-snug">Attendance Correction Request</h2>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <HiOutlineClock className="w-3 h-3" /> Diajukan {fmtDateTime(correction.createdAt)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <HiOutlineX className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Info hero */}
            <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">Tanggal Koreksi</p>
                  <p className="text-xl font-bold text-amber-700">{fmtDate(correction.date)}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <HiOutlineCalendar className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Notes banner - alasan dari pengaju */}
            {correction.description && (
              <div className="mt-3 rounded-xl px-4 py-3 bg-blue-50 border border-blue-200 flex items-start gap-2">
                <HiOutlineAnnotation className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">Alasan Pengajuan</p>
                  <p className="text-xs text-blue-800 leading-relaxed italic">"{correction.description}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            <Section title="Informasi Pengaju">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-700 font-bold text-lg">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{correction.employeeName}</p>
                  {correction.employeeCode && (
                    <p className="text-xs text-gray-500 mt-0.5">NIK: {correction.employeeCode}</p>
                  )}
                  {correction.departmentName && (
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <HiOutlineOfficeBuilding className="w-3 h-3" /> {correction.departmentName}
                    </p>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Detail Koreksi">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={HiOutlineCalendar} label="Tanggal" value={fmtDate(correction.date)} />
                <InfoRow icon={HiOutlineShieldCheck} label="Tipe Koreksi" value={TYPE_LABELS[correction.type] || correction.type} />
                {correction.oldCheckIn && (
                  <InfoRow icon={HiOutlineClock} label="Check-in Lama" value={fmtTime(correction.oldCheckIn)} />
                )}
                {correction.newCheckIn && (
                  <InfoRow icon={HiOutlineCheck} label="Check-in Baru" value={fmtDateTime(correction.newCheckIn)} />
                )}
                {correction.oldCheckOut && (
                  <InfoRow icon={HiOutlineClock} label="Check-out Lama" value={fmtTime(correction.oldCheckOut)} />
                )}
                {correction.newCheckOut && (
                  <InfoRow icon={HiOutlineCheck} label="Check-out Baru" value={fmtDateTime(correction.newCheckOut)} />
                )}
              </div>
            </Section>

            <Section title="Riwayat Approval">
              {!correction.approvals || correction.approvals?.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <HiOutlineClock className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-400">Belum ada approval record</p>
                  <p className="text-xs text-gray-300 mt-1">Menunggu persetujuan</p>
                </div>
              ) : (
                <div className="pt-1">
                  {(correction.approvals || []).map((ar, idx) => (
                    <ApprovalStep key={ar.id ?? idx} ar={ar} isLast={idx === (correction.approvals?.length || 0) - 1} />
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
            {canAct ? (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log("[DetailModal] Set actionModal to REJECTED");
                    setActionModal("REJECTED");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <HiOutlineX className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => {
                    console.log("[DetailModal] Set actionModal to APPROVED");
                    setActionModal("APPROVED");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <HiOutlineCheck className="w-4 h-4" /> Approve
                </button>
              </div>
            ) : (
              <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border ${sCfg.cls}`}>
                <span className={`w-2 h-2 rounded-full ${sCfg.dot}`} />
                Request sudah {sCfg.label}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <ActionModal
          correction={correction}
          action={actionModal}
          onClose={() => {
            console.log("[DetailModal] Closing ActionModal");
            setActionModal(null);
          }}
          onSuccess={handleActionSuccess}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ApprovalAttendancePage = () => {
  const navigate = useNavigate();
  const { corrections, loading, fetchAllCorrections, handleApprove, handleReject } = useAttendanceCorrection({ role: "admin" });
  
  console.log("[ApprovalAttendancePage] corrections:", corrections);
  console.log("[ApprovalAttendancePage] loading:", loading);
  console.log("[ApprovalAttendancePage] fetchAllCorrections:", fetchAllCorrections);
  console.log("[ApprovalAttendancePage] handleApprove:", handleApprove);
  console.log("[ApprovalAttendancePage] handleReject:", handleReject);
  
  const [selected, setSelected] = useState(null);
  const [activeFilters, setActiveFilters] = useState(["PENDING"]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    console.log("[ApprovalAttendancePage] loadData called");
    if (fetchAllCorrections) {
      console.log("[ApprovalAttendancePage] Calling fetchAllCorrections");
      await fetchAllCorrections();
      console.log("[ApprovalAttendancePage] fetchAllCorrections completed");
    } else {
      console.warn("[ApprovalAttendancePage] fetchAllCorrections is not a function!");
    }
  }, [fetchAllCorrections]);

  useEffect(() => {
    console.log("[ApprovalAttendancePage] useEffect - initial load");
    loadData();
  }, []);

  // Sync selected dengan data terbaru setelah refresh
  useEffect(() => {
    if (selected && corrections) {
      const updated = corrections.find((c) => c.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [corrections, selected]);

  const stats = (corrections || []).reduce(
    (acc, c) => {
      acc.total++;
      if (c.status === "PENDING") acc.pending++;
      if (c.status === "APPROVED") acc.approved++;
      if (c.status === "REJECTED") acc.rejected++;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );

  const counts = (corrections || []).reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  // Filter berdasarkan search
  const filteredBySearch = (corrections || []).filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.employeeName?.toLowerCase().includes(q);
  });

  // PENDING di atas, lainnya di bawah
  const sorted = [
    ...filteredBySearch.filter((c) => c.status === "PENDING"),
    ...filteredBySearch.filter((c) => c.status !== "PENDING"),
  ];

  const filtered = sorted.filter((c) => activeFilters.includes(c.status));

  const handleActionSuccess = () => {
    console.log("[ApprovalAttendancePage] handleActionSuccess called");
    showToast("Request berhasil diproses.", "success");
    setSelected(null);
    loadData();
  };

  return (
    <div className="w-full px-4 md:px-6 py-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Approval Attendance Correction</h1>
        {stats.pending > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {stats.pending} perlu tindakan
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
            <HiOutlineClock className="w-3 h-3 text-indigo-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Status Overview</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-gray-100">
          {[
            { label: "Total", value: stats.total, color: "text-gray-800" },
            { label: "Pending", value: stats.pending, color: "text-amber-600" },
            { label: "Approved", value: stats.approved, color: "text-emerald-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-500" },
          ].map((s, i) => (
            <div key={s.label} className={i > 0 ? "pl-6" : ""}>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value ?? 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama karyawan..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <FilterDropdown activeFilters={activeFilters} onChange={setActiveFilters} counts={counts} />
        <div className="flex-1" />
        <button onClick={loadData} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-40" title="Refresh">
          <HiOutlineRefresh className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner cls="w-6 h-6 text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
          <HiOutlineClock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">
            {search ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Employee", "Tanggal", "Tipe", "Check-in Baru", "Check-out Baru", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => {
                const sCfg = STATUS_CFG[c.status] || STATUS_CFG.PENDING;
                const canAct = c.status === "PENDING";
                const isActive = selected?.id === c.id;
                const initials = c.employeeName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

                return (
                  <tr
                    key={c.id}
                    onClick={() => {
                      console.log("[ApprovalAttendancePage] Selected correction:", c);
                      setSelected(c);
                    }}
                    className={`transition-colors cursor-pointer ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-indigo-600">{initials}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 whitespace-nowrap">{c.employeeName}</p>
                          {c.departmentName && <p className="text-xs text-gray-400">{c.departmentName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(c.date)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                        {TYPE_LABELS[c.type] || c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.newCheckIn ? fmtDateTime(c.newCheckIn) : "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.newCheckOut ? fmtDateTime(c.newCheckOut) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sCfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                        {sCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            console.log("[ApprovalAttendancePage] Detail button clicked for:", c);
                            setSelected(c); 
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 whitespace-nowrap"
                        >
                          <HiOutlineEye className="w-3.5 h-3.5" /> Detail
                        </button>
                        {canAct && (
                          <>
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                console.log("[ApprovalAttendancePage] Approve button clicked for:", c);
                                setSelected(c); 
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 whitespace-nowrap"
                            >
                              <HiOutlineCheck className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                console.log("[ApprovalAttendancePage] Reject button clicked for:", c);
                                setSelected(c); 
                              }}
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

      {/* Detail Modal */}
      {selected && (
        <AttendanceCorrectionDetailModal
          correction={selected}
          onClose={() => {
            console.log("[ApprovalAttendancePage] Closing detail modal");
            setSelected(null);
          }}
          onSuccess={handleActionSuccess}
          onRefresh={loadData}
        />
      )}
    </div>
  );
};

export default ApprovalAttendancePage;