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
