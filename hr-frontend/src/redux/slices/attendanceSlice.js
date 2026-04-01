import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Fetch all attendances by employee ID (internal use)
export const fetchAttendancesByEmployeeId = createAsyncThunk(
  'attendance/fetchByEmployeeId',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/attendances/employee/${employeeId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendances');
    }
  }
);

// Fetch attendances by employee identification number (NIK)
export const fetchAttendancesByIdentificationNumber = createAsyncThunk(
  'attendance/fetchByIdentificationNumber',
  async (employeeIdentificationNumber, { rejectWithValue }) => {
    try {
      // Step 1: Get all employees to find the one with matching identification number
      const employeesRes = await axios.get(`${BASE_URL}/api/employees`);
      const employees = employeesRes.data.data;

      const matched = employees.find(
        (emp) => emp.employeeIdentificationNumber === employeeIdentificationNumber
      );

      if (!matched) {
        return rejectWithValue(`Employee with identification number "${employeeIdentificationNumber}" not found`);
      }

      // Step 2: Fetch attendances by found employee ID
      const attendanceRes = await axios.get(`${BASE_URL}/api/attendances/employee/${matched.id}`);
      return {
        employee: matched,
        attendances: attendanceRes.data.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendances');
    }
  }
);

// Upload Excel attendance file
export const uploadAttendanceExcel = createAsyncThunk(
  'attendance/uploadExcel',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${BASE_URL}/api/attendances/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

// Compute summary from attendance list
const computeSummary = (attendances) => {
  const summary = { present: 0, absent: 0, lates: 0, leave: 0 };
  attendances.forEach((a) => {
    const status = (a.status || '').toUpperCase();
    if (status === 'PRESENT') summary.present += 1;
    else if (status === 'ABSENT') summary.absent += 1;
    else if (status === 'LATE') summary.lates += 1;
    else if (status === 'LEAVE') summary.leave += 1;
  });
  return summary;
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    attendances: [],
    employee: null,
    summary: { present: 0, absent: 0, lates: 0, leave: 0 },
    loading: false,
    uploadLoading: false,
    error: null,
    uploadSuccess: null,
  },
  reducers: {
    clearAttendanceError(state) {
      state.error = null;
    },
    clearUploadStatus(state) {
      state.uploadSuccess = null;
      state.error = null;
    },
    resetAttendance(state) {
      state.attendances = [];
      state.employee = null;
      state.summary = { present: 0, absent: 0, lates: 0, leave: 0 };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAttendancesByEmployeeId
    builder
      .addCase(fetchAttendancesByEmployeeId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendancesByEmployeeId.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload;
        state.summary = computeSummary(action.payload);
      })
      .addCase(fetchAttendancesByEmployeeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchAttendancesByIdentificationNumber
    builder
      .addCase(fetchAttendancesByIdentificationNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendancesByIdentificationNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload.employee;
        state.attendances = action.payload.attendances;
        state.summary = computeSummary(action.payload.attendances);
      })
      .addCase(fetchAttendancesByIdentificationNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // uploadAttendanceExcel
    builder
      .addCase(uploadAttendanceExcel.pending, (state) => {
        state.uploadLoading = true;
        state.uploadSuccess = null;
        state.error = null;
      })
      .addCase(uploadAttendanceExcel.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadSuccess = action.payload;
      })
      .addCase(uploadAttendanceExcel.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceError, clearUploadStatus, resetAttendance } = attendanceSlice.actions;

// Selectors
export const selectAttendances = (state) => state.attendance.attendances;
export const selectAttendanceEmployee = (state) => state.attendance.employee;
export const selectAttendanceSummary = (state) => state.attendance.summary;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectUploadLoading = (state) => state.attendance.uploadLoading;
export const selectUploadSuccess = (state) => state.attendance.uploadSuccess;

export default attendanceSlice.reducer;
