import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash,
  HiOutlineCurrencyDollar, HiOutlineDocumentText,
  HiOutlineCheck, HiOutlineX, HiOutlineClock
} from "react-icons/hi";
import { useReimbursement } from "../../../redux/hooks/useReimbursement";

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

// ==================== COMPONENT ====================
const ReimbursementDetail = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const { getReimbursementById, deleteReimbursement } = useReimbursement();

  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await getReimbursementById(id);
        const item = res?.data ?? res; // hook already unwraps; handle both shapes
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

  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 py-6 flex justify-center items-center h-64">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
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
  }

  const statusCfg = STATUS_CFG[data.status] || { label: data.status, cls: "bg-gray-100 text-gray-600 border-gray-200", Icon: HiOutlineClock };

  // receiptFile is a URL string from backend
  const receipt  = data.receiptFile;
  const isImage  = receipt && /\.(jpg|jpeg|png)(\?|$)/i.test(receipt);

  return (
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

          {/* Card header */}
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

          {/* Fields */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
            <Field label="Expense Date" value={fmtDate(data.expenseDate)} />
            <Field label="Employee"     value={data.employeeName} />
            <Field label="Paid By"      value={data.paidBy === "EMPLOYEE" ? "Employee (reimbursed)" : "Company"} />
            <Field label="Category"     value={data.category} />
            {data.companyName && <Field label="Company"    value={data.companyName} />}
            <Field label="Submitted"    value={fmtDate(data.createdAt)} />
            <Field label="Last Updated" value={fmtDate(data.updatedAt)} />
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="px-6 pb-6">
              <p className="text-xs text-gray-400 font-medium mb-1">Notes</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">{data.notes}</p>
            </div>
          )}
        </div>

        {/* Receipt card — receiptFile is a URL string */}
        {receipt && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Attached Receipt</p>
            {isImage ? (
              <a href={receipt} target="_blank" rel="noreferrer">
                <img src={receipt} alt="receipt"
                  className="max-h-72 rounded-xl border border-gray-200 object-contain hover:opacity-90 transition-opacity cursor-pointer" />
              </a>
            ) : (
              <a href={receipt} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                <HiOutlineDocumentText className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">View Receipt</p>
                  <p className="text-xs text-gray-400 mt-0.5">Click to open in new tab</p>
                </div>
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ReimbursementDetail;
