import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../slices/departmentSlice";

export const useDepartment = () => {
  const dispatch = useDispatch();

  const { list, loading, error } = useSelector(
    (state) => state.departments
  );

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  return {
    departments: list,
    loading,
    error,
    fetchDepartments: () => dispatch(fetchDepartments()),
    createDepartment: (data) =>
      dispatch(createDepartment(data)),
    updateDepartment: (department) =>
      dispatch(updateDepartment(department)),
    deleteDepartment: (id) =>
      dispatch(deleteDepartment(id)),
  };
};