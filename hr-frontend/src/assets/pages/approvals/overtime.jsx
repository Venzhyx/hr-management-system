import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineFilter,
  HiOutlineChevronDown,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
  HiOutlineAnnotation,
  HiOutlineSearch,
  HiOutlineClipboardList,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineDotsCircleHorizontal,
} from "react-icons/hi";
import { useOvertime } from "../../../redux/hooks/useOvertime";
import { useApproval } from "../../../redux/hooks/useApproval";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  PENDING:  { cls: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400",   label: "Pending"  },
  APPROVED: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Approved" },
  REJECTED: { cls: "bg-red-50 text-red-700 border border-red-200",             dot: "bg-red-400",     label: "Rejected" },
};

const TYPE_LABELS = {
  WORKDAY: "Hari Kerja",
  HOLIDAY: "Hari Libur",
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

const fmtHours = (h) => {
  if (h == null) return "—";
  const hours   = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} mnt`;
};

// ── Toast ─────────────────────────────────────────────────────────────────────

const Toast = ({ message, type = "success", onClose }) => (
  <div className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
    ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}
  >
    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${type === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
      {type === "success"
        ? <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-600" />
        : <HiOutlineX className="w-3.5 h-3.5 text-red-600" />}
    </span>
    {message}
    <button onClick={onClose} className="ml-1 p-0.5 hover:opacity-60"><HiOutlineX className="w-3.5 h-3.5" /></button>
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
      <button onClick={() => setOpen((v) => !v)}
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
            <button onClick={() => onChange(isAll ? ["PENDING"] : [...ALL_STATUSES])}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 mb-1">
              <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${isAll ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                {isAll && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </span>
              <span className="text-sm text-gray-700 font-medium">All</span>
              <span className="ml-auto text-xs text-gray-400">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
            </button>
            {ALL_STATUSES.map((status) => {
              const cfg = STATUS_CFG[status];
              const checked = activeFilters.includes(status);
              const isLast = activeFilters.length === 1 && checked;
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

// ── Spinner ──────────────────────────────────────────────────────────────────
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
      <button type="button" onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</span>
        <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 py-4 bg-white space-y-4">{children}</div>}
    </div>
  );
};

// ─── Multi-Level Approval Timeline ───────────────────────────────────────────
const ApprovalTimeline = ({ approvals = [], overallStatus }) => {
  const levels = [1, 2, 3].map((level) => {
    const record = approvals.find((a) => a.approvalOrder === level || a.level === level) || null;
    return { level, record };
  });

  const getLockState = (idx) => {
    if (idx === 0) return false;
    for (let i = 0; i < idx; i++) {
      const rec = levels[i].record;
      if (!rec || rec.status !== "APPROVED") return true;
    }
    return false;
  };

  return (
    <div className="space-y-0">
      {levels.map(({ level, record }, idx) => {
        const isLocked  = getLockState(idx);
        const isLast    = idx === levels.length - 1;
        const status    = record?.status || (isLocked ? "LOCKED" : "WAITING");
        const approverName = record?.approverName || record?.employeeName || null;
        const actionAt  = record?.approvedAt || record?.actionAt || null;
        const notes     = record?.notes || null;

        let iconEl, iconWrap, lineColor;
        if (status === "APPROVED") {
          iconEl   = <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />;
          iconWrap = "bg-emerald-50 border-emerald-300";
          lineColor = "bg-emerald-200";
        } else if (status === "REJECTED") {
          iconEl   = <HiOutlineXCircle className="w-4 h-4 text-red-500" />;
          iconWrap = "bg-red-50 border-red-300";
          lineColor = "bg-gray-200";
        } else if (status === "LOCKED") {
          iconEl   = <HiOutlineLockClosed className="w-4 h-4 text-gray-300" />;
          iconWrap = "bg-gray-50 border-gray-200";
          lineColor = "bg-gray-100";
        } else {
          iconEl   = <HiOutlineDotsCircleHorizontal className="w-4 h-4 text-indigo-500" />;
          iconWrap = "bg-indigo-50 border-indigo-300";
          lineColor = "bg-gray-200";
        }

        return (
          <div key={level} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${iconWrap}`}>
                {iconEl}
              </div>
              {!isLast && <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${lineColor}`} />}
            </div>
            <div className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Level {level}</span>
                {status === "APPROVED" && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>}
                {status === "REJECTED" && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Rejected</span>}
                {status === "WAITING" && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Menunggu</span>}
                {status === "LOCKED" && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Terkunci</span>}
              </div>
              {approverName ? (
                <p className="text-sm font-semibold text-gray-800">{approverName}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  {isLocked ? "Menunggu level sebelumnya" : "Belum ada approver"}
                </p>
              )}
              {actionAt && (
                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <HiOutlineCalendar className="w-3 h-3" />{fmtDateTime(actionAt)}
                </p>
              )}
              {notes && (
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
                  <HiOutlineAnnotation className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed italic">"{notes}"</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Action Modal ──────────────────────────────────────────────────────────────
const ActionModal = ({ overtime, action, onClose, onSuccess, onRefresh }) => {
  const { handleApprove, handleReject, actionLoading, actionError } = useOvertime({ role: "admin" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [notes,   setNotes]   = useState("");

  const isApprove = action === "APPROVED";

  const approvals   = overtime?.approvals || [];
  const nextLevel   = approvals.filter((a) => a.status === "APPROVED").length + 1;
  const totalLevels = 3;

  const btnCls    = isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600";
  const wrapCls   = isApprove ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200";
  const iconBgCls = isApprove ? "bg-emerald-100" : "bg-red-100";
  const iconCls   = isApprove ? "text-emerald-600" : "text-red-500";

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isApprove) {
        await handleApprove(overtime.id, notes || undefined);
      } else {
        await handleReject(overtime.id, notes || undefined);
      }
      if (onRefresh) await onRefresh();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Gagal memproses approval.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`px-6 py-5 border-b ${wrapCls}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgCls}`}>
              {isApprove ? <HiOutlineCheck className={`w-5 h-5 ${iconCls}`} /> : <HiOutlineX className={`w-5 h-5 ${iconCls}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-800">
                {isApprove ? "Approve Overtime Request" : "Reject Overtime Request"}
              </h3>
              {overtime?.employeeName && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {overtime.employeeName} · {fmtDate(overtime.date ?? overtime.startTime)}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/70 rounded-lg">
              <HiOutlineX className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {(error || actionError) && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg leading-relaxed">
              {error || actionError}
            </div>
          )}

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((lvl) => {
              const isDone    = lvl < nextLevel;
              const isCurrent = lvl === nextLevel;
              return (
                <React.Fragment key={lvl}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isDone    ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    isCurrent ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" :
                                "bg-gray-50 border-gray-200 text-gray-400"
                  }`}>
                    {isDone ? <HiOutlineCheck className="w-3 h-3" /> : <span>{lvl}</span>}
                    Level {lvl}
                  </div>
                  {lvl < 3 && <div className={`h-px flex-1 ${isDone ? "bg-emerald-200" : "bg-gray-200"}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Tipe</span>
              <span className="font-medium text-gray-700">{TYPE_LABELS[overtime?.type] ?? overtime?.type ?? "—"}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Waktu Mulai</span>
              <span className="font-medium text-gray-700">{fmtDateTime(overtime?.startTime)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Waktu Selesai</span>
              <span className="font-medium text-gray-700">{fmtDateTime(overtime?.endTime)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Total Jam</span>
              <span className="font-semibold text-indigo-600">{fmtHours(overtime?.totalHours)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {isApprove ? "Catatan Approval" : "Alasan Penolakan"}
              {!isApprove && <span className="text-red-500 ml-1">*</span>}
              <span className="ml-1 text-xs text-gray-400 font-normal">{isApprove ? "(opsional)" : "(wajib diisi)"}</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isApprove ? "Tambahkan catatan jika diperlukan..." : "Jelaskan alasan penolakan..."}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button type="button" onClick={onClose} disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={handleSubmit}
            disabled={loading || (!isApprove && !notes.trim())}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${btnCls}`}>
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

// ─── Detail Modal ───────────────────────────────────────────────────────────────
const OvertimeDetailModal = ({ overtime, onClose, onSuccess, onRefresh }) => {
  const sCfg    = STATUS_CFG[overtime.status] || STATUS_CFG.PENDING;
  const canAct  = overtime.status === "PENDING";
  const initials = overtime.employeeName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const [actionModal, setActionModal] = useState(null);

  const approvals    = overtime.approvals || [];
  const approvedCount = approvals.filter((a) => a.status === "APPROVED").length;
  const totalLevels  = 3;

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
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge cfg={sCfg} />
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    overtime.type === "HOLIDAY" ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {TYPE_LABELS[overtime.type] || overtime.type}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                    <HiOutlineShieldCheck className="w-3 h-3" />
                    {approvedCount}/{totalLevels} Level
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-snug">Overtime Request</h2>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <HiOutlineClock className="w-3 h-3" /> Diajukan {fmtDateTime(overtime.createdAt)}
                </p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
                <HiOutlineX className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Total Lembur</p>
                  <p className="text-2xl font-bold text-indigo-700">{fmtHours(overtime.totalHours)}</p>
                  <p className="text-xs text-indigo-400 mt-0.5">
                    {fmtTime(overtime.startTime)} – {fmtTime(overtime.endTime)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                  <HiOutlineClock className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
            </div>

            {overtime.description && (
              <div className="mt-3 rounded-xl px-4 py-3 bg-blue-50 border border-blue-200 flex items-start gap-2">
                <HiOutlineAnnotation className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">Keterangan</p>
                  <p className="text-xs text-blue-800 leading-relaxed italic">"{overtime.description}"</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            <Section title="Informasi Pengaju">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-indigo-100 flex items-center justify-center ring-2 ring-white shadow-sm">
                  <span className="text-indigo-700 font-bold text-lg">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{overtime.employeeName}</p>
                  {overtime.employeeCode && <p className="text-xs text-gray-500 mt-0.5">NIK: {overtime.employeeCode}</p>}
                  {overtime.departmentName && (
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <HiOutlineOfficeBuilding className="w-3 h-3" /> {overtime.departmentName}
                    </p>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Detail Lembur">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={HiOutlineCalendar}      label="Tanggal"       value={fmtDate(overtime.date ?? overtime.startTime)} />
                <InfoRow icon={HiOutlineClipboardList} label="Tipe"          value={TYPE_LABELS[overtime.type] || overtime.type} />
                <InfoRow icon={HiOutlineClock}         label="Waktu Mulai"   value={fmtDateTime(overtime.startTime)} />
                <InfoRow icon={HiOutlineClock}         label="Waktu Selesai" value={fmtDateTime(overtime.endTime)} />
                <InfoRow icon={HiOutlineClock}         label="Total Jam"
                  value={
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                      <HiOutlineClock className="w-3.5 h-3.5" />{fmtHours(overtime.totalHours)}
                    </span>
                  }
                />
              </div>
            </Section>

            <Section title={`Alur Approval (${approvedCount}/${totalLevels} Selesai)`}>
              <ApprovalTimeline approvals={approvals} overallStatus={overtime.status} />
            </Section>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
            {canAct ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${(approvedCount / totalLevels) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    Level {approvedCount + 1} dari {totalLevels}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setActionModal("REJECTED")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition-colors shadow-sm">
                    <HiOutlineX className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => setActionModal("APPROVED")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                    <HiOutlineCheck className="w-4 h-4" />
                    {approvedCount < totalLevels - 1 ? `Approve Level ${approvedCount + 1}` : "Final Approve"}
                  </button>
                </div>
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

      {actionModal && (
        <ActionModal
          overtime={overtime}
          action={actionModal}
          onClose={() => setActionModal(null)}
          onSuccess={handleActionSuccess}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ApprovalOvertimePage = () => {
  const { overtimes: rawOvertimes, loading, fetchOvertimes } = useOvertime({ role: "admin" });
  const overtimeApproval = useApproval({ type: "overtime" });

  const [selected,      setSelected]      = useState(null);
  const [activeFilters, setActiveFilters] = useState(["PENDING"]);
  const [search,        setSearch]        = useState("");
  const [toast,         setToast]         = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    if (fetchOvertimes) await fetchOvertimes();
  }, [fetchOvertimes]);

  useEffect(() => {
    loadData();
    overtimeApproval.fetchApprovers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selected && rawOvertimes) {
      const updated = rawOvertimes.find((o) => o.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [rawOvertimes, selected]);

  const stats = (rawOvertimes || []).reduce(
    (acc, o) => { acc.total++; if (o.status === "PENDING") acc.pending++; if (o.status === "APPROVED") acc.approved++; if (o.status === "REJECTED") acc.rejected++; return acc; },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );

  const counts = (rawOvertimes || []).reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  const filteredBySearch = (rawOvertimes || []).filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.employeeName?.toLowerCase().includes(q);
  });

  const sorted = [
    ...filteredBySearch.filter((o) => o.status === "PENDING"),
    ...filteredBySearch.filter((o) => o.status !== "PENDING"),
  ];

  const filtered = sorted.filter((o) => activeFilters.includes(o.status));

  const handleActionSuccess = () => {
    showToast("Request berhasil diproses.", "success");
    setSelected(null);
    loadData();
  };

  return (
    <div className="w-full px-4 md:px-6 py-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Approval Overtime</h1>
        {stats.pending > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {stats.pending} perlu tindakan
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
            <HiOutlineClock className="w-3 h-3 text-indigo-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Status Overview</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-gray-100">
          {[
            { label: "Total",    value: stats.total,    color: "text-gray-800"    },
            { label: "Pending",  value: stats.pending,  color: "text-amber-600"   },
            { label: "Approved", value: stats.approved, color: "text-emerald-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-500"     },
          ].map((s, i) => (
            <div key={s.label} className={i > 0 ? "pl-6" : ""}>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value ?? 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama karyawan..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <FilterDropdown activeFilters={activeFilters} onChange={setActiveFilters} counts={counts} />
        <div className="flex-1" />
        <button onClick={loadData} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-40" title="Refresh">
          <HiOutlineRefresh className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

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
                {["Employee", "Tanggal", "Tipe", "Mulai", "Selesai", "Total Jam", "Level", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((o) => {
                const sCfg    = STATUS_CFG[o.status] || STATUS_CFG.PENDING;
                const canAct  = o.status === "PENDING";
                const isActive = selected?.id === o.id;
                const initials = o.employeeName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                const approvedLevels = (o.approvals || []).filter((a) => a.status === "APPROVED").length;

                return (
                  <tr key={o.id} onClick={() => setSelected(o)}
                    className={`transition-colors cursor-pointer ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-indigo-600">{initials}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 whitespace-nowrap">{o.employeeName}</p>
                          {o.departmentName && <p className="text-xs text-gray-400">{o.departmentName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(o.date ?? o.startTime)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        o.type === "HOLIDAY" ? "bg-orange-50 text-orange-700" : "bg-indigo-50 text-indigo-700"
                      }`}>{TYPE_LABELS[o.type] || o.type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono text-xs">{fmtTime(o.startTime)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono text-xs">{fmtTime(o.endTime)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                        <HiOutlineClock className="w-3 h-3" />{fmtHours(o.totalHours)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((lvl) => (
                          <div key={lvl} className={`w-2 h-2 rounded-full ${
                            lvl <= approvedLevels ? "bg-emerald-400" :
                            (o.status === "REJECTED" && lvl === approvedLevels + 1) ? "bg-red-400" :
                            "bg-gray-200"
                          }`} />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">{approvedLevels}/3</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sCfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button onClick={(e) => { e.stopPropagation(); setSelected(o); }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 whitespace-nowrap">
                          <HiOutlineEye className="w-3.5 h-3.5" /> Detail
                        </button>
                        {canAct && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); setSelected(o); }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 whitespace-nowrap">
                              <HiOutlineCheck className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setSelected(o); }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 whitespace-nowrap">
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

      {selected && (
        <OvertimeDetailModal
          overtime={selected}
          onClose={() => setSelected(null)}
          onSuccess={handleActionSuccess}
          onRefresh={loadData}
        />
      )}
    </div>
  );
};

export default ApprovalOvertimePage;