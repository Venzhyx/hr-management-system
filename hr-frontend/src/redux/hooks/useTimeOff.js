import { useDispatch, useSelector } from "react-redux";
import {
  fetchTimeOffRequests,
  fetchTimeOffRequestById,
  createTimeOffRequest,
  updateTimeOffRequest,
  deleteTimeOffRequest,
  approveTimeOffRequest,
  rejectTimeOffRequest,
} from "../slices/timeoffSlice";

export const useTimeOff = () => {
  const dispatch = useDispatch();

  const { list = [], loading = false, error = null } =
    useSelector((state) => state.timeOff || {});

  return {
    timeOffRequests: list,
    loading,
    error,

    fetchTimeOffRequests:  ()         => dispatch(fetchTimeOffRequests()).unwrap(),  // ← fix: pakai .unwrap() agar error bisa di-catch
    getTimeOffRequestById: (id)       => dispatch(fetchTimeOffRequestById(id)).unwrap(),
    createTimeOffRequest:  (data)     => dispatch(createTimeOffRequest(data)).unwrap(),
    updateTimeOffRequest:  (id, data) => dispatch(updateTimeOffRequest({ id, data })).unwrap(),
    deleteTimeOffRequest:  (id)       => dispatch(deleteTimeOffRequest(id)).unwrap(),
    approveTimeOffRequest: (id)       => dispatch(approveTimeOffRequest(id)).unwrap(),
    rejectTimeOffRequest:  (id)       => dispatch(rejectTimeOffRequest(id)).unwrap(),
  };
};
