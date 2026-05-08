import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineEye,
  HiOutlineRefresh,
  HiCheck,
} from 'react-icons/hi';
import usePayroll from '../../../redux/hooks/usePayroll';
import { useEmployee } from '../../../redux/hooks/useEmployee';

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];
const now = new Date();
const formatRp = (val) =>
  val == null ? 'Rp 0' : 'Rp ' + Number(val).toLocaleString('id-ID');

// ─── Step Bar ─────────────────────────────────────────────────────────────────
const STEPS = ['Pilih Periode', 'Preview Payroll', 'Review & Konfirmasi', 'Selesai'];

const StepBar = ({ current }) => (
  <div className="flex items-center mb-8">
    {STEPS.map((label, i) => {
      const idx    = i + 1;
      const done   = current > idx;
      const active = current === idx;
      return (
        <React.Fragment key={idx}>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}>
              {done ? <HiCheck className="w-4 h-4" /> : idx}
            </div>
            <span className={`text-xs font-semibold hidden sm:block
              ${done ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 transition-all ${current > idx ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, photo }) => {
  const [err, setErr] = useState(false);
  const initial = (name ?? 'U').charAt(0).toUpperCase();
  if (photo && !err) {
    return (
      <img src={photo} alt={name} onError={() => setErr(true)}
        className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0" />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center
                    text-blue-600 font-bold text-xs flex-shrink-0 select-none">
      {initial}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Pilih Periode
// ─────────────────────────────────────────────────────────────────────────────
const Step1 = ({ month, setMonth, year, setYear, onNext, onCancel }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
    <div>
      <h2 className="text-base font-semibold text-gray-800">Pilih Periode Payroll</h2>
      <p className="text-sm text-gray-400 mt-0.5">Pilih periode yang akan digunakan untuk membuat payroll</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bulan</label>
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tahun</label>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-1.5">
      <p className="font-semibold text-blue-900 mb-2">Informasi</p>
      <p>• Pastikan semua data kehadiran sudah lengkap</p>
      <p>• Komponen gaji dan potongan sudah terisi</p>
      <p>• Payroll yang sudah di-approve tidak dapat diedit</p>
    </div>

    <div className="flex justify-between items-center pt-2">
      <button onClick={onCancel}
        className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">
        Batal
      </button>
      <button onClick={onNext}
        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-blue-600
                   hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm">
        Lanjutkan <HiOutlineChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Preview Payroll
// Memanggil run.execute() untuk mendapat data preview. Hasilnya disimpan ke
// `previewData` (prop dari parent). Tombol "Lanjutkan" hanya pindah step,
// TIDAK memanggil execute lagi.
// ─────────────────────────────────────────────────────────────────────────────
const Step2 = ({ month, year, previewData, empMap, loading, error, onRunPreview, onNext, onBack }) => {
  const periodLabel = `${MONTHS[month - 1]} ${year}`;
  const payslips    = previewData?.payslips ?? [];

  const totalGaji     = payslips.reduce((s, p) => s + Number(p.totalEarning   ?? p.basicSalary ?? 0), 0);
  const totalPotongan = payslips.reduce((s, p) => s + Number(p.totalDeduction ?? 0), 0);
  const totalNet      = payslips.reduce((s, p) => s + Number(p.netSalary      ?? 0), 0);
  const totalKaryawan = previewData?.totalEmployees ?? payslips.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Preview Payroll – {periodLabel}</h2>
        {/* Tombol refresh untuk re-run preview jika diperlukan */}
        <button onClick={onRunPreview} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors">
          <HiOutlineRefresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {previewData ? 'Refresh' : 'Load Preview'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <HiOutlineClock className="w-7 h-7 text-blue-400 animate-spin" />
          <p className="text-sm text-gray-400">Memproses data payroll...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2.5">
          <HiOutlineExclamation className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Gagal memuat preview</p>
            <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
            <button onClick={onRunPreview}
              className="mt-2 text-xs underline text-red-600 hover:text-red-800">
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* Belum ada data — belum pernah di-load */}
      {!loading && !error && !previewData && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-gray-500">Klik tombol di bawah untuk memuat preview payroll</p>
          <button onClick={onRunPreview}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600
                       hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm">
            <HiOutlineRefresh className="w-4 h-4" />
            Generate Preview
          </button>
        </div>
      )}

      {/* Ada data — tampilkan summary + table */}
      {!loading && !error && previewData && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Karyawan', value: `${totalKaryawan} Orang`, color: 'text-blue-600' },
              { label: 'Total Gaji',     value: formatRp(totalGaji),       color: 'text-gray-800' },
              { label: 'Total Potongan', value: formatRp(totalPotongan),   color: 'text-orange-600' },
              { label: 'Net Salary',     value: formatRp(totalNet),        color: 'text-gray-800' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className={`text-sm font-bold ${c.color} leading-tight`}>{c.value}</p>
              </div>
            ))}
          </div>

          {payslips.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Karyawan','Basic Salary','Total Earning','Total Deduction','Net Salary'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payslips.slice(0, 10).map(p => {
                      const emp      = empMap?.[String(p.employeeId)];
                      const photo    = emp?.photo ?? null;
                      const jobTitle = emp?.jobTitle ?? emp?.position ?? p.jobTitle ?? '-';
                      const dept     = emp?.departmentName ?? emp?.department ?? null;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={p.employeeName} photo={photo} />
                              <div>
                                <p className="font-medium text-gray-800 text-xs">{p.employeeName}</p>
                                <p className="text-gray-400 text-xs">{jobTitle}</p>
                                {dept && <p className="text-indigo-400 text-[10px] font-medium">{dept}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{formatRp(p.basicSalary)}</td>
                          <td className="px-4 py-3 text-green-600 font-medium text-xs">{formatRp(p.totalEarning)}</td>
                          <td className="px-4 py-3 text-red-500 text-xs">{formatRp(p.totalDeduction)}</td>
                          <td className="px-4 py-3 font-bold text-gray-900 text-xs">{formatRp(p.netSalary)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {payslips.length > 10 && (
                <div className="px-4 py-2.5 border-t border-gray-50 text-xs text-gray-400 text-center">
                  +{payslips.length - 10} karyawan lainnya
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex justify-between items-center pt-2">
        <button onClick={onBack}
          className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">
          Kembali
        </button>
        <button onClick={onNext} disabled={!previewData || loading}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-blue-600
                     hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm
                     disabled:opacity-50 disabled:cursor-not-allowed">
          Lanjutkan ke Review <HiOutlineChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Review & Konfirmasi
// Hanya menampilkan data dari previewData. Tombol konfirmasi TIDAK memanggil
// execute lagi — hanya pindah ke step 4.
// ─────────────────────────────────────────────────────────────────────────────
const Step3 = ({ month, year, previewData, onConfirm, onBack }) => {
  const periodLabel = `${MONTHS[month - 1]} ${year}`;
  const payslips    = previewData?.payslips ?? [];

  const totalGaji     = payslips.reduce((s, p) => s + Number(p.totalEarning   ?? p.basicSalary ?? 0), 0);
  const totalPotongan = payslips.reduce((s, p) => s + Number(p.totalDeduction ?? 0), 0);
  const totalNet      = payslips.reduce((s, p) => s + Number(p.netSalary      ?? 0), 0);
  const totalKaryawan = previewData?.totalEmployees ?? payslips.length;

  // Agregat komponen dari semua payslip
  const allComponents    = payslips.flatMap(p => p.components ?? []);
  const sumByName        = (arr) => {
    const map = {};
    arr.forEach(c => { map[c.componentName] = (map[c.componentName] ?? 0) + Number(c.amount ?? 0); });
    return Object.entries(map);
  };
  const totalBasicSalary = payslips.reduce((s, p) => s + Number(p.basicSalary ?? 0), 0);
  const earningSummary   = sumByName(allComponents.filter(c => c.type === 'EARNING'));
  const deductionSummary = sumByName(allComponents.filter(c => c.type === 'DEDUCTION'));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-800">Review & Konfirmasi</h2>
        <p className="text-sm text-gray-400 mt-0.5">Periksa kembali detail payroll sebelum dikonfirmasi.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Kiri: summary */}
        <div className="space-y-0 text-sm">
          {[
            ['Periode',        periodLabel],
            ['Total Karyawan', `${totalKaryawan} Orang`],
            ['Total Gaji',     formatRp(totalGaji)],
            ['Total Potongan', formatRp(totalPotongan)],
            ['Net Salary',     formatRp(totalNet)],
            ['Tanggal Dibuat', new Date().toLocaleString('id-ID', {
              day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit',
            })],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between gap-4 py-2 border-b border-gray-50">
              <span className="text-gray-500 shrink-0">{label}</span>
              <span className="font-medium text-gray-800 text-right">{val}</span>
            </div>
          ))}
        </div>

        {/* Kanan: rincian komponen */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-3">
          <p className="font-semibold text-gray-800">Rincian Komponen</p>

          <div>
            <p className="text-green-600 font-semibold mb-1.5 flex justify-between">
              <span>Earning (Total)</span><span>{formatRp(totalGaji)}</span>
            </p>
            <div className="space-y-1 text-gray-600 text-xs">
              <div className="flex justify-between">
                <span>• Gaji Pokok</span><span>{formatRp(totalBasicSalary)}</span>
              </div>
              {earningSummary.length > 0
                ? earningSummary.map(([name, total]) => (
                    <div key={name} className="flex justify-between">
                      <span>• {name}</span><span>{formatRp(total)}</span>
                    </div>
                  ))
                : <p className="text-gray-400 italic">Tidak ada komponen earning tambahan</p>
              }
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <p className="text-red-500 font-semibold mb-1.5 flex justify-between">
              <span>Deduction (Total)</span><span>{formatRp(totalPotongan)}</span>
            </p>
            <div className="space-y-1 text-gray-600 text-xs">
              {deductionSummary.length > 0
                ? deductionSummary.map(([name, total]) => (
                    <div key={name} className="flex justify-between">
                      <span>• {name}</span><span>{formatRp(total)}</span>
                    </div>
                  ))
                : <p className="text-gray-400 italic">Tidak ada data potongan</p>
              }
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3.5 text-sm text-yellow-800 flex items-start gap-2.5">
        <HiOutlineExclamation className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Setelah dikonfirmasi, payroll akan masuk ke status <strong>APPROVED</strong> dan siap untuk dibayarkan.</p>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button onClick={onBack}
          className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">
          Kembali
        </button>
        {/* onConfirm hanya navigate ke step 4, tidak memanggil API lagi */}
        <button onClick={onConfirm}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-green-600
                     hover:bg-green-700 text-white rounded-xl transition-colors shadow-sm">
          <HiOutlineCheckCircle className="w-4 h-4" />
          Konfirmasi & Lanjutkan
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Selesai (data dari previewData — response langsung dari API run)
// ─────────────────────────────────────────────────────────────────────────────
const Step4 = ({ month, year, previewData, onReset, onViewSlips }) => {
  const periodLabel   = `${MONTHS[month - 1]} ${year}`;
  const totalKaryawan = previewData?.totalEmployees ?? previewData?.successCount ?? 0;
  const netSalary     = previewData?.netSalary
    ?? (previewData?.payslips ?? []).reduce((s, p) => s + Number(p.netSalary ?? 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <HiOutlineCheckCircle className="w-9 h-9 text-green-500" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Payroll Berhasil Dibuat!</h2>
        <p className="text-sm text-gray-500 mt-1">
          Payroll untuk periode {periodLabel} telah berhasil dibuat dan disetujui.
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 text-sm text-left max-w-sm mx-auto space-y-2.5">
        {[
          ['Periode',        periodLabel],
          ['Total Karyawan', `${totalKaryawan} Orang`],
          ['Net Salary',     formatRp(netSalary)],
          ['Status',         '__badge__'],
          ['Tanggal',        new Date().toLocaleString('id-ID', {
            day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit',
          })],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between gap-4">
            <span className="text-gray-500">{label}</span>
            {val === '__badge__'
              ? <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-lg text-xs">APPROVED</span>
              : <span className="font-semibold text-gray-800">{val}</span>
            }
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center pt-2">
        <button onClick={onReset}
          className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">
          Kembali ke Daftar Payroll
        </button>
        <button onClick={onViewSlips}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600
                     hover:bg-blue-700 text-white rounded-xl transition-colors">
          <HiOutlineEye className="w-4 h-4" />
          Lihat Detail Payroll
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const RunPayrollPage = () => {
  const navigate = useNavigate();
  const { run, actionLoading, actionError, clearError } = usePayroll();
  const { employees, fetchEmployees } = useEmployee();

  const [step,        setStep]        = useState(1);
  const [month,       setMonth]       = useState(now.getMonth() + 1);
  const [year,        setYear]        = useState(now.getFullYear());
  // previewData menyimpan response dari run.execute() — dipakai di step 2, 3, dan 4
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // empMap: id → employee object (untuk avatar & jabatan di preview table)
  const empMap = useMemo(() => {
    const map = {};
    (employees ?? []).forEach(e => { map[String(e.id)] = e; });
    return map;
  }, [employees]);

  // Dipanggil dari Step 2 (tombol "Generate Preview" / "Refresh")
  // Menjalankan run.execute() dan menyimpan hasilnya ke state lokal
  const handleRunPreview = async () => {
    setPreviewError(null);
    clearError?.();
    const res = await run.execute(month, year);
    if (res?.meta?.requestStatus === 'fulfilled') {
      // run.result sudah diisi oleh redux setelah fulfilled
      setPreviewData(run.result ?? res.payload);
    } else {
      // Tangkap error jika ada
      setPreviewError(actionError ?? res?.error?.message ?? 'Gagal memproses payroll');
    }
  };

  // Step 3 konfirmasi → TIDAK memanggil API lagi, langsung ke step 4
  const handleConfirm = () => {
    setStep(4);
  };

  const handleReset = () => {
    run.clear?.();
    clearError?.();
    setPreviewData(null);
    setPreviewError(null);
    navigate('/payroll');
  };

  // Jika periode berubah di step 1, reset preview supaya tidak stale
  const handleMonthChange = (val) => {
    setMonth(val);
    setPreviewData(null);
    setPreviewError(null);
  };
  const handleYearChange = (val) => {
    setYear(val);
    setPreviewData(null);
    setPreviewError(null);
  };

  const handleBack = () => {
    if (step === 1 || step === 4) navigate('/payroll');
    else setStep(s => s - 1);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={handleBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                     hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Payroll</h1>
          <p className="text-sm text-gray-400 mt-0.5">Buat dan kelola payroll untuk periode tertentu</p>
        </div>
      </div>

      <StepBar current={step} />

      {step === 1 && (
        <Step1
          month={month} setMonth={handleMonthChange}
          year={year}   setYear={handleYearChange}
          onNext={() => { clearError?.(); setStep(2); }}
          onCancel={() => navigate('/payroll')}
        />
      )}

      {step === 2 && (
        <Step2
          month={month} year={year}
          previewData={previewData}
          empMap={empMap}
          loading={actionLoading}
          error={previewError ?? actionError}
          onRunPreview={handleRunPreview}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step3
          month={month} year={year}
          previewData={previewData}
          onConfirm={handleConfirm}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <Step4
          month={month} year={year}
          previewData={previewData}
          onReset={handleReset}
          onViewSlips={() => navigate('/payroll/slips')}
        />
      )}
    </div>
  );
};

export default RunPayrollPage;
