import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePlay,
  HiOutlineDocumentText,
  HiOutlineCollection,
  HiOutlineUserCircle,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardCheck,
  HiOutlineChevronRight,
  HiOutlineInbox,
} from 'react-icons/hi';
import usePayroll from '../../../redux/hooks/usePayroll';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const formatRp = (val) => {
  if (val == null) return 'Rp 0';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const now   = new Date();
const MONTH = now.getMonth() + 1;
const YEAR  = now.getFullYear();

const StatCard = ({ icon: Icon, label, value, sub, iconClass, bgClass }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-4 items-start">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
      <Icon className={`w-5 h-5 ${iconClass}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-lg font-bold text-gray-800 truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const MenuCard = ({ icon: Icon, title, desc, path, iconClass, bgClass, onClick }) => (
  <button
    onClick={() => onClick(path)}
    className="group bg-white rounded-2xl border-2 border-gray-200 p-5 text-left w-full
               hover:border-indigo-400 hover:shadow-md transition-all duration-200 select-none"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors
                     ${bgClass} group-hover:bg-indigo-600`}>
      <Icon className={`w-6 h-6 transition-colors ${iconClass} group-hover:text-white`} />
    </div>
    <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{title}</p>
    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{desc}</p>
    <div className="flex justify-end mt-3 text-gray-300 group-hover:text-indigo-400 transition-colors">
      <HiOutlineChevronRight className="w-4 h-4" />
    </div>
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    DRAFT:     'bg-yellow-50 text-yellow-700 border border-yellow-200',
    FINALIZED: 'bg-blue-50 text-blue-700 border border-blue-200',
    PAID:      'bg-green-50 text-green-700 border border-green-200',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
};

const PayrollIndex = () => {
  const navigate = useNavigate();
  const { run, loading } = usePayroll();

  // Fetch riwayat dari backend saat mount
  // Jika endpoint belum ada, fallback otomatis ke localStorage (tidak crash)
  useEffect(() => { run.fetchAll(); }, []);

  // FIX: pakai run.history (persist di localStorage) bukan run.result (hilang saat refresh)
  const history = run.history ?? [];
  const lastRun = history[0] ?? null;

  const statEmployees = lastRun?.totalEmployees ?? '-';
  const statSuccess   = lastRun?.successCount   ?? '-';
  const statSkipped   = lastRun?.skippedCount   ?? 0;
  const statNet       = lastRun?.payslips
    ? lastRun.payslips.reduce((acc, p) => acc + Number(p.netSalary ?? 0), 0)
    : null;

  const menus = [
    {
      icon: HiOutlinePlay,
      title: 'Run Payroll',
      desc: 'Jalankan penggajian bulanan untuk semua karyawan aktif.',
      path: '/payroll/run',
      bgClass: 'bg-blue-100',
      iconClass: 'text-blue-600',
    },
    {
      icon: HiOutlineDocumentText,
      title: 'Payslip',
      desc: 'Lihat & unduh slip gaji karyawan per periode.',
      path: '/payroll/slips',
      bgClass: 'bg-green-100',
      iconClass: 'text-green-600',
    },
    {
      icon: HiOutlineCollection,
      title: 'Salary Components',
      desc: 'Kelola komponen earning & deduction yang digunakan saat run payroll.',
      path: '/payroll/components',
      bgClass: 'bg-purple-100',
      iconClass: 'text-purple-600',
    },
    {
      icon: HiOutlineUserCircle,
      title: 'Employee Salary',
      desc: 'Set gaji pokok dan komponen per karyawan.',
      path: '/payroll/employee-salary',
      bgClass: 'bg-orange-100',
      iconClass: 'text-orange-600',
    },
  ];

  const stats = [
    {
      icon: HiOutlineUsers,
      label: 'Total Karyawan Diproses',
      value: loading ? '...' : statEmployees,
      sub: lastRun ? lastRun.periodLabel : 'Belum ada run',
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
    },
    {
      icon: HiOutlineCheckCircle,
      label: 'Payslip Berhasil',
      value: loading ? '...' : statSuccess,
      sub: statSkipped > 0 ? `${statSkipped} di-skip` : 'Semua berhasil',
      bgClass: 'bg-green-50',
      iconClass: 'text-green-600',
    },
    {
      icon: HiOutlineCurrencyDollar,
      label: 'Total Net Salary',
      value: loading ? '...' : (statNet != null ? formatRp(statNet) : '-'),
      sub: lastRun?.periodLabel ?? '',
      bgClass: 'bg-yellow-50',
      iconClass: 'text-yellow-600',
    },
    {
      icon: HiOutlineClipboardCheck,
      label: 'Status Terakhir',
      value: lastRun?.status ?? '-',
      sub: lastRun ? `ID #${lastRun.id}` : 'Belum ada run',
      bgClass: 'bg-purple-50',
      iconClass: 'text-purple-600',
    },
  ];

  return (
    <div className="w-full px-4 md:px-6 py-6 space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {MONTHS[MONTH - 1]} {YEAR}
          </p>
        </div>
        <button
          onClick={() => navigate('/payroll/run')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white
                     text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <HiOutlinePlay className="w-4 h-4" />
          Run Payroll
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Menu Cards ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Menu</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {menus.map((m) => (
            <MenuCard key={m.path} {...m} onClick={navigate} />
          ))}
        </div>
      </div>

      {/* ── Riwayat Run ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Riwayat Payroll Run
          </h2>
          {history.length > 0 && (
            <button
              onClick={() => {
                localStorage.removeItem('payroll_run_history');
                window.location.reload();
              }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Reset riwayat
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <HiOutlineInbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">Belum ada riwayat payroll</p>
              <p className="text-sm mt-1">Klik "Run Payroll" untuk memulai penggajian</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Periode','Status','Karyawan','Berhasil','Di-skip','Total Net',''].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                        h === '' || h === 'Periode' || h === 'Status' ? 'text-left' : 'text-right'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((row) => {
                  const totalNet = row.payslips
                    ? row.payslips.reduce((acc, p) => acc + Number(p.netSalary ?? 0), 0)
                    : 0;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{row.periodLabel}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={row.status} /></td>
                      <td className="px-5 py-3.5 text-right text-gray-600">{row.totalEmployees}</td>
                      <td className="px-5 py-3.5 text-right text-green-600 font-medium">{row.successCount}</td>
                      <td className="px-5 py-3.5 text-right text-yellow-600">{row.skippedCount}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-800">{formatRp(totalNet)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => navigate('/payroll/slips')}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
                        >
                          Lihat Slip
                          <HiOutlineChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default PayrollIndex;
