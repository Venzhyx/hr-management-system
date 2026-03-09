import API from "./api";

// Approval Settings
export const getApprovalSettingsAPI  = ()           => API.get("/approval-settings");
export const createApprovalSettingAPI = (data)      => API.post("/approval-settings", data);
export const updateApprovalSettingAPI = (id, data)  => API.put(`/approval-settings/${id}`, data);

// Approval Approvers
export const getApprovalApproversAPI  = ()          => API.get("/approval-approvers");
export const createApprovalApproverAPI = (data)     => API.post("/approval-approvers", data);
export const deleteApprovalApproverAPI = (id)       => API.delete(`/approval-approvers/${id}`);

// Reimbursement Approval Actions
export const approveReimbursementAPI = (id, data)   => API.post(`/reimbursements/${id}/approve`, data);
export const rejectReimbursementAPI  = (id, data)   => API.post(`/reimbursements/${id}/reject`, data);
