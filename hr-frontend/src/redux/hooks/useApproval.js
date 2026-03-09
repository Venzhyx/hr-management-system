import { useDispatch, useSelector } from "react-redux";
import {
  fetchApprovalSettings,
  createApprovalSetting,
  updateApprovalSetting,
  fetchApprovalApprovers,
  createApprovalApprover,
  deleteApprovalApprover,
} from "../slices/approvalSlice";
import {
  approveReimbursement,
  rejectReimbursement,
} from "../slices/reimbursementSlice";

export const useApproval = () => {
  const dispatch = useDispatch();

  const { settings = [], approvers = [], loading = false, error = null } =
    useSelector((state) => state.approval || {});

  return {
    settings,
    approvers,
    loading,
    error,

    // Settings
    fetchApprovalSettings:  ()           => dispatch(fetchApprovalSettings()),
    createApprovalSetting:  (data)       => dispatch(createApprovalSetting(data)).unwrap(),
    updateApprovalSetting:  (data)       => dispatch(updateApprovalSetting(data)).unwrap(),

    // Approvers
    fetchApprovalApprovers: ()           => dispatch(fetchApprovalApprovers()),
    createApprovalApprover: (data)       => dispatch(createApprovalApprover(data)).unwrap(),
    deleteApprovalApprover: (id)         => dispatch(deleteApprovalApprover(id)).unwrap(),

    // Reimbursement actions
    approveReimbursement:   (params)     => dispatch(approveReimbursement(params)).unwrap(),
    rejectReimbursement:    (params)     => dispatch(rejectReimbursement(params)).unwrap(),
  };
};
