import { useDispatch, useSelector } from "react-redux";
import {
  reimbursementThunks,
  timeoffThunks,
  attendanceThunks,
  overtimeThunks,
} from "../slices/approvalSlice";
import {
  getReimbursementApprovalsAPI,
  updateReimbursementApprovalAPI,
  getTimeOffApprovalsAPI,
  updateTimeOffApprovalAPI,
  getAttendanceApprovalsAPI,
  updateAttendanceApprovalAPI,
  getOvertimeApprovalsAPI,
  updateOvertimeApprovalAPI,
} from "../../ApiService/approvalApi";

const THUNKS_MAP = {
  reimbursement: reimbursementThunks,
  timeoff: timeoffThunks,
  attendance: attendanceThunks,
  overtime: overtimeThunks,
};

const APPROVAL_APIS = {
  reimbursement: { get: getReimbursementApprovalsAPI, update: updateReimbursementApprovalAPI },
  timeoff: { get: getTimeOffApprovalsAPI, update: updateTimeOffApprovalAPI },
  attendance: { get: getAttendanceApprovalsAPI, update: updateAttendanceApprovalAPI },
  overtime: { get: getOvertimeApprovalsAPI, update: updateOvertimeApprovalAPI },
};

export const useApproval = ({ type = "reimbursement" } = {}) => {
  const dispatch = useDispatch();
  const thunks = THUNKS_MAP[type];
  const apis = APPROVAL_APIS[type];

  const { approvers = [], loading = false, error = null } = useSelector(
    (state) => state.approval?.[type] || { approvers: [], loading: false, error: null }
  );

  /**
   * Process approval untuk suatu request (single level)
   * Mencari record PENDING pertama dan meng-update-nya
   */
  const processApproval = async (requestId, action, notes = null) => {
    const res = await apis.get(requestId);
    const list = res.data?.data ?? res.data ?? [];

    if (!Array.isArray(list) || list.length === 0) {
      throw new Error(`No approval records found for ${type}`);
    }

    const pending = list.find((a) => a.status === "PENDING");
    if (!pending) throw new Error("All approvals have been processed");

    await apis.update(pending.id, { action, notes: notes?.trim() || null });
  };

  /**
   * Process approval untuk level tertentu (multi-level)
   * Mencari record dengan approvalOrder tertentu
   */
  const processApprovalByLevel = async (requestId, level, action, notes = null) => {
    const res = await apis.get(requestId);
    const list = res.data?.data ?? res.data ?? [];

    if (!Array.isArray(list) || list.length === 0) {
      throw new Error(`No approval records found for ${type}`);
    }

    const targetApproval = list.find((a) => a.approvalOrder === level);
    if (!targetApproval) {
      throw new Error(`Approval record for level ${level} not found`);
    }

    if (targetApproval.status !== "PENDING") {
      throw new Error(`Level ${level} is already ${targetApproval.status}`);
    }

    await apis.update(targetApproval.id, { action, notes: notes?.trim() || null });
  };

  return {
    // State
    approvers,
    loading,
    error,
    
    // Approver management
    fetchApprovers: () => dispatch(thunks.fetch()),
    createApprover: (data) => dispatch(thunks.create(data)).unwrap(),
    deleteApprover: (id) => dispatch(thunks.delete(id)).unwrap(),
    
    // Single-level approval (otomatis cari PENDING pertama)
    processApproval,
    approve: (id, notes) => processApproval(id, "APPROVED", notes),
    reject: (id, notes) => processApproval(id, "REJECTED", notes),
    
    // Multi-level approval (approve/reject berdasarkan level)
    processApprovalByLevel,
    approveLevel: (id, level, notes) => processApprovalByLevel(id, level, "APPROVED", notes),
    rejectLevel: (id, level, notes) => processApprovalByLevel(id, level, "REJECTED", notes),
    
    // Backward compatibility (untuk reimbursement)
    fetchApprovalApprovers: () => dispatch(thunks.fetch()),
    createApprovalApprover: (data) => dispatch(thunks.create(data)).unwrap(),
    deleteApprovalApprover: (id) => dispatch(thunks.delete(id)).unwrap(),
    approveReimbursement: (id, notes) => processApproval(id, "APPROVED", notes),
    rejectReimbursement: (id, notes) => processApproval(id, "REJECTED", notes),
  };
};