import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCorrections,
  fetchCorrectionsByEmployee,
  createCorrection,
  approveCorrection,
  rejectCorrection,
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

export const useAttendanceCorrection = ({ role = "employee", employeeId, adminId = 1 } = {}) => {
  const dispatch = useDispatch();

  console.log("[useAttendanceCorrection] Initialized with:", { role, employeeId, adminId });

  const rawList = useSelector(selectCorrectionList);
  const loading = useSelector(selectCorrectionLoading);
  const error = useSelector(selectCorrectionError);
  const actionLoading = useSelector(selectCorrectionActionLoading);
  const actionError = useSelector(selectCorrectionActionError);

  const isModalOpen = useSelector(selectIsModalOpen);
  const isDetailModalOpen = useSelector(selectIsDetailModalOpen);
  const selectedCorrection = useSelector(selectSelectedCorrection);
  const filterStatus = useSelector(selectFilterStatus);
  const filterType = useSelector(selectFilterType);

  // Initial fetch
  useEffect(() => {
    console.log("[useAttendanceCorrection] useEffect fetching data, role:", role);
    if (role === "admin") {
      dispatch(fetchAllCorrections());
    } else if (role === "employee" && employeeId) {
      dispatch(fetchCorrectionsByEmployee(employeeId));
    }
  }, [dispatch, role, employeeId]);

  // Filtered list
  const corrections = useMemo(() => {
    return rawList.filter((c) => {
      const statusMatch = filterStatus === "ALL" || c.status === filterStatus;
      const typeMatch = filterType === "ALL" || c.type === filterType;
      return statusMatch && typeMatch;
    });
  }, [rawList, filterStatus, filterType]);

  // Stats
  const stats = useMemo(() => ({
    total: rawList.length,
    pending: rawList.filter((c) => c.status === "PENDING").length,
    approved: rawList.filter((c) => c.status === "APPROVED").length,
    rejected: rawList.filter((c) => c.status === "REJECTED").length,
  }), [rawList]);

  // Action handlers
  const handleCreate = async (formData) => {
    try {
      const result = await dispatch(createCorrection(formData)).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const handleApprove = async (id) => {
    console.log("[useAttendanceCorrection] handleApprove called with id:", id, "adminId:", adminId);
    try {
      const result = await dispatch(approveCorrection({ id, adminId })).unwrap();
      console.log("[useAttendanceCorrection] approve result:", result);
      return result;
    } catch (err) {
      console.error("[useAttendanceCorrection] approve error:", err);
      throw err;
    }
  };

  const handleReject = async (id) => {
    console.log("[useAttendanceCorrection] handleReject called with id:", id, "adminId:", adminId);
    try {
      const result = await dispatch(rejectCorrection({ id, adminId })).unwrap();
      console.log("[useAttendanceCorrection] reject result:", result);
      return result;
    } catch (err) {
      console.error("[useAttendanceCorrection] reject error:", err);
      throw err;
    }
  };

  const handleRefresh = () => {
    console.log("[useAttendanceCorrection] handleRefresh called, role:", role);
    if (role === "admin") {
      dispatch(fetchAllCorrections());
    } else if (employeeId) {
      dispatch(fetchCorrectionsByEmployee(employeeId));
    }
  };

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
    openCreateModal: () => dispatch(openCreateModal()),
    closeCreateModal: () => dispatch(closeCreateModal()),
    openDetailModal: (c) => dispatch(openDetailModal(c)),
    closeDetailModal: () => dispatch(closeDetailModal()),
    setFilterStatus: (v) => dispatch(setFilterStatus(v)),
    setFilterType: (v) => dispatch(setFilterType(v)),
    clearError: () => dispatch(clearCorrectionError()),

    // Async actions
    handleCreate,
    handleApprove,
    handleReject,
    handleRefresh,
  };
};