// src/redux/hooks/useCheckIn.js
import { useState, useCallback } from "react";
import API from "../../ApiService/api";

export const useCheckIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult]   = useState(null);

  /** Ambil koordinat GPS — optional, boleh gagal */
  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation tidak didukung browser ini."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy:  pos.coords.accuracy,
        }),
        (err) => reject(new Error(`Gagal mendapatkan lokasi: ${err.message}`)),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  /**
   * Submit absensi ke backend.
   * GPS bersifat optional — jika null/undefined, field latitude/longitude tidak dikirim.
   *
   * @param {{ employeeId: string, photoBlob: Blob, location: {latitude,longitude,accuracy}|null, capturedAt: Date }} params
   */
  const submitCheckIn = useCallback(async ({ employeeId, photoBlob, location, capturedAt, workType }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("employeeId", employeeId);
      formData.append("photo", photoBlob, `checkin_${employeeId}_${Date.now()}.jpg`);
      formData.append("checkInTime", (capturedAt || new Date()).toISOString());
      formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
      if (workType) formData.append("workType", workType);

      // GPS optional
      if (location?.latitude  != null) formData.append("latitude",  String(location.latitude));
      if (location?.longitude != null) formData.append("longitude", String(location.longitude));
      if (location?.accuracy  != null) formData.append("accuracy",  String(location.accuracy));

      console.log("[CheckIn] Mengirim absensi employeeId:", employeeId, "| GPS:", location ? "ada" : "tidak ada");

      const res = await API.post("/attendances/check-in", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("[CheckIn] Response status:", res.status);
      console.log("[CheckIn] Response data:", res.data);

      const parsed = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      setResult(parsed);
      setSuccess(true);
      return parsed;
    } catch (err) {
      console.error("[CheckIn] Error status :", err.response?.status);
      console.error("[CheckIn] Error data   :", err.response?.data);
      console.error("[CheckIn] Error message:", err.message);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        err.message ||
        "Gagal melakukan absensi.";

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setResult(null);
  }, []);

  return { loading, error, success, result, getLocation, submitCheckIn, reset };
};
