import React, { useState, useEffect, useRef } from 'react';
import {
  HiOutlineBell,
  HiOutlineMenu,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineUserAdd,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineCurrencyDollar,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import { useLocation } from 'react-router-dom';

// ── Route → title map ──────────────────────────────────────────────────────
const ROUTE_TITLES = {
  '/':                   { title: 'Dashboard',        sub: 'Selamat datang kembali' },
  '/dashboard':          { title: 'Dashboard',        sub: 'Ringkasan aktivitas perusahaan' },
  '/employees':          { title: 'Employees',        sub: 'Manajemen data karyawan' },
  '/employees/add':      { title: 'Add Employee',     sub: 'Tambah karyawan baru' },
  '/departments':        { title: 'Departments',      sub: 'Struktur departemen' },
  '/departments/add':    { title: 'Add Department',   sub: 'Buat departemen baru' },
  '/companies':          { title: 'Company',          sub: 'Data & profil perusahaan' },
  '/companies/add':      { title: 'Add Company',      sub: 'Daftarkan perusahaan baru' },
  '/attendance':         { title: 'Attendance',       sub: 'Rekap kehadiran karyawan' },
  '/timeoff':            { title: 'Time Off',         sub: 'Pengajuan & persetujuan cuti' },
  '/payroll':            { title: 'Payroll',          sub: 'Penggajian & slip gaji' },
  '/reimbursement':      { title: 'Reimbursement',    sub: 'Klaim & penggantian biaya' },
  '/settings':           { title: 'Settings',         sub: 'Pengaturan aplikasi' },
  '/profile':            { title: 'My Profile',       sub: 'Informasi akun Anda' },
  '/help':               { title: 'Help & Support',   sub: 'Pusat bantuan & dokumentasi' },
};

const getRouteInfo = (pathname) => {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (/\/employees\/.+\/edit/.test(pathname))   return { title: 'Edit Employee',   sub: 'Ubah data karyawan' };
  if (/\/departments\/.+\/edit/.test(pathname)) return { title: 'Edit Department', sub: 'Ubah data departemen' };
  if (/\/companies\/.+\/edit/.test(pathname))   return { title: 'Edit Company',    sub: 'Ubah data perusahaan' };
  return { title: 'PeopleFlow', sub: 'PT Alpha Beta Engineering' };
};

// ── Notifications ──────────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  {
    id: 1, type: 'leave', title: 'Pengajuan Cuti',
    message: 'Budi Santoso (Engineering) mengajukan cuti 3 hari mulai 10 Maret 2026.',
    time: '5 menit lalu', read: false,
    icon: <HiOutlineBriefcase className="w-4 h-4" />,
    iconColor: 'text-blue-600', iconBg: 'bg-blue-100', dot: 'bg-blue-500',
  },
  {
    id: 2, type: 'late', title: 'Keterlambatan Check-in',
    message: 'Dewi Rahayu (QA) terlambat masuk 20 menit — 07:20 WIB.',
    time: '30 menit lalu', read: false,
    icon: <HiOutlineClock className="w-4 h-4" />,
    iconColor: 'text-orange-600', iconBg: 'bg-orange-100', dot: 'bg-orange-500',
  },
  {
    id: 3, type: 'new_employee', title: 'Karyawan Baru',
    message: 'Raka Pratama resmi bergabung sebagai Junior Engineer di divisi Sipil.',
    time: '1 jam lalu', read: false,
    icon: <HiOutlineUserAdd className="w-4 h-4" />,
    iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100', dot: 'bg-indigo-500',
  },
  {
    id: 4, type: 'approved', title: 'Reimbursement Disetujui',
    message: 'Klaim perjalanan dinas Andi Wijaya (Procurement) Rp 1.250.000 telah disetujui.',
    time: '2 jam lalu', read: true,
    icon: <HiOutlineCheckCircle className="w-4 h-4" />,
    iconColor: 'text-green-600', iconBg: 'bg-green-100', dot: 'bg-green-500',
  },
  {
    id: 5, type: 'rejected', title: 'Lembur Ditolak',
    message: 'Pengajuan lembur Sari Kusuma (Finance) pada 8 Maret ditolak oleh manajer.',
    time: '3 jam lalu', read: true,
    icon: <HiOutlineXCircle className="w-4 h-4" />,
    iconColor: 'text-red-600', iconBg: 'bg-red-100', dot: 'bg-red-500',
  },
  {
    id: 6, type: 'payroll', title: 'Payroll Siap Diproses',
    message: 'Penggajian bulan Maret 2026 untuk 147 karyawan menunggu persetujuan.',
    time: '5 jam lalu', read: true,
    icon: <HiOutlineCurrencyDollar className="w-4 h-4" />,
    iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100', dot: 'bg-yellow-500',
  },
  {
    id: 7, type: 'document', title: 'Kontrak Segera Habis',
    message: 'Kontrak kerja 4 karyawan PKWT akan berakhir dalam 14 hari ke depan.',
    time: '8 jam lalu', read: true,
    icon: <HiOutlineDocumentText className="w-4 h-4" />,
    iconColor: 'text-purple-600', iconBg: 'bg-purple-100', dot: 'bg-purple-500',
  },
  {
    id: 8, type: 'birthday', title: 'Ulang Tahun Hari Ini 🎂',
    message: 'Hari ini Hendra Gunawan (Manajer Operasional) merayakan ulang tahun ke-38.',
    time: '9 jam lalu', read: true,
    icon: <HiOutlineCalendar className="w-4 h-4" />,
    iconColor: 'text-pink-600', iconBg: 'bg-pink-100', dot: 'bg-pink-500',
  },
];

const DAYS   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// ── Component ──────────────────────────────────────────────────────────────
const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();

  const [currentDate,       setCurrentDate]       = useState('');
  const [routeInfo,         setRouteInfo]         = useState({ title: '', sub: '' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled,        setIsScrolled]        = useState(false);
  const [notifications,     setNotifications]     = useState(INITIAL_NOTIFICATIONS);
  const [animateTitle,      setAnimateTitle]      = useState(false);

  const notifRef  = useRef(null);
  const buttonRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const now = new Date();
    setCurrentDate(`${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`);
  }, []);

  useEffect(() => {
    setAnimateTitle(false);
    const t = setTimeout(() => {
      setRouteInfo(getRouteInfo(location.pathname));
      setAnimateTitle(true);
    }, 60);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (
        notifRef.current  && !notifRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead  = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()   => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const clearAll    = ()   => setNotifications([]);

  return (
    <nav className={`fixed top-0 right-0 lg:left-64 h-20 z-30 transition-all duration-500 ${
      isScrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20'
        : 'bg-white border-b border-gray-200 shadow-sm'
    }`}>

      <div className="h-full px-8 flex items-center justify-between">

        {/* LEFT — title */}
        <div className="flex items-center space-x-4">
          <button onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <HiOutlineMenu className="w-6 h-6" />
          </button>

          <div className={`transition-all duration-300 ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{routeInfo.title}</h2>
            <div className="flex items-center space-x-2 mt-0.5">
              <HiOutlineOfficeBuilding className="w-3 h-3 text-indigo-400" />
              <p className="text-xs text-gray-400">{routeInfo.sub}</p>
              <span className="text-gray-300">·</span>
              <p className="text-xs text-gray-400">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center space-x-3 relative">

          {/* Company badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
            <HiOutlineOfficeBuilding className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-medium text-indigo-700">PT Alpha Beta Engineering</span>
          </div>

          {/* Bell */}
          <button
            ref={buttonRef}
            onClick={() => setShowNotifications(p => !p)}
            className={`relative p-2.5 rounded-xl transition-all duration-200 ${
              showNotifications
                ? 'bg-indigo-100 text-indigo-600'
                : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <HiOutlineBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-0.5 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {showNotifications && (
            <div
              ref={notifRef}
              className="absolute top-full right-0 mt-3 w-[22rem] rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-50 bg-white"
              style={{ animation: 'slideDown 0.2s ease' }}
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Notifikasi</h3>
                  <p className="text-[10px] text-indigo-200 mt-0.5">PT Alpha Beta Engineering</p>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-semibold rounded-full">
                    {unreadCount} baru
                  </span>
                )}
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <button onClick={markAllRead} className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    Tandai semua dibaca
                  </button>
                  <button onClick={clearAll} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                    Hapus semua
                  </button>
                </div>
              )}

              {/* List */}
              <div className="max-h-[26rem] overflow-y-auto divide-y divide-gray-50">
                {notifications.length > 0 ? notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${!notif.read ? 'bg-indigo-50/40' : ''}`}
                  >
                    <div className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg ${notif.iconBg} ${notif.iconColor} flex items-center justify-center shadow-sm`}>
                      {notif.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-semibold leading-snug ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <span className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${notif.dot}`} />}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 flex flex-col items-center text-gray-400">
                    <HiOutlineBell className="w-10 h-10 text-gray-200 mb-3" />
                    <p className="text-sm font-medium">Tidak ada notifikasi</p>
                    <p className="text-xs text-gray-300 mt-1">Semua sudah terbaca</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                    Lihat semua notifikasi →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
