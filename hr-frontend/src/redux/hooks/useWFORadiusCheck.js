/**
 * useWfoRadiusCheck
 *
 * Hook untuk validasi lokasi WFO saat check-in.
 * Mengambil GPS user → hitung jarak ke koordinat kantor → bandingkan dengan radius.
 *
 * Usage:
 *   const { checkLocation, status, distance, error, loading } = useWfoRadiusCheck();
 *
 *   status: 'idle' | 'checking' | 'inside' | 'outside' | 'error'
 *   distance: jarak dalam meter (null jika belum dicek)
 */

import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

// ── Haversine formula — jarak antara 2 koordinat dalam meter ─────────────────
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R    = 6371000; // radius bumi dalam meter
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Format jarak untuk ditampilkan ke user ────────────────────────────────────
export const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return '-';
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
};

const useWfoRadiusCheck = () => {
  const [status,   setStatus]   = useState('idle');    // idle | checking | inside | outside | error
  const [distance, setDistance] = useState(null);      // meter
  const [userPos,  setUserPos]  = useState(null);      // { lat, lng }
  const [errorMsg, setErrorMsg] = useState(null);

  // Ambil settings (wfoRadius) dan company (latitude/longitude) dari Redux
  const wfoRadius = useSelector(s => s.attendanceSettings?.data?.wfoRadius ?? 100);
  const companies = useSelector(s => s.companies?.list ?? []);

  // Ambil koordinat kantor dari company pertama yang punya koordinat
  const officeLocation = (() => {
    const company = companies.find(c => c.latitude && c.longitude);
    if (!company) return null;
    return { lat: company.latitude, lng: company.longitude, name: company.companyName };
  })();

  // ── Main check function ───────────────────────────────────────────────────
  const checkLocation = useCallback(() => {
    return new Promise((resolve) => {
      // Jika tidak ada koordinat kantor, lewati validasi (tidak blokir)
      if (!officeLocation) {
        setStatus('idle');
        setErrorMsg('Koordinat kantor belum diatur. Hubungi admin.');
        resolve({ valid: true, skipped: true, reason: 'no_office_location' });
        return;
      }

      if (!navigator.geolocation) {
        setStatus('error');
        setErrorMsg('Browser tidak mendukung GPS.');
        resolve({ valid: false, reason: 'no_geolocation' });
        return;
      }

      setStatus('checking');
      setErrorMsg(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: userLat, longitude: userLng } = position.coords;
          const dist = haversineDistance(
            userLat, userLng,
            officeLocation.lat, officeLocation.lng
          );

          setUserPos({ lat: userLat, lng: userLng });
          setDistance(dist);

          if (dist <= wfoRadius) {
            setStatus('inside');
            resolve({
              valid:    true,
              distance: dist,
              userLat,
              userLng,
              withinRadius: true,
            });
          } else {
            setStatus('outside');
            resolve({
              valid:    false,
              distance: dist,
              userLat,
              userLng,
              withinRadius: false,
              radiusLimit: wfoRadius,
              officeName:  officeLocation.name,
            });
          }
        },
        (err) => {
          setStatus('error');
          const msg =
            err.code === err.PERMISSION_DENIED     ? 'Akses lokasi ditolak. Izinkan akses GPS di browser.' :
            err.code === err.POSITION_UNAVAILABLE  ? 'Lokasi tidak tersedia saat ini.' :
            err.code === err.TIMEOUT               ? 'Timeout: gagal mendapatkan lokasi.' :
            'Gagal mendapatkan lokasi.';
          setErrorMsg(msg);
          resolve({ valid: false, reason: 'gps_error', message: msg });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, [officeLocation, wfoRadius]);

  const reset = useCallback(() => {
    setStatus('idle');
    setDistance(null);
    setUserPos(null);
    setErrorMsg(null);
  }, []);

  return {
    checkLocation,   // call ini saat user pilih WFO → returns Promise
    reset,
    status,          // 'idle' | 'checking' | 'inside' | 'outside' | 'error'
    distance,        // number (meter) | null
    userPos,         // { lat, lng } | null
    errorMsg,        // string | null
    wfoRadius,       // radius saat ini (meter)
    officeLocation,  // { lat, lng, name } | null
    isChecking:      status === 'checking',
    isInside:        status === 'inside',
    isOutside:       status === 'outside',
    isError:         status === 'error',
  };
};

export default useWfoRadiusCheck;
