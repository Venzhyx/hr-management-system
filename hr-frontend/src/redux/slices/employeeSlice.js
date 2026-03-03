// src/redux/slices/employeeSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/api";

// Gunakan proxy dari Vite
const API_URL = "employees";

/* ================================
   ASYNC THUNKS
================================ */

// GET ALL EMPLOYEES
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get(API_URL);
      return response.data; // { success, message, data }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// GET EMPLOYEE BY ID
export const fetchEmployeeById = createAsyncThunk(
  "employees/fetchEmployeeById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// CREATE
export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (data, { rejectWithValue }) => {
    try {
      const response = await API.post(API_URL, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// UPDATE
export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async (employee, { rejectWithValue }) => {
    try {
      const response = await API.put(`${API_URL}/${employee.id}`, employee);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// DELETE
export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================================
   INITIAL STATE
================================ */

const initialState = {
  list: [],
  selectedEmployee: null,
  loading: false,
  error: null,
};

/* ================================
   SLICE
================================ */

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ===== FETCH ALL ===== */
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;

        // Backend return { success, message, data }
        state.list = action.payload.data || [];
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch employees";
      })

      /* ===== FETCH BY ID ===== */
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload.data;
      })

      /* ===== CREATE ===== */
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.push(action.payload.data);
      })

      /* ===== UPDATE ===== */
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload;
        const index = state.list.findIndex((emp) => emp.id === updated.id);
        if (index !== -1) {
          state.list[index] = updated;
        }
      })

      /* ===== DELETE ===== */
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter((emp) => emp.id !== action.payload);
      });
  },
});

export default employeeSlice.reducer;