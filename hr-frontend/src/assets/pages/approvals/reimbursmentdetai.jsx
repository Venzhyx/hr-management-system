import React, { useEffect, useState } from "react";
import {
  HiOutlineX,
  HiOutlineUser,
  HiOutlineCheck,
  HiOutlineAnnotation,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineReceiptTax,
  HiOutlineOfficeBuilding,
  HiOutlineTag,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineChevronDown,
  HiOutlinePhotograph,
  HiOutlineEye,
  HiOutlineDownload,
} from "react-icons/hi";
import { getReimbursementApprovalsAPI } from "../../../api/approvalApi";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmt = (n) =>
  n != null ? `Rp ${Number(n).toLocaleString("id-ID")}` : "—";

const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
const isPDF   = (url) => /\.pdf(\?.*)?$/i.test(url);

const STATUS_CFG = {
  SUBMITTED: { cls: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400",   label: "Submitted" },
  APPROVED:  { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Approved"  },
  REJECTED:  { cls: "bg-red-50 text-red-700 border border-red-200",             dot: "bg-red-400",     label: "Rejected"  },
};

const AR_STATUS = {
  PENDING:  { cls: "bg-amber-50 text-amber-700 border border-amber-200",       dot: "bg-amber-400",   label: "Pending"  },
  APPROVED: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", label: "Approved" },
  REJECTED: { cls: "bg-red-50 text-red-700 border border-red-200",             dot: "bg-red-400",     label: "Rejected" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Badge = ({ cfg }) =>
  cfg ? (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  ) : null;

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium break-words">{value || "—"}</p>
    </div>
  </div>
);

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</span>
        <HiOutlineChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 py-4 bg-white space-y-4">{children}</div>}
    </div>
  );
};

// ── Receipt inline preview ────────────────────────────────────────────────────
const ReceiptPreview = ({ url }) => {
  const [expanded, setExpanded] = useState(false);
  if (!url) return null;

  const img = isImage(url);
  const pdf = isPDF(url);

  return (
    <div className="space-y-2">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 p-3 border border-dashed border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          {img ? (
            <HiOutlinePhotograph className="w-5 h-5 text-indigo-600" />
          ) : (
            <HiOutlineReceiptTax className="w-5 h-5 text-indigo-600" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-indigo-700">
            {expanded ? "Sembunyikan Preview" : "Lihat Receipt"}
          </p>
          <p className="text-[10px] text-indigo-400">
            {img ? "Gambar" : pdf ? "PDF" : "File"} · klik untuk {expanded ? "tutup" : "pratinjau"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Download — stop propagation agar tidak toggle expanded */}
          <a
            href={url}
            download
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600"
            title="Download"
          >
            <HiOutlineDownload className="w-3.5 h-3.5" />
          </a>
          <HiOutlineEye
            className={`w-4 h-4 text-indigo-400 transition-opacity ${expanded ? "opacity-40" : ""}`}
          />
        </div>
      </button>

      {/* Inline preview area */}
      {expanded && (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {img ? (
            <img
              src={url}
              alt="Receipt"
              className="w-full max-h-[400px] object-contain bg-gray-100"
            />
          ) : pdf ? (
            <iframe
              src={url}
              title="Receipt PDF"
              className="w-full h-[420px] border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <HiOutlineDocumentText className="w-10 h-10" />
              <p className="text-sm">Format tidak didukung untuk preview.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline"
              >
                Buka di tab baru
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Approval Timeline Step ────────────────────────────────────────────────────
const ApprovalStep = ({ ar, isLast }) => {
  const cfg = AR_STATUS[ar.status] || {
    cls: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
    label: ar.status,
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
          ar.status === "APPROVED" ? "bg-emerald-50 border-emerald-300"
          : ar.status === "REJECTED" ? "bg-red-50 border-red-300"
          : "bg-amber-50 border-amber-300"
        }`}>
          {ar.status === "APPROVED" ? (
            <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : ar.status === "REJECTED" ? (
            <HiOutlineX className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <HiOutlineClock className="w-3.5 h-3.5 text-amber-500" />
          )}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
      </div>

      <div className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-semibold text-gray-800">{ar.approverName || "—"}</span>
          <Badge cfg={cfg} />
          {ar.approvedAt && (
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <HiOutlineCalendar className="w-3 h-3" />
              {fmtDate(ar.approvedAt)}
            </span>
          )}
        </div>

        {/* Notes dari approver di timeline */}
        {ar.notes && (
          <div className="mt-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
            <HiOutlineAnnotation className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed italic">"{ar.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
const ReimbursementDetailModal = ({ item, onClose }) => {
  const [approvalRecords,  setApprovalRecords]  = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);

  // ESC + scroll lock
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Fetch approval history
  useEffect(() => {
    const load = async () => {
      setLoadingApprovals(true);
      try {
        const res  = await getReimbursementApprovalsAPI(item.id);
        const list = res.data?.data ?? res.data ?? [];
        setApprovalRecords(Array.isArray(list) ? list : []);
      } catch {
        setApprovalRecords([]);
      } finally {
        setLoadingApprovals(false);
      }
    };
    load();
  }, [item.id]);

  const statusCfg = STATUS_CFG[item.status] || STATUS_CFG.SUBMITTED;

  // Ambil notes dari record yang sudah di-approve/reject (untuk ditampilkan di hero)
  const processedRecord = approvalRecords.find(
    (ar) => ar.status === "APPROVED" || ar.status === "REJECTED"
  );

  return (
    // Overlay — klik luar = onClose(), TIDAK navigate ke page lain
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card — stopPropagation agar klik di dalam tidak menutup modal */}
      <div
        className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          {/* Drag handle (mobile only) */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge cfg={statusCfg} />
                {item.category && (
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">
                {item.title || "Reimbursement Detail"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <HiOutlineClock className="w-3 h-3" />
                Diajukan {fmtDate(item.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <HiOutlineX className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Amount hero */}
          <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Total Amount</p>
              <p className="text-2xl font-bold text-indigo-700">{fmt(item.total)}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <HiOutlineCurrencyDollar className="w-6 h-6 text-indigo-500" />
            </div>
          </div>

          {/* Notes approve/reject — muncul di header setelah approval diproses */}
          {!loadingApprovals && processedRecord?.notes && (
            <div className={`mt-3 rounded-xl px-4 py-3 flex items-start gap-2 border ${
              processedRecord.status === "APPROVED"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}>
              <HiOutlineAnnotation className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                processedRecord.status === "APPROVED" ? "text-emerald-500" : "text-red-400"
              }`} />
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${
                  processedRecord.status === "APPROVED" ? "text-emerald-500" : "text-red-400"
                }`}>
                  {processedRecord.status === "APPROVED" ? "Catatan Approver" : "Alasan Penolakan"}
                </p>
                <p className={`text-xs leading-relaxed italic ${
                  processedRecord.status === "APPROVED" ? "text-emerald-800" : "text-red-800"
                }`}>
                  "{processedRecord.notes}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">

          {/* Informasi Umum */}
          <Section title="Informasi Umum">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={HiOutlineUser}          label="Karyawan"      value={item.employeeName} />
              <InfoRow icon={HiOutlineTag}            label="Kategori"      value={item.category} />
              <InfoRow icon={HiOutlineCalendar}       label="Tanggal Biaya" value={fmtDate(item.expenseDate)} />
              <InfoRow icon={HiOutlineOfficeBuilding} label="Dibayar Oleh"  value={item.paidBy} />
            </div>
          </Section>

          {/* Notes pengaju */}
          {item.notes && (
            <Section title="Catatan Pengaju">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HiOutlineAnnotation className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{item.notes}</p>
                </div>
              </div>
            </Section>
          )}

          {/* Receipt — inline preview */}
          {item.receiptFile && (
            <Section title="Dokumen / Receipt">
              <ReceiptPreview url={item.receiptFile} />
            </Section>
          )}

          {/* Riwayat Approval */}
          <Section title="Riwayat Approval">
            {loadingApprovals ? (
              <div className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
                <p className="text-sm text-gray-400">Memuat riwayat approval…</p>
              </div>
            ) : approvalRecords.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <HiOutlineDocumentText className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">Belum ada approval record</p>
                <p className="text-xs text-gray-300 mt-1">Pastikan approver sudah dikonfigurasi</p>
              </div>
            ) : (
              <div className="pt-1">
                {approvalRecords.map((ar, idx) => (
                  <ApprovalStep
                    key={ar.id}
                    ar={ar}
                    isLast={idx === approvalRecords.length - 1}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReimbursementDetailModal;
