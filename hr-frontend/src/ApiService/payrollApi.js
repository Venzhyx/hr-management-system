import API from "./api";

const BASE = "/payroll";

// ─── Salary Component ──────────────────────────────────────────────────────
export const payrollApi = {

  // GET /payroll/components?activeOnly=
  getSalaryComponents: async (activeOnly = false) => {
    const response = await API.get(`${BASE}/components`, { params: { activeOnly } });
    return response.data;
  },

  // POST /payroll/components
  createSalaryComponent: async (data) => {
    const response = await API.post(`${BASE}/components`, data);
    return response.data;
  },

  // PUT /payroll/components/{id}
  updateSalaryComponent: async (id, data) => {
    const response = await API.put(`${BASE}/components/${id}`, data);
    return response.data;
  },

  // DELETE /payroll/components/{id}
  deleteSalaryComponent: async (id) => {
    const response = await API.delete(`${BASE}/components/${id}`);
    return response.data;
  },

  // ─── Employee Salary ─────────────────────────────────────────────────────

  // POST /payroll/employee-salary
  setEmployeeSalary: async (data) => {
    const response = await API.post(`${BASE}/employee-salary`, data);
    return response.data;
  },

  // POST /payroll/employee-salary/{id}/components
  addEmployeeSalaryComponent: async (id, data) => {
    const response = await API.post(`${BASE}/employee-salary/${id}/components`, data);
    return response.data;
  },

  // GET /payroll/employee-salary/{employeeId}
  getEmployeeSalary: async (employeeId) => {
    const response = await API.get(`${BASE}/employee-salary/${employeeId}`);
    return response.data;
  },

  // GET /payroll/employee-salary/{employeeId}/history
  getEmployeeSalaryHistory: async (employeeId) => {
    const response = await API.get(`${BASE}/employee-salary/${employeeId}/history`);
    return response.data;
  },

  // ─── Payroll Run ──────────────────────────────────────────────────────────

  // POST /payroll/run
  runPayroll: async (data) => {
    const response = await API.post(`${BASE}/run`, data);
    return response.data;
  },

  // GET /payroll/runs
  getPayrollRuns: async () => {
    const response = await API.get(`${BASE}/runs`);
    return response.data;
  },

  // GET /payroll/runs/{periodId}
  getPayrollRunDetail: async (periodId) => {
    const response = await API.get(`${BASE}/runs/${periodId}`);
    return response.data;
  },

  // ─── Payslip ─────────────────────────────────────────────────────────────

  // GET /payroll/payslips/{employeeId}
  getPayslipsByEmployee: async (employeeId) => {
    const response = await API.get(`${BASE}/payslips/${employeeId}`);
    return response.data;
  },

  // GET /payroll/payslips/detail/{payslipId}
  getPayslipDetail: async (payslipId) => {
    const response = await API.get(`${BASE}/payslips/detail/${payslipId}`);
    return response.data;
  },

  // GET /payroll/payslips/{payslipId}/pdf
  downloadPayslipPdf: async (payslipId) => {
    const response = await API.get(`${BASE}/payslips/${payslipId}/pdf`, {
      responseType: "blob",
    });
    return response;
  },

  // ─── Report ───────────────────────────────────────────────────────────────

  // GET /payroll/reports/pdf?month=&year=
  downloadPayrollPdf: async (month, year) => {
    const response = await API.get(`${BASE}/reports/pdf`, {
      params: { month, year },
      responseType: "blob",
    });
    return response;
  },

  // GET /payroll/reports/excel?month=&year=
  downloadPayrollExcel: async (month, year) => {
    const response = await API.get(`${BASE}/reports/excel`, {
      params: { month, year },
      responseType: "blob",
    });
    return response;
  },
};