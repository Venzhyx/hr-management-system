import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash,
  HiOutlineCurrencyDollar, HiOutlineDocumentText,
  HiOutlineCheck, HiOutlineX, HiOutlineClock,
  HiOutlineZoomIn, HiOutlineAnnotation, HiOutlineSave
} from "react-icons/hi";
import { useReimbursement } from "../../../redux/hooks/useReimbursement";
import API from "../../../api/api";

// ==================== HELPERS ====================
const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const STATUS_CFG = {
  SUBMITTED: { label: "Submitted", cls: "bg-yellow-50 text-yellow-700 border-yellow-200", Icon: HiOutlineClock },
  APPROVED:  { label: "Approved",  cls: "bg-green-50 text-green-700 border-green-200",   Icon: HiOutlineCheck },
  REJECTED:  { label: "Rejected",  cls: "bg-red-50 text-red-700 border-red-200",         Icon: HiOutlineX    },
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
    <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
  </div>
);

// ==================== RECEIPT MODAL ====================
const ReceiptModal = ({ url, onClose }) => {
  const isImage = url && (/\.(jpg|jpeg|png)(\?|$)/i.test(url) || url.startsWith("blob:"));

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Receipt Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}>
              <HiOutlineZoomIn className="w-3.5 h-3.5" /> Open full size
            </a>
            <button type="button" onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-50 min-h-0">
          {isImage
            ? <img src={url} alt="Receipt" className="max-w-full max-h-full object-contain rounded-lg shadow" />
            : <iframe src={url} title="Receipt PDF" className="w-full rounded-lg border border-gray-200 bg-white" style={{ height: "65vh" }} />
          }
        </div>
      </div>
    </div>
  );
};

// ==================== APPROVAL NOTES SECTION ====================
// Editable oleh atasan (di halaman ini), read-only di sisi karyawan (lihat EditReimbursement)
const ApprovalNotesSection = ({ reimbursementId, initialNotes, status, onSaved }) => {
  const [notes,  setNotes]  = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState(null);

  const isApproved  = status === "APPROVED";
  const borderCls   = isApproved ? "border-green-200 bg-green-50"  : "border-red-200 bg-red-50";
  const labelCls    = isApproved ? "text-green-800"                 : "text-red-800";
  const ringCls     = isApproved ? "focus:ring-green-400 border-green-300" : "focus:ring-red-400 border-red-300";
  const btnCls      = isApproved ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";
  const badgeCls    = isApproved ? "bg-green-100 text-green-700"    : "bg-red-100 text-red-700";

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Backend endpoint: PATCH /reimbursements/:id/review  body: { approvalNotes }
      await API.patch(`/reimbursements/${reimbursementId}/review`, {
        approvalNotes: notes.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (onSaved) onSaved(notes.trim() || null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save notes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rounded-xl border p-5 ${borderCls}`}>
      <div className="flex items-center gap-2 mb-3">
        <HiOutlineAnnotation className={`w-4 h-4 ${labelCls}`} />
        <p className={`text-sm font-semibold ${labelCls}`}>
          {isApproved ? "Approval Notes" : "Rejection Notes"}
        </p>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${badgeCls}`}>
          {isApproved ? "Approved" : "Rejected"}
        </span>
      </div>

      <textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        disabled={saving}
        rows={3}
        placeholder={
          isApproved
            ? "e.g., All receipts verified and amounts match. Approved."
            : "e.g., Receipt unclear, please resubmit with a clearer photo."
        }
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors resize-none disabled:opacity-60 ${ringCls}`}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <div className="flex items-center justify-between mt-3">
        <p className={`text-xs ${labelCls} opacity-70`}>
          Note ini akan terlihat oleh karyawan pada record mereka.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnCls}`}
        >
          {saving ? (
            <>
              <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving…
            </>
          ) : saved ? (
            <><HiOutlineCheck className="w-3 h-3" /> Saved!</>
          ) : (
            <><HiOutlineSave className="w-3 h-3" /> Save Notes</>
          )}
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const ReimbursementDetail = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const { getReimbursementById, deleteReimbursement } = useReimbursement();

  const [data,             setData]             = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [deleting,         setDeleting]         = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await getReimbursementById(id);
        const item = res?.data ?? res;
        if (!item?.id) throw new Error("Not found");
        setData(item);
      } catch (e) {
        console.error(e);
        setError("Failed to load reimbursement.");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this reimbursement?")) return;
    setDeleting(true);
    try {
      await deleteReimbursement(id);
      navigate("/reimbursements", {
        state: { toast: { show: true, message: "Reimbursement deleted.", type: "success" } }
      });
    } catch {
      alert("Failed to delete.");
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="w-full px-4 md:px-6 py-6 flex justify-center items-center h-64">
      <div className="text-gray-400">Loading…</div>
    </div>
  );

  if (error || !data) return (
    <div className="w-full px-4 md:px-6 py-6">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => navigate("/reimbursements")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Reimbursement Detail</h1>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">{error}</div>
    </div>
  );

  const statusCfg  = STATUS_CFG[data.status] || { label: data.status, cls: "bg-gray-100 text-gray-600 border-gray-200", Icon: HiOutlineClock };
  const receipt    = data.receiptFile;
  const isImage    = receipt && /\.(jpg|jpeg|png)(\?|$)/i.test(receipt);
  const isReviewed = data.status === "APPROVED" || data.status === "REJECTED";

  return (
    <>
      {showReceiptModal && receipt && (
        <ReceiptModal url={receipt} onClose={() => setShowReceiptModal(false)} />
      )}

      <div className="w-full px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate("/reimbursements")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reimbursement Detail</h1>
              <p className="text-sm text-gray-500 mt-0.5">ID: {id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.status === "SUBMITTED" && (
              <button onClick={() => navigate(`/reimbursements/edit/${id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                <HiOutlinePencil className="w-4 h-4" /> Edit
              </button>
            )}
            <button onClick={handleDelete} disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 transition-colors text-sm disabled:opacity-50">
              <HiOutlineTrash className="w-4 h-4" />
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        <div className="space-y-4">

          {/* Status banner */}
          <div className={`rounded-xl border px-5 py-4 flex items-center gap-3 ${statusCfg.cls}`}>
            <statusCfg.Icon className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Status: {statusCfg.label}</p>
              {data.status === "SUBMITTED" && (
                <p className="text-xs opacity-75 mt-0.5">Awaiting approval</p>
              )}
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 p-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <HiOutlineCurrencyDollar className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">{data.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{data.category}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{fmt(data.total)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
              <Field label="Expense Date" value={fmtDate(data.expenseDate)} />
              <Field label="Employee"     value={data.employeeName} />
              <Field label="Paid By"      value={data.paidBy === "EMPLOYEE" ? "Employee (reimbursed)" : "Company"} />
              <Field label="Category"     value={data.category} />
              {data.companyName && <Field label="Company"    value={data.companyName} />}
              <Field label="Submitted"    value={fmtDate(data.createdAt)} />
              <Field label="Last Updated" value={fmtDate(data.updatedAt)} />
            </div>

            {/* Employee notes — read-only */}
            {data.notes && (
              <div className="px-6 pb-6">
                <p className="text-xs text-gray-400 font-medium mb-1">Notes</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">{data.notes}</p>
              </div>
            )}
          </div>

          {/* Approval / Rejection Notes — editable oleh atasan */}
          {isReviewed && (
            <ApprovalNotesSection
              reimbursementId={id}
              initialNotes={data.approvalNotes}
              status={data.status}
              onSaved={(val) => setData(prev => ({ ...prev, approvalNotes: val }))}
            />
          )}

          {/* Receipt */}
          {receipt && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Attached Receipt</p>
              {isImage ? (
                <button type="button" onClick={() => setShowReceiptModal(true)}
                  className="block focus:outline-none group relative">
                  <img src={receipt} alt="receipt"
                    className="max-h-72 rounded-xl border border-gray-200 object-contain transition-opacity group-hover:opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <HiOutlineZoomIn className="w-4 h-4" /> Click to preview
                    </span>
                  </div>
                </button>
              ) : (
                <button type="button" onClick={() => setShowReceiptModal(true)}
                  className="inline-flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors w-full text-left">
                  <HiOutlineDocumentText className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">View Receipt</p>
                    <p className="text-xs text-gray-400 mt-0.5">Click to preview PDF</p>
                  </div>
                  <HiOutlineZoomIn className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ReimbursementDetail;
