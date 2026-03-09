import React, { useState, useEffect, useRef } from "react";
import {
  HiOutlineShieldCheck, HiOutlineDotsVertical, HiOutlineX,
  HiOutlinePlus, HiOutlineTrash, HiOutlineUser, HiOutlineCheck,
  HiOutlineClipboardList, HiOutlineClock, HiOutlinePencil, HiOutlineEye,
} from "react-icons/hi";
import { useApproval } from "../../../redux/hooks/useApproval";
import { useReimbursement } from "../../../redux/hooks/useReimbursement";
import { useEmployee } from "../../../redux/hooks/useEmployee";

const TABS = [
  { key: "reimbursement", label: "Reimbursement", icon: HiOutlineClipboardList },
  { key: "attendance",    label: "Attendance",    icon: HiOutlineClock },
  { key: "timeoff",       label: "Time Off",      icon: HiOutlineShieldCheck },
];

const STATUS_COLOR = {
  SUBMITTED: "bg-yellow-100 text-yellow-700",
  APPROVED:  "bg-green-100 text-green-700",
  REJECTED:  "bg-red-100 text-red-700",
};

// ─── Add Approver Modal ───────────────────────────────────────────────────────
// Fields: Select Employee, Required (True/False + Notes), Minimum Approval
const AddApproverModal = ({ setting, approvers, employees, onAdd, onUpdateSetting, onClose }) => {
  const usedIds   = approvers.filter(a => a.approvalSettingId === setting.id).map(a => a.employeeId);
  const active    = employees?.filter(e => e.status === "ACTIVE" && !usedIds.includes(e.id)) || [];
  const nextOrder = approvers.filter(a => a.approvalSettingId === setting.id).length + 1;

  const [form, setForm] = useState({
    employeeId:    "",
    isRequired:    null, // null = belum pilih
    notes:         "",
    minimumApproval: setting.minimumApproval,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const handleSubmit = async () => {
    if (!form.employeeId)          { setError("Employee is required"); return; }
    if (form.isRequired === null)  { setError("Required field must be selected"); return; }
    setSaving(true); setError(null);
    try {
      // Update minimum approval kalau berubah
      if (parseInt(form.minimumApproval) !== setting.minimumApproval) {
        await onUpdateSetting({ id: setting.id, module: setting.module, minimumApproval: parseInt(form.minimumApproval) });
      }
      await onAdd({
        approvalSettingId: setting.id,
        employeeId:    parseInt(form.employeeId),
        isRequired:    form.isRequired,
        approvalOrder: nextOrder,
      });
      onClose();
    } catch (e) {
      setError(e?.message || "Failed to add approver");
    } finally { setSaving(false); }
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

          {/* Select Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select value={form.employeeId}
              onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select Employee</option>
              {active.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name}{e.employeeCode ? ` (${e.employeeCode})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Required — True/False dengan Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { val: true,  label: "True" },
                { val: false, label: "False" },
              ].map(opt => (
                <label key={String(opt.val)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.isRequired === opt.val
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <input type="radio" className="accent-indigo-600 w-4 h-4"
                    checked={form.isRequired === opt.val}
                    onChange={() => setForm(p => ({ ...p, isRequired: opt.val }))} />
                  <span className={`text-sm font-medium ${form.isRequired === opt.val ? "text-indigo-700" : "text-gray-700"}`}>
                    {opt.label}
                  </span>
                  {/* Notes field muncul di sebelah kanan setelah dipilih */}
                  {form.isRequired === opt.val && (
                    <input
                      value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Notes (optional)"
                      onClick={e => e.stopPropagation()}
                      className="ml-auto flex-1 px-2.5 py-1 border border-indigo-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Approval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Approval</label>
            <input type="number" min={1} value={form.minimumApproval}
              onChange={e => setForm(p => ({ ...p, minimumApproval: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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

// ─── Edit Approver Modal ──────────────────────────────────────────────────────
const EditApproverModal = ({ approver, setting, onSave, onClose }) => {
  const [form, setForm] = useState({
    isRequired: approver.isRequired,
    notes:      "",
    minimumApproval: setting.minimumApproval,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try { await onSave({ ...form }); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-800">Edit Approver</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <HiOutlineX className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* Employee (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <HiOutlineUser className="w-3 h-3 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-700">{approver.employeeName}</span>
            </div>
          </div>

          {/* Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required</label>
            <div className="space-y-2">
              {[{ val: true, label: "True" }, { val: false, label: "False" }].map(opt => (
                <label key={String(opt.val)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.isRequired === opt.val ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <input type="radio" className="accent-indigo-600 w-4 h-4"
                    checked={form.isRequired === opt.val}
                    onChange={() => setForm(p => ({ ...p, isRequired: opt.val }))} />
                  <span className={`text-sm font-medium ${form.isRequired === opt.val ? "text-indigo-700" : "text-gray-700"}`}>
                    {opt.label}
                  </span>
                  {form.isRequired === opt.val && (
                    <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Notes (optional)" onClick={e => e.stopPropagation()}
                      className="ml-auto flex-1 px-2.5 py-1 border border-indigo-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Approval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Approval</label>
            <input type="number" min={1} value={form.minimumApproval}
              onChange={e => setForm(p => ({ ...p, minimumApproval: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Reimbursement Detail Modal ───────────────────────────────────────────────
const DetailModal = ({ item, onClose }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Detail Reimbursement</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><HiOutlineX className="w-5 h-5 text-gray-500" /></button>
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
            <a href={item.receiptFile} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">View Receipt</a>
          </div>
        )}
      </div>
      <div className="px-6 pb-5">
        <button onClick={onClose} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">Close</button>
      </div>
    </div>
  </div>
);

// ─── Approval Settings Modal ──────────────────────────────────────────────────
// Tombol Add Approver di atas, tabel approver di bawah (Edit + Delete)
const ApprovalSettingsModal = ({ setting, approvers, employees, onClose, onAddApprover, onDeleteApprover, onUpdateSetting }) => {
  const myApprovers = approvers
    .filter(a => a.approvalSettingId === setting.id)
    .sort((a, b) => a.approvalOrder - b.approvalOrder);

  const [showAdd,   setShowAdd]   = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [deleting,  setDeleting]  = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Delete this approver?")) return;
    setDeleting(id);
    try { await onDeleteApprover(id); } finally { setDeleting(null); }
  };

  // Edit: hanya update isRequired & minimumApproval (backend tidak ada update approver endpoint,
  // jadi kita update setting saja untuk minimumApproval)
  const handleEdit = async (data) => {
    if (parseInt(data.minimumApproval) !== setting.minimumApproval) {
      await onUpdateSetting({ id: setting.id, module: setting.module, minimumApproval: parseInt(data.minimumApproval) });
    }
    setEditItem(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-800 capitalize">
                {setting.module} — Approval Settings
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage approvers for this module</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <HiOutlineX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            {/* Tombol Add Approver di atas tabel */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Approvers
                <span className="ml-2 text-xs text-gray-400 font-normal">({myApprovers.length})</span>
              </h3>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors">
                <HiOutlinePlus className="w-3.5 h-3.5" />
                Add Approver
              </button>
            </div>

            {/* Tabel Approver */}
            {myApprovers.length === 0
              ? (
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
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {myApprovers.map(ap => (
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
                              : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optional</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit Approver */}
                              <button onClick={() => setEditItem(ap)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                                <HiOutlinePencil className="w-3 h-3" />
                                Edit
                              </button>
                              {/* Delete Approver */}
                              <button onClick={() => handleDelete(ap.id)} disabled={deleting === ap.id}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors disabled:opacity-50">
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Add Approver Modal */}
      {showAdd && (
        <AddApproverModal
          setting={setting}
          approvers={approvers}
          employees={employees}
          onAdd={onAddApprover}
          onUpdateSetting={onUpdateSetting}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Edit Approver Modal */}
      {editItem && (
        <EditApproverModal
          approver={editItem}
          setting={setting}
          onSave={handleEdit}
          onClose={() => setEditItem(null)}
        />
      )}
    </>
  );
};

// ─── Tab Card ─────────────────────────────────────────────────────────────────
const TabCard = ({ tab, approvers, isActive, onClick, onOpenSettings }) => {
  const count   = approvers.filter(a => a.approvalSettingId === tab.settingId).length;
  const Icon    = tab.icon;
  const menuRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div onClick={onClick}
      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
        isActive ? "border-indigo-500 bg-indigo-50 shadow-md" : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm"
      }`}>

      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-indigo-600" : "bg-gray-100"}`}>
        <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isActive ? "text-indigo-700" : "text-gray-800"}`}>{tab.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{count} reviewer(s)</p>
      </div>

      {/* Titik 3 → dropdown → Approval Settings */}
      <div ref={menuRef} className="relative" onClick={e => e.stopPropagation()}>
        <button onClick={() => setMenuOpen(v => !v)}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
          <HiOutlineDotsVertical className="w-4 h-4 text-gray-500" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-30 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-48">
            <button
              onClick={() => { setMenuOpen(false); onOpenSettings(tab); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <HiOutlineShieldCheck className="w-4 h-4 text-indigo-500" />
              Approval Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reimbursement Panel: tabel dengan Detail, Approve, Reject ────────────────
const ReimbursementPanel = ({ reimbursements, onApprove, onReject }) => {
  const [actionMap,  setActionMap]  = useState({});
  const [notes,      setNotes]      = useState({});
  const [approverId, setApproverId] = useState("");
  const [detailItem, setDetailItem] = useState(null);

  const handle = async (id, action) => {
    if (!approverId) { alert("Please enter your Employee ID as approver"); return; }
    setActionMap(p => ({ ...p, [id]: action }));
    try {
      const params = { id, approverId: parseInt(approverId), notes: notes[id] || "" };
      if (action === "approve") await onApprove(params);
      else await onReject(params);
    } finally {
      setActionMap(p => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  const all = [
    ...reimbursements.filter(r => r.status === "SUBMITTED"),
    ...reimbursements.filter(r => r.status !== "SUBMITTED"),
  ];

  return (
    <div className="mt-6 space-y-4">
      {/* Approver ID */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Your Employee ID (approver):</label>
        <input type="number" value={approverId} onChange={e => setApproverId(e.target.value)}
          placeholder="e.g. 5"
          className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
      </div>

      {all.length === 0
        ? (
          <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl">
            <HiOutlineCheck className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium">No reimbursements found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
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
                {all.map(r => (
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
                        <input value={notes[r.id] || ""} onChange={e => setNotes(p => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="Notes…"
                          className="w-28 px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Detail */}
                        <button onClick={() => setDetailItem(r)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                        {/* Approve & Reject — hanya untuk SUBMITTED */}
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
        )
      }

      {/* Detail Modal */}
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ApprovalPage = () => {
  const {
    settings, approvers, loading,
    fetchApprovalSettings, createApprovalSetting, updateApprovalSetting,
    fetchApprovalApprovers, createApprovalApprover, deleteApprovalApprover,
    approveReimbursement, rejectReimbursement,
  } = useApproval();

  const { reimbursements, fetchReimbursements } = useReimbursement();
  const { employees, fetchEmployees }           = useEmployee();

  const [activeTab,      setActiveTab]      = useState("reimbursement");
  const [settingsTarget, setSettingsTarget] = useState(null);
  const [pendingOpenTab, setPendingOpenTab] = useState(null);
  const [creating,       setCreating]       = useState(false);

  useEffect(() => {
    fetchApprovalSettings();
    fetchApprovalApprovers();
    fetchReimbursements();
    fetchEmployees();
  }, []);

  const tabs = TABS.map(t => ({
    ...t,
    settingId: settings.find(s => s.module === t.key)?.id ?? null,
    setting:   settings.find(s => s.module === t.key) ?? null,
  }));

  // Setelah settings refresh, buka modal tab yang pending
  useEffect(() => {
    if (!pendingOpenTab) return;
    const found = tabs.find(t => t.key === pendingOpenTab && t.setting);
    if (found) {
      setSettingsTarget(found);
      setPendingOpenTab(null);
      setCreating(false);
    }
  }, [settings, pendingOpenTab]);

  // Klik titik 3 → buka modal, auto-create setting kalau belum ada
  const handleOpenSettings = async (tab) => {
    if (tab.setting) {
      setSettingsTarget(tab);
    } else {
      setCreating(true);
      try {
        await createApprovalSetting({ module: tab.key, minimumApproval: 1 });
        setPendingOpenTab(tab.key);
        fetchApprovalSettings();
      } catch (e) {
        setCreating(false);
        console.error(e);
      }
    }
  };

  return (
    <div className="w-full px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Approval</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage approval workflows and reviewers</p>
      </div>

      {/* Tab Cards */}
      {loading && settings.length === 0
        ? <p className="text-sm text-gray-400">Loading…</p>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tabs.map(tab => (
              <TabCard key={tab.key} tab={tab} approvers={approvers}
                isActive={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                onOpenSettings={handleOpenSettings} />
            ))}
          </div>
        )
      }

      {creating && (
        <p className="text-sm text-indigo-500 mt-3 animate-pulse">Creating approval setting…</p>
      )}

      {/* Content per tab */}
      {activeTab === "reimbursement" && (
        <ReimbursementPanel
          reimbursements={reimbursements}
          onApprove={approveReimbursement}
          onReject={rejectReimbursement}
        />
      )}
      {activeTab === "attendance" && (
        <div className="mt-6 text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
          <HiOutlineClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Attendance approvals — Coming soon</p>
        </div>
      )}
      {activeTab === "timeoff" && (
        <div className="mt-6 text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
          <HiOutlineShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Time Off approvals — Coming soon</p>
        </div>
      )}

      {/* Approval Settings Modal */}
      {settingsTarget?.setting && (
        <ApprovalSettingsModal
          setting={settingsTarget.setting}
          approvers={approvers}
          employees={employees}
          onClose={() => setSettingsTarget(null)}
          onAddApprover={createApprovalApprover}
          onDeleteApprover={deleteApprovalApprover}
          onUpdateSetting={updateApprovalSetting}
        />
      )}
    </div>
  );
};

export default ApprovalPage;
