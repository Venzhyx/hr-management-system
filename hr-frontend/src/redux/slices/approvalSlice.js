import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getApprovalApproversAPI,
  createApprovalApproverAPI,
  deleteApprovalApproverAPI,
} from "../../api/approvalApi";

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

const approvalSlice = createSlice({
  name: "approval",
  initialState: {
    approvers: [],
    loading:   false,
    error:     null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const pending  = (s)    => { s.loading = true;  s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };

    builder
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
