import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineX, HiOutlineUser, HiOutlineCheck,
  HiOutlineEye, HiOutlineArrowLeft, HiOutlineClock,
  HiOutlineAnnotation, HiOutlineRefresh,
} from "react-icons/hi";
import { useReimbursement } from "../../../redux/hooks/useReimbursement";
import { useApproval }      from "../../../redux/hooks/useApproval";
import { getReimbursementApprovalsAPI } from "../../../api/approvalApi";

const STATUS_CFG = {
  SUBMITTED: { cls: "bg-yellow-100 text-yellow-700", label: "Submitted" },
  APPROVED:  { cls: "bg-green-100 text-green-700",   label: "Approved"  },
  REJECTED:  { cls: "bg-red-100 text-red-700",       label: "Rejected"  },
};
const AR_STATUS = {
  PENDING:  { cls: "bg-yellow-100 text-yellow-700", label: "Pending"  },
  APPROVED: { cls: "bg-green-100 text-green-700",   label: "Approved" },
  REJECTED: { cls: "bg-red-100 text-red-700",       label: "Rejected" },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmt = (n) =>
  n != null ? `Rp ${Number(n).toLocaleString("id-ID")}` : "—";

// ── Action Modal ──────────────────────────────────────────────────────────────
const ActionModal = ({ reimbursementId, reimbursementTitle, action, onClose, onSuccess }) => {
  const { processApproval } = useApproval();
  const [notes,   setNotes]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const isApprove = action === "APPROVED";
  const btnCls    = isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600";
  const iconBgCls = isApprove ? "bg-green-100" : "bg-red-100";
  const iconCls   = isApprove ? "text-green-600" : "text-red-500";
  const ringCls   = isApprove ? "focus:ring-green-400 border-green-300" : "focus:ring-red-400 border-red-300";
  const wrapCls   = isApprove ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      await processApproval(reimbursementId, action, notes);
      onSuccess(); onClose();
    } catch (err) {
  console.log("ERROR APPROVAL:", err);
  console.log("RESPONSE:", err?.response);
  console.log("DATA:", err?.response?.data);

  setError(err?.response?.data?.message || err?.message || "Gagal memproses approval.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`px-6 py-5 border-b ${wrapCls}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgCls}`}>
              {isApprove ? <HiOutlineCheck className={`w-5 h-5 ${iconCls}`} /> : <HiOutlineX className={`w-5 h-5 ${iconCls}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-800">
                {isApprove ? "Approve Reimbursement" : "Reject Reimbursement"}
              </h3>
              {reimbursementTitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{reimbursementTitle}</p>}
            </div>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/70 rounded-lg">
              <HiOutlineX className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg leading-relaxed">
              {error}
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineAnnotation className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">
              Notes
              {!isApprove ? <span className="text-red-500 ml-0.5">*</span>
                          : <span className="text-gray-400 font-normal ml-1">(opsional)</span>}
            </label>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={loading} rows={4}
            placeholder={isApprove ? "Contoh: Semua kwitansi sudah diverifikasi." : "Contoh: Kwitansi tidak jelas, mohon unggah ulang."}
            className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 transition-colors resize-none disabled:opacity-60 ${ringCls}`}
          />
          {!isApprove && !notes.trim() && (
            <p className="mt-1.5 text-xs text-red-500">Alasan penolakan wajib diisi.</p>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button type="button" onClick={onClose} disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={handleSubmit}
            disabled={loading || (!isApprove && !notes.trim())}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${btnCls}`}>
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Memproses…
              </>
            ) : isApprove ? (
              <><HiOutlineCheck className="w-4 h-4" /> Konfirmasi Approve</>
            ) : (
              <><HiOutlineX className="w-4 h-4" /> Konfirmasi Reject</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }) => {
  const [approvalRecords,  setApprovalRecords]  = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      setLoadingApprovals(true);
      try {
        const res  = await getReimbursementApprovalsAPI(item.id);
        const list = res.data?.data ?? res.data ?? [];
        setApprovalRecords(Array.isArray(list) ? list : []);
      } catch { setApprovalRecords([]); }
      finally  { setLoadingApprovals(false); }
    };
    load();
  }, [item.id]);

  const statusCfg = STATUS_CFG[item.status] || STATUS_CFG.SUBMITTED;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Detail Reimbursement</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <HiOutlineX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          <div className="flex gap-3 items-center">
            <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0">Status</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusCfg.cls}`}>{statusCfg.label}</span>
          </div>
          {[
            ["Title",        item.title],
            ["Employee",     item.employeeName],
            ["Category",     item.category],
            ["Expense Date", fmtDate(item.expenseDate)],
            ["Total",        fmt(item.total)],
            ["Paid By",      item.paidBy],
            ["Submitted",    fmtDate(item.createdAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-3">
              <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">{label}</span>
              <span className="text-sm text-gray-800">{value || "—"}</span>
            </div>
          ))}
          {item.notes && (
            <div className="flex gap-3">
              <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Notes</span>
              <p className="text-sm flex-1 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">{item.notes}</p>
            </div>
          )}
          {item.receiptFile && (
            <div className="flex gap-3">
              <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Receipt</span>
              <a href={item.receiptFile} target="_blank" rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline">Lihat Receipt</a>
            </div>
          )}

          {/* Approval History */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-3">Approval History</p>
            {loadingApprovals ? (
              <p className="text-xs text-gray-400">Memuat…</p>
            ) : approvalRecords.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Belum ada approval record. Pastikan approver sudah dikonfigurasi.
              </p>
            ) : (
              <div className="space-y-2">
                {approvalRecords.map((ar) => {
                  const arCfg = AR_STATUS[ar.status] || { cls: "bg-gray-100 text-gray-600", label: ar.status };
                  return (
                    <div key={ar.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <HiOutlineUser className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-gray-800">{ar.approverName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${arCfg.cls}`}>{arCfg.label}</span>
                          {ar.approvedAt && <span className="text-[10px] text-gray-400">{fmtDate(ar.approvedAt)}</span>}
                        </div>
                        {ar.notes && <p className="text-xs text-gray-500 mt-1 italic">"{ar.notes}"</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-gray-100">
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ApprovalReimbursementPage = () => {
  const navigate = useNavigate();
  const { reimbursements, fetchReimbursements } = useReimbursement();

  const [loading,     setLoading]     = useState(true);
  const [detailItem,  setDetailItem]  = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { await fetchReimbursements(); }
    finally { setLoading(false); }
  }, [fetchReimbursements]);

  useEffect(() => { load(); }, []);

  const sorted = [
    ...(reimbursements || []).filter((r) => r.status === "SUBMITTED"),
    ...(reimbursements || []).filter((r) => r.status !== "SUBMITTED"),
  ];

  return (
    <>
      <div className="w-full px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/approvals")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-medium">Approval</span>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-semibold text-gray-700">Reimbursement</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mt-0.5">Reimbursement Approvals</h1>
            </div>
          </div>
          <button onClick={load} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-40" title="Refresh">
            <HiOutlineRefresh className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400 text-sm">Memuat data…</div>
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
            <HiOutlineCheck className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Tidak ada data reimbursement</p>
          </div>
        )}

        {!loading && sorted.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tanggal</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((r) => {
                  const statusCfg = STATUS_CFG[r.status] || STATUS_CFG.SUBMITTED;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 truncate max-w-[160px]">{r.title || "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{r.category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <HiOutlineUser className="w-3 h-3 text-indigo-600" />
                          </div>
                          <span className="text-xs text-gray-700">{r.employeeName || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">{fmt(r.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cls}`}>{statusCfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="w-3 h-3" />{fmtDate(r.expenseDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button onClick={() => setDetailItem(r)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 whitespace-nowrap">
                            <HiOutlineEye className="w-3.5 h-3.5" /> Detail
                          </button>
                          {r.status === "SUBMITTED" && (
                            <>
                              <button
                                onClick={() => setActionModal({ reimbursementId: r.id, reimbursementTitle: r.title, action: "APPROVED" })}
                                className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 whitespace-nowrap">
                                <HiOutlineCheck className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => setActionModal({ reimbursementId: r.id, reimbursementTitle: r.title, action: "REJECTED" })}
                                className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 whitespace-nowrap">
                                <HiOutlineX className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {actionModal && (
        <ActionModal
          reimbursementId={actionModal.reimbursementId}
          reimbursementTitle={actionModal.reimbursementTitle}
          action={actionModal.action}
          onClose={() => setActionModal(null)}
          onSuccess={load}
        />
      )}
      {detailItem && (
        <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </>
  );
};

export default ApprovalReimbursementPage;
