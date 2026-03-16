import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash,
  HiOutlineCalendar, HiOutlineUser, HiOutlineDocumentText,
  HiOutlineCheck, HiOutlineX, HiOutlineClock, HiOutlineZoomIn,
  HiOutlineOfficeBuilding, HiOutlineBriefcase,
} from "react-icons/hi";
import { useTimeOff } from "../../../redux/hooks/useTimeOff";
import { useEmployee } from "../../../redux/hooks/useEmployee";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const STATUS_CFG = {
  SUBMITTED: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",   label: "Pending",  Icon: HiOutlineClock },
  APPROVED:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Approved", Icon: HiOutlineCheck },
  REJECTED:  { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-400",     label: "Rejected", Icon: HiOutlineX    },
};

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
  </div>
);

const TimeOffDetailPage = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const { getTimeOffRequestById, deleteTimeOffRequest, approveTimeOffRequest, rejectTimeOffRequest } = useTimeOff();
  const { employees, fetchEmployees } = useEmployee();

  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showPreview,   setShowPreview]   = useState(false);

  useEffect(() => {
    fetchEmployees();
    const load = async () => {
      try {
        const res  = await getTimeOffRequestById(id);
        const item = res?.data ?? res;
        if (!item?.id) throw new Error("Not found");
        setData(item);
      } catch {
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const refresh = async () => {
    try {
      const res = await getTimeOffRequestById(id);
      setData(res?.data ?? res);
    } catch {}
  };

  const handleApprove = async () => {
    setActionLoading("approve");
    try { await approveTimeOffRequest(id); await refresh(); }
    catch {} finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    setActionLoading("reject");
    try { await rejectTimeOffRequest(id); await refresh(); }
    catch {} finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Hapus time off request ini?")) return;
    setDeleting(true);
    try {
      await deleteTimeOffRequest(id);
      navigate("/time-off", { state: { toast: { show: true, message: "Request dihapus.", type: "success" } } });
    } catch {
      alert("Gagal menghapus.");
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="w-full px-4 md:px-6 py-6 flex items-center justify-center h-64">
      <div className="text-gray-400 text-sm">Memuat data…</div>
    </div>
  );

  if (error || !data) return (
    <div className="w-full px-4 md:px-6 py-6">
      <button onClick={() => navigate("/time-off")} className="p-2 hover:bg-gray-100 rounded-lg mb-4">
        <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
      </button>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">{error}</div>
    </div>
  );

  const sCfg    = STATUS_CFG[data.status] || STATUS_CFG.SUBMITTED;
  const emp     = employees.find(e => e.id === data.employeeId || String(e.id) === String(data.employeeId));
  const isImage = data.attachmentUrl && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(data.attachmentUrl);
  const initials = data.employeeName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <>
      {/* ── Preview Modal ── */}
      {showPreview && data.attachmentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Attachment Preview</span>
              <button onClick={() => setShowPreview(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <HiOutlineX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-50">
              {isImage
                ? <img src={data.attachmentUrl} alt="attachment" className="max-w-full max-h-full object-contain rounded-xl shadow" />
                : <iframe src={data.attachmentUrl} title="PDF" className="w-full rounded-lg border border-gray-200" style={{ height: "65vh" }} />
              }
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-4 md:px-6 py-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/time-off")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <p className="text-xs text-gray-400 font-medium">
                Time Off <span className="text-gray-300 mx-1">/</span>
                <span className="text-gray-600">Detail</span>
              </p>
              <h1 className="text-2xl font-bold text-gray-800">Time Off Detail</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.status === "SUBMITTED" && (
              <button onClick={() => navigate(`/time-off/edit/${id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                <HiOutlinePencil className="w-4 h-4" /> Edit
              </button>
            )}
            <button onClick={handleDelete} disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 shadow-sm disabled:opacity-50 transition-all">
              <HiOutlineTrash className="w-4 h-4" />
              {deleting ? "Menghapus…" : "Hapus"}
            </button>
          </div>
        </div>

        <div className="space-y-4">

          {/* ══ Top row: Employee card + Summary card (2 col) ══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Employee card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                {emp?.photo ? (
                  <img src={emp.photo} alt={data.employeeName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Karyawan</p>
                <p className="text-base font-bold text-gray-900 truncate">{data.employeeName || "—"}</p>
                {(emp?.jobTitle || emp?.position) && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <HiOutlineBriefcase className="w-3.5 h-3.5 flex-shrink-0" />
                    {emp.jobTitle || emp.position}
                  </p>
                )}
                {emp?.departmentName && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                    <HiOutlineOfficeBuilding className="w-3.5 h-3.5 flex-shrink-0" />
                    {emp.departmentName}
                  </p>
                )}
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ringkasan</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-indigo-600">{data.requested ?? "—"}</p>
                  <p className="text-sm text-gray-400 mt-0.5">Hari Cuti</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${sCfg.bg} ${sCfg.text} ${sCfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                    {sCfg.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">Diajukan {fmtDate(data.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ══ Detail row: 4 col ══ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Detail Cuti</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <InfoRow label="Start Date" value={fmtDate(data.startDate)} />
              <InfoRow label="End Date"   value={fmtDate(data.endDate)} />
              <InfoRow label="Tipe Cuti"  value={data.timeOffTypeName} />
              <InfoRow label="Durasi"     value={data.requested ? `${data.requested} hari` : "—"} />
            </div>
          </div>

          {/* ══ Reason + Attachment (2 col, only if content exists) ══ */}
          {(data.reason || data.attachmentUrl) && (
            <div className={`grid gap-4 ${data.reason && data.attachmentUrl ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>

              {data.reason && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Alasan</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{data.reason}</p>
                </div>
              )}

              {data.attachmentUrl && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Attachment</p>
                  {isImage ? (
                    <button type="button" onClick={() => setShowPreview(true)}
                      className="block group relative w-full focus:outline-none">
                      <img src={data.attachmentUrl} alt="attachment"
                        className="w-full max-h-48 rounded-xl border border-gray-200 object-cover transition-opacity group-hover:opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <span className="bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <HiOutlineZoomIn className="w-4 h-4" /> Preview
                        </span>
                      </div>
                    </button>
                  ) : (
                    <button type="button" onClick={() => setShowPreview(true)}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-left">
                      <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <HiOutlineDocumentText className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{data.attachmentName || "Lihat File"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Klik untuk preview PDF</p>
                      </div>
                      <HiOutlineZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default TimeOffDetailPage;
