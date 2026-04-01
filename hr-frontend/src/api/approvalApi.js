import API from "./api";

// Approval Approvers
export const getApprovalApproversAPI   = ()      => API.get("/approval-approvers");
export const createApprovalApproverAPI = (data)  => API.post("/approval-approvers", data);
export const deleteApprovalApproverAPI = (id)    => API.delete(`/approval-approvers/${id}`);

// Reimbursement Approval Actions
// GET semua approval records untuk 1 reimbursement
export const getReimbursementApprovalsAPI = (reimbursementId) =>
  API.get(`/reimbursement-approvals/reimbursement/${reimbursementId}`);

// PATCH approval record (approve / reject + notes)
export const updateReimbursementApprovalAPI = (approvalId, data) =>
  API.patch(`/reimbursement-approvals/${approvalId}`, data);
// data: { action: "APPROVED" | "REJECTED", notes?: string }

// Time Off Approval Actions
// GET semua approval records untuk 1 time off request
// endpoint: GET /api/time-off-approvals/request/{requestId}
export const getTimeOffApprovalsAPI = (requestId) =>
  API.get(`/time-off-approvals/request/${requestId}`);

// PATCH approval record (approve / reject + notes)
// endpoint: PATCH /api/time-off-approvals/{id}
// body: { action: "APPROVED" | "REJECTED", notes?: string }
export const updateTimeOffApprovalAPI = (approvalId, data) =>
  API.patch(`/time-off-approvals/${approvalId}`, data);
