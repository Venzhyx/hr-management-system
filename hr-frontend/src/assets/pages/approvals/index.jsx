import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineChevronRight,
  HiOutlineDotsVertical,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { useApproval }  from "../../../redux/hooks/useApproval";
import { useEmployee }  from "../../../redux/hooks/useEmployee";
import { useReimbursement } from "../../../redux/hooks/useReimbursement";

// ─── Add Approver Modal ───────────────────────────────────────────────────────
const AddApproverModal = ({ approvers, employees, onAdd, onClose }) => {
  const usedIds   = approvers.map((a) => a.employeeId);
  const active    = employees?.filter((e) => e.status === "ACTIVE" && !usedIds.includes(e.id)) || [];
  const nextOrder = approvers.length + 1;

  const [form,   setForm]   = useState({ employeeId: "", isRequired: null });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const handleSubmit = async () => {
    if (!form.employeeId)         { setError("Employee is required"); return; }
    if (form.isRequired === null) { setError("Required field must be selected"); return; }
    setSaving(true);
    setError(null);
    try {
      const currentRequired = approvers.filter((a) => a.isRequired === true).length;
      const newMinimum      = form.isRequired ? currentRequired + 1 : Math.max(currentRequired, 1);
      await onAdd({
        employeeId:      parseInt(form.employeeId),
        isRequired:      form.isRequired,
        approvalOrder:   nextOrder,
        minimumApproval: newMinimum,
      });
      onClose();
    } catch (e) {
      setError(e?.message || "Failed to add approver");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-800">Add Approver</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <HiOutlineX className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Employee</option>
              {active.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}{e.employeeCode ? ` (${e.employeeCode})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[{ val: true, label: "Required" }, { val: false, label: "Optional" }].map((opt) => (
                <label
                  key={String(opt.val)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.isRequired === opt.val
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input type="radio" className="accent-indigo-600 w-4 h-4 flex-shrink-0"
                    checked={form.isRequired === opt.val}
                    onChange={() => setForm((p) => ({ ...p, isRequired: opt.val }))} />
                  <span className={`text-sm font-medium ${form.isRequired === opt.val ? "text-indigo-700" : "text-gray-700"}`}>
                    {opt.label}
                  </span>
                  {opt.val && (
                    <span className="ml-auto text-xs text-gray-400">Counts toward minimum approval</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {saving ? "Saving…" : "Add Approver"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Approval Settings Modal ──────────────────────────────────────────────────
const ApprovalSettingsModal = ({ approvers, employees, onClose, onAddApprover, onDeleteApprover }) => {
  const sorted          = [...approvers].sort((a, b) => a.approvalOrder - b.approvalOrder);
  const minimumApproval = sorted.filter((a) => a.isRequired === true).length;

  const [showAdd,  setShowAdd]  = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Delete this approver?")) return;
    setDeleting(id);
    try { await onDeleteApprover(id); } finally { setDeleting(null); }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Approval Settings</h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage approvers for reimbursement</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <HiOutlineX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Approvers
                  <span className="ml-2 text-xs text-gray-400 font-normal">({sorted.length})</span>
                </h3>
                <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors">
                  <HiOutlinePlus className="w-3.5 h-3.5" /> Add Approver
                </button>
              </div>

              {sorted.length === 0 ? (
                <div className="text-center py-14 border border-dashed border-gray-300 rounded-xl">
                  <HiOutlineUser className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No approvers yet.</p>
                  <p className="text-xs text-gray-400 mt-0.5">Click "Add Approver" to add one.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Order</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Employee</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Required</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sorted.map((ap) => (
                        <tr key={ap.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400 text-xs">{ap.approvalOrder}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <HiOutlineUser className="w-3.5 h-3.5 text-indigo-600" />
                              </div>
                              <span className="text-gray-800 font-medium">{ap.employeeName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {ap.isRequired
                              ? <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">Required</span>
                              : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optional</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDelete(ap.id)} disabled={deleting === ap.id}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors disabled:opacity-50">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Minimum Approval counter */}
            <div className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${
              minimumApproval > 0 ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-200"
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                minimumApproval > 0 ? "bg-indigo-600" : "bg-gray-300"
              }`}>
                <HiOutlineShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${minimumApproval > 0 ? "text-indigo-800" : "text-gray-600"}`}>
                  Minimum Approval
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Auto-calculated from approvers with <span className="font-medium text-red-500">Required</span> status
                </p>
              </div>
              <div className={`text-3xl font-bold tabular-nums ${
                minimumApproval > 0 ? "text-indigo-600" : "text-gray-400"
              }`}>
                {minimumApproval}
              </div>
            </div>

            {minimumApproval === 0 && sorted.length > 0 && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl">
                <HiOutlineInformationCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  No approvers are marked as <span className="font-semibold">Required</span>. Minimum approval is 0 — all approvers are optional.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAdd && (
        <AddApproverModal
          approvers={approvers}
          employees={employees}
          onAdd={onAddApprover}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
};

// ─── Pending Badge ────────────────────────────────────────────────────────────
const PendingBadge = ({ count }) => {
  if (!count) return null;
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
};

// ─── Card with dots menu ──────────────────────────────────────────────────────
const ApprovalCard = ({ tab, pendingCount, onNavigate, onOpenSettings }) => {
  const Icon    = tab.icon;
  const menuRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const hasPending = pendingCount > 0;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      onClick={() => tab.available && onNavigate(tab.path)}
      className={`relative group bg-white rounded-2xl border-2 p-6 transition-all select-none ${
        tab.available
          ? hasPending
            ? "border-red-200 hover:border-red-400 hover:shadow-md cursor-pointer"
            : "border-gray-200 hover:border-indigo-400 hover:shadow-md cursor-pointer"
          : "border-gray-100 opacity-60 cursor-not-allowed"
      }`}
    >
      {/* Icon */}
      <div className="relative w-fit mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          tab.available
            ? hasPending
              ? "bg-red-50 group-hover:bg-red-500"
              : "bg-indigo-100 group-hover:bg-indigo-600"
            : "bg-gray-100"
        }`}>
          <Icon className={`w-6 h-6 transition-colors ${
            tab.available
              ? hasPending
                ? "text-red-500 group-hover:text-white"
                : "text-indigo-600 group-hover:text-white"
              : "text-gray-400"
          }`} />
        </div>

        {/* Red dot on icon */}
        {hasPending && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </div>

      <h2 className="text-base font-bold text-gray-800 mb-1">{tab.label}</h2>
      <p className="text-xs text-gray-500 leading-relaxed">{tab.description}</p>

      {/* Pending count — always shown for reimbursement */}
      {tab.key === "reimbursement" && (
        <div className="flex items-center gap-2 mt-3">
          <span className={`text-xs font-semibold ${hasPending ? "text-red-500" : "text-gray-400"}`}>
            Pending Review
          </span>
          <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full leading-none ${
            hasPending ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"
          }`}>
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        </div>
      )}

      {!tab.available && (
        <span className="absolute top-4 right-4 text-[10px] font-semibold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
          Coming soon
        </span>
      )}

      {tab.available && (
        <div
          ref={menuRef}
          className="absolute top-4 right-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiOutlineDotsVertical className="w-4 h-4 text-gray-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-48">
              <button
                onClick={() => { setMenuOpen(false); onOpenSettings(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <HiOutlineShieldCheck className="w-4 h-4 text-indigo-500" />
                Approval Settings
              </button>
            </div>
          )}
        </div>
      )}

      {tab.available && (
        <div className={`absolute bottom-5 right-5 transition-colors ${
          hasPending ? "text-red-300 group-hover:text-red-500" : "text-gray-300 group-hover:text-indigo-500"
        }`}>
          <HiOutlineChevronRight className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

// ─── TABS config ──────────────────────────────────────────────────────────────
const TABS = [
  {
    key:         "reimbursement",
    label:       "Reimbursement",
    description: "Review and approve expense reimbursement requests",
    icon:        HiOutlineClipboardList,
    path:        "/approvals/reimbursement",
    available:   true,
  },
  {
    key:         "attendance",
    label:       "Attendance",
    description: "Review and approve attendance correction requests",
    icon:        HiOutlineClock,
    path:        "/approvals/attendance",
    available:   false,
  },
  {
    key:         "timeoff",
    label:       "Time Off",
    description: "Review and approve time off requests",
    icon:        HiOutlineShieldCheck,
    path:        "/approvals/timeoff",
    available:   false,
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const ApprovalPage = () => {
  const navigate = useNavigate();
  const { approvers, fetchApprovalApprovers, createApprovalApprover, deleteApprovalApprover } = useApproval();
  const { employees, fetchEmployees }       = useEmployee();
  const { reimbursements, fetchReimbursements } = useReimbursement();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchApprovalApprovers();
    fetchEmployees();
    fetchReimbursements();
  }, []);

  const pendingCounts = {
    reimbursement: (reimbursements || []).filter((r) => r.status === "SUBMITTED").length,
  };

  const totalPending = Object.values(pendingCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="w-full px-4 md:px-6 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Approval</h1>
            {totalPending > 0 && <PendingBadge count={totalPending} />}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Select a category to manage approval workflows
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TABS.map((tab) => (
            <ApprovalCard
              key={tab.key}
              tab={tab}
              pendingCount={pendingCounts[tab.key] ?? 0}
              onNavigate={navigate}
              onOpenSettings={() => setShowSettings(true)}
            />
          ))}
        </div>
      </div>

      {showSettings && (
        <ApprovalSettingsModal
          approvers={approvers}
          employees={employees}
          onClose={() => setShowSettings(false)}
          onAddApprover={createApprovalApprover}
          onDeleteApprover={deleteApprovalApprover}
        />
      )}
    </>
  );
};

export default ApprovalPage;
