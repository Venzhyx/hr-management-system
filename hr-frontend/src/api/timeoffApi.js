import API from "./api"; // pakai instance terpusat yang sudah ada interceptor token

const BASE      = "/time-off-requests";
const TYPE_BASE = "/time-off-types";

export const getAllTimeOffRequestsAPI        = ()           => API.get(BASE);
export const getTimeOffRequestByIdAPI        = (id)         => API.get(`${BASE}/${id}`);
export const getTimeOffRequestsByEmployeeAPI = (employeeId) => API.get(`${BASE}/employee/${employeeId}`);
export const createTimeOffRequestAPI         = (data)       => API.post(BASE, data);
export const updateTimeOffRequestAPI         = (id, data)   => API.put(`${BASE}/${id}`, data);
export const deleteTimeOffRequestAPI         = (id)         => API.delete(`${BASE}/${id}`);
export const approveTimeOffRequestAPI        = (id)         => API.patch(`${BASE}/${id}/approve`);
export const rejectTimeOffRequestAPI         = (id)         => API.patch(`${BASE}/${id}/reject`);

export const getAllTimeOffTypesAPI            = ()           => API.get(TYPE_BASE);

// Upload attachment — returns permanent URL string
export const uploadAttachmentAPI = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
