import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getApprovalSettingsAPI,
  createApprovalSettingAPI,
  updateApprovalSettingAPI,
  getApprovalApproversAPI,
  createApprovalApproverAPI,
  deleteApprovalApproverAPI,
} from "../../api/approvalApi";

// ==================== SETTINGS THUNKS ====================

export const fetchApprovalSettings = createAsyncThunk(
  "approval/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getApprovalSettingsAPI();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createApprovalSetting = createAsyncThunk(
  "approval/createSetting",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createApprovalSettingAPI(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateApprovalSetting = createAsyncThunk(
  "approval/updateSetting",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await updateApprovalSettingAPI(id, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ==================== APPROVERS THUNKS ====================

export const fetchApprovalApprovers = createAsyncThunk(
  "approval/fetchApprovers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getApprovalApproversAPI();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createApprovalApprover = createAsyncThunk(
  "approval/createApprover",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createApprovalApproverAPI(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteApprovalApprover = createAsyncThunk(
  "approval/deleteApprover",
  async (id, { rejectWithValue }) => {
    try {
      await deleteApprovalApproverAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ==================== SLICE ====================

const approvalSlice = createSlice({
  name: "approval",
  initialState: {
    settings:  [],
    approvers: [],
    loading:   false,
    error:     null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const pending  = (s)    => { s.loading = true;  s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };

    builder
      // Settings
      .addCase(fetchApprovalSettings.pending,   pending)
      .addCase(fetchApprovalSettings.fulfilled, (s, a) => { s.loading = false; s.settings = a.payload || []; })
      .addCase(fetchApprovalSettings.rejected,  rejected)

      .addCase(createApprovalSetting.pending,   pending)
      .addCase(createApprovalSetting.fulfilled, (s, a) => { s.loading = false; if (a.payload) s.settings.push(a.payload); })
      .addCase(createApprovalSetting.rejected,  rejected)

      .addCase(updateApprovalSetting.pending,   pending)
      .addCase(updateApprovalSetting.fulfilled, (s, a) => {
        s.loading = false;
        if (a.payload) s.settings = s.settings.map(x => x.id === a.payload.id ? a.payload : x);
      })
      .addCase(updateApprovalSetting.rejected,  rejected)

      // Approvers
      .addCase(fetchApprovalApprovers.pending,   pending)
      .addCase(fetchApprovalApprovers.fulfilled, (s, a) => { s.loading = false; s.approvers = a.payload || []; })
      .addCase(fetchApprovalApprovers.rejected,  rejected)

      .addCase(createApprovalApprover.pending,   pending)
      .addCase(createApprovalApprover.fulfilled, (s, a) => { s.loading = false; if (a.payload) s.approvers.push(a.payload); })
      .addCase(createApprovalApprover.rejected,  rejected)

      .addCase(deleteApprovalApprover.pending,   pending)
      .addCase(deleteApprovalApprover.fulfilled, (s, a) => { s.loading = false; s.approvers = s.approvers.filter(x => x.id !== a.payload); })
      .addCase(deleteApprovalApprover.rejected,  rejected);
  },
});

export default approvalSlice.reducer;
