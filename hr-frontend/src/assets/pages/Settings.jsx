import React, { useState } from 'react';
import {
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineBriefcase,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineExclamation,
} from 'react-icons/hi';

// ─── Shared ────────────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-indigo-600' : 'bg-gray-300'
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? 'translate-x-4' : 'translate-x-1'
      }`}
    />
  </button>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

// ─── Toast ─────────────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slideIn ${
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-red-50 border-red-200 text-red-800'
  }`}>
    {type === 'success'
      ? <HiOutlineCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
      : <HiOutlineExclamation className="w-5 h-5 text-red-600 flex-shrink-0" />
    }
    {message}
    <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
      <HiOutlineX className="w-4 h-4" />
    </button>
  </div>
);

// ─── Attendance Settings ───────────────────────────────────────────────────────

const AttendanceSettings = ({ showToast }) => {
  const [form, setForm] = useState({
    toleranceMinutes: 15,
    extraHoursValidation: 'automatically',
  });

  const handleSave = () => {
    showToast('Attendance settings saved', 'success');
  };

  return (
    <SectionCard title="Extra Hours">
      <div className="space-y-5 max-w-lg">
        {/* Tolerance Time */}
        <div>
          <label className={labelCls}>
            Tolerance Time in Favor of Employee
            <span className="ml-1 text-gray-400 font-normal">(minutes)</span>
          </label>
          <input
            type="number"
            min={0}
            max={120}
            value={form.toleranceMinutes}
            onChange={e => setForm(f => ({ ...f, toleranceMinutes: e.target.value }))}
            className={`${inputCls} w-40`}
          />
          <p className="mt-1 text-xs text-gray-400">
            Grace period before overtime is counted against the employee.
          </p>
        </div>

        {/* Extra Hours Validation */}
        <div>
          <label className={labelCls}>Extra Hours Validation</label>
          <select
            value={form.extraHoursValidation}
            onChange={e => setForm(f => ({ ...f, extraHoursValidation: e.target.value }))}
            className={inputCls + ' w-64 appearance-none'}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25rem',
            }}
          >
            <option value="automatically">Automatically Approved</option>
            <option value="by_manager">By Manager</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            {form.extraHoursValidation === 'automatically'
              ? 'Extra hours are approved automatically without manager review.'
              : 'Extra hours require manager approval before being counted.'}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

// ─── Calendar Settings ─────────────────────────────────────────────────────────

const EVENT_TYPES = ['National Holiday', 'Collective Leave Day'];

const CalendarSettings = ({ showToast }) => {
  const [events, setEvents] = useState([
    { id: 1, date: '2025-01-01', name: "New Year's Day",       type: 'National Holiday' },
    { id: 2, date: '2025-08-17', name: 'Independence Day',     type: 'National Holiday' },
    { id: 3, date: '2025-12-25', name: 'Christmas Day',        type: 'National Holiday' },
    { id: 4, date: '2025-12-26', name: 'Christmas Collective', type: 'Collective Leave Day' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState({ date: '', name: '', type: 'National Holiday' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setEditEvent(null);
    setForm({ date: '', name: '', type: 'National Holiday' });
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setEditEvent(ev);
    setForm({ date: ev.date, name: ev.name, type: ev.type });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.date || !form.name.trim()) return;
    if (editEvent) {
      setEvents(prev => prev.map(e => e.id === editEvent.id ? { ...e, ...form } : e));
      showToast('Event updated', 'success');
    } else {
      setEvents(prev => [...prev, { id: Date.now(), ...form }]);
      showToast('Event added', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeleteTarget(null);
    showToast('Event deleted', 'success');
  };

  const TYPE_BADGE = {
    'National Holiday':    'bg-red-100 text-red-700',
    'Collective Leave Day': 'bg-blue-100 text-blue-700',
  };

  return (
    <>
      <SectionCard title="Calendar Events">
        <div className="flex justify-end mb-4">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 text-sm">
                    No events. Click "Add Event" to get started.
                  </td>
                </tr>
              ) : (
                events.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-gray-700 font-medium">
                      {new Date(ev.date + 'T00:00:00').toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3 text-gray-800">{ev.name}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_BADGE[ev.type] || 'bg-gray-100 text-gray-600'}`}>
                        {ev.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(ev)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(ev)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editEvent ? 'Edit Event' : 'Add Event'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Event Name</label>
                <input type="text" placeholder="e.g. Independence Day" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className={inputCls + ' appearance-none'}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem',
                  }}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave}
                disabled={!form.date || !form.name.trim()}
                className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {editEvent ? 'Save Changes' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <HiOutlineTrash className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Delete Event</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Delete <span className="font-semibold">{deleteTarget.name}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteTarget.id)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Time Off Settings ─────────────────────────────────────────────────────────

const LEAVE_TYPES = ['Leave', 'Permission'];

const TimeOffSettings = ({ showToast }) => {
  const [types, setTypes] = useState([
    { id: 1, name: 'Annual Leave',    type: 'Leave',      maxDays: 12, status: true },
    { id: 2, name: 'Sick Leave',      type: 'Leave',      maxDays: 14, status: true },
    { id: 3, name: 'Personal Leave',  type: 'Permission', maxDays: 3,  status: true },
    { id: 4, name: 'Unpaid Leave',    type: 'Leave',      maxDays: 30, status: false },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editType, setEditType]   = useState(null);
  const [form, setForm]           = useState({ name: '', type: 'Leave', maxDays: 1, status: true });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setEditType(null);
    setForm({ name: '', type: 'Leave', maxDays: 1, status: true });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditType(t);
    setForm({ name: t.name, type: t.type, maxDays: t.maxDays, status: t.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editType) {
      setTypes(prev => prev.map(t => t.id === editType.id ? { ...t, ...form } : t));
      showToast('Time off type updated', 'success');
    } else {
      setTypes(prev => [...prev, { id: Date.now(), ...form }]);
      showToast('Time off type added', 'success');
    }
    setShowModal(false);
  };

  const toggleStatus = (id) => {
    setTypes(prev => prev.map(t => t.id === id ? { ...t, status: !t.status } : t));
  };

  const handleDelete = (id) => {
    setTypes(prev => prev.filter(t => t.id !== id));
    setDeleteTarget(null);
    showToast('Time off type deleted', 'success');
  };

  return (
    <>
      <SectionCard title="Time Off Types">
        <div className="flex justify-end mb-4">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Type
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time Off Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Days</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {types.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    No time off types. Click "Add Type" to get started.
                  </td>
                </tr>
              ) : (
                types.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{t.name}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.type === 'Leave' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{t.maxDays} days</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Toggle checked={t.status} onChange={() => toggleStatus(t.id)} />
                        <span className={`text-xs font-medium ${t.status ? 'text-green-600' : 'text-gray-400'}`}>
                          {t.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(t)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editType ? 'Edit Time Off Type' : 'Add Time Off Type'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Time Off Type Name</label>
                <input type="text" placeholder="e.g. Annual Leave" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className={inputCls + ' appearance-none'}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem',
                  }}>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Max Days / Submission
                </label>
                <input type="number" min={1} max={365} value={form.maxDays}
                  onChange={e => setForm(f => ({ ...f, maxDays: parseInt(e.target.value) || 1 }))}
                  className={`${inputCls} w-40`} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <div className="flex items-center gap-3 mt-1">
                  <Toggle checked={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} />
                  <span className={`text-sm font-medium ${form.status ? 'text-green-600' : 'text-gray-400'}`}>
                    {form.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleSave}
                disabled={!form.name.trim()}
                className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {editType ? 'Save Changes' : 'Add Type'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <HiOutlineTrash className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Delete Time Off Type</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Delete <span className="font-semibold">{deleteTarget.name}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteTarget.id)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Main Settings Page ────────────────────────────────────────────────────────

const MENU = [
  { key: 'attendance', label: 'Attendance', icon: <HiOutlineClock className="w-5 h-5" /> },
  { key: 'calendar',   label: 'Calendar',   icon: <HiOutlineCalendar className="w-5 h-5" /> },
  { key: 'timeoff',    label: 'Time Off',   icon: <HiOutlineBriefcase className="w-5 h-5" /> },
];

const TITLES = {
  attendance: 'Attendance Settings',
  calendar:   'Calendar Settings',
  timeoff:    'Time Off Settings',
};

export default function Settings() {
  const [active, setActive]   = useState('attendance');
  const [toast,  setToast]    = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Settings Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 pt-6">
        <p className="px-5 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Settings
        </p>
        <nav className="px-3 space-y-0.5">
          {MENU.map(item => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active === item.key
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <span className={active === item.key ? 'text-indigo-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 px-8 py-6 overflow-y-auto">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{TITLES[active]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure {TITLES[active].toLowerCase()} preferences
          </p>
        </div>

        {active === 'attendance' && <AttendanceSettings showToast={showToast} />}
        {active === 'calendar'   && <CalendarSettings  showToast={showToast} />}
        {active === 'timeoff'    && <TimeOffSettings   showToast={showToast} />}
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
