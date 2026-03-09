import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlus, HiOutlineSearch, HiOutlineEye,
  HiOutlinePencil, HiOutlineTrash, HiOutlineCurrencyDollar,
  HiOutlineChevronLeft, HiOutlineChevronRight
} from "react-icons/hi";
import { useReimbursement } from "../../../redux/hooks/useReimbursement";

const STATUS_CFG = {
  SUBMITTED: { label: "Submitted", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  APPROVED:  { label: "Approved",  cls: "bg-green-50 text-green-700 border-green-200"   },
  REJECTED:  { label: "Rejected",  cls: "bg-red-50 text-red-700 border-red-200"         },
};

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const Badge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { label: status, cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const ReimbursementIndex = () => {
  const navigate = useNavigate();
  const { reimbursements, fetchReimbursements, deleteReimbursement, loading } = useReimbursement();

  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page,         setPage]         = useState(1);
  const [toast,        setToast]        = useState(null);
  const PER_PAGE = 10;

  useEffect(() => { fetchReimbursements(); }, []);

  // Toast dari navigate state
  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.toast) {
      setToast(state.toast);
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  const filtered = (reimbursements || []).filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      r.title?.toLowerCase().includes(q)        ||
      r.category?.toLowerCase().includes(q)     ||
      r.employeeName?.toLowerCase().includes(q); // ← pakai employeeName (dari ReimbursementResponse)
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reimbursement?")) return;
    try {
      await deleteReimbursement(id);
      setToast({ type: "success", message: "Reimbursement deleted." });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ type: "error", message: "Failed to delete." });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 py-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium border ${
          toast.type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reimbursements</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} records found</p>
        </div>
        <button
          onClick={() => navigate("/reimbursements/add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Reimbursement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search title, category, employee…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Loading…</td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <HiOutlineCurrencyDollar className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No reimbursements found</p>
                      <p className="text-gray-400 text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : paged.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(r.expenseDate)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">{r.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                    {fmt(r.total)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {r.employeeName || "—"}
                  </td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => navigate(`/reimbursements/detail/${r.id}`)}
                        className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600" title="View">
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                      {r.status === "SUBMITTED" && (
                        <button
                          onClick={() => navigate(`/reimbursements/edit/${r.id}`)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors text-amber-600" title="Edit">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500" title="Delete">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReimbursementIndex;
