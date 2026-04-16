import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../ApiService/api";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchAllEmployeesForDropdown = createAsyncThunk(
  "attendance/fetchAllEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/employees");
      const parsed = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      return parsed?.data ?? [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gagal memuat daftar karyawan.");
    }
  }
);

export const fetchAttendancesByEmployeeId = createAsyncThunk(
  "attendance/fetchByEmployeeId",
  async (employeeId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/attendances/employee/${employeeId}`, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      let parsed;
      if (typeof res.data === "string") {
        try {
          parsed = JSON.parse(res.data);
        } catch (parseErr) {
          console.error("[Slice] JSON.parse gagal, kemungkinan response terpotong");
          console.error("[Slice] res.data.length:", res.data.length);
          console.error("[Slice] res.data (100 char terakhir):", res.data.slice(-100));
          return rejectWithValue("Response dari server tidak valid (terpotong).");
        }
      } else {
        parsed = res.data;
      }

      const list = Array.isArray(parsed?.data) ? parsed.data : [];
      return { attendances: list, employeeId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gagal memuat data absensi.");
    }
  }
);

// ✅ Tambahan: fetch attendance by employee (alias untuk fetchAttendancesByEmployeeId)
export const fetchAttendanceByEmployee = createAsyncThunk(
  "attendance/fetchByEmployee",
  async (employeeId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/attendances/employee/${employeeId}`, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      let parsed;
      if (typeof res.data === "string") {
        try {
          parsed = JSON.parse(res.data);
        } catch (parseErr) {
          console.error("[Slice] JSON.parse gagal");
          return rejectWithValue("Response dari server tidak valid (terpotong).");
        }
      } else {
        parsed = res.data;
      }

      const list = Array.isArray(parsed?.data) ? parsed.data : [];
      return { attendances: list, employeeId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gagal memuat data absensi.");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendances:      [],
    loading:          false,
    error:            null,
    employees:        [],
    loadingEmployees: false,
    lastFetchedEmployeeId: null, // Track employee yang terakhir di-fetch
  },
  reducers: {
    clearAttendanceError(state) {
      state.error = null;
    },
    clearAttendanceData(state) {
      state.attendances = [];
      state.error       = null;
      state.lastFetchedEmployeeId = null;
    },
    resetAttendanceState(state) {
      state.attendances = [];
      state.loading = false;
      state.error = null;
      state.lastFetchedEmployeeId = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch employees for dropdown
    builder
      .addCase(fetchAllEmployeesForDropdown.pending, (state) => {
        state.loadingEmployees = true;
        state.error = null;
      })
      .addCase(fetchAllEmployeesForDropdown.fulfilled, (state, action) => {
        state.loadingEmployees = false;
        state.employees = action.payload;
      })
      .addCase(fetchAllEmployeesForDropdown.rejected, (state, action) => {
        state.loadingEmployees = false;
        state.error = action.payload;
      });

    // Fetch attendances by employee ID
    builder
      .addCase(fetchAttendancesByEmployeeId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendancesByEmployeeId.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload.attendances;
        state.lastFetchedEmployeeId = action.payload.employeeId;
      })
      .addCase(fetchAttendancesByEmployeeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch attendance by employee (alias)
    builder
      .addCase(fetchAttendanceByEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload.attendances;
        state.lastFetchedEmployeeId = action.payload.employeeId;
      })
      .addCase(fetchAttendanceByEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearAttendanceError, 
  clearAttendanceData, 
  resetAttendanceState 
} = attendanceSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAttendances = (state) => state.attendance.attendances;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectEmployees = (state) => state.attendance.employees;
export const selectLoadingEmployees = (state) => state.attendance.loadingEmployees;
export const selectLastFetchedEmployeeId = (state) => state.attendance.lastFetchedEmployeeId;

export default attendanceSlice.reducer;