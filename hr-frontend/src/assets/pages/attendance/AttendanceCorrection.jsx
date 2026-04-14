import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HiOutlinePencilAlt,
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
} from "react-icons/hi";
import { useAttendanceCorrection } from "../../../redux/hooks/useAttendanceCorrection";
import { useEmployee } from "../../../redux/hooks/useEmployee";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useLocation } from "react-router-dom";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border border-amber-200",    Icon: HiOutlineClock },
  APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border border-emerald-200", Icon: HiOutlineCheckCircle },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-600 border border-red-200",          Icon: HiOutlineXCircle },
};

const TYPE_LABELS = {
  CHECKIN:  "Check-in",
  CHECKOUT: "Check-out",
  BOTH:     "Check-in & Out",
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
const fmtTime = (dt) => {
  if (!dt) return "—";
  try { return format(new Date(dt), "HH:mm"); }
  catch { return "—"; }
};

// ─── Employee Dropdown Component ──────────────────────────────────────────────

const EmployeeDropdown = ({ employees, loadingEmployees, selectedEmployee, onChange, error }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
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
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 border rounded-xl shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm ${
          error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <HiOutlineUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {selectedEmployee ? (
            <span className="truncate text-gray-800 font-medium">
              {selectedEmployee.name}
              <span className="ml-1.5 text-gray-400 font-normal font-mono text-xs">
                ({selectedEmployee.employeeIdentificationNumber})
              </span>
            </span>
          ) : (
            <span className="text-gray-400">
              {loadingEmployees ? "Memuat karyawan…" : "Pilih karyawan"}
            </span>
          )}
        </div>
        <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <HiOutlineSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Cari nama atau NIK…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
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
                    <button
                      type="button"
                      onClick={() => {
                        onChange(emp);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors ${
                        isActive ? "bg-indigo-50" : ""
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isActive ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {emp.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-indigo-700" : "text-gray-800"}`}>
                          {emp.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {emp.employeeIdentificationNumber}
                          {emp.departmentName && ` · ${emp.departmentName}`}
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
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
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
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
      active ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

// ─── Create Modal ─────────────────────────────────────────────────────────────

const CreateCorrectionModal = ({
  onClose,
  onSubmit,
  isLoading,
  actionError,
  employees,
  loadingEmployees,
  selectedEmployee,
  onEmployeeChange,
  initialDate,
  initialCheckIn,
  initialCheckOut,
  initialType,
  onClearInitialData,
}) => {
  const [form, setForm] = useState({
    employeeId: selectedEmployee?.id ?? "",
    date: initialDate ?? "",
    type: initialType ?? "BOTH",
    newCheckIn: "",
    newCheckOut: "",
    description: "",
  });

  // Update form when initial props change (from navigation)
  useEffect(() => {
    if (initialDate) {
      let formattedCheckIn = "";
      let formattedCheckOut = "";

      if (initialCheckIn && initialCheckIn !== "—") {
        formattedCheckIn = `${initialDate}T${initialCheckIn}`;
      }

      if (initialCheckOut && initialCheckOut !== "—") {
        formattedCheckOut = `${initialDate}T${initialCheckOut}`;
      }

      setForm((prev) => ({
        ...prev,
        date: initialDate,
        newCheckIn: formattedCheckIn,
        newCheckOut: formattedCheckOut,
        type: initialType ?? prev.type,
      }));
    }
  }, [initialDate, initialCheckIn, initialCheckOut, initialType]);

  // Update employeeId when selectedEmployee changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      employeeId: selectedEmployee?.id ?? "",
    }));
  }, [selectedEmployee]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId) return;
    const payload = {
      employeeId: Number(form.employeeId),
      date: form.date,
      type: form.type,
      description: form.description || null,
      newCheckIn: form.type === "CHECKIN" || form.type === "BOTH" ? form.newCheckIn || null : null,
      newCheckOut: form.type === "CHECKOUT" || form.type === "BOTH" ? form.newCheckOut || null : null,
    };
    try {
      await onSubmit(payload);
      if (onClearInitialData) onClearInitialData();
    } catch (_) {}
  };

  const needsCI = form.type === "CHECKIN" || form.type === "BOTH";
  const needsCO = form.type === "CHECKOUT" || form.type === "BOTH";
  const today = new Date().toISOString().split("T")[0];
  const hasEmployeeError = !form.employeeId && !selectedEmployee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Buat Koreksi Kehadiran</h2>
            <p className="text-sm text-gray-500 mt-0.5">Isi detail koreksi yang ingin diajukan</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <HiOutlineX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {(actionError || hasEmployeeError) && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
              {hasEmployeeError ? "Silakan pilih karyawan terlebih dahulu" : actionError}
            </div>
          )}

          {/* Employee Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Karyawan <span className="text-red-500">*</span>
            </label>
            <EmployeeDropdown
              employees={employees}
              loadingEmployees={loadingEmployees}
              selectedEmployee={selectedEmployee}
              onChange={onEmployeeChange}
              error={hasEmployeeError}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.date}
              max={today}
              onChange={(e) => set("date", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Koreksi</label>
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              >
                <option value="CHECKIN">Check-in saja</option>
                <option value="CHECKOUT">Check-out saja</option>
                <option value="BOTH">Check-in & Check-out</option>
              </select>
              <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Check-in */}
          {needsCI && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Waktu Check-in Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={form.newCheckIn}
                onChange={(e) => set("newCheckIn", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
              {initialCheckIn && initialCheckIn !== "—" && (
                <p className="text-xs text-gray-400 mt-1">Data lama: {initialCheckIn}</p>
              )}
            </div>
          )}

          {/* Check-out */}
          {needsCO && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Waktu Check-out Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={form.newCheckOut}
                onChange={(e) => set("newCheckOut", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
              {initialCheckOut && initialCheckOut !== "—" && (
                <p className="text-xs text-gray-400 mt-1">Data lama: {initialCheckOut}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alasan / Keterangan</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Jelaskan alasan koreksi kehadiran..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !form.employeeId}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading ? "Mengirim..." : "Ajukan Koreksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const InfoRow = ({ label, value, span }) => (
  <div className={span ? "col-span-2" : ""}>
    <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
  </div>
);

const DetailModal = ({
  correction,
  onClose,
  onApprove,
  onReject,
  actionLoading,
  actionError,
  isAdmin,
}) => {
  if (!correction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Detail Koreksi</h2>
            <p className="text-xs text-gray-400 mt-0.5">ID #{correction.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={correction.status} />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <HiOutlineX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {actionError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
              {actionError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow label="Karyawan" value={correction.employeeName} />
            <InfoRow label="ID Karyawan" value={`#${correction.employeeId}`} />
            <InfoRow label="Tanggal" value={fmtDate(correction.date)} />
            <InfoRow label="Tipe" value={TYPE_LABELS[correction.type] ?? correction.type} />
            {correction.newCheckIn && (
              <InfoRow label="Check-in Baru" value={fmt(correction.newCheckIn)} />
            )}
            {correction.newCheckOut && (
              <InfoRow label="Check-out Baru" value={fmt(correction.newCheckOut)} />
            )}
          </div>

          {correction.description && (
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1.5">Keterangan</p>
              <p className="text-sm text-gray-800 bg-gray-50 rounded-xl p-3 leading-relaxed">
                {correction.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-3 border-t border-gray-100">
            <InfoRow label="Diajukan" value={fmt(correction.createdAt)} />
            {correction.approvedAt && (
              <InfoRow label="Diproses" value={fmt(correction.approvedAt)} />
            )}
          </div>
        </div>

        {isAdmin && correction.status === "PENDING" && (
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => onReject(correction.id)}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {actionLoading ? (
                <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiOutlineXCircle className="w-4 h-4" />
              )}
              Tolak
            </button>
            <button
              onClick={() => onApprove(correction.id)}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {actionLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiOutlineCheckCircle className="w-4 h-4" />
              )}
              Setujui
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ onNew, isAdmin }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
      <HiOutlinePencilAlt className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-800 mb-1">Belum ada koreksi kehadiran</h3>
    <p className="text-sm text-gray-400 max-w-xs">
      {isAdmin
        ? "Belum ada pengajuan koreksi dari karyawan."
        : "Ajukan koreksi jika ada kesalahan data kehadiran kamu."}
    </p>
    {!isAdmin && (
      <button
        onClick={onNew}
        className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
      >
        <HiOutlinePlus className="w-4 h-4" />
        Buat Koreksi Pertama
      </button>
    )}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const AttendanceCorrection = ({ role = "employee", employeeId, adminId }) => {
  const location = useLocation();
  const isAdmin = role === "admin";

  const { employees, loadingEmployees, fetchEmployees } = useEmployee();
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [autoOpenModal, setAutoOpenModal] = useState(false);
  const [initialModalData, setInitialModalData] = useState({
    date: "",
    checkIn: "",
    checkOut: "",
    type: "BOTH",
  });

  const {
    corrections,
    stats,
    loading,
    error,
    actionLoading,
    actionError,
    isModalOpen,
    isDetailModalOpen,
    selectedCorrection,
    filterStatus,
    filterType,
    openCreateModal,
    closeCreateModal,
    openDetailModal,
    closeDetailModal,
    setFilterStatus,
    setFilterType,
    handleCreate,
    handleApprove,
    handleReject,
    handleRefresh,
  } = useAttendanceCorrection({ role, employeeId, adminId });

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Set selected employee from props (employee mode)
  useEffect(() => {
    if (employeeId && employees.length > 0 && !selectedEmployee) {
      const emp = employees.find((e) => e.id === Number(employeeId));
      if (emp) setSelectedEmployee(emp);
    }
  }, [employeeId, employees, selectedEmployee]);

  // ✅ FIX: Baca employeeId dari navigation state dan auto-select employee
  useEffect(() => {
    const { state } = location;
    if (state?.openModal && state?.action === "correction") {
      setAutoOpenModal(true);

      const selectedDate = state.selectedDate || "";
      const attendanceData = state.attendanceData || {};
      const navEmployeeId = state.employeeId; // ✅ sekarang tersedia dari Dashboard

      // ✅ FIX: Auto-select employee dari navigation state saat employees sudah loaded
      if (navEmployeeId && employees.length > 0) {
        const emp = employees.find((e) => e.id === Number(navEmployeeId));
        if (emp) setSelectedEmployee(emp);
      }

      let checkInTime = "";
      let checkOutTime = "";
      let correctionType = "BOTH";

      if (attendanceData.checkIn) {
        try {
          const checkInDate = new Date(attendanceData.checkIn);
          if (!isNaN(checkInDate)) {
            checkInTime = format(checkInDate, "HH:mm");
          }
        } catch (e) {
          console.error("Error parsing checkIn:", e);
        }
      }

      if (attendanceData.checkOut) {
        try {
          const checkOutDate = new Date(attendanceData.checkOut);
          if (!isNaN(checkOutDate)) {
            checkOutTime = format(checkOutDate, "HH:mm");
          }
        } catch (e) {
          console.error("Error parsing checkOut:", e);
        }
      }

      if (checkInTime && !checkOutTime) correctionType = "CHECKIN";
      else if (!checkInTime && checkOutTime) correctionType = "CHECKOUT";
      else if (checkInTime && checkOutTime) correctionType = "BOTH";
      else correctionType = "BOTH";

      setInitialModalData({
        date: selectedDate,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        type: correctionType,
      });

      window.history.replaceState({}, document.title);
    }
  }, [location, employees]);

  // ✅ FIX: Tambah useEffect terpisah untuk handle kasus employees belum loaded
  // saat navigation state pertama kali dibaca
  useEffect(() => {
    const { state } = location;
    if (!state?.employeeId || employees.length === 0) return;
    if (selectedEmployee?.id === Number(state.employeeId)) return;

    const emp = employees.find((e) => e.id === Number(state.employeeId));
    if (emp) setSelectedEmployee(emp);
  }, [employees]);

  useEffect(() => {
    if (autoOpenModal && !isModalOpen) {
      openCreateModal();
      setAutoOpenModal(false);
    }
  }, [autoOpenModal, isModalOpen, openCreateModal]);

  const handleCloseModal = () => {
    closeCreateModal();
    setInitialModalData({
      date: "",
      checkIn: "",
      checkOut: "",
      type: "BOTH",
    });
  };

  const handleEmployeeChange = (emp) => {
    setSelectedEmployee(emp);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Correction</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola koreksi data kehadiran karyawan</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-4 h-4" />
          </button>
          {!isAdmin && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Buat Koreksi
            </button>
          )}
        </div>
      </div>

      {/* Global error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total"    value={stats.total}    Icon={HiOutlinePencilAlt}   accent="bg-indigo-50 text-indigo-500" />
        <StatCard label="Pending"  value={stats.pending}  Icon={HiOutlineClock}        accent="bg-amber-50 text-amber-500" />
        <StatCard label="Approved" value={stats.approved} Icon={HiOutlineCheckCircle}  accent="bg-emerald-50 text-emerald-500" />
        <StatCard label="Rejected" value={stats.rejected} Icon={HiOutlineXCircle}      accent="bg-red-50 text-red-500" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <HiOutlineFilter className="w-4 h-4 text-gray-400 shrink-0" />
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
              <FilterPill
                key={s}
                label={s === "ALL" ? "Semua" : STATUS_CONFIG[s]?.label ?? s}
                active={filterStatus === s}
                onClick={() => setFilterStatus(s)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["ALL", "CHECKIN", "CHECKOUT", "BOTH"].map((t) => (
              <FilterPill
                key={t}
                label={t === "ALL" ? "Semua Tipe" : TYPE_LABELS[t]}
                active={filterType === t}
                onClick={() => setFilterType(t)}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : corrections.length === 0 ? (
          <EmptyState onNew={openCreateModal} isAdmin={isAdmin} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Diajukan</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {corrections.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-indigo-600">
                            {c.employeeName?.charAt(0)?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{c.employeeName}</p>
                          <p className="text-xs text-gray-400">#{c.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                        <HiOutlineCalendar className="w-3.5 h-3.5 text-gray-400" />
                        {fmtDate(c.date)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                        {TYPE_LABELS[c.type] ?? c.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-sm">{fmtTime(c.newCheckIn)}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-sm">{fmtTime(c.newCheckOut)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{fmt(c.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openDetailModal(c)}
                        className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-gray-400 hover:text-indigo-600"
                        title="Lihat detail"
                      >
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
        <CreateCorrectionModal
          onClose={handleCloseModal}
          onSubmit={handleCreate}
          isLoading={actionLoading}
          actionError={actionError}
          employees={employees}
          loadingEmployees={loadingEmployees}
          selectedEmployee={selectedEmployee}
          onEmployeeChange={handleEmployeeChange}
          initialDate={initialModalData.date}
          initialCheckIn={initialModalData.checkIn}
          initialCheckOut={initialModalData.checkOut}
          initialType={initialModalData.type}
          onClearInitialData={() =>
            setInitialModalData({ date: "", checkIn: "", checkOut: "", type: "BOTH" })
          }
        />
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && (
        <DetailModal
          correction={selectedCorrection}
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

export default AttendanceCorrection;
