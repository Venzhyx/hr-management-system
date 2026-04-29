// src/redux/hooks/useWFHRadiusCheck.js
import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

// ── Haversine formula ─────────────────────────────────────────────────────────
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R    = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return '-';
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
};

const useWFHRadiusCheck = () => {
  const [status,   setStatus]   = useState('idle');
  const [distance, setDistance] = useState(null);
  const [userPos,  setUserPos]  = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // ✅ Ambil dari attendanceSettings
  const wfhRadius = useSelector(s => s.attendanceSettings?.data?.wfhRadius ?? 100);
  
  // ✅ Ambil employee dari AUTH (yang sedang login)
  const authEmployee = useSelector(s => s.auth?.employee);
  // ✅ Atau dari employees slice jika perlu
  const employeesEmployee = useSelector(s => s.employees?.selectedEmployee);
  
  // Gunakan employee yang tersedia (prioritaskan auth)
  const employee = authEmployee || employeesEmployee;
  
  const homeLatitude = employee?.homeLatitude;
  const homeLongitude = employee?.homeLongitude;
  const homeAddress = employee?.homeAddress;

  console.log('useWFHRadiusCheck - Employee data:', {
    id: employee?.id,
    name: employee?.name,
    homeAddress,
    homeLatitude,
    homeLongitude,
  });

  const homeLocation = (() => {
    if (homeLatitude && homeLongitude) {
      return { 
        lat: homeLatitude, 
        lng: homeLongitude, 
        name: 'Rumah',
        address: homeAddress || 'Alamat rumah'
      };
    }
    return null;
  })();

  const checkLocation = useCallback(() => {
    return new Promise((resolve) => {
      // Debug log
      console.log('Checking WFH location - homeLocation:', homeLocation);
      console.log('WFH Radius setting:', wfhRadius);
      
      if (!homeLocation) {
        setStatus('no_home_coords');
        setErrorMsg('Koordinat rumah belum diatur. Silakan update profile Anda.');
        resolve({ 
          valid: true, 
          skipped: true, 
          reason: 'no_home_coordinates',
          message: 'Koordinat rumah belum diatur'
        });
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
            homeLocation.lat, homeLocation.lng
          );

          setUserPos({ lat: userLat, lng: userLng });
          setDistance(dist);

          console.log('Distance to home:', dist, 'meters. Limit:', wfhRadius);

          if (dist <= wfhRadius) {
            setStatus('inside');
            resolve({
              valid:    true,
              distance: dist,
              userLat,
              userLng,
              withinRadius: true,
              homeLocation: homeLocation,
            });
          } else {
            setStatus('outside');
            resolve({
              valid:    false,
              distance: dist,
              userLat,
              userLng,
              withinRadius: false,
              radiusLimit: wfhRadius,
              homeLocation: homeLocation,
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
  }, [homeLocation, wfhRadius]);

  const reset = useCallback(() => {
    setStatus('idle');
    setDistance(null);
    setUserPos(null);
    setErrorMsg(null);
  }, []);

  return {
    checkLocation,
    reset,
    status,
    distance,
    userPos,
    errorMsg,
    wfhRadius,
    homeLocation,
    isChecking:      status === 'checking',
    isInside:        status === 'inside',
    isOutside:       status === 'outside',
    isError:         status === 'error',
    noHomeCoords:    status === 'no_home_coords',
  };
};

export default useWFHRadiusCheck;