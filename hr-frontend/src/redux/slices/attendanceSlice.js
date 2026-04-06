import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/api";

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
        // Naikkan limit response — default Axios kadang terpotong untuk response besar
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
      return { attendances: list };
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
  },
  reducers: {
    clearAttendanceError(state) {
      state.error = null;
    },
    clearAttendanceData(state) {
      state.attendances = [];
      state.error       = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEmployeesForDropdown.pending, (state) => {
        state.loadingEmployees = true;
      })
      .addCase(fetchAllEmployeesForDropdown.fulfilled, (state, action) => {
        state.loadingEmployees = false;
        state.employees        = action.payload;
      })
      .addCase(fetchAllEmployeesForDropdown.rejected, (state) => {
        state.loadingEmployees = false;
      });

    builder
      .addCase(fetchAttendancesByEmployeeId.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAttendancesByEmployeeId.fulfilled, (state, action) => {
        state.loading     = false;
        state.attendances = action.payload.attendances;
      })
      .addCase(fetchAttendancesByEmployeeId.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { clearAttendanceError, clearAttendanceData } = attendanceSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAttendances       = (s) => s.attendance.attendances;
export const selectAttendanceLoading = (s) => s.attendance.loading;
export const selectAttendanceError   = (s) => s.attendance.error;
export const selectEmployees         = (s) => s.attendance.employees;
export const selectLoadingEmployees  = (s) => s.attendance.loadingEmployees;

export default attendanceSlice.reducer;