import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineExclamation,
  HiOutlinePlay,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import usePayroll from '../../../redux/hooks/usePayroll';
import StatusBadge from '../../components/StatusBadge';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const now = new Date();
const formatRp = (val) => val == null ? 'Rp 0' : 'Rp ' + Number(val).toLocaleString('id-ID');

const RunPayrollPage = () => {
  const navigate = useNavigate();
  const { run, actionLoading, actionError, clearError } = usePayroll();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [done,  setDone]  = useState(false);

  const handleRun = async () => {
    clearError();
    const res = await run.execute(month, year);
    if (res?.meta?.requestStatus === 'fulfilled') setDone(true);
  };

  const handleReset = () => { run.clear(); setDone(false); clearError(); };

  const result = run.result;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/payroll')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                     hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Run Payroll</h1>
          <p className="text-sm text-gray-400 mt-0.5">Jalankan penggajian bulanan</p>
        </div>
      </div>

      {!done ? (
        /* ── Form ────────────────────────────────────────────────────────── */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 flex items-start gap-3">
            <HiOutlineExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Perhatian:</strong> Payroll bersifat <strong>immutable</strong>. Setelah dijalankan,
              tidak bisa diubah. Pastikan data attendance dan overtime sudah final.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Bulan *</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500">
                {MONTHS.map((m, i) => (
                  <option key={i+1} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun *</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500">
                {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-800">Yang akan dihitung:</p>
            <p>• Gaji pokok semua karyawan aktif yang punya EmployeeSalary</p>
            <p>• Earning &amp; deduction dari salary components</p>
            <p>• Upah lembur (overtime APPROVED)</p>
            <p>• Potongan absent &amp; keterlambatan</p>
          </div>

          {actionError && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
              {typeof actionError === 'string' ? actionError : JSON.stringify(actionError)}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={() => navigate('/payroll')}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">
              Batal
            </button>
            <button onClick={handleRun} disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-blue-600
                         hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm">
              {actionLoading ? (
                <>
                  <HiOutlineClock className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <HiOutlinePlay className="w-4 h-4" />
                  Jalankan Payroll {MONTHS[month-1]} {year}
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ── Result ──────────────────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Status banner */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
            <HiOutlineCheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">Payroll berhasil dijalankan!</p>
              <p className="text-sm text-green-700 mt-0.5">
                {result?.periodLabel} · {result?.successCount} payslip dibuat
                {result?.skippedCount > 0 && ` · ${result.skippedCount} di-skip`}
                {result?.failedCount > 0 && ` · ${result.failedCount} gagal`}
              </p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Karyawan', value: result?.totalEmployees, color: 'text-gray-800' },
              { label: 'Berhasil',       value: result?.successCount,   color: 'text-green-600' },
              { label: 'Di-skip',        value: result?.skippedCount,   color: 'text-yellow-600' },
              { label: 'Gagal',          value: result?.failedCount,    color: 'text-red-500' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value ?? 0}</p>
              </div>
            ))}
          </div>

          {/* Payslip table */}
          {result?.payslips?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  Detail Payslip ({result.payslips.length})
                </p>
                <StatusBadge status={result.status} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Karyawan','Gaji Pokok','Lembur','Total Earning','Total Deduction','Net Salary'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.payslips.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{p.employeeName}</td>
                        <td className="px-4 py-3 text-gray-600">{formatRp(p.basicSalary)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatRp(p.overtimePay)}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">{formatRp(p.totalEarning)}</td>
                        <td className="px-4 py-3 text-red-500">{formatRp(p.totalDeduction)}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{formatRp(p.netSalary)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">
              Run Lagi
            </button>
            <button onClick={() => navigate('/payroll/slips')}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
              Lihat Semua Payslip
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunPayrollPage;
