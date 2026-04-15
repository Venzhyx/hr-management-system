import React, { useState, useEffect } from "react";
import {
  HiOutlineX,
  HiOutlineUser,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
  HiOutlineAnnotation,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineDotsCircleHorizontal,
  HiOutlineChevronDown,
} from "react-icons/hi";
import { useAttendanceCorrection } from "../../../redux/hooks/useAttendanceCorrection";
import { useApproval } from "../../../redux/hooks/useApproval";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd MMM yyyy", { locale: localeId });
  } catch {
    return "—";
  }
};

const fmtDateTime = (dt) => {
  if (!dt) return "—";
  try {
    return format(new Date(dt), "dd MMM yyyy, HH:mm", { locale: localeId });
  } catch {
    return "—";
  }
};

const fmtTime = (dt) => {
  if (!dt) return "—";
  try {
    return format(new Date(dt), "HH:mm");
  } catch {
    return "—";
  }
};

const STATUS_CFG = {
  PENDING: { cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400", label: "Pending" },
  APPROVED: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Approved" },
  REJECTED: { cls: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-400", label: "Rejected" },
};

const TYPE_LABELS = {
  CHECKIN: "Check-in",
  CHECKOUT: "Check-out",
  BOTH: "Check-in & Out",
};

const Spinner = ({ cls = "w-4 h-4" }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Badge = ({ cfg }) =>
  cfg ? (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  ) : null;

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

// ─── Multi-Level Approval Timeline ───────────────────────────────────────────
const ApprovalTimeline = ({ approvals = [], approversList = [] }) => {
  const levels = [1, 2, 3].map((level) => {
    const existingApproval = approvals.find((a) => a.approvalOrder === level || a.level === level);
    const approverConfig = approversList.find((a) => a.approvalOrder === level);
    return {
      level,
      record: existingApproval,
      config: approverConfig,
    };
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
      {levels.map(({ level, record, config }, idx) => {
        const isLocked = getLockState(idx);
        const isLast = idx === levels.length - 1;
        const status = record?.status || (isLocked ? "LOCKED" : "WAITING");
        const approverName = record?.approverName || config?.employeeName || null;
        const actionAt = record?.approvedAt || record?.actionAt || null;
        const notes = record?.notes || null;

        let iconEl, iconWrap, lineColor;
        if (status === "APPROVED") {
          iconEl = <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />;
          iconWrap = "bg-emerald-50 border-emerald-300";
          lineColor = "bg-emerald-200";
        } else if (status === "REJECTED") {
          iconEl = <HiOutlineXCircle className="w-4 h-4 text-red-500" />;
          iconWrap = "bg-red-50 border-red-300";
          lineColor = "bg-gray-200";
        } else if (status === "LOCKED") {
          iconEl = <HiOutlineLockClosed className="w-4 h-4 text-gray-300" />;
          iconWrap = "bg-gray-50 border-gray-200";
          lineColor = "bg-gray-100";
        } else {
          iconEl = <HiOutlineDotsCircleHorizontal className="w-4 h-4 text-amber-500" />;
          iconWrap = "bg-amber-50 border-amber-300";
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
                {config?.isRequired && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                    Required
                  </span>
                )}
                {status === "APPROVED" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Approved by {approverName}</span>
                )}
                {status === "REJECTED" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Rejected by {approverName}</span>
                )}
                {status === "WAITING" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Menunggu Approval</span>
                )}
                {status === "LOCKED" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Terkunci</span>
                )}
              </div>
              {approverName && status !== "WAITING" && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <HiOutlineUser className="w-3 h-3 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{approverName}</p>
                </div>
              )}
              {!approverName && status === "WAITING" && config && (
                <p className="text-sm text-gray-500">Menunggu approval dari <span className="font-semibold">{config.employeeName}</span></p>
              )}
              {actionAt && (
                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <HiOutlineCalendar className="w-3 h-3" />
                  {fmtDateTime(actionAt)}
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
const ActionModal = ({ correction, action, onClose, onSuccess, onRefresh }) => {
  const { handleApprove, handleReject, actionLoading, actionError } = useAttendanceCorrection({ role: "admin" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");

  const isApprove = action === "APPROVED";

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!isApprove && !notes.trim()) {
      setError("Alasan penolakan wajib diisi");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isApprove) {
        await handleApprove(correction.id, notes || undefined);
      } else {
        await handleReject(correction.id, notes || undefined);
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

  const btnCls = isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600";
  const wrapCls = isApprove ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200";
  const iconBgCls = isApprove ? "bg-emerald-100" : "bg-red-100";
  const iconCls = isApprove ? "text-emerald-600" : "text-red-500";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`px-6 py-5 border-b ${wrapCls}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgCls}`}>
              {isApprove ? <HiOutlineCheck className={`w-5 h-5 ${iconCls}`} /> : <HiOutlineX className={`w-5 h-5 ${iconCls}`} />}
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

        <div className="px-6 py-5 space-y-4">
          {(error || actionError) && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg leading-relaxed">
              {error || actionError}
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Tanggal</span>
              <span className="font-medium text-gray-700">{fmtDate(correction?.date)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Tipe Koreksi</span>
              <span className="font-medium text-gray-700">{TYPE_LABELS[correction?.type] ?? correction?.type ?? "—"}</span>
            </div>
            {correction?.newCheckIn && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Check-in Baru</span>
                <span className="font-medium text-gray-700">{fmtDateTime(correction.newCheckIn)}</span>
              </div>
            )}
            {correction?.newCheckOut && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Check-out Baru</span>
                <span className="font-medium text-gray-700">{fmtDateTime(correction.newCheckOut)}</span>
              </div>
            )}
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
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
            />
          </div>
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
            disabled={loading || (!isApprove && !notes.trim())}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${btnCls}`}
          >
            {loading ? (
              <>
                <Spinner /> Memproses…
              </>
            ) : isApprove ? (
              <>
                <HiOutlineCheck className="w-4 h-4" /> Konfirmasi Approve
              </>
            ) : (
              <>
                <HiOutlineX className="w-4 h-4" /> Konfirmasi Reject
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Detail Modal ─────────────────────────────────────────────────────────
const AttendanceCorrectionDetailModal = ({ correction, emp, onClose, onSuccess, onRefresh }) => {
  const sCfg = STATUS_CFG[correction.status] || STATUS_CFG.PENDING;
  const canAct = correction.status === "PENDING";
  const initials = correction.employeeName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const [actionModal, setActionModal] = useState(null);

  // Fetch approvers untuk attendance
  const attendanceApproval = useApproval({ type: "attendance" });

  useEffect(() => {
    attendanceApproval.fetchApprovers();
  }, []);

  const approvals = correction.approvals || [];
  const approvedCount = approvals.filter((a) => a.status === "APPROVED").length;
  const totalLevels = 3;
  const nextLevel = approvedCount + 1;
  const currentApprover = attendanceApproval.approvers.find((a) => a.approvalOrder === nextLevel);
  const isLastLevel = nextLevel === totalLevels;

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
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
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
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
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                    <HiOutlineShieldCheck className="w-3 h-3" />
                    {approvedCount}/{totalLevels} Level
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

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            <Section title="Informasi Pengaju">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm bg-amber-100 flex items-center justify-center">
                  {emp?.photo ? (
                    <img src={emp.photo} alt={correction.employeeName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-amber-700 font-bold text-lg">{initials}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{correction.employeeName}</p>
                  {correction.employeeCode && <p className="text-xs text-gray-500 mt-0.5">NIK: {correction.employeeCode}</p>}
                  {emp?.departmentName && (
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <HiOutlineOfficeBuilding className="w-3 h-3" /> {emp.departmentName}
                    </p>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Detail Koreksi">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={HiOutlineCalendar} label="Tanggal" value={fmtDate(correction.date)} />
                <InfoRow icon={HiOutlineShieldCheck} label="Tipe Koreksi" value={TYPE_LABELS[correction.type] || correction.type} />
                {correction.oldCheckIn && <InfoRow icon={HiOutlineClock} label="Check-in Lama" value={fmtTime(correction.oldCheckIn)} />}
                {correction.newCheckIn && <InfoRow icon={HiOutlineCheck} label="Check-in Baru" value={fmtDateTime(correction.newCheckIn)} />}
                {correction.oldCheckOut && <InfoRow icon={HiOutlineClock} label="Check-out Lama" value={fmtTime(correction.oldCheckOut)} />}
                {correction.newCheckOut && <InfoRow icon={HiOutlineCheck} label="Check-out Baru" value={fmtDateTime(correction.newCheckOut)} />}
              </div>
            </Section>

            <Section title={`Alur Approval (${approvedCount}/${totalLevels} Selesai)`}>
              <ApprovalTimeline approvals={approvals} approversList={attendanceApproval.approvers} />
            </Section>
          </div>

          {/* Footer - Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
            {canAct ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${(approvedCount / totalLevels) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    Level {nextLevel} dari {totalLevels}
                  </span>
                </div>

                {/* Info approver untuk level saat ini */}
                {currentApprover && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
                    <HiOutlineUser className="w-3.5 h-3.5 text-amber-500" />
                    Akan di-approve oleh: <span className="font-semibold text-amber-600">{currentApprover.employeeName}</span>
                    {currentApprover.isRequired && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded-full">Required</span>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setActionModal("REJECTED")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition-colors"
                  >
                    <HiOutlineX className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => setActionModal("APPROVED")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                    {!isLastLevel ? `Approve Level ${nextLevel}` : "Final Approve"}
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
          correction={correction}
          action={actionModal}
          onClose={() => setActionModal(null)}
          onSuccess={handleActionSuccess}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};

export default AttendanceCorrectionDetailModal;