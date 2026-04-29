// src/components/attendance/CheckInModal.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  HiOutlineCamera, HiOutlineLocationMarker, HiOutlineClock,
  HiOutlineRefresh, HiOutlineX, HiOutlineCheckCircle,
  HiOutlineExclamationCircle, HiOutlineUser, HiOutlineOfficeBuilding,
  HiOutlineHome, HiOutlineGlobe,
} from "react-icons/hi";
import { useCheckIn } from "../../redux/hooks/useCheckin";
import { useAttendance } from "../../redux/hooks/useAttendance";
import WfoRadiusWarning from '../components/WfoRadiusWarning';
import WfhRadiusWarning from '../components/WfhRadiusWarning';

const fmtDateTime = (d) =>
  d.toLocaleString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
const fmtCoord = (n) => (typeof n === "number" ? n.toFixed(6) : "-");

const STEP = {
  CAMERA: "camera", WORK_TYPE: "work_type",
  SUBMITTING: "submitting", SUCCESS: "success", ERROR: "error",
};

const WORK_TYPES = [
  { value: "WFO", label: "Work from Office",  short: "WFO", icon: HiOutlineOfficeBuilding, color: "indigo", desc: "Hadir di kantor" },
  { value: "WFH", label: "Work from Home",    short: "WFH", icon: HiOutlineHome,           color: "green",  desc: "Bekerja dari rumah" },
  { value: "WFA", label: "Work from Anywhere",short: "WFA", icon: HiOutlineGlobe,          color: "amber",  desc: "Bekerja dari mana saja" },
];

const COLOR_MAP = {
  indigo: { ring: "ring-indigo-500", bg: "bg-indigo-50", border: "border-indigo-400", icon: "text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700" },
  green:  { ring: "ring-green-500",  bg: "bg-green-50",  border: "border-green-400",  icon: "text-green-600",  btn: "bg-green-600 hover:bg-green-700" },
  amber:  { ring: "ring-amber-500",  bg: "bg-amber-50",  border: "border-amber-400",  icon: "text-amber-600",  btn: "bg-amber-500 hover:bg-amber-600" },
};

const CheckInModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const clockRef  = useRef(null);

  const [step, setStep]             = useState(STEP.CAMERA);
  const [photoBlob, setPhotoBlob]   = useState(null);
  const [photoUrl, setPhotoUrl]     = useState(null);
  const [capturedAt, setCapturedAt] = useState(null);
  const [workType, setWorkType]     = useState(null);
  const [location, setLocation]     = useState(null);
  const [locError, setLocError]     = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [now, setNow]               = useState(new Date());
  const [facingMode, setFacingMode] = useState("user");
  const [cameraError, setCameraError] = useState(null);

  // ── Radius state ──────────────────────────────────────────────────────────
  // PENTING: pakai state (bukan hanya ref) supaya perubahan trigger re-render
  // dan tombol langsung update tanpa perlu klik kedua kali
  const [wfoRadiusDone,     setWfoRadiusDone]     = useState(false); // true = sudah ada hasil
  const [wfhRadiusDone,     setWfhRadiusDone]     = useState(false);
  const [isOutsideWFORadius, setIsOutsideWFORadius] = useState(false);
  const [isOutsideWFHRadius, setIsOutsideWFHRadius] = useState(false);

  const { error: submitError, submitCheckIn, getLocation, reset: resetHook } = useCheckIn();
  const { upsertAttendanceRecord } = useAttendance();

  // ── GPS dengan auto-retry ─────────────────────────────────────────────────
  const fetchGPS = useCallback((retryCount = 0) => {
    setLocLoading(true);
    setLocError(null);
    getLocation()
      .then((loc) => {
        setLocation(loc);
        setLocLoading(false);
      })
      .catch((err) => {
        // ✅ Auto-retry sampai 2x sebelum menyerah
        if (retryCount < 2) {
          console.warn(`[CheckIn] GPS gagal (attempt ${retryCount + 1}), retry...`);
          setTimeout(() => fetchGPS(retryCount + 1), 1500);
        } else {
          console.warn("[CheckIn] GPS gagal setelah 3 attempt:", err.message);
          setLocError(err.message);
          setLocLoading(false);
        }
      });
  }, [getLocation]);

  // Live clock
  useEffect(() => {
    if (!isOpen) return;
    clockRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockRef.current);
  }, [isOpen]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (mode) => {
    setCameraError(null);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCameraError("Kamera tidak dapat diakses. Izinkan akses kamera di browser Anda.");
    }
  }, [stopStream]);

  // Open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setStep(STEP.CAMERA);
      setPhotoBlob(null);
      setPhotoUrl(null);
      setLocation(null);
      setLocError(null);
      setLocLoading(false);
      setCapturedAt(null);
      setWorkType(null);
      setWfoRadiusDone(false);
      setWfhRadiusDone(false);
      setIsOutsideWFORadius(false);
      setIsOutsideWFHRadius(false);
      resetHook();
      startCamera("user");
      fetchGPS(0);
    } else {
      stopStream();
    }
    return () => stopStream();
  }, [isOpen]); // eslint-disable-line

  const flipCamera = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  };

  const capturePhoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (facingMode === "user") { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0);

    const ts = new Date();
    setCapturedAt(ts);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(8, canvas.height - 34, 330, 26);
    ctx.fillStyle = "white";
    ctx.fillText(fmtDateTime(ts), 12, canvas.height - 16);

    canvas.toBlob((blob) => {
      if (!blob) return;
      setPhotoBlob(blob);
      setPhotoUrl(URL.createObjectURL(blob));
      stopStream();
      setStep(STEP.WORK_TYPE);
    }, "image/jpeg", 0.92);
  }, [facingMode, stopStream]);

  const retake = useCallback(() => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setPhotoBlob(null);
    setCapturedAt(null);
    setWorkType(null);
    setWfoRadiusDone(false);
    setWfhRadiusDone(false);
    setIsOutsideWFORadius(false);
    setIsOutsideWFHRadius(false);
    setStep(STEP.CAMERA);
    startCamera(facingMode);
  }, [facingMode, photoUrl, startCamera]);

  const handleSubmit = useCallback(async () => {
    if (!photoBlob || !employee?.id || !workType) return;
    if (workType === 'WFO' && isOutsideWFORadius) { setStep(STEP.ERROR); return; }
    if (workType === 'WFH' && isOutsideWFHRadius) { setStep(STEP.ERROR); return; }

    setStep(STEP.SUBMITTING);
    try {
      const loc = location || { latitude: null, longitude: null, accuracy: null };
      const res = await submitCheckIn({
        employeeId: employee.id, photoBlob,
        location: loc, capturedAt: capturedAt || new Date(), workType,
      });
      const record = res?.data ?? res;
      if (record?.id) upsertAttendanceRecord(record);
      setStep(STEP.SUCCESS);
      onSuccess?.(res);
    } catch (err) {
      console.error("[CheckIn] Submit error:", err);
      setStep(STEP.ERROR);
    }
  }, [photoBlob, location, employee, capturedAt, workType, submitCheckIn, onSuccess, upsertAttendanceRecord, isOutsideWFORadius, isOutsideWFHRadius]);

  const handleClose = useCallback(() => {
    stopStream();
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    onClose?.();
  }, [stopStream, photoUrl, onClose]);

  if (!isOpen) return null;

  const selectedType  = WORK_TYPES.find((t) => t.value === workType);
  const selectedColor = selectedType ? COLOR_MAP[selectedType.color] : null;

  // ✅ FIX TOMBOL:
  // - WFA: langsung enabled begitu dipilih (tidak perlu cek radius)
  // - WFO: disabled sampai wfoRadiusDone = true (hasil onResult masuk)
  // - WFH: disabled sampai wfhRadiusDone = true
  // - Pakai STATE bukan ref → perubahan trigger re-render → tombol langsung update
  const isRadiusLoading =
    (workType === 'WFO' && !wfoRadiusDone) ||
    (workType === 'WFH' && !wfhRadiusDone);

  const isDisabled =
    !workType ||
    locLoading ||
    isRadiusLoading ||
    (workType === 'WFO' && isOutsideWFORadius) ||
    (workType === 'WFH' && isOutsideWFHRadius);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">Absen Hari Ini</h2>
            <p className="text-indigo-200 text-xs mt-0.5">{fmtDateTime(now)}</p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <HiOutlineX className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Employee info */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <HiOutlineUser className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{employee?.name ?? "—"}</p>
            <p className="text-xs text-gray-400 font-mono">
              {employee?.employeeIdentificationNumber}
              {employee?.departmentName && ` · ${employee.departmentName}`}
            </p>
          </div>
          <div className="flex-shrink-0">
            {locLoading ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-400 text-xs">
                <div className="w-2.5 h-2.5 rounded-full border border-gray-400 border-t-transparent animate-spin" />
                GPS…
              </span>
            ) : location ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs">
                <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                GPS OK
              </span>
            ) : (
              <span
                onClick={() => fetchGPS(0)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-500 text-xs cursor-pointer hover:bg-red-100"
                title="Klik untuk retry GPS"
              >
                <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                No GPS ↺
              </span>
            )}
          </div>
        </div>

        {/* ── STEP: CAMERA ── */}
        {step === STEP.CAMERA && (
          <div className="flex flex-col">
            <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <HiOutlineExclamationCircle className="w-12 h-12 text-red-400" />
                  <p className="text-red-400 text-sm">{cameraError}</p>
                  <button onClick={() => startCamera(facingMode)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"
                    style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-48 rounded-full border-2 border-white/50" />
                  </div>
                  <button onClick={flipCamera} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors">
                    <HiOutlineRefresh className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
            </div>
            <div className="px-5 py-4 flex flex-col items-center gap-3">
              <button onClick={capturePhoto} disabled={!!cameraError}
                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 flex items-center justify-center shadow-lg transition-all active:scale-95">
                <HiOutlineCamera className="w-8 h-8 text-white" />
              </button>
              <p className="text-xs text-gray-400">Tekan untuk mengambil foto</p>
            </div>
          </div>
        )}

        {/* ── STEP: WORK TYPE ── */}
        {step === STEP.WORK_TYPE && (
          <div className="flex flex-col">
            {photoUrl && (
              <div className="relative" style={{ aspectRatio: "16/7" }}>
                <img src={photoUrl} alt="Foto absen" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <HiOutlineClock className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-medium">
                    {capturedAt?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className="text-white/70 text-xs">
                    · {capturedAt?.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <button onClick={retake} className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg text-xs transition-colors">
                  <HiOutlineRefresh className="w-3.5 h-3.5" />
                  Foto Ulang
                </button>
              </div>
            )}

            <div className="px-5 py-4 space-y-4">
              {/* GPS info */}
              <div className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border ${
                location ? "bg-green-50 border-green-200" :
                locLoading ? "bg-gray-50 border-gray-200" : "bg-orange-50 border-orange-200"
              }`}>
                <HiOutlineLocationMarker className={`w-5 h-5 flex-shrink-0 ${
                  location ? "text-green-500" : locLoading ? "text-gray-400" : "text-orange-400"
                }`} />
                <div className="flex-1 min-w-0">
                  {locLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                      <span className="text-sm text-gray-500">Mengambil lokasi GPS…</span>
                    </div>
                  ) : location ? (
                    <>
                      <p className="text-xs font-semibold text-green-700">Lokasi berhasil diperoleh</p>
                      <p className="text-xs text-green-600 font-mono">
                        {fmtCoord(location.latitude)}, {fmtCoord(location.longitude)}
                        <span className="ml-1 text-green-400">±{Math.round(location.accuracy ?? 0)}m</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-orange-600">Lokasi tidak tersedia</p>
                      <p className="text-xs text-orange-500">
                        Absen tetap bisa dilanjutkan ·{" "}
                        <button onClick={() => fetchGPS(0)} className="underline font-medium">Coba lagi</button>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Radius warnings */}
              {workType === 'WFO' && (
                <WfoRadiusWarning
                  allowOutside={true}
                  onResult={(result) => {
                    const outside = result.skipped ? false : !result.withinRadius;
                    setIsOutsideWFORadius(outside);
                    setWfoRadiusDone(true); // ✅ trigger re-render → tombol langsung update
                  }}
                />
              )}
              {workType === 'WFH' && (
                <WfhRadiusWarning
                  allowOutside={true}
                  onResult={(result) => {
                    const outside = result.skipped ? false : !result.withinRadius;
                    setIsOutsideWFHRadius(outside);
                    setWfhRadiusDone(true); // ✅ trigger re-render → tombol langsung update
                  }}
                />
              )}

              {/* Pilih tipe kerja */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2.5">Pilih Tipe Kehadiran</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {WORK_TYPES.map(({ value, short, desc, icon: Icon, color }) => {
                    const c = COLOR_MAP[color];
                    const isSelected = workType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          // ✅ Reset radius state saat ganti tipe
                          setWfoRadiusDone(false);
                          setWfhRadiusDone(false);
                          setIsOutsideWFORadius(false);
                          setIsOutsideWFHRadius(false);
                          setWorkType(value);
                        }}
                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all
                          ${isSelected
                            ? `${c.bg} ${c.border} ring-2 ${c.ring} ring-offset-1 shadow-sm`
                            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isSelected ? c.bg : "bg-gray-100"}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? c.icon : "text-gray-400"}`} />
                        </div>
                        <p className={`text-sm font-bold ${isSelected ? c.icon : "text-gray-600"}`}>{short}</p>
                        <p className={`text-[10px] text-center leading-tight ${isSelected ? c.icon : "text-gray-400"}`}>{desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tombol kirim */}
              <button
                onClick={handleSubmit}
                disabled={isDisabled}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all shadow-sm
                  ${isDisabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : selectedColor ? selectedColor.btn : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
              >
                <HiOutlineCheckCircle className="w-4 h-4" />
                {!workType
                  ? "Pilih tipe kehadiran dulu"
                  : locLoading
                  ? "Menunggu GPS…"
                  : isRadiusLoading
                  ? `Memeriksa radius ${workType}...`
                  : workType === 'WFO' && isOutsideWFORadius
                  ? "Di luar radius WFO"
                  : workType === 'WFH' && isOutsideWFHRadius
                  ? "Di luar radius WFH"
                  : `Kirim Absen · ${workType}`
                }
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: SUBMITTING ── */}
        {step === STEP.SUBMITTING && (
          <div className="flex flex-col items-center justify-center py-14 px-5 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <HiOutlineCamera className="absolute inset-0 m-auto w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800">Mengirim Data Absensi…</p>
              <p className="text-sm text-gray-400 mt-1">Mohon tunggu sebentar</p>
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === STEP.SUCCESS && (
          <div className="flex flex-col items-center justify-center py-12 px-5 gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <HiOutlineCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600 mb-1">Absen Berhasil!</p>
              <p className="text-sm text-gray-500">
                {employee?.name} berhasil absen pada{" "}
                <span className="font-medium text-gray-700">
                  {capturedAt?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </p>
            </div>
            {workType && (
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                workType === "WFO" ? "bg-indigo-100 text-indigo-700" :
                workType === "WFH" ? "bg-green-100 text-green-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {workType} · {WORK_TYPES.find(t => t.value === workType)?.label}
              </span>
            )}
            {location && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <HiOutlineLocationMarker className="w-3.5 h-3.5 text-green-400" />
                {fmtCoord(location.latitude)}, {fmtCoord(location.longitude)}
              </p>
            )}
            <button onClick={handleClose} className="mt-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
              Selesai
            </button>
          </div>
        )}

        {/* ── STEP: ERROR ── */}
        {step === STEP.ERROR && (
          <div className="flex flex-col items-center justify-center py-10 px-5 gap-4">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <HiOutlineExclamationCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600 mb-1">Absen Gagal</p>
              <p className="text-sm text-gray-500 mb-1">
                {isOutsideWFORadius && workType === 'WFO'
                  ? "Anda berada di luar radius kantor. Silakan pilih WFH atau WFA, atau pastikan Anda berada di lokasi kantor."
                  : isOutsideWFHRadius && workType === 'WFH'
                  ? "Anda berada di luar radius rumah. Silakan pilih WFO atau WFA, atau pastikan Anda berada di sekitar rumah."
                  : submitError || "Terjadi kesalahan. Silakan coba lagi."}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={retake} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                <HiOutlineRefresh className="w-4 h-4" />
                Foto Ulang
              </button>
              <button
                onClick={() => {
                  setWfoRadiusDone(false);
                  setWfhRadiusDone(false);
                  setIsOutsideWFORadius(false);
                  setIsOutsideWFHRadius(false);
                  setStep(STEP.WORK_TYPE);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CheckInModal;