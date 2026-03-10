import { useDispatch, useSelector } from "react-redux";
import {
  fetchApprovalApprovers,
  createApprovalApprover,
  deleteApprovalApprover,
} from "../slices/approvalSlice";
import {
  getReimbursementApprovalsAPI,
  updateReimbursementApprovalAPI,
} from "../../api/approvalApi";

export const useApproval = () => {
  const dispatch = useDispatch();

  const { approvers = [], loading = false, error = null } =
    useSelector((state) => state.approval || {});

  /**
   * Approve atau reject sebuah reimbursement.
   * Flow:
   *  1. GET /reimbursement-approvals/reimbursement/:reimbursementId
   *  2. Cari record yang PENDING
   *  3. PATCH /reimbursement-approvals/:approvalId { action, notes }
   *
   * @param {number} reimbursementId
   * @param {"APPROVED"|"REJECTED"} action
   * @param {string|null} notes
   */
  const processApproval = async (reimbursementId, action, notes = null) => {
    // Step 1: ambil approval records
    const res  = await getReimbursementApprovalsAPI(reimbursementId);
    const list = res.data?.data ?? res.data ?? [];

    if (!Array.isArray(list) || list.length === 0) {
      throw new Error(
        "Tidak ada approval record untuk reimbursement ini. " +
        "Pastikan approver sudah dikonfigurasi sebelum reimbursement dibuat."
      );
    }

    // Step 2: cari yang PENDING
    const pending = list.find((a) => a.status === "PENDING");
    if (!pending) {
      throw new Error("Semua approval record sudah diproses.");
    }

    // Step 3: patch
    await updateReimbursementApprovalAPI(pending.id, {
      action,
      notes: notes?.trim() || null,
    });
  };

  return {
    approvers,
    loading,
    error,

    fetchApprovalApprovers: ()       => dispatch(fetchApprovalApprovers()),
    createApprovalApprover: (data)   => dispatch(createApprovalApprover(data)).unwrap(),
    deleteApprovalApprover: (id)     => dispatch(deleteApprovalApprover(id)).unwrap(),

    // Unified method untuk approve/reject
    processApproval,

    // Shorthand
    approveReimbursement: (reimbursementId, notes) =>
      processApproval(reimbursementId, "APPROVED", notes),
    rejectReimbursement: (reimbursementId, notes) =>
      processApproval(reimbursementId, "REJECTED", notes),
  };
};
