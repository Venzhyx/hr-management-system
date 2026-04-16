import API from "./api"; // 🔥 ganti ini

const BASE_URL = "/overtimes"; // ⚠️ TANPA /api

export const overtimeApi = {
  createOvertime: async (payload) => {
    const response = await API.post(BASE_URL, payload);
    return response.data;
  },

  getAllOvertimes: async () => {
    const response = await API.get(BASE_URL);
    return response.data;
  },

  getOvertimesByEmployee: async (employeeId) => {
    const response = await API.get(`${BASE_URL}/my/${employeeId}`);
    return response.data;
  },

  getTotalOvertimeByEmployee: async (employeeId, month, year) => {
    const response = await API.get(`${BASE_URL}/total/${employeeId}`, {
      params: { month, year },
    });
    return response.data;
  },

  approveOvertime: async (id, adminId) => {
    const response = await API.put(`${BASE_URL}/${id}/approve`, null, {
      params: { adminId },
    });
    return response.data;
  },

  rejectOvertime: async (id, adminId) => {
    const response = await API.put(`${BASE_URL}/${id}/reject`, null, {
      params: { adminId },
    });
    return response.data;
  },
};