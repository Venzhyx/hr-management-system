import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOvertimes,
  fetchOvertimesByEmployee,
  createOvertime,
  approveOvertime,
  rejectOvertime,
  openCreateModal,
  closeCreateModal,
  openDetailModal,
  closeDetailModal,
  setFilterStatus,
  setFilterType,
  clearActionError,
} from "../slices/overtimeSlice";

/**
 * useOvertime
 * @param {{ role: "admin" | "employee", employeeId?: number, adminId?: number }} options
 */
export const useOvertime = ({ role = "employee", employeeId, adminId } = {}) => {
  const dispatch = useDispatch();

  const {
    overtimes:        rawOvertimes,
    totalHours,
    loading,
    error,
    actionLoading,
    actionError,
    isModalOpen,
    isDetailModalOpen,
    selectedOvertime,
    filterStatus,
    filterType,
  } = useSelector((state) => state.overtime);

  const isAdmin = role === "admin";

  // ─── Fetch ────────────────────────────────────────────────────────────────────

  const fetchOvertimes = useCallback(() => {
    if (isAdmin) {
      dispatch(fetchAllOvertimes());
    } else if (employeeId) {
      dispatch(fetchOvertimesByEmployee(employeeId));
    }
  }, [dispatch, isAdmin, employeeId]);

  const handleRefresh = useCallback(() => fetchOvertimes(), [fetchOvertimes]);

  // ─── Filtered + Stats ─────────────────────────────────────────────────────────

  const overtimes = useMemo(() => {
    return (rawOvertimes || []).filter((o) => {
      const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
      const matchType   = filterType   === "ALL" || o.type   === filterType;
      return matchStatus && matchType;
    });
  }, [rawOvertimes, filterStatus, filterType]);

  const stats = useMemo(() => ({
    total:    (rawOvertimes || []).length,
    pending:  (rawOvertimes || []).filter((o) => o.status === "PENDING").length,
    approved: (rawOvertimes || []).filter((o) => o.status === "APPROVED").length,
    rejected: (rawOvertimes || []).filter((o) => o.status === "REJECTED").length,
  }), [rawOvertimes]);

  // ─── Actions ──────────────────────────────────────────────────────────────────

  const handleCreate = useCallback(async (payload) => {
    const result = await dispatch(createOvertime(payload));
    if (createOvertime.rejected.match(result)) throw new Error(result.payload);
  }, [dispatch]);

  const handleApprove = useCallback(async (id) => {
    const effectiveAdminId = adminId ?? 1;
    const result = await dispatch(approveOvertime({ id, adminId: effectiveAdminId }));
    if (approveOvertime.rejected.match(result)) throw new Error(result.payload);
  }, [dispatch, adminId]);

  const handleReject = useCallback(async (id) => {
    const effectiveAdminId = adminId ?? 1;
    const result = await dispatch(rejectOvertime({ id, adminId: effectiveAdminId }));
    if (rejectOvertime.rejected.match(result)) throw new Error(result.payload);
  }, [dispatch, adminId]);

  // ─── Modal Controls ───────────────────────────────────────────────────────────

  const handleOpenCreateModal  = useCallback(() => dispatch(openCreateModal()),         [dispatch]);
  const handleCloseCreateModal = useCallback(() => dispatch(closeCreateModal()),        [dispatch]);
  const handleOpenDetailModal  = useCallback((o) => dispatch(openDetailModal(o)),       [dispatch]);
  const handleCloseDetailModal = useCallback(() => dispatch(closeDetailModal()),        [dispatch]);
  const handleClearError       = useCallback(() => dispatch(clearActionError()),        [dispatch]);

  // ─── Filter Controls ──────────────────────────────────────────────────────────

  const handleSetFilterStatus  = useCallback((s) => dispatch(setFilterStatus(s)),      [dispatch]);
  const handleSetFilterType    = useCallback((t) => dispatch(setFilterType(t)),         [dispatch]);

  return {
    // Data
    overtimes,
    totalHours,
    stats,
    // State
    loading,
    error,
    actionLoading,
    actionError,
    // Modal
    isModalOpen,
    isDetailModalOpen,
    selectedOvertime,
    // Filter
    filterStatus,
    filterType,
    // Actions
    fetchOvertimes,
    handleRefresh,
    handleCreate,
    handleApprove,
    handleReject,
    clearError: handleClearError,
    // Modal controls
    openCreateModal:  handleOpenCreateModal,
    closeCreateModal: handleCloseCreateModal,
    openDetailModal:  handleOpenDetailModal,
    closeDetailModal: handleCloseDetailModal,
    // Filter controls
    setFilterStatus:  handleSetFilterStatus,
    setFilterType:    handleSetFilterType,
  };
};
