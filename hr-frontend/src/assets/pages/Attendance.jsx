import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineBan,
  HiOutlineCalendar, HiOutlineUser, HiOutlineOfficeBuilding,
  HiOutlineSearch, HiOutlineChevronDown, HiOutlineRefresh,
  HiOutlineChevronLeft, HiOutlineChevronRight,
} from "react-icons/hi";
import { useAttendance } from "../../redux/hooks/useAttendance";

const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const monthFull   = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const weekDays    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const getDate     = (att) => att.date;
const getStatus   = (att) => att.status?.toUpperCase();

const fmtTime = (t) => {
  if (!t) return "-";
  const d = new Date(t);
  if (isNaN(d)) return "-";
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

// Heatmap color berdasarkan status
const getActivityColor = (status) => {
  switch (status) {
    case "PRESENT": return "bg-green-500 hover:bg-green-600";
    case "LATE":    return "bg-yellow-400 hover:bg-yellow-500";
    case "LEAVE":   return "bg-purple-400 hover:bg-purple-500";
    case "ABSENT":  return "bg-red-400 hover:bg-red-500";
    default:        return "bg-gray-100 hover:bg-gray-200";
  }
};

// ─── Employee Dropdown ────────────────────────────────────────────────────────

const EmployeeDropdown = ({ employees, loadingEmployees, selectedEmployee, onChange }) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref                 = useRef(null);

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
    <div className="relative w-full sm:w-72" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
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
            ) : filtered.map((emp) => {
              const isActive = emp.id === selectedEmployee?.id;
              return (
                <li key={emp.id}>
                  <button
                    type="button"
                    onClick={() => { onChange(emp); setOpen(false); setSearch(""); }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors ${isActive ? "bg-indigo-50" : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isActive ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {emp.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-indigo-700" : "text-gray-800"}`}>{emp.name}</p>
                      <p className="text-xs text-gray-400 font-mono">
                        {emp.employeeIdentificationNumber}
                        {emp.departmentName && ` · ${emp.departmentName}`}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Monthly Calendar (Full Width) ───────────────────────────────────────────

const MonthCalendar = ({ year, month, attendanceMap }) => {
  const today       = new Date();
  const firstDay    = new Date(year, month, 1);
  const startDow    = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getDayAtt = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return attendanceMap[dateStr] || null;
  };

  const isToday  = (day) => day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  const isWeekend = (idx) => idx % 7 === 5 || idx % 7 === 6;

  const pillStyle = (status) => {
    switch (status) {
      case "PRESENT": return { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500",  label: "Hadir"       };
      case "LATE":    return { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Terlambat"   };
      case "LEAVE":   return { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", label: "Izin"        };
      case "ABSENT":  return { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500",    label: "Tidak Hadir" };
      default: return null;
    }
  };

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
        <p className="text-base font-semibold text-gray-800">{monthFull[month]} {year}</p>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"].map((d, i) => (
          <div key={d} className={`text-center text-xs font-semibold py-3 ${i >= 5 ? "text-orange-400" : "text-gray-500"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      {rows.map((row, ri) => (
        <div key={ri} className={`grid grid-cols-7 ${ri < rows.length - 1 ? "border-b border-gray-100" : ""}`}>
          {row.map((day, ci) => {
            const att     = getDayAtt(day);
            const status  = att?.status?.toUpperCase();
            const pill    = pillStyle(status);
            const today_  = isToday(day);
            const weekend = isWeekend(ci);

            return (
              <div
                key={ci}
                className={`min-h-[90px] p-2 border-r border-gray-100 last:border-r-0
                  ${!day ? "bg-gray-50/50" : ""}
                  ${weekend && day ? "bg-orange-50/30" : ""}
                `}
              >
                {day && (
                  <>
                    {/* Tanggal */}
                    <div className="mb-1.5">
                      <span className={`text-sm font-semibold w-7 h-7 inline-flex items-center justify-center rounded-full
                        ${today_ ? "bg-indigo-600 text-white" : weekend ? "text-orange-400" : "text-gray-700"}
                      `}>
                        {day}
                      </span>
                    </div>

                    {/* Status pill */}
                    {pill && (
                      <div className={`group relative rounded-md px-2 py-1 ${pill.bg} cursor-default w-full`}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pill.dot}`} />
                          <span className={`text-xs font-medium truncate ${pill.text}`}>
                            {pill.label}
                          </span>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 z-30 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                          <p className="font-semibold">{pill.label}</p>
                          {att?.checkIn && (
                            <p className="text-gray-300 mt-0.5">
                              Masuk: {fmtTime(att.checkIn)}
                            </p>
                          )}
                          {att?.checkOut && (
                            <p className="text-gray-300">
                              Keluar: {fmtTime(att.checkOut)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AttendanceDashboard = () => {
  const {
    attendances, loading, error, employees, loadingEmployees,
    loadEmployees, loadAttendance, dismissError, resetAttendance,
  } = useAttendance();

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedYear, setSelectedYear]         = useState(new Date().getFullYear());
  const [calPage, setCalPage]                   = useState(0);

  useEffect(() => { loadEmployees(); }, []);

  useEffect(() => {
    if (selectedEmployee?.id) loadAttendance(selectedEmployee.id);
    else resetAttendance();
  }, [selectedEmployee]);

  useEffect(() => { setCalPage(0); }, [selectedEmployee]);

  // Map date → attendance
  const attendanceMap = useMemo(() => {
    const map = {};
    attendances.forEach((att) => {
      const d = getDate(att);
      if (d) map[d] = att;
    });
    return map;
  }, [attendances]);

  // Daftar bulan yang ada data, diurutkan terbaru
  const availableMonths = useMemo(() => {
    if (!attendances.length) return [];
    const set = new Set();
    attendances.forEach((att) => {
      const d = getDate(att);
      if (d) set.add(d.slice(0, 7)); // "2026-03"
    });
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [attendances]);

  const MONTHS_PER_PAGE = 1; // 1 bulan full-width per halaman
  const pagedMonths     = useMemo(() => {
    const start = calPage * MONTHS_PER_PAGE;
    return availableMonths.slice(start, start + MONTHS_PER_PAGE);
  }, [availableMonths, calPage]);
  const totalPages = Math.ceil(availableMonths.length / MONTHS_PER_PAGE);

  // Summary
  const summary = useMemo(() => ({
    present: attendances.filter((a) => getStatus(a) === "PRESENT").length,
    late:    attendances.filter((a) => getStatus(a) === "LATE").length,
    leave:   attendances.filter((a) => getStatus(a) === "LEAVE").length,
    absent:  attendances.filter((a) => getStatus(a) === "ABSENT").length,
  }), [attendances]);

  const stats = useMemo(() => {
    const total = attendances.length;
    const { present, late, leave, absent } = summary;
    return {
      total, present, late, leave, absent,
      attendanceRate:  total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0,
      punctualityRate: (present + late) > 0 ? ((present / (present + late)) * 100).toFixed(1) : 0,
    };
  }, [attendances, summary]);

  // Heatmap — status-based coloring
  const heatmapData = useMemo(() => {
    if (!attendances.length) return { weeks: [] };

    const statusMap = {};
    attendances.forEach((att) => {
      const d = getDate(att);
      if (d) statusMap[d] = att.status?.toUpperCase();
    });

    const cursor = new Date(selectedYear, 0, 1);
    const dow    = cursor.getDay();
    cursor.setDate(cursor.getDate() + (dow === 0 ? -6 : 1 - dow));

    const weeks = [];
    const endDate = new Date(selectedYear, 11, 31);
    while (cursor <= endDate || weeks.length < 53) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = cursor.toISOString().split("T")[0];
        week.push({ dateStr, status: statusMap[dateStr] || null });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
      if (cursor.getFullYear() > selectedYear && weeks.length >= 52) break;
    }
    return { weeks };
  }, [attendances, selectedYear]);

  const availableYears = useMemo(() => {
    const years = attendances.map((a) => new Date(getDate(a)).getFullYear()).filter((y) => !isNaN(y));
    return [...new Set(years)].sort((a, b) => b - a);
  }, [attendances]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-500 text-sm">Memuat data absensi…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center max-w-md">
        <HiOutlineXCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <button onClick={dismissError} className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm">Tutup</button>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 md:px-6 py-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <HiOutlineCalendar className="w-6 h-6 text-indigo-600" />
              Dashboard Absensi
            </h1>
            <p className="text-xs text-gray-400 mt-1">Jam kerja: 08:00 – 16:00 (Senin – Jumat)</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <EmployeeDropdown
              employees={employees}
              loadingEmployees={loadingEmployees}
              selectedEmployee={selectedEmployee}
              onChange={setSelectedEmployee}
            />
            <button
              onClick={() => selectedEmployee?.id && loadAttendance(selectedEmployee.id)}
              disabled={!selectedEmployee}
              className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-40 transition-colors flex-shrink-0"
              title="Refresh"
            >
              <HiOutlineRefresh className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedEmployee && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
              <HiOutlineUser className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-indigo-700">{selectedEmployee.name}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-500">
              NIK: <span className="font-mono text-gray-700 ml-1">{selectedEmployee.employeeIdentificationNumber}</span>
            </div>
            {selectedEmployee.departmentName && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-700">
                <HiOutlineOfficeBuilding className="w-4 h-4 text-gray-400" />
                {selectedEmployee.departmentName}
              </div>
            )}
            {selectedEmployee.jobTitle && (
              <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-gray-700">{selectedEmployee.jobTitle}</div>
            )}
          </div>
        )}

        {!selectedEmployee && (
          <p className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">
            Pilih karyawan dari dropdown untuk melihat data absensi.
          </p>
        )}
      </div>

      {attendances.length > 0 && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Hari Kerja",  value: stats.total,               sub: "Hari tercatat",     color: "blue"   },
              { label: "Tingkat Kehadiran", value: `${stats.attendanceRate}%`,  sub: "Hadir + Terlambat", color: "green"  },
              { label: "Tingkat Ketepatan", value: `${stats.punctualityRate}%`, sub: "Tepat waktu",       color: "yellow" },
              { label: "Izin Diambil",      value: stats.leave,               sub: "Hari izin",         color: "purple" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-4 border border-${color}-200`}>
                <p className={`text-sm text-${color}-600 font-medium`}>{label}</p>
                <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value}</p>
                <p className={`text-xs text-${color}-500 mt-1`}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Summary + Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Ringkasan Absensi</h2>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: HiOutlineCheckCircle, val: stats.present, label: "Hadir",       color: "green"  },
                  { icon: HiOutlineXCircle,     val: stats.absent,  label: "Tidak Hadir", color: "red"    },
                  { icon: HiOutlineClock,       val: stats.late,    label: "Terlambat",   color: "yellow" },
                  { icon: HiOutlineBan,         val: stats.leave,   label: "Izin",        color: "purple" },
                ].map(({ icon: Icon, val, label, color }) => (
                  <div key={label} className={`text-center p-4 rounded-lg bg-${color}-50 hover:scale-105 transition-transform`}>
                    <Icon className={`w-8 h-8 text-${color}-500 mx-auto mb-2`} />
                    <div className={`text-2xl font-bold text-${color}-700`}>{val}</div>
                    <div className={`text-xs text-${color}-600 font-medium`}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Peta Aktivitas</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Hover untuk lihat tanggal & status</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Legend */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                      {[
                        { color: "bg-green-500",  label: "Hadir"       },
                        { color: "bg-yellow-400", label: "Terlambat"   },
                        { color: "bg-purple-400", label: "Izin"        },
                        { color: "bg-red-400",    label: "Absen"       },
                      ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-sm ${color}`} />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                    {availableYears.length > 0 && (
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(+e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Month labels */}
                  <div className="flex ml-8 mb-2">
                    {monthLabels.map((m) => (
                      <div key={m} className="text-xs text-gray-400 flex-1" style={{ minWidth: 40 }}>{m}</div>
                    ))}
                  </div>
                  <div className="flex">
                    {/* Day labels */}
                    <div className="flex flex-col mr-2 gap-1 pt-1">
                      {weekDays.map((d) => (
                        <div key={d} className="text-xs text-gray-400 h-3 leading-3">{d}</div>
                      ))}
                    </div>
                    {/* Cells */}
                    <div className="flex gap-1 flex-1">
                      {heatmapData.weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-1 flex-1">
                          {week.map((day, di) => (
                            <div
                              key={di}
                              className={`w-full aspect-square rounded-sm cursor-pointer group relative transition-colors
                                ${getActivityColor(day.status)}
                              `}
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                                {day.dateStr}
                                {day.status && ` · ${
                                  day.status === "PRESENT" ? "Hadir" :
                                  day.status === "LATE"    ? "Terlambat" :
                                  day.status === "LEAVE"   ? "Izin" :
                                  day.status === "ABSENT"  ? "Tidak Hadir" : day.status
                                }`}
                                {!day.status && " · Tidak ada data"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kalender Bulanan Full Width */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Absensi Bulanan</h2>
                <p className="text-xs text-gray-400 mt-0.5">Hover tanggal untuk lihat jam masuk & keluar</p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalPage((p) => Math.min(p + 1, totalPages - 1))}
                    disabled={calPage >= totalPages - 1}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
                  >
                    <HiOutlineChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xs text-gray-500 min-w-[60px] text-center">
                    {pagedMonths[0] ? (() => { const [y,m] = pagedMonths[0].split("-"); return `${monthFull[+m-1]} ${y}`; })() : ""}
                  </span>
                  <button
                    onClick={() => setCalPage((p) => Math.max(p - 1, 0))}
                    disabled={calPage <= 0}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
                  >
                    <HiOutlineChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {pagedMonths.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">Tidak ada data</p>
              ) : (
                <div className="space-y-6">
                  {pagedMonths.map((ym) => {
                    const [y, m] = ym.split("-").map(Number);
                    return (
                      <MonthCalendar
                        key={ym}
                        year={y}
                        month={m - 1}
                        attendanceMap={attendanceMap}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {attendances.length === 0 && !loading && selectedEmployee && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <HiOutlineCalendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-700 mb-1">Tidak Ada Data Absensi</h3>
          <p className="text-sm text-gray-400">
            Belum ada catatan absensi untuk <span className="font-medium">{selectedEmployee.name}</span>.
          </p>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
        {selectedEmployee
          ? `Data absensi: ${selectedEmployee.name} (${selectedEmployee.employeeIdentificationNumber}) · Jam kerja: 08:00 – 16:00`
          : "Pilih karyawan dari dropdown untuk melihat data absensi"}
      </p>
    </div>
  );
};

export default AttendanceDashboard;