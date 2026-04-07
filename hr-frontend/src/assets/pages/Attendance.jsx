import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HiOutlineXCircle, HiOutlineCalendar, HiOutlineUser, HiOutlineOfficeBuilding,
  HiOutlineSearch, HiOutlineChevronDown, HiOutlineRefresh,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineInformationCircle,
} from "react-icons/hi";
import { useAttendance } from "../../redux/hooks/useAttendance";

const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const monthFull   = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const weekDays    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const getDate   = (att) => att.date;
const getStatus = (att) => att.status?.toUpperCase();

const fmtTime = (t) => {
  if (!t) return "-";
  const d = new Date(t);
  if (isNaN(d)) return "-";
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

const getActivityColor = (status) => {
  switch (status) {
    case "PRESENT": return "bg-green-500 hover:bg-green-600";
    case "LATE":    return "bg-yellow-400 hover:bg-yellow-500";
    case "ABSENT":  return "bg-red-400 hover:bg-red-500";
    default:        return "bg-gray-100 hover:bg-gray-200";
  }
};

// ─── Status Icon ──────────────────────────────────────────────────────────────

const StatusIcon = ({ status }) => {
  if (status === "PRESENT") return (
    <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full bg-green-500 flex-shrink-0">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
  if (status === "ABSENT") return (
    <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full bg-red-500 flex-shrink-0">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path d="M3 3l4 4M7 3l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </span>
  );
  if (status === "LATE") return (
    <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full bg-yellow-400 flex-shrink-0">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="3.5" stroke="white" strokeWidth="1.2"/>
        <path d="M5 3.5V5l1 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
  return null;
};

const statusLabel = (status) => {
  if (status === "PRESENT") return "Attend";
  if (status === "ABSENT")  return "Non Present";
  if (status === "LATE")    return "Late";
  return "";
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

// ─── Monthly Calendar ─────────────────────────────────────────────────────────

const MonthCalendar = ({ year, month, attendanceMap }) => {
  const today       = new Date();
  const firstDay    = new Date(year, month, 1);
  const startDow    = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getDayAtt  = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return attendanceMap[dateStr] || null;
  };
  const isToday   = (day) => day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  const isWeekend = (idx) => idx % 7 === 5 || idx % 7 === 6;

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <p className="text-sm font-semibold text-gray-700">{monthFull[month]} {year}</p>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
          <div key={d} className={`text-left text-xs font-semibold px-3 py-2 border-r border-gray-100 last:border-r-0 ${i >= 5 ? "text-orange-400" : "text-gray-500"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Date rows */}
      {rows.map((row, ri) => (
        <div key={ri} className={`grid grid-cols-7 ${ri < rows.length - 1 ? "border-b border-gray-100" : ""}`}>
          {row.map((day, ci) => {
            const att     = getDayAtt(day);
            const status  = att?.status?.toUpperCase();
            const today_  = isToday(day);
            const weekend = isWeekend(ci);

            return (
              <div
                key={ci}
                className={`min-h-[60px] px-2 py-2 border-r border-gray-100 last:border-r-0
                  ${!day ? "bg-gray-50/50" : ""}
                  ${weekend && day ? "bg-orange-50/30" : ""}
                `}
              >
                {day && (
                  /* date number + status icon + label all inline in one row */
                  <div className="flex items-center gap-1 flex-wrap group relative">
                    <span className={`text-sm font-medium inline-flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0
                      ${today_ ? "bg-indigo-600 text-white" : weekend ? "text-orange-400" : "text-gray-600"}
                    `}>
                      {day}
                    </span>

                    {status ? (
                      <>
                        <StatusIcon status={status} />
                        <span className={`text-xs font-medium
                          ${status === "PRESENT" ? "text-green-700" : status === "ABSENT" ? "text-red-600" : "text-yellow-600"}
                        `}>
                          {statusLabel(status)}
                        </span>
                        {(att?.checkIn || att?.checkOut) && (
                          <div className="absolute top-full left-0 mt-1 z-30 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                            <p className="font-semibold mb-0.5">{statusLabel(status)}</p>
                            {att?.checkIn  && <p className="text-gray-300">Masuk: {fmtTime(att.checkIn)}</p>}
                            {att?.checkOut && <p className="text-gray-300">Keluar: {fmtTime(att.checkOut)}</p>}
                          </div>
                        )}
                      </>
                    ) : weekend ? (
                      <span className="text-xs text-orange-300">Weekend</span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─── Attendance Summary Card ──────────────────────────────────────────────────

const AttendanceSummary = ({ present, absent, late }) => {
  const items = [
    {
      label: "Present",
      value: String(present).padStart(2, "0"),
      bg: "bg-green-600",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4" width="14" height="13" rx="2" stroke="white" strokeWidth="1.5"/>
          <path d="M7 2v4M13 2v4M3 8h14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M6.5 12l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Absents",
      value: String(absent).padStart(2, "0"),
      bg: "bg-red-500",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4" width="14" height="13" rx="2" stroke="white" strokeWidth="1.5"/>
          <path d="M7 2v4M13 2v4M3 8h14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7 12l6 4M13 12l-6 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Lates",
      value: String(late).padStart(2, "0"),
      bg: "bg-amber-500",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="11" r="6" stroke="white" strokeWidth="1.5"/>
          <path d="M10 8v3l2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 3h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-800">Attendance Summary</h2>
        <HiOutlineInformationCircle className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        {items.map(({ label, value, bg, icon }) => (
          <div key={label} className="flex flex-col items-center py-5 px-3">
            <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center mb-2`}>
              {icon}
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-xl font-bold text-gray-800 tabular-nums">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Activity Heatmap — 6-month paged ────────────────────────────────────────

const ActivityHeatmap = ({ attendances, selectedYear, setSelectedYear, availableYears }) => {
  const [halfPage, setHalfPage] = useState(0); // 0 = Jan–Jun, 1 = Jul–Dec

  const statusMap = useMemo(() => {
    const map = {};
    attendances.forEach((att) => {
      const d = att.date;
      if (d) map[d] = att.status?.toUpperCase();
    });
    return map;
  }, [attendances]);

  const { weeks, visibleMonths } = useMemo(() => {
    const startMonth = halfPage === 0 ? 0 : 6;
    const endMonth   = halfPage === 0 ? 5 : 11;
    const visibleMonths = monthLabels.slice(startMonth, endMonth + 1);

    const cursor = new Date(selectedYear, startMonth, 1);
    const dow = cursor.getDay();
    cursor.setDate(cursor.getDate() + (dow === 0 ? -6 : 1 - dow));

    const endDate = new Date(selectedYear, endMonth + 1, 0);
    const weeks = [];
    while (cursor <= endDate) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = cursor.toISOString().split("T")[0];
        const inRange = cursor.getMonth() >= startMonth && cursor.getMonth() <= endMonth && cursor.getFullYear() === selectedYear;
        week.push({ dateStr, status: inRange ? (statusMap[dateStr] || null) : null, inRange });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    return { weeks, visibleMonths };
  }, [statusMap, selectedYear, halfPage]);

  const halfLabel = halfPage === 0 ? `Jan – Jun ${selectedYear}` : `Jul – Des ${selectedYear}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Activity</h2>
          <p className="text-xs text-gray-400 mt-0.5">Hover untuk lihat tanggal & status</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {[
              { color: "bg-green-500",  label: "Hadir"     },
              { color: "bg-yellow-400", label: "Terlambat" },
              { color: "bg-red-400",    label: "Absen"     },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          {/* Year select */}
          {availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(+e.target.value); setHalfPage(0); }}
              className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {/* Half-year nav */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHalfPage(0)}
              disabled={halfPage === 0}
              className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
            >
              <HiOutlineChevronLeft className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <span className="text-xs text-gray-500 min-w-[96px] text-center">{halfLabel}</span>
            <button
              onClick={() => setHalfPage(1)}
              disabled={halfPage === 1}
              className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
            >
              <HiOutlineChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Month labels */}
        <div className="flex ml-7 mb-1.5">
          {visibleMonths.map((m) => (
            <div key={m} className="text-xs text-gray-400 flex-1">{m}</div>
          ))}
        </div>
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-1.5 gap-[3px] pt-0.5 w-6 flex-shrink-0">
            {weekDays.map((d) => (
              <div key={d} className="text-xs text-gray-400 h-3 leading-3">{d}</div>
            ))}
          </div>
          {/* Week columns */}
          <div className="flex gap-[3px] flex-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px] flex-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-full aspect-square rounded-sm cursor-pointer group relative transition-colors
                      ${day.inRange ? getActivityColor(day.status) : "bg-transparent"}
                    `}
                  >
                    {day.inRange && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                        {day.dateStr}
                        {day.status && ` · ${
                          day.status === "PRESENT" ? "Hadir" :
                          day.status === "LATE"    ? "Terlambat" :
                          day.status === "ABSENT"  ? "Tidak Hadir" : day.status
                        }`}
                        {!day.status && " · Tidak ada data"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
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

  const attendanceMap = useMemo(() => {
    const map = {};
    attendances.forEach((att) => {
      const d = getDate(att);
      if (d) map[d] = att;
    });
    return map;
  }, [attendances]);

  const availableMonths = useMemo(() => {
    if (!attendances.length) return [];
    const set = new Set();
    attendances.forEach((att) => {
      const d = getDate(att);
      if (d) set.add(d.slice(0, 7));
    });
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [attendances]);

  const MONTHS_PER_PAGE = 1;
  const pagedMonths = useMemo(() => {
    const start = calPage * MONTHS_PER_PAGE;
    return availableMonths.slice(start, start + MONTHS_PER_PAGE);
  }, [availableMonths, calPage]);
  const totalPages = Math.ceil(availableMonths.length / MONTHS_PER_PAGE);

  const summary = useMemo(() => ({
    present: attendances.filter((a) => getStatus(a) === "PRESENT").length,
    late:    attendances.filter((a) => getStatus(a) === "LATE").length,
    absent:  attendances.filter((a) => getStatus(a) === "ABSENT").length,
  }), [attendances]);

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
          {/* Summary (kiri, kecil) + Activity (kanan, besar 2:1) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 items-start">
            <AttendanceSummary
              present={summary.present}
              absent={summary.absent}
              late={summary.late}
            />
            <ActivityHeatmap
              attendances={attendances}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              availableYears={availableYears}
            />
          </div>

          {/* Kalender Bulanan */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Absensi Bulanan</h2>
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
                  <span className="text-xs text-gray-500 min-w-[100px] text-center">
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
