import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineMinusCircle,
  HiOutlineClock,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDotsVertical,
  HiOutlineDownload,
  HiOutlineDocumentDownload,
  HiOutlinePlusCircle,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import usePayroll from '../../../redux/hooks/usePayroll';
import { useEmployee } from '../../../redux/hooks/useEmployee';
import { payrollApi } from '../../../ApiService/payrollApi'; // sesuaikan path jika berbeda

// ── Constants ────────────────────────────────────────────────────────────────
const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

const formatRp = (val) => {
  if (val == null || val === '') return 'Rp 0';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const now = new Date();

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const normalized = (status ?? '').toString().trim().toUpperCase();
  const styles = {
    DRAFT:     'bg-yellow-50 text-yellow-700 border border-yellow-200',
    FINALIZED: 'bg-blue-50   text-blue-700   border border-blue-200',
    APPROVED:  'bg-green-50  text-green-700  border border-green-200',
    PAID:      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };
  if (!normalized) return null;
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${styles[normalized] ?? 'bg-gray-100 text-gray-500'}`}>
      {normalized}
    </span>
  );
};

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, sub, subColor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm flex-1 min-w-0 overflow-hidden">
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="min-w-0 flex-1 overflow-hidden">
      <p className="text-xs text-gray-400 font-medium mb-0.5 truncate">{label}</p>
      <p className="text-sm font-bold text-gray-900 truncate leading-tight">{value}</p>
      {sub && <p className={`text-[11px] mt-0.5 font-medium truncate ${subColor ?? 'text-gray-400'}`}>{sub}</p>}
    </div>
  </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, photo, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const dim   = size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const text  = size === 'lg' ? 'text-sm'   : 'text-xs';
  const initial = (name ?? 'U').trim().charAt(0).toUpperCase();

  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setImgError(true)}
        className={`${dim} rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${dim} rounded-full bg-indigo-100 flex items-center justify-center
                     text-indigo-600 font-bold ${text} flex-shrink-0 select-none ring-2 ring-white shadow-sm`}>
      {initial}
    </div>
  );
};

// ── Detail panel ──────────────────────────────────────────────────────────────
const DetailPanel = ({ payslip, emp, onClose, onDownload, downloading }) => {
  if (!payslip) return null;

  const earnings   = payslip.components?.filter(c => c.type === 'EARNING')   ?? [];
  const deductions = payslip.components?.filter(c => c.type === 'DEDUCTION') ?? [];

  const totalEarning   = payslip.totalEarning   ?? (payslip.basicSalary ?? 0);
  const totalDeduction = payslip.totalDeduction ?? 0;

  const photo      = emp?.photo       ?? null;
  const jobTitle   = emp?.jobTitle    ?? emp?.position ?? payslip.jobTitle    ?? '-';
  const department = emp?.departmentName ?? emp?.department ?? payslip.department ?? null;
  const employeeId = emp?.employeeCode ?? payslip.employeeId ?? '-';
  const joinDate   = emp?.joinDate    ?? payslip.joinDate    ?? '-';

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <h3 className="font-semibold text-gray-800 text-sm">Detail Payslip</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <HiOutlineX className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Employee info */}
        <div className="flex items-center gap-3">
          <Avatar name={payslip.employeeName} photo={photo} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 text-sm truncate">{payslip.employeeName ?? '-'}</p>
            <p className="text-xs text-gray-400 truncate">{jobTitle}</p>
            {department && (
              <p className="text-xs text-indigo-500 font-medium truncate">{department}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={payslip.status} />
          </div>
        </div>

        {/* Meta info grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Periode',     value: payslip.periodLabel ?? '-' },
            { label: 'Employee ID', value: employeeId },
            { label: 'Join Date',   value: joinDate },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 overflow-hidden">
              <p className="text-[10px] text-gray-400 mb-1">{label}</p>
              <p className="text-xs font-semibold text-gray-700 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Attendance pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Absen', value: `${payslip.totalAbsent ?? 0} hari`,       color: 'text-red-600' },
            { label: 'Telat',       value: `${payslip.totalLate ?? 0} hari`,         color: 'text-orange-500' },
            { label: 'Lembur',      value: `${payslip.totalOvertimeHours ?? 0} jam`, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 mb-1">{label}</p>
              <p className={`text-sm font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Earnings */}
        <div>
          <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Earnings</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gaji Pokok</span>
              <span className="font-medium text-gray-800">{formatRp(payslip.basicSalary)}</span>
            </div>
            {earnings.map((c, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{c.componentName}</span>
                <span className="font-medium text-gray-800">{formatRp(c.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-2 mt-1">
              <span className="text-green-700">Total Earnings</span>
              <span className="text-green-600">{formatRp(totalEarning)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2">Deductions</p>
          <div className="space-y-2">
            {deductions.length === 0 ? (
              <p className="text-xs text-gray-400">Tidak ada potongan</p>
            ) : deductions.map((c, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{c.componentName}</span>
                <span className="font-medium text-gray-800">{formatRp(c.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-2 mt-1">
              <span className="text-red-600">Total Deductions</span>
              <span className="text-red-500">{formatRp(totalDeduction)}</span>
            </div>
          </div>
        </div>

        {/* Net salary highlight */}
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 font-medium mb-1">NET SALARY</p>
          <p className="text-2xl font-bold text-indigo-600">{formatRp(payslip.netSalary)}</p>
        </div>
      </div>

      {/* Download button */}
      <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={() => onDownload(payslip.id, payslip.employeeName, payslip.periodLabel)}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
                     text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading
            ? <HiOutlineClock className="w-5 h-5 animate-spin" />
            : <HiOutlineDocumentDownload className="w-5 h-5" />
          }
          {downloading ? 'Mengunduh...' : 'Download Payslip PDF'}
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PayrollIndex = () => {
  const navigate = useNavigate();
  const { run, loading }              = usePayroll();
  const { employees, fetchEmployees } = useEmployee();

  const [currentMonth,    setCurrentMonth]    = useState(now.getMonth());
  const [currentYear,     setCurrentYear]     = useState(now.getFullYear());
  const [search,          setSearch]          = useState('');
  const [filterStatus,    setFilterStatus]    = useState('Semua Status');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [page,            setPage]            = useState(1);
  const [perPage,         setPerPage]         = useState(10);
  const [downloading,     setDownloading]     = useState(false);

  useEffect(() => {
    run.fetchAll();
    fetchEmployees();
  }, []);

  const empMap = useMemo(() => {
    const map = {};
    (employees || []).forEach((e) => { map[String(e.id)] = e; });
    return map;
  }, [employees]);

  const history  = run.history ?? [];
  const lastRun  = history[0]  ?? null;
  const allSlips = lastRun?.payslips ?? [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const filtered = allSlips.filter(p => {
    const matchSearch = !search || (p.employeeName ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Semua Status' || (p.status ?? '').toUpperCase() === filterStatus;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  const totalNet       = allSlips.reduce((s, p) => s + Number(p.netSalary      ?? 0), 0);
  const totalDeduction = allSlips.reduce((s, p) => s + Number(p.totalDeduction ?? 0), 0);
  const pendingCount   = allSlips.filter(p => (p.status ?? '').toUpperCase() === 'DRAFT').length;

  // ── Download PDF per payslip (blob) ──────────────────────────────────────
  const handleDownload = async (payslipId, employeeName, periodLabel) => {
    setDownloading(true);
    try {
      const response = await payrollApi.downloadPayslipPdf(payslipId);
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `payslip-${employeeName ?? payslipId}-${periodLabel ?? ''}.pdf`.replace(/\s+/g, '-');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download PDF gagal:', err);
    } finally {
      setDownloading(false);
    }
  };

  const statusOptions = ['Semua Status', 'DRAFT', 'FINALIZED', 'APPROVED', 'PAID'];

  return (
    <div className="flex h-full w-full bg-gray-50 overflow-hidden">

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Payroll</h1>
              <p className="text-sm text-gray-400 mt-0.5">Kelola penggajian karyawan perusahaan Anda</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Month navigator */}
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600 p-0.5 rounded">
                  <HiOutlineChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 px-2">
                  <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700 min-w-[90px] text-center">
                    {MONTHS[currentMonth]} {currentYear}
                  </span>
                  <HiOutlineChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600 p-0.5 rounded">
                  <HiOutlineChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <span className="text-sm text-gray-500">Status:</span>
                <span className="text-sm font-bold text-yellow-600">{lastRun?.status ?? 'DRAFT'}</span>
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              </div>

              {/* Export Excel */}
              <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50
                                 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors">
                <HiOutlineDownload className="w-4 h-4 text-green-600" />
                Export Excel
              </button>

              {/* Download PDF */}
              <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50
                                 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors">
                <HiOutlineDocumentDownload className="w-4 h-4 text-gray-500" />
                Download PDF
              </button>

              {/* Generate Payroll CTA */}
              <button
                onClick={() => navigate('/payroll/run')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white
                           text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <HiOutlinePlusCircle className="w-4 h-4" />
                Generate Payroll
              </button>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="px-6 pt-5 pb-1 flex-shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
            <StatCard
              icon={HiOutlineUsers}
              iconBg="bg-indigo-100" iconColor="text-indigo-600"
              label="Total Karyawan"
              value={loading ? '...' : String(lastRun?.totalEmployees ?? allSlips.length)}
              sub={`Aktif ${lastRun?.totalEmployees ?? allSlips.length} orang`}
              subColor="text-indigo-500"
            />
            <StatCard
              icon={HiOutlineCurrencyDollar}
              iconBg="bg-green-100" iconColor="text-green-600"
              label="Total Gaji"
              value={loading ? '...' : formatRp(totalNet)}
              sub={`Dari ${allSlips.length} karyawan`}
              subColor="text-green-500"
            />
            <StatCard
              icon={HiOutlineMinusCircle}
              iconBg="bg-orange-100" iconColor="text-orange-500"
              label="Total Potongan"
              value={loading ? '...' : formatRp(totalDeduction)}
              sub={totalNet ? `${((totalDeduction / totalNet) * 100).toFixed(1)}% dari total` : '0%'}
              subColor="text-orange-400"
            />
            <StatCard
              icon={HiOutlineClock}
              iconBg="bg-purple-100" iconColor="text-purple-600"
              label="Pending Payroll"
              value={loading ? '...' : String(pendingCount)}
              sub={pendingCount > 0 ? 'Belum di-approve' : 'Semua sudah diproses'}
              subColor={pendingCount > 0 ? 'text-purple-500' : 'text-gray-400'}
            />
          </div>
        </div>

        {/* Table section */}
        <div className="flex-1 px-6 py-4 overflow-hidden flex flex-col min-h-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0">

            {/* Table toolbar */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 flex-wrap flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-700">Daftar Payroll</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari karyawan..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50
                               focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 w-44"
                  />
                </div>

                {/* Status filter */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl
                               bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                  >
                    {statusOptions.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <HiOutlineFilter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>

                <button className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors">
                  <HiOutlineDotsVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-100">
                    {['Karyawan','Basic Salary','Allowance','Deduction','Net Salary','Status','Aksi'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide
                                    ${i === 0 ? 'text-left' : 'text-right'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                        <p className="font-medium">Tidak ada data payroll</p>
                        <p className="text-xs mt-1">Jalankan Generate Payroll terlebih dahulu</p>
                      </td>
                    </tr>
                  ) : paginated.map((p) => {
                    const emp        = empMap[String(p.employeeId)];
                    const photo      = emp?.photo ?? null;
                    const jobTitle   = emp?.jobTitle ?? emp?.position ?? p.jobTitle ?? '-';
                    const department = emp?.departmentName ?? emp?.department ?? null;

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPayslip(p)}
                        className={`hover:bg-indigo-50/40 transition-colors cursor-pointer
                                    ${selectedPayslip?.id === p.id ? 'bg-indigo-50' : ''}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.employeeName} photo={photo} />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 text-xs truncate">{p.employeeName ?? '-'}</p>
                              <p className="text-[11px] text-gray-400 truncate">{jobTitle}</p>
                              {department && (
                                <p className="text-[11px] text-indigo-400 font-medium truncate">{department}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right text-gray-600 text-xs whitespace-nowrap">{formatRp(p.basicSalary)}</td>
                        <td className="px-5 py-3.5 text-right text-gray-600 text-xs whitespace-nowrap">{formatRp(p.totalEarning)}</td>
                        <td className="px-5 py-3.5 text-right text-gray-600 text-xs whitespace-nowrap">{formatRp(p.totalDeduction)}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-gray-900 text-xs whitespace-nowrap">{formatRp(p.netSalary)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {/* Tombol mata → navigate ke halaman detail payslip */}
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/payroll/slips/${p.id}`); }}
                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Lihat Detail"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 flex-wrap gap-2 flex-shrink-0">
              <p className="text-xs text-gray-400">
                Menampilkan {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} dari {filtered.length} karyawan
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50
                             disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <HiOutlineChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 text-xs rounded-lg border transition-colors font-medium
                                  ${page === pg
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="text-gray-400 text-xs">...</span>}
                {totalPages > 5 && (
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`w-7 h-7 text-xs rounded-lg border transition-colors font-medium
                                ${page === totalPages
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50
                             disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <HiOutlineChevronRight className="w-3.5 h-3.5" />
                </button>

                <select
                  value={perPage}
                  onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className="ml-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                >
                  {[10, 25, 50].map(n => <option key={n} value={n}>{n} / halaman</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Panel (right side) ──────────────────────────────────────── */}
      <div
        className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out
                    ${selectedPayslip ? 'w-80 xl:w-96' : 'w-0'}`}
      >
        {selectedPayslip && (
          <DetailPanel
            payslip={selectedPayslip}
            emp={empMap[String(selectedPayslip.employeeId)] ?? null}
            onClose={() => setSelectedPayslip(null)}
            onDownload={handleDownload}
            downloading={downloading}
          />
        )}
      </div>
    </div>
  );
};

export default PayrollIndex;
