import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../slices/companySlice";

export const useCompany = () => {
  const dispatch = useDispatch();

  const { list, loading, error } = useSelector(
    (state) => state.companies
  );

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  return {
    companies: list,
    loading,
    error,

    fetchCompanies: () => dispatch(fetchCompanies()),

    // CREATE (multipart)
    createCompany: (formData) =>
      dispatch(createCompany(formData)),

    // UPDATE (multipart)
    updateCompany: (id, formData) =>
      dispatch(updateCompany({ id, formData })),

    deleteCompany: (id) =>
      dispatch(deleteCompany(id)),
  };
};