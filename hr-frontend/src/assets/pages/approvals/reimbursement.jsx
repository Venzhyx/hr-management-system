import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineX, HiOutlineUser, HiOutlineCheck,
  HiOutlineEye, HiOutlineArrowLeft,
} from "react-icons/hi";
import { useApproval }      from "../../../redux/hooks/useApproval";
import { useReimbursement } from "../../../redux/hooks/useReimbursement";

const STATUS_COLOR = {
  SUBMITTED: "bg-yellow-100 text-yellow-700",
  APPROVED:  "bg-green-100 text-green-700",
  REJECTED:  "bg-red-100 text-red-700",
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Detail Reimbursement</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <HiOutlineX className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="px-6 py-4 space-y-3">
        {[
          ["Title",        item.title],
          ["Employee",     item.employeeName],
          ["Category",     item.category],
          ["Expense Date", item.expenseDate],
          ["Total",        `Rp ${item.total?.toLocaleString("id-ID")}`],
          ["Paid By",      item.paidBy],
          ["Status",       item.status],
          ["Notes",        item.notes || "—"],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-3">
            <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-gray-800">{value}</span>
          </div>
        ))}
        {item.receiptFile && (
          <div className="flex gap-3">
            <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Receipt</span>
            <a href={item.receiptFile} target="_blank" rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline">View Receipt</a>
          </div>
        )}
      </div>
      <div className="px-6 pb-5">
        <button onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
          Close
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ApprovalReimbursementPage = () => {
  const navigate = useNavigate();

  const { approveReimbursement, rejectReimbursement } = useApproval();
  const { reimbursements, fetchReimbursements }       = useReimbursement();

  const [actionMap,  setActionMap]  = useState({});
  const [notes,      setNotes]      = useState({});
  const [approverId, setApproverId] = useState("");
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => {
    fetchReimbursements();
  }, []);

  const handle = async (id, action) => {
    if (!approverId) { alert("Please enter your Employee ID as approver"); return; }
    setActionMap((p) => ({ ...p, [id]: action }));
    try {
      const params = { id, approverId: parseInt(approverId), notes: notes[id] || "" };
      if (action === "approve") await approveReimbursement(params);
      else await rejectReimbursement(params);
    } finally {
      setActionMap((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  const sorted = [
    ...reimbursements.filter((r) => r.status === "SUBMITTED"),
    ...reimbursements.filter((r) => r.status !== "SUBMITTED"),
  ];

  return (
    <>
      <div className="w-full px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/approvals")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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

        {/* Approver ID input */}
        <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl mb-5 shadow-sm">
          <HiOutlineUser className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Your Employee ID (approver):</label>
          <input type="number" value={approverId} onChange={(e) => setApproverId(e.target.value)}
            placeholder="e.g. 5"
            className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
        </div>

        {/* Table */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
            <HiOutlineCheck className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No reimbursements found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Notes</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 truncate max-w-[140px]">{r.title}</p>
                      <p className="text-xs text-gray-400">{r.category} · {r.expenseDate}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{r.employeeName}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap text-xs">
                      Rp {r.total?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[r.status] || "bg-gray-100 text-gray-600"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "SUBMITTED" && (
                        <input value={notes[r.id] || ""}
                          onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="Notes…"
                          className="w-28 px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button onClick={() => setDetailItem(r)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                          <HiOutlineEye className="w-3.5 h-3.5" /> Detail
                        </button>
                        {r.status === "SUBMITTED" && (
                          <>
                            <button onClick={() => handle(r.id, "approve")} disabled={!!actionMap[r.id]}
                              className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap">
                              <HiOutlineCheck className="w-3.5 h-3.5" />
                              {actionMap[r.id] === "approve" ? "…" : "Approve"}
                            </button>
                            <button onClick={() => handle(r.id, "reject")} disabled={!!actionMap[r.id]}
                              className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors whitespace-nowrap">
                              <HiOutlineX className="w-3.5 h-3.5" />
                              {actionMap[r.id] === "reject" ? "…" : "Reject"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailItem && (
        <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </>
  );
};

export default ApprovalReimbursementPage;
