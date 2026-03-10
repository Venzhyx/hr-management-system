import API from "./api";

// Approval Approvers
export const getApprovalApproversAPI   = ()      => API.get("/approval-approvers");
export const createApprovalApproverAPI = (data)  => API.post("/approval-approvers", data);
export const deleteApprovalApproverAPI = (id)    => API.delete(`/approval-approvers/${id}`);

// Reimbursement Approval Actions
export const approveReimbursementAPI = (id, data) => API.post(`/reimbursements/${id}/approve`, data);
export const rejectReimbursementAPI  = (id, data) => API.post(`/reimbursements/${id}/reject`, data);
