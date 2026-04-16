import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchAllCorrections,
  fetchCorrectionsByEmployee,
  createCorrection,
  openCreateModal,
  closeCreateModal,
  openDetailModal,
  closeDetailModal,
  setFilterStatus,
  setFilterType,
  clearCorrectionError,
  selectCorrectionList,
  selectCorrectionLoading,
  selectCorrectionError,
  selectCorrectionActionLoading,
  selectCorrectionActionError,
  selectIsModalOpen,
  selectIsDetailModalOpen,
  selectSelectedCorrection,
  selectFilterStatus,
  selectFilterType,
} from "../slices/attendanceCorrectionSlice";
import {
  getAttendanceApprovalsAPI,
  updateAttendanceApprovalAPI,
} from "../../ApiService/approvalApi";
import { useMemo } from "react";

// ── Core approval processor — same pattern as useTimeOff ──────────────────────
const processAttendanceApproval = async (id, action, notes = null, dispatch) => {
  let res;
  try {
    res = await getAttendanceApprovalsAPI(id);
  } catch (apiErr) {
    throw new Error(
      "Gagal mengambil approval records: " +
        (apiErr?.response?.data?.message || apiErr.message)
    );
  }

  const payload = res?.data;
  let records = [];
  if      (Array.isArray(payload?.data))      records = payload.data;
  else if (Array.isArray(payload))            records = payload;
  else if (Array.isArray(payload?.content))   records = payload.content;
  else if (Array.isArray(payload?.approvals)) records = payload.approvals;
  else {
    const firstArr = payload
      ? Object.values(payload).find((v) => Array.isArray(v))
      : null;
    if (firstArr) records = firstArr;
  }

  if (records.length === 0) {
    throw new Error(
      "Tidak ada approval record untuk request ini. " +
        "Pastikan approver sudah dikonfigurasi sebelum request dibuat."
    );
  }

  const pending = records.find((a) =>
    ["PENDING", "SUBMITTED", "WAITING"].includes(a.status?.toUpperCase())
  );

  if (!pending) {
    throw new Error("Semua approval record sudah diproses.");
  }

  await updateAttendanceApprovalAPI(pending.id, {
    action,
    notes: notes?.trim() || null,
  });

  if (dispatch) {
    try {
      await dispatch(fetchAllCorrections(id)).unwrap();
    } catch {
      // tidak fatal
    }
  }
};

export const useAttendanceCorrection = ({ role = "employee", employeeId } = {}) => {
  const dispatch = useDispatch();

  const rawList       = useSelector(selectCorrectionList);
  const loading       = useSelector(selectCorrectionLoading);
  const error         = useSelector(selectCorrectionError);
  const actionLoading = useSelector(selectCorrectionActionLoading);
  const actionError   = useSelector(selectCorrectionActionError);

  const isModalOpen       = useSelector(selectIsModalOpen);
  const isDetailModalOpen = useSelector(selectIsDetailModalOpen);
  const selectedCorrection = useSelector(selectSelectedCorrection);
  const filterStatus      = useSelector(selectFilterStatus);
  const filterType        = useSelector(selectFilterType);

  // Filtered list
  const corrections = useMemo(() => {
    return rawList.filter((c) => {
      const statusMatch = filterStatus === "ALL" || c.status === filterStatus;
      const typeMatch   = filterType   === "ALL" || c.type   === filterType;
      return statusMatch && typeMatch;
    });
  }, [rawList, filterStatus, filterType]);

  // Stats
  const stats = useMemo(
    () => ({
      total:    rawList.length,
      pending:  rawList.filter((c) => c.status === "PENDING").length,
      approved: rawList.filter((c) => c.status === "APPROVED").length,
      rejected: rawList.filter((c) => c.status === "REJECTED").length,
    }),
    [rawList]
  );

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchAllCorrectionsFn = useCallback(
    () => dispatch(fetchAllCorrections()).unwrap(),
    [dispatch]
  );

  const fetchCorrectionsByEmployeeFn = useCallback(
    (empId) => dispatch(fetchCorrectionsByEmployee(empId)).unwrap(),
    [dispatch]
  );

  const getAttendanceApprovals = useCallback(
    (id) => getAttendanceApprovalsAPI(id),
    []
  );

  // ── Action handlers — mirroring useTimeOff pattern ────────────────────────
  const handleCreate = async (formData) => {
    return dispatch(createCorrection(formData)).unwrap();
  };

  const handleApprove = async (id, notes) =>
    processAttendanceApproval(id, "APPROVED", notes, dispatch);

  const handleReject = async (id, notes) =>
    processAttendanceApproval(id, "REJECTED", notes, dispatch);

  const handleRefresh = useCallback(() => {
    if (role === "admin") {
      dispatch(fetchAllCorrections());
    } else if (employeeId) {
      dispatch(fetchCorrectionsByEmployee(employeeId));
    }
  }, [dispatch, role, employeeId]);

  return {
    // Data
    corrections,
    stats,
    loading,
    error,
    actionLoading,
    actionError,

    // UI state
    isModalOpen,
    isDetailModalOpen,
    selectedCorrection,
    filterStatus,
    filterType,

    // Dispatchers
    openCreateModal:  ()  => dispatch(openCreateModal()),
    closeCreateModal: ()  => dispatch(closeCreateModal()),
    openDetailModal:  (c) => dispatch(openDetailModal(c)),
    closeDetailModal: ()  => dispatch(closeDetailModal()),
    setFilterStatus:  (v) => dispatch(setFilterStatus(v)),
    setFilterType:    (v) => dispatch(setFilterType(v)),
    clearError:       ()  => dispatch(clearCorrectionError()),

    // Async actions
    handleCreate,
    handleApprove,
    handleReject,
    handleRefresh,
    fetchAllCorrections:        fetchAllCorrectionsFn,
    fetchCorrectionsByEmployee: fetchCorrectionsByEmployeeFn,
    getAttendanceApprovals,
  };
};
