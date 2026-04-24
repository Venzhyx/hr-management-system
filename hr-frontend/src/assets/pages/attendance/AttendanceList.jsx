// src/pages/attendance/AttendanceList.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  HiOutlineSearch, HiOutlineClock, HiOutlineCalendar, HiOutlineUser,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationCircle,
  HiOutlineRefresh, HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineChevronDown, HiOutlineOfficeBuilding, HiOutlineEye,
  HiOutlineLocationMarker, HiOutlineCamera, HiOutlineX,
} from 'react-icons/hi';
import { useAttendance } from '../../../redux/hooks/useAttendance';

const PER_PAGE = 10;

const STATUS_CONFIG = {
  PRESENT: { label: 'Present', color: 'bg-green-100 text-green-700',   icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  LATE:    { label: 'Late',    color: 'bg-yellow-100 text-yellow-700', icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  ABSENT:  { label: 'Absent',  color: 'bg-red-100 text-red-700',       icon: <HiOutlineXCircle className="w-3.5 h-3.5" /> },
};

const WORK_TYPE_CONFIG = {
  WFO: { label: 'WFO', color: 'bg-blue-100 text-blue-700' },
  WFH: { label: 'WFH', color: 'bg-purple-100 text-purple-700' },
  WFA: { label: 'WFA', color: 'bg-orange-100 text-orange-700' },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toUpperCase()] ?? { label: status ?? '-', color: 'bg-gray-100 text-gray-600', icon: null };

const getWorkTypeConfig = (type) =>
  WORK_TYPE_CONFIG[type?.toUpperCase()] ?? { label: type ?? '-', color: 'bg-gray-100 text-gray-600' };

const formatTime = (dt) => {
  if (!dt) return '-';
  const d = new Date(dt);
  return isNaN(d) ? '-' : d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dt) => {
  if (!dt) return '-';
  const d = new Date(dt);
  return isNaN(d) ? '-' : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const calcDuration = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '-';
  const diff = (new Date(checkOut) - new Date(checkIn)) / 60000;
  if (diff <= 0) return '-';
  return `${Math.floor(diff / 60)}j ${Math.round(diff % 60)}m`;
};

const formatCoord = (val) => {
  if (val == null || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n.toFixed(5);
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

// ─── Work Type Badge ──────────────────────────────────────────────────────────
const WorkTypeBadge = ({ type }) => {
  const cfg = getWorkTypeConfig(type);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const empName  = item.employee?.name ?? item.employeeName ?? '-';
  const deptName = item.employee?.departmentName ?? item.departmentName ?? item.employee?.department?.name ?? '';
  const photoIn  = item.checkInPhoto  ?? item.check_in_photo  ?? item.photoIn  ?? item.photo ?? null;
  const photoOut = item.checkOutPhoto ?? item.check_out_photo ?? item.photoOut ?? null;
  const lat      = item.latitude  ?? item.lat  ?? null;
  const lng      = item.longitude ?? item.long ?? item.lng ?? null;
  const workType = item.workType  ?? item.work_type ?? null;
  const mapsUrl  = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {empName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{empName}</p>
              {deptName && <p className="text-xs text-gray-400">{deptName}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Tanggal',    value: formatDate(item.date) },
              { label: 'Status',     value: <StatusBadge status={item.status} /> },
              { label: 'Check In',   value: formatTime(item.checkIn) },
              { label: 'Check Out',  value: formatTime(item.checkOut) },
              { label: 'Durasi',     value: calcDuration(item.checkIn, item.checkOut) },
              { label: 'Tipe Kerja', value: workType ? <WorkTypeBadge type={workType} /> : '-' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <div className="text-sm font-medium text-gray-800">{value}</div>
              </div>
            ))}
          </div>

          {/* Lokasi */}
          {(lat || lng) && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                Lokasi Absen
              </p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-mono text-gray-700">
                  {formatCoord(lat)}, {formatCoord(lng)}
                </p>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    Buka Maps ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Foto */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Foto Check In',  url: photoIn },
              { label: 'Foto Check Out', url: photoOut },
            ].map(({ label, url }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                  <HiOutlineCamera className="w-3.5 h-3.5" />
                  {label}
                </p>
                {url ? (
                  <img
                    src={url}
                    alt={label}
                    className="w-full h-36 object-cover rounded-xl border border-gray-200"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-36 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                    Tidak ada foto
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 10 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-gray-100 rounded w-full" />
      </td>
    ))}
  </tr>
);

// ─── Employee Dropdown ────────────────────────────────────────────────────────
const EmployeeDropdown = ({ employees, loadingEmployees, selectedEmployee, onChange }) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const ref                 = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredEmps = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.employeeIdentificationNumber?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const selectedObj = employees.find((e) => String(e.id) === String(selectedEmployee));

  return (
    <div className="relative w-full sm:w-72" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-sm"
      >
        <div className="flex items-center gap-2 min-w-0">
          <HiOutlineUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {selectedObj ? (
            <span className="truncate text-gray-800 font-medium text-sm">
              {selectedObj.name}
              {selectedObj.employeeIdentificationNumber && (
                <span className="ml-1.5 text-gray-400 font-normal font-mono text-xs">
                  ({selectedObj.employeeIdentificationNumber})
                </span>
              )}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">
              {loadingEmployees ? 'Memuat...' : '— Pilih Karyawan —'}
            </span>
          )}
        </div>
        <HiOutlineChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <HiOutlineSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Cari nama atau NIK..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {loadingEmployees ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">Memuat...</li>
            ) : filteredEmps.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">Tidak ditemukan</li>
            ) : (
              filteredEmps.map((emp) => {
                const isActive = String(emp.id) === String(selectedEmployee);
                return (
                  <li key={emp.id}>
                    <button
                      type="button"
                      onClick={() => { onChange(emp.id); setOpen(false); setSearch(''); }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors ${isActive ? 'bg-indigo-50' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {emp.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>
                          {emp.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono truncate">
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

// ─── Main ─────────────────────────────────────────────────────────────────────
const AttendanceList = () => {
  const {
    attendances, employees, loading, loadingEmployees, error,
    loadEmployees, loadAttendance, resetAttendance,
  } = useAttendance();

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [filterStatus, setFilterStatus]         = useState('');
  const [filterDate, setFilterDate]             = useState('');
  const [search, setSearch]                     = useState('');
  const [page, setPage]                         = useState(1);
  const [detailItem, setDetailItem]             = useState(null);

  useEffect(() => {
    loadEmployees();
    return () => resetAttendance();
  }, []);

  useEffect(() => {
    if (selectedEmployee) { setPage(1); loadAttendance(selectedEmployee); }
    else resetAttendance();
  }, [selectedEmployee]);

  // Sort terbaru di atas, lalu filter
  const filtered = useMemo(() => {
    const sorted = [...attendances].sort((a, b) => {
      const da = new Date(a.date ?? a.checkIn ?? 0);
      const db = new Date(b.date ?? b.checkIn ?? 0);
      return db - da;
    });
    return sorted.filter((item) => {
      const empName     = (item.employee?.name ?? item.employeeName ?? '').toLowerCase();
      const matchSearch = !search       || empName.includes(search.toLowerCase());
      const matchStatus = !filterStatus || item.status?.toUpperCase() === filterStatus;
      const matchDate   = !filterDate   || (item.date ?? '').startsWith(filterDate);
      return matchSearch && matchStatus && matchDate;
    });
  }, [attendances, search, filterStatus, filterDate]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const selectedObj = employees.find((e) => String(e.id) === String(selectedEmployee));

  const handleReset = useCallback(() => {
    setSelectedEmployee(''); setFilterStatus(''); setFilterDate(''); setSearch(''); setPage(1);
  }, []);

  const hasFilter = selectedEmployee || filterStatus || filterDate || search;

  const COLUMNS = ['No', 'Karyawan', 'Tanggal', 'Check In', 'Check Out', 'Durasi', 'Tipe', 'Lokasi', 'Status', 'Aksi'];

  return (
    <div className="space-y-5 px-4 sm:px-6 py-4 sm:py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance List</h1>
          <p className="text-sm text-gray-500 mt-0.5">Riwayat absensi karyawan — terbaru di atas</p>
        </div>
        <button
          onClick={() => selectedEmployee && loadAttendance(selectedEmployee)}
          disabled={!selectedEmployee || loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-start sm:self-auto"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <EmployeeDropdown
            employees={employees}
            loadingEmployees={loadingEmployees}
            selectedEmployee={selectedEmployee}
            onChange={setSelectedEmployee}
          />

          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white appearance-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
            </select>
            <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Date */}
          <div className="relative">
            <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {hasFilter && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>

        {/* Info karyawan terpilih */}
        {selectedObj && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-lg">
              <HiOutlineUser className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">{selectedObj.name}</span>
            </div>
            {selectedObj.employeeIdentificationNumber && (
              <div className="px-3 py-1 bg-gray-50 rounded-lg text-xs text-gray-500 font-mono">
                NIK: {selectedObj.employeeIdentificationNumber}
              </div>
            )}
            {selectedObj.departmentName && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg">
                <HiOutlineOfficeBuilding className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">{selectedObj.departmentName}</span>
              </div>
            )}
            {filtered.length > 0 && (
              <div className="px-3 py-1 bg-gray-50 rounded-lg text-xs text-gray-500">
                {filtered.length} record
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border-b border-red-100 text-red-600 text-sm">
            <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" />
            {typeof error === 'string' ? error : 'Gagal memuat data. Coba refresh.'}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {COLUMNS.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !selectedEmployee ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-gray-400">
                    <HiOutlineUser className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Pilih karyawan untuk melihat riwayat absensi</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-gray-400">
                    <HiOutlineClock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada data absensi</p>
                    {(filterStatus || filterDate || search) && (
                      <button
                        onClick={() => { setFilterStatus(''); setFilterDate(''); setSearch(''); }}
                        className="mt-2 text-xs text-indigo-600 hover:underline block mx-auto"
                      >
                        Hapus filter
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => {
                  const empName  = item.employee?.name ?? item.employeeName ?? '-';
                  const deptName = item.employee?.departmentName ?? item.departmentName ?? item.employee?.department?.name ?? '';
                  const initial  = empName !== '-' ? empName.charAt(0).toUpperCase() : '?';
                  const lat      = item.latitude  ?? item.lat  ?? null;
                  const lng      = item.longitude ?? item.long ?? item.lng ?? null;
                  const workType = item.workType  ?? item.work_type ?? null;
                  const lngFmt   = formatCoord(lng);
                  const mapsUrl  = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

                  return (
                    <tr key={item.id ?? idx} className="hover:bg-indigo-50/30 transition-colors">
                      {/* No */}
                      <td className="px-4 py-3.5 text-gray-400 tabular-nums text-xs">
                        {(page - 1) * PER_PAGE + idx + 1}
                      </td>

                      {/* Karyawan */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs flex-shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 leading-tight text-sm">{empName}</p>
                            {deptName && <p className="text-xs text-gray-400">{deptName}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Tanggal */}
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-sm">
                        {formatDate(item.date)}
                      </td>

                      {/* Check In */}
                      <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap tabular-nums text-sm">
                        {formatTime(item.checkIn)}
                      </td>

                      {/* Check Out */}
                      <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap tabular-nums text-sm">
                        {formatTime(item.checkOut)}
                      </td>

                      {/* Durasi */}
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-sm">
                        {calcDuration(item.checkIn, item.checkOut)}
                      </td>

                      {/* Tipe WFO/WFH/WFA */}
                      <td className="px-4 py-3.5">
                        {workType
                          ? <WorkTypeBadge type={workType} />
                          : <span className="text-gray-300 text-xs">—</span>
                        }
                      </td>

                      {/* Lokasi (longitude + link maps) */}
                      <td className="px-4 py-3.5">
                        {lngFmt ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs text-gray-600">{lngFmt}</span>
                            {mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors"
                              >
                                <HiOutlineLocationMarker className="w-3 h-3" />
                                Maps
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && paginated.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Menampilkan{' '}
              <span className="font-medium text-gray-700">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)}
              </span>
              {' '}dari{' '}
              <span className="font-medium text-gray-700">{filtered.length}</span> data
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                }
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-xs rounded-lg border transition-colors ${
                      p === page
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailItem && (
        <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  );
};

export default AttendanceList;