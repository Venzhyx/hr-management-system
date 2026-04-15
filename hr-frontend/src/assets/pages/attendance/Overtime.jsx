import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineFilter,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlineChevronDown,
  HiOutlineExclamationCircle,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineClipboardList,
  HiOutlineCheck,
  HiOutlineAnnotation,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
  HiOutlineLockClosed,
  HiOutlineDotsCircleHorizontal,
} from "react-icons/hi";
import { useOvertime } from "../../../redux/hooks/useOvertime";
import { useEmployee } from "../../../redux/hooks/useEmployee";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useLocation } from "react-router-dom";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400",   Icon: HiOutlineClock },
  APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", Icon: HiOutlineCheckCircle },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-600 border border-red-200",             dot: "bg-red-400",     Icon: HiOutlineXCircle },
};

const TYPE_LABELS = {
  WORKDAY: "Hari Kerja",
  HOLIDAY: "Hari Libur",
};

const fmt = (dt) => {
  if (!dt) return "—";
  try { return format(new Date(dt), "dd MMM yyyy, HH:mm", { locale: localeId }); }
  catch { return "—"; }
};
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
const fmtHours = (h) => {
  if (h == null) return "—";
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} mnt`;
};

// ─── Employee Dropdown ────────────────────────────────────────────────────────

const EmployeeDropdown = ({ employees, loadingEmployees, selectedEmployee, onChange, error }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (e) => e.name?.toLowerCase().includes(q) || e.employeeIdentificationNumber?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button" onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 border rounded-xl shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm ${
          error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <HiOutlineUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {selectedEmployee ? (
            <span className="truncate text-gray-800 font-medium">
              {selectedEmployee.name}
              <span className="ml-1.5 text-gray-400 font-normal font-mono text-xs">({selectedEmployee.employeeIdentificationNumber})</span>
            </span>
          ) : (
            <span className="text-gray-400">{loadingEmployees ? "Memuat karyawan…" : "Pilih karyawan"}</span>
          )}
        </div>
        <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <HiOutlineSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input autoFocus type="text" placeholder="Cari nama atau NIK…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
            </div>
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {loadingEmployees ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">Memuat…</li>
            ) : filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">Tidak ditemukan</li>
            ) : (
              filtered.map((emp) => {
                const isActive = emp.id === selectedEmployee?.id;
                return (
                  <li key={emp.id}>
                    <button type="button"
                      onClick={() => { onChange(emp); setOpen(false); setSearch(""); }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors ${isActive ? "bg-indigo-50" : ""}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isActive ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {emp.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-indigo-700" : "text-gray-800"}`}>{emp.name}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          {emp.employeeIdentificationNumber}{emp.departmentName && ` · ${emp.departmentName}`}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
      <Icon className="w-3.5 h-3.5" />{cfg.label}
    </span>
  );
};

const StatCard = ({ label, value, Icon, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  </div>
);

const FilterPill = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
      active ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`}>
    {label}
  </button>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ cls = "w-4 h-4" }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ─── Section (collapsible) ────────────────────────────────────────────────────
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

// ─── InfoRowDetail ────────────────────────────────────────────────────────────
const InfoRowDetail = ({ icon: Icon, label, value }) => (
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

// ─── Multi-Level Approval Timeline ────────────────────────────────────────────
const ApprovalTimeline = ({ approvals = [] }) => {
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
        const isLocked    = getLockState(idx);
        const isLast      = idx === levels.length - 1;
        const status      = record?.status || (isLocked ? "LOCKED" : "WAITING");
        const approverName = record?.approverName || record?.employeeName || null;
        const actionAt    = record?.approvedAt || record?.actionAt || null;
        const notes       = record?.notes || null;

        let iconEl, iconWrap, lineColor;
        if (status === "APPROVED") {
          iconEl    = <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />;
          iconWrap  = "bg-emerald-50 border-emerald-300";
          lineColor = "bg-emerald-200";
        } else if (status === "REJECTED") {
          iconEl    = <HiOutlineXCircle className="w-4 h-4 text-red-500" />;
          iconWrap  = "bg-red-50 border-red-300";
          lineColor = "bg-gray-200";
        } else if (status === "LOCKED") {
          iconEl    = <HiOutlineLockClosed className="w-4 h-4 text-gray-300" />;
          iconWrap  = "bg-gray-50 border-gray-200";
          lineColor = "bg-gray-100";
        } else {
          iconEl    = <HiOutlineDotsCircleHorizontal className="w-4 h-4 text-amber-500" />;
          iconWrap  = "bg-amber-50 border-amber-300";
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
                {status === "WAITING"  && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Menunggu</span>}
                {status === "LOCKED"   && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Terkunci</span>}
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

// ─── Detail Modal (rich, dari approval page) ──────────────────────────────────
const DetailModal = ({ overtime, onClose, onApprove, onReject, actionLoading, actionError, isAdmin }) => {
  if (!overtime) return null;

  const sCfg         = STATUS_CONFIG[overtime.status] || STATUS_CONFIG.PENDING;
  const canAct       = isAdmin && overtime.status === "PENDING";
  const initials     = overtime.employeeName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
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

  return (
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
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sCfg.className}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sCfg.dot}`} />
                  {sCfg.label}
                </span>
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
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

          {/* Hero card — indigo theme untuk overtime */}
          <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">Tanggal Lembur</p>
                <p className="text-xl font-bold text-indigo-700">{fmtDate(overtime.date)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-indigo-500 font-mono">
                    {overtime.startTime ? format(new Date(overtime.startTime), "HH:mm") : "—"}
                    {" → "}
                    {overtime.endTime ? format(new Date(overtime.endTime), "HH:mm") : "—"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                    <HiOutlineClock className="w-3 h-3" />
                    {fmtHours(overtime.totalHours)}
                  </span>
                </div>
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

          {/* Error */}
          {actionError && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />{actionError}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {/* Pengaju */}
          <Section title="Informasi Pengaju">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm bg-indigo-100 flex items-center justify-center">
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

          {/* Detail Lembur */}
          <Section title="Detail Lembur">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRowDetail icon={HiOutlineCalendar}    label="Tanggal"        value={fmtDate(overtime.date)} />
              <InfoRowDetail icon={HiOutlineShieldCheck} label="Tipe Lembur"    value={TYPE_LABELS[overtime.type] || overtime.type} />
              <InfoRowDetail icon={HiOutlineClock}       label="Waktu Mulai"    value={fmt(overtime.startTime)} />
              <InfoRowDetail icon={HiOutlineClock}       label="Waktu Selesai"  value={fmt(overtime.endTime)} />
              <InfoRowDetail
                icon={HiOutlineClipboardList}
                label="Total Jam"
                value={
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    {fmtHours(overtime.totalHours)}
                  </span>
                }
              />
              {overtime.approvedBy && (
                <InfoRowDetail icon={HiOutlineUser} label="Diproses Oleh" value={`#${overtime.approvedBy}`} />
              )}
            </div>
          </Section>

          {/* Approval Timeline */}
          <Section title={`Alur Approval (${approvedCount}/${totalLevels} Selesai)`}>
            <ApprovalTimeline approvals={approvals} />
          </Section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          {canAct ? (
            <div className="space-y-2">
              {/* Level progress bar */}
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
                <button
                  onClick={() => onReject(overtime.id)} disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50">
                  {actionLoading ? <Spinner /> : <HiOutlineX className="w-4 h-4" />}
                  Tolak
                </button>
                <button
                  onClick={() => onApprove(overtime.id)} disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50">
                  {actionLoading ? <Spinner /> : <HiOutlineCheck className="w-4 h-4" />}
                  {approvedCount < totalLevels - 1 ? `Approve Level ${approvedCount + 1}` : "Final Approve"}
                </button>
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border ${sCfg.className}`}>
              <span className={`w-2 h-2 rounded-full ${sCfg.dot}`} />
              Request sudah {sCfg.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Create Modal ─────────────────────────────────────────────────────────────

const CreateOvertimeModal = ({
  onClose, onSubmit, isLoading, actionError,
  employees, loadingEmployees, selectedEmployee, onEmployeeChange,
  initialDate, initialCheckOut, onClearInitialData,
}) => {
  const [form, setForm] = useState({ type: "WORKDAY", startTime: "", endTime: "", description: "" });

  useEffect(() => {
    if (initialDate) {
      let formattedStartTime = "";
      if (initialCheckOut && initialCheckOut !== "—") {
        formattedStartTime = `${initialDate}T${initialCheckOut}`;
      }
      setForm((prev) => ({ ...prev, startTime: formattedStartTime, endTime: "" }));
    }
  }, [initialDate, initialCheckOut]);

  const hasEmployeeError = !selectedEmployee;
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    const payload = {
      employeeId: Number(selectedEmployee.id),
      type: form.type,
      startTime: form.startTime,
      endTime: form.endTime,
      description: form.description || null,
    };
    try { await onSubmit(payload); if (onClearInitialData) onClearInitialData(); } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ajukan Lembur</h2>
            <p className="text-sm text-gray-500 mt-0.5">Isi detail pengajuan lembur karyawan</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <HiOutlineX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {actionError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />{actionError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Karyawan <span className="text-red-500">*</span>
            </label>
            <EmployeeDropdown employees={employees} loadingEmployees={loadingEmployees}
              selectedEmployee={selectedEmployee} onChange={onEmployeeChange} error={hasEmployeeError} />
            {hasEmployeeError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <HiOutlineExclamationCircle className="w-3.5 h-3.5" />Silakan pilih karyawan terlebih dahulu
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Lembur</label>
            <div className="relative">
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400">
                <option value="WORKDAY">Hari Kerja</option>
                <option value="HOLIDAY">Hari Libur</option>
              </select>
              <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Waktu Mulai <span className="text-red-500">*</span>
            </label>
            <input type="datetime-local" required value={form.startTime} max={`${today}T23:59`}
              onChange={(e) => set("startTime", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
            {initialCheckOut && initialCheckOut !== "—" && (
              <p className="text-xs text-gray-400 mt-1">Pre-filled dari jam checkout: {initialCheckOut}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Waktu Selesai <span className="text-red-500">*</span>
            </label>
            <input type="datetime-local" required value={form.endTime} min={form.startTime || undefined}
              onChange={(e) => set("endTime", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
          </div>

          {form.startTime && form.endTime && new Date(form.endTime) > new Date(form.startTime) && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
              <HiOutlineClock className="w-4 h-4 text-indigo-500 shrink-0" />
              <p className="text-sm text-indigo-700 font-medium">
                Total: {fmtHours((new Date(form.endTime) - new Date(form.startTime)) / 1000 / 3600)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Jelaskan pekerjaan yang dilakukan saat lembur..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isLoading || !selectedEmployee}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isLoading ? "Mengirim..." : "Ajukan Lembur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ onNew, isAdmin }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
      <HiOutlineClipboardList className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-800 mb-1">Belum ada data lembur</h3>
    <p className="text-sm text-gray-400 max-w-xs">
      {isAdmin ? "Belum ada pengajuan lembur dari karyawan." : "Ajukan lembur jika kamu bekerja di luar jam kerja normal."}
    </p>
    {!isAdmin && (
      <button onClick={onNew}
        className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
        <HiOutlinePlus className="w-4 h-4" />Ajukan Lembur Pertama
      </button>
    )}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const Overtime = ({ role = "employee", employeeId, adminId }) => {
  const location = useLocation();
  const isAdmin = role === "admin";

  const { employees, loadingEmployees, fetchEmployees } = useEmployee();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [autoOpenModal, setAutoOpenModal] = useState(false);
  const [initialModalData, setInitialModalData] = useState({ date: "", checkOut: "" });

  const {
    overtimes, stats, loading, error, actionLoading, actionError,
    isModalOpen, isDetailModalOpen, selectedOvertime, filterStatus, filterType,
    fetchOvertimes, openCreateModal, closeCreateModal, openDetailModal, closeDetailModal,
    setFilterStatus, setFilterType, handleCreate, handleApprove, handleReject, handleRefresh,
  } = useOvertime({ role, employeeId, adminId });

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { fetchOvertimes(); }, [role, employeeId]);

  useEffect(() => {
    if (employeeId && employees.length > 0 && !selectedEmployee) {
      const emp = employees.find((e) => e.id === Number(employeeId));
      if (emp) setSelectedEmployee(emp);
    }
  }, [employeeId, employees, selectedEmployee]);

  useEffect(() => {
    const { state } = location;
    if (state?.openModal && state?.action === "overtime") {
      setAutoOpenModal(true);
      const selectedDate  = state.selectedDate || "";
      const attendanceData = state.attendanceData || {};
      const navEmployeeId = state.employeeId;

      if (navEmployeeId && employees.length > 0) {
        const emp = employees.find((e) => e.id === Number(navEmployeeId));
        if (emp) setSelectedEmployee(emp);
      }

      let checkOutTime = "";
      if (attendanceData.checkOut) {
        try {
          const d = new Date(attendanceData.checkOut);
          if (!isNaN(d)) checkOutTime = format(d, "HH:mm");
        } catch (_) {}
      }

      setInitialModalData({ date: selectedDate, checkOut: checkOutTime });
      window.history.replaceState({}, document.title);
    }
  }, [location, employees]);

  useEffect(() => {
    const { state } = location;
    if (!state?.employeeId || employees.length === 0) return;
    if (selectedEmployee?.id === Number(state.employeeId)) return;
    const emp = employees.find((e) => e.id === Number(state.employeeId));
    if (emp) setSelectedEmployee(emp);
  }, [employees]);

  useEffect(() => {
    if (autoOpenModal && !isModalOpen) { openCreateModal(); setAutoOpenModal(false); }
  }, [autoOpenModal, isModalOpen, openCreateModal]);

  const handleCloseModal = () => {
    closeCreateModal();
    setInitialModalData({ date: "", checkOut: "" });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overtime</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola pengajuan dan rekap lembur karyawan</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh}
            className="p-2.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors" title="Refresh">
            <HiOutlineRefresh className="w-4 h-4" />
          </button>
          {!isAdmin && (
            <button onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
              <HiOutlinePlus className="w-4 h-4" />Ajukan Lembur
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total"    value={stats.total}    Icon={HiOutlineClipboardList} accent="bg-indigo-50 text-indigo-500" />
        <StatCard label="Pending"  value={stats.pending}  Icon={HiOutlineClock}         accent="bg-amber-50 text-amber-500" />
        <StatCard label="Approved" value={stats.approved} Icon={HiOutlineCheckCircle}   accent="bg-emerald-50 text-emerald-500" />
        <StatCard label="Rejected" value={stats.rejected} Icon={HiOutlineXCircle}       accent="bg-red-50 text-red-500" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <HiOutlineFilter className="w-4 h-4 text-gray-400 shrink-0" />
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
              <FilterPill key={s} label={s === "ALL" ? "Semua" : STATUS_CONFIG[s]?.label ?? s}
                active={filterStatus === s} onClick={() => setFilterStatus(s)} />
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["ALL", "WORKDAY", "HOLIDAY"].map((t) => (
              <FilterPill key={t} label={t === "ALL" ? "Semua Tipe" : TYPE_LABELS[t]}
                active={filterType === t} onClick={() => setFilterType(t)} />
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : overtimes.length === 0 ? (
          <EmptyState onNew={openCreateModal} isAdmin={isAdmin} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Karyawan", "Tanggal", "Tipe", "Mulai", "Selesai", "Total Jam", "Status", "Diajukan", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overtimes.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-indigo-600">{o.employeeName?.charAt(0)?.toUpperCase() ?? "?"}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{o.employeeName}</p>
                          <p className="text-xs text-gray-400">#{o.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                        <HiOutlineCalendar className="w-3.5 h-3.5 text-gray-400" />{fmtDate(o.date)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        o.type === "HOLIDAY" ? "bg-orange-50 text-orange-700" : "bg-indigo-50 text-indigo-700"
                      }`}>
                        {TYPE_LABELS[o.type] ?? o.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-sm font-mono">
                      {o.startTime ? format(new Date(o.startTime), "HH:mm") : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-sm font-mono">
                      {o.endTime ? format(new Date(o.endTime), "HH:mm") : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                        <HiOutlineClock className="w-3 h-3" />{fmtHours(o.totalHours)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{fmt(o.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => openDetailModal(o)}
                        className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-gray-400 hover:text-indigo-600" title="Lihat detail">
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {(isModalOpen || autoOpenModal) && (
        <CreateOvertimeModal
          onClose={handleCloseModal}
          onSubmit={handleCreate}
          isLoading={actionLoading}
          actionError={actionError}
          employees={employees}
          loadingEmployees={loadingEmployees}
          selectedEmployee={selectedEmployee}
          onEmployeeChange={setSelectedEmployee}
          initialDate={initialModalData.date}
          initialCheckOut={initialModalData.checkOut}
          onClearInitialData={() => setInitialModalData({ date: "", checkOut: "" })}
        />
      )}

      {/* Detail Modal — rich version dari approval page */}
      {isDetailModalOpen && (
        <DetailModal
          overtime={selectedOvertime}
          onClose={closeDetailModal}
          onApprove={handleApprove}
          onReject={handleReject}
          actionLoading={actionLoading}
          actionError={actionError}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default Overtime;
