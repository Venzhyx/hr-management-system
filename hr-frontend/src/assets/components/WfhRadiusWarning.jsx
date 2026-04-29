// src/components/attendance/WfhRadiusWarning.jsx
import React, { useEffect, useState } from 'react';
import {
  HiOutlineCheckCircle, HiOutlineExclamation,
  HiOutlineRefresh, HiOutlineHome,
} from 'react-icons/hi';
import useWFHRadiusCheck, { formatDistance } from '../../redux/hooks/useWFHRadiusCheck';

const WfhRadiusWarning = ({ onResult, allowOutside = true }) => {
  const {
    checkLocation, reset, status, distance, errorMsg,
    wfhRadius, homeLocation,
    isChecking, isInside, isOutside, isError, noHomeCoords,
  } = useWFHRadiusCheck();

  const [checked, setChecked] = useState(false);

  // ✅ Langsung auto-check saat mount — tidak ada dependency isDataReady
  useEffect(() => {
    handleCheck();
    return () => reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheck = async () => {
    setChecked(false);
    const result = await checkLocation();
    setChecked(true);
    onResult?.(result);
  };

  if (!checked || isChecking) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <svg className="animate-spin w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Mengecek lokasi rumah...</span>
      </div>
    );
  }

  if (noHomeCoords) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
        <HiOutlineHome className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500" />
        <div className="flex-1">
          <p className="font-medium">Koordinat rumah belum diatur</p>
          <p className="text-yellow-600 mt-0.5 text-xs">Silakan update profile Anda dengan mengisi alamat rumah lengkap.</p>
        </div>
        <button onClick={handleCheck} className="text-yellow-500 hover:text-yellow-700 flex-shrink-0">
          <HiOutlineRefresh className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
        <HiOutlineExclamation className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
        <div className="flex-1 text-sm text-red-700">
          <p className="font-medium">Gagal mendapatkan lokasi</p>
          <p className="text-red-500 mt-0.5">{errorMsg}</p>
        </div>
        <button onClick={handleCheck} className="text-red-500 hover:text-red-700 flex-shrink-0">
          <HiOutlineRefresh className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (isInside) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
        <HiOutlineCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
        <div className="flex-1 text-sm text-green-700">
          <p className="font-medium">Kamu berada di sekitar rumah ✓</p>
          <p className="text-green-500 mt-0.5">
            Jarak ke rumah: <span className="font-semibold">{formatDistance(distance)}</span>
            {' · '}Radius WFH: <span className="font-semibold">{formatDistance(wfhRadius)}</span>
          </p>
        </div>
        <button onClick={handleCheck} className="text-green-500 hover:text-green-700 flex-shrink-0">
          <HiOutlineRefresh className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (isOutside) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-300 rounded-xl">
          <HiOutlineExclamation className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Kamu berada di luar radius WFH</p>
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
              Jarakmu ke rumah adalah{' '}
              <span className="font-bold text-amber-800">{formatDistance(distance)}</span>, sedangkan
              radius WFH yang diizinkan hanya{' '}
              <span className="font-bold text-amber-800">{formatDistance(wfhRadius)}</span>.
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-amber-600 mb-1">
                <span>Rumah</span><span>{formatDistance(distance)}</span>
              </div>
              <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((wfhRadius / distance) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
          <button onClick={handleCheck} className="text-amber-500 hover:text-amber-700 flex-shrink-0 mt-0.5">
            <HiOutlineRefresh className="w-4 h-4" />
          </button>
        </div>
        {allowOutside && (
          <p className="text-xs text-gray-400 px-1">
            ⚠ Check-in WFH tetap bisa dilakukan, namun akan tercatat sebagai{' '}
            <span className="font-medium text-gray-600">di luar radius WFH</span>.
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default WfhRadiusWarning;