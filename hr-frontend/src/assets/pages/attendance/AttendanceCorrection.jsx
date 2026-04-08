import React from 'react';
import { HiOutlinePencilAlt, HiOutlinePlus } from 'react-icons/hi';

const AttendanceCorrection = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Correction</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola koreksi data kehadiran karyawan</p>
        </div>
        <button
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Buat Koreksi</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <HiOutlinePencilAlt className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Belum ada koreksi kehadiran
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Halaman ini akan menampilkan daftar pengajuan koreksi kehadiran karyawan.
          </p>
          <button className="mt-6 flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            <HiOutlinePlus className="w-4 h-4" />
            <span>Buat Koreksi Pertama</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCorrection;
