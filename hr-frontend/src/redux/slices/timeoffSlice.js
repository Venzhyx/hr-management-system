import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllTimeOffRequestsAPI,
  getTimeOffRequestByIdAPI,
  createTimeOffRequestAPI,
  updateTimeOffRequestAPI,
  deleteTimeOffRequestAPI,
  approveTimeOffRequestAPI,
  rejectTimeOffRequestAPI,
} from "../../api/timeoffApi";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchTimeOffRequests = createAsyncThunk(
  "timeOff/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllTimeOffRequestsAPI();
      return res.data?.data ?? res.data ?? [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTimeOffRequestById = createAsyncThunk(
  "timeOff/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getTimeOffRequestByIdAPI(id);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createTimeOffRequest = createAsyncThunk(
  "timeOff/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createTimeOffRequestAPI(data);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateTimeOffRequest = createAsyncThunk(
  "timeOff/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateTimeOffRequestAPI(id, data);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteTimeOffRequest = createAsyncThunk(
  "timeOff/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteTimeOffRequestAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const approveTimeOffRequest = createAsyncThunk(
  "timeOff/approve",
  async (id, { rejectWithValue }) => {
    try {
      const res = await approveTimeOffRequestAPI(id);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const rejectTimeOffRequest = createAsyncThunk(
  "timeOff/reject",
  async (id, { rejectWithValue }) => {
    try {
      const res = await rejectTimeOffRequestAPI(id);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const upsert = (list, updated) =>
  list.map((item) => (item.id === updated.id ? updated : item));

// ── Slice ─────────────────────────────────────────────────────────────────────
const timeOffSlice = createSlice({
  name: "timeOff",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const pending  = (state)          => { state.loading = true;  state.error = null; };
    const rejected = (state, action)  => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchTimeOffRequests.pending,   pending)
      .addCase(fetchTimeOffRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTimeOffRequests.rejected,  rejected)

      .addCase(createTimeOffRequest.pending,   pending)
      .addCase(createTimeOffRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) state.list.unshift(action.payload);
      })
      .addCase(createTimeOffRequest.rejected,  rejected)

      .addCase(updateTimeOffRequest.pending,   pending)
      .addCase(updateTimeOffRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) state.list = upsert(state.list, action.payload);
      })
      .addCase(updateTimeOffRequest.rejected,  rejected)

      .addCase(deleteTimeOffRequest.pending,   pending)
      .addCase(deleteTimeOffRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = state.list.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteTimeOffRequest.rejected,  rejected)

      .addCase(approveTimeOffRequest.pending,   pending)
      .addCase(approveTimeOffRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) state.list = upsert(state.list, action.payload);
      })
      .addCase(approveTimeOffRequest.rejected,  rejected)

      .addCase(rejectTimeOffRequest.pending,   pending)
      .addCase(rejectTimeOffRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) state.list = upsert(state.list, action.payload);
      })
      .addCase(rejectTimeOffRequest.rejected,  rejected);
  },
});

export default timeOffSlice.reducer;
