import { useDispatch, useSelector } from "react-redux";
import {
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

  const { approvers = [], loading = false, error = null } =
    useSelector((state) => state.approval || {});

  return {
    approvers,
    loading,
    error,

    fetchApprovalApprovers: ()       => dispatch(fetchApprovalApprovers()),
    createApprovalApprover: (data)   => dispatch(createApprovalApprover(data)).unwrap(),
    deleteApprovalApprover: (id)     => dispatch(deleteApprovalApprover(id)).unwrap(),

    approveReimbursement:   (params) => dispatch(approveReimbursement(params)).unwrap(),
    rejectReimbursement:    (params) => dispatch(rejectReimbursement(params)).unwrap(),
  };
};
