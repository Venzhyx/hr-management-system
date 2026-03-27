import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  HiOutlineSearch, HiOutlineRefresh, HiOutlineFilter,
  HiOutlineChevronDown, HiOutlineClock, HiOutlineCheck,
  HiOutlineX, HiOutlineDocumentText, HiOutlineZoomIn,
  HiOutlineOfficeBuilding, HiOutlineBriefcase,
} from "react-icons/hi";
import { useTimeOff }   from "../../../redux/hooks/useTimeOff";
import { useEmployee }  from "../../../redux/hooks/useEmployee";

const fmtDateShort = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_CFG = {
  SUBMITTED: { cls: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400",   label: "Pending"  },
  APPROVED:  { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Approved" },
  REJECTED:  { cls: "bg-red-50 text-red-700 border border-red-200",             dot: "bg-red-400",     label: "Rejected" },
};
const ALL_STATUSES = ["SUBMITTED", "APPROVED", "REJECTED"];

const Spinner = ({ cls = "w-4 h-4" }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

/* ── Toast ── */
const Toast = ({ message, type = "success", onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
    ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${type === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
      {type === "success" ? <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-600" /> : <HiOutlineX className="w-3.5 h-3.5 text-red-600" />}
    </span>
    {message}
    <button onClick={onClose} className="ml-1 p-0.5 hover:opacity-60"><HiOutlineX className="w-3.5 h-3.5" /></button>
  </div>
);

/* ── Filter Dropdown ── */
const FilterDropdown = ({ activeFilters, onChange, counts }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (s) => {
    if (activeFilters.includes(s)) {
      if (activeFilters.length === 1) return;
      onChange(activeFilters.filter(x => x !== s));
    } else onChange([...activeFilters, s]);
  };
  const isAll = activeFilters.length === ALL_STATUSES.length;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${!isAll ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
        <HiOutlineFilter className="w-4 h-4" />
        <span className="font-medium">Status</span>
        <HiOutlineChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Status</span>
          </div>
          <div className="py-1.5">
            <button onClick={() => onChange(isAll ? ["SUBMITTED"] : [...ALL_STATUSES])}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 mb-1">
              <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${isAll ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                {isAll && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </span>
              <span className="text-sm text-gray-700 font-medium">All</span>
              <span className="ml-auto text-xs text-gray-400">{Object.values(counts).reduce((a,b)=>a+b,0)}</span>
            </button>
            {ALL_STATUSES.map(status => {
              const cfg = STATUS_CFG[status];
              const checked = activeFilters.includes(status);
              const isLast  = activeFilters.length === 1 && checked;
              return (
                <button key={status} onClick={() => toggle(status)} disabled={isLast}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${isLast ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}>
                  <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${checked ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                    {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  </span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className="text-sm text-gray-700 font-medium">{cfg.label}</span>
                  <span className="ml-auto text-xs text-gray-400">{counts[status] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ══ Side Panel ══ */
const ApprovalPanel = ({ request, emp, onClose, onApprove, onReject, actionLoading }) => {
  const [showPreview, setShowPreview] = useState(false);
  if (!request) return null;

  const sCfg     = STATUS_CFG[request.status] || STATUS_CFG.SUBMITTED;
  const isImage  = request.attachmentUrl && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(request.attachmentUrl);
  const initials = request.employeeName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const isPending = request.status === "SUBMITTED";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {showPreview && request.attachmentUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Attachment Preview</span>
              <button onClick={() => setShowPreview(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><HiOutlineX className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-50">
              {isImage
                ? <img src={request.attachmentUrl} alt="attachment" className="max-w-full max-h-full object-contain rounded-xl shadow" />
                : <iframe src={request.attachmentUrl} title="PDF" className="w-full rounded-lg border border-gray-200" style={{ height: "65vh" }} />}
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Approval</p>
            <h2 className="text-lg font-bold text-gray-800">Detail Request</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HiOutlineX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Employee */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
              {emp?.photo
                ? <img src={emp.photo} alt={request.employeeName} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">{initials}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{request.employeeName}</p>
              {(emp?.jobTitle || emp?.position) && (
                <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <HiOutlineBriefcase className="w-3 h-3" /> {emp.jobTitle || emp.position}
                </p>
              )}
              {emp?.departmentName && (
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <HiOutlineOfficeBuilding className="w-3 h-3" /> {emp.departmentName}
                </p>
              )}
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${sCfg.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
              {sCfg.label}
            </span>
          </div>

          {/* Days + Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">{request.requested ?? "—"}</p>
              <p className="text-xs text-indigo-400 font-medium mt-0.5">Hari</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center col-span-2">
              <p className="text-sm font-semibold text-gray-700">{fmtDateShort(request.startDate)}</p>
              <p className="text-xs text-gray-300 my-0.5">→</p>
              <p className="text-sm font-semibold text-gray-700">{fmtDateShort(request.endDate)}</p>
            </div>
          </div>

          {/* Type + Submitted */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium mb-1">Tipe Cuti</p>
              <p className="text-sm font-semibold text-gray-800">{request.timeOffTypeName || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium mb-1">Diajukan</p>
              <p className="text-sm font-semibold text-gray-800">{fmtDateShort(request.createdAt)}</p>
            </div>
          </div>

          {request.reason && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Alasan</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">{request.reason}</p>
            </div>
          )}

          {request.attachmentUrl && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Attachment</p>
              {isImage ? (
                <button type="button" onClick={() => setShowPreview(true)} className="block group relative w-full focus:outline-none">
                  <img src={request.attachmentUrl} alt="attachment" className="w-full max-h-40 rounded-xl border border-gray-200 object-cover transition-opacity group-hover:opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <span className="bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <HiOutlineZoomIn className="w-3.5 h-3.5" /> Preview
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
                    <p className="text-sm font-medium text-gray-800 truncate">{request.attachmentName || "Lihat File"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Klik untuk preview</p>
                  </div>
                  <HiOutlineZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          {isPending ? (
            <div className="flex gap-3">
              <button onClick={onReject} disabled={!!actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors shadow-sm">
                {actionLoading === "reject" ? <Spinner /> : <HiOutlineX className="w-4 h-4" />} Reject
              </button>
              <button onClick={onApprove} disabled={!!actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors shadow-sm">
                {actionLoading === "approve" ? <Spinner /> : <HiOutlineCheck className="w-4 h-4" />} Approve
              </button>
            </div>
          ) : (
            <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border ${sCfg.cls}`}>
              <span className={`w-2 h-2 rounded-full ${sCfg.dot}`} />
              Request sudah {sCfg.label}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ══ Main Page ══ */
const ApprovalTimeOffPage = () => {
  const { timeOffRequests, fetchTimeOffRequests, approveTimeOffRequest, rejectTimeOffRequest } = useTimeOff();
  const { employees, fetchEmployees } = useEmployee();

  const empMap = React.useMemo(() => {
    const m = {};
    (employees || []).forEach(e => { m[String(e.id)] = e; });
    return m;
  }, [employees]);

  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [activeFilters, setActiveFilters] = useState([...ALL_STATUSES]);
  const [selected,      setSelected]      = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast,         setToast]         = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { await fetchTimeOffRequests(); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); fetchEmployees(); }, [load]);

  // Sync panel when list updates
  useEffect(() => {
    if (selected) {
      const updated = (timeOffRequests || []).find(r => r.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [timeOffRequests]);

  const stats = (timeOffRequests || []).reduce(
    (acc, r) => { acc.total++; if(r.status==="SUBMITTED") acc.pending++; if(r.status==="APPROVED") acc.approved++; if(r.status==="REJECTED") acc.rejected++; return acc; },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );
  const counts = (timeOffRequests || []).reduce((acc, r) => { acc[r.status] = (acc[r.status]||0)+1; return acc; }, {});

  const sorted = [...(timeOffRequests || [])].sort((a,b) => {
    const o = { SUBMITTED:0, APPROVED:1, REJECTED:2 };
    return (o[a.status]??3)-(o[b.status]??3);
  });

  const filtered = sorted.filter(r => {
    if (!activeFilters.includes(r.status)) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.employeeName?.toLowerCase().includes(q) || r.timeOffTypeName?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleApprove = async () => {
    if (!selected) return;
    setActionLoading("approve");
    try {
      await approveTimeOffRequest(selected.id);
      showToast(`Request ${selected.employeeName} berhasil di-approve.`);
    } catch (err) {
      showToast(err?.message || "Gagal approve.", "error");
    } finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!selected) return;
    setActionLoading("reject");
    try {
      await rejectTimeOffRequest(selected.id);
      showToast(`Request ${selected.employeeName} di-reject.`, "error");
    } catch (err) {
      showToast(err?.message || "Gagal reject.", "error");
    } finally { setActionLoading(null); }
  };

  return (
    <div className="w-full px-4 md:px-6 py-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Approval Time Off</h1>
        {stats.pending > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {stats.pending} pending
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
            <HiOutlineClock className="w-3 h-3 text-indigo-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Status Overview</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-gray-100">
          {[
            { label:"Total",    value: stats.total,    color:"text-gray-800"    },
            { label:"Pending",  value: stats.pending,  color:"text-amber-600"   },
            { label:"Approved", value: stats.approved, color:"text-emerald-600" },
            { label:"Rejected", value: stats.rejected, color:"text-red-500"     },
          ].map((s,i) => (
            <div key={s.label} className={i>0?"pl-6":""}>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value??0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama / tipe cuti…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <FilterDropdown activeFilters={activeFilters} onChange={setActiveFilters} counts={counts} />
        <div className="flex-1" />
        <button onClick={load} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-40" title="Refresh">
          <HiOutlineRefresh className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner cls="w-6 h-6 text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
          <HiOutlineClock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Tidak ada data</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Employee","Tipe Cuti","Tanggal","Durasi","Status","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => {
                const sCfg    = STATUS_CFG[r.status] || STATUS_CFG.SUBMITTED;
                const emp     = empMap[String(r.employeeId)];
                const initials = r.employeeName?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"?";
                const isActive = selected?.id === r.id;

                return (
                  <tr key={r.id} onClick={() => setSelected(r)}
                    className={`transition-colors cursor-pointer ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"}`}>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-gray-200">
                          {emp?.photo
                            ? <img src={emp.photo} alt={r.employeeName} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-[10px]">{initials}</div>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 whitespace-nowrap">{r.employeeName}</p>
                          {emp?.departmentName && <p className="text-xs text-gray-400">{emp.departmentName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.timeOffTypeName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">
                      {fmtDateShort(r.startDate)} <span className="text-gray-300 mx-1">→</span> {fmtDateShort(r.endDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.requested} hari</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sCfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} /> {sCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {r.status === "SUBMITTED" ? (
                        <button onClick={() => setSelected(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                          <HiOutlineCheck className="w-3.5 h-3.5" /> Review
                        </button>
                      ) : (
                        <button onClick={() => setSelected(r)} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">Detail</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ApprovalPanel
          request={selected}
          emp={empMap[String(selected.employeeId)]}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default ApprovalTimeOffPage;
