import API from "./api";

// ============================================
// APPROVERS MANAGEMENT (Single unified endpoint)
// ============================================
export const getApprovalApproversAPI = (type) => 
  API.get(`/approval-approvers?type=${type}`);

export const createApprovalApproverAPI = (data) => 
  API.post("/approval-approvers", data);

export const deleteApprovalApproverAPI = (id) => 
  API.delete(`/approval-approvers/${id}`);

// ============================================
// REIMBURSEMENT APPROVALS
// ============================================
export const getReimbursementApprovalsAPI = (reimbursementId) =>
  API.get(`/reimbursement-approvals/reimbursement/${reimbursementId}`);

export const updateReimbursementApprovalAPI = (approvalId, data) =>
  API.patch(`/reimbursement-approvals/${approvalId}`, data);

// ============================================
// TIMEOFF APPROVALS
// ============================================
export const getTimeOffApprovalsAPI = (requestId) =>
  API.get(`/time-off-approvals/request/${requestId}`);

export const updateTimeOffApprovalAPI = (approvalId, data) =>
  API.patch(`/time-off-approvals/${approvalId}`, data);

// ============================================
// ATTENDANCE APPROVALS
// ============================================
export const getAttendanceApprovalsAPI = (correctionId) =>
  API.get(`/attendance-approvals/correction/${correctionId}`);

export const updateAttendanceApprovalAPI = (approvalId, data) =>
  API.patch(`/attendance-approvals/${approvalId}`, data);

// ============================================
// OVERTIME APPROVALS
// ============================================
export const getOvertimeApprovalsAPI = (overtimeId) =>
  API.get(`/overtime-approvals/overtime/${overtimeId}`);

export const updateOvertimeApprovalAPI = (approvalId, data) =>
  API.patch(`/overtime-approvals/${approvalId}`, data);