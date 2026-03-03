  // src/redux/hooks/useEmployee.js

  import { useEffect, useState, useMemo } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import {
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } from "../slices/employeeSlice";

  export const useEmployee = () => {
    const dispatch = useDispatch();

    const {
      list = [],
      selectedEmployee = null,
      loading = false,
      error = null,
    } = useSelector((state) => state.employees || {});

    /* =========================
      FETCH DATA
    ========================== */
    useEffect(() => {
      dispatch(fetchEmployees());
    }, [dispatch]);

    /* =========================
      FILTER STATE
    ========================== */
    const [filters, setFilters] = useState({
      search: "",
      department: "",
      status: "",
    });

    const setSearchFilter = (value) =>
      setFilters((prev) => ({ ...prev, search: value }));

    const setDepartmentFilter = (value) =>
      setFilters((prev) => ({ ...prev, department: value }));

    const setStatusFilter = (value) =>
      setFilters((prev) => ({ ...prev, status: value }));

    /* =========================
      FILTER LOGIC
    ========================== */
    const filteredEmployees = useMemo(() => {
      return list.filter((emp) => {
        const matchesSearch =
          emp.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          emp.employeeCode?.toLowerCase().includes(filters.search.toLowerCase()) ||
          emp.jobTitle?.toLowerCase().includes(filters.search.toLowerCase());

        const matchesDepartment = filters.department
          ? emp.departmentName === filters.department
          : true;

        const matchesStatus = filters.status
          ? emp.status === filters.status
          : true;

        return matchesSearch && matchesDepartment && matchesStatus;
      });
    }, [list, filters]);

    /* =========================
      PAGINATION
    ========================== */
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const totalElements = filteredEmployees.length;
    const totalPages = Math.ceil(totalElements / pageSize);

    const startIndex = (currentPage - 1) * pageSize;

    const paginatedEmployees = filteredEmployees.slice(
      startIndex,
      startIndex + pageSize
    );

    const setPage = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    const pagination = {
      currentPage,
      totalPages,
      totalElements,
      size: pageSize,
      startIndex,
    };

    /* =========================
      STATS
    ========================== */
    const total = list.length;

    const fullTime = list.filter(
      (emp) => emp.employeeType === "FULL_TIME"
    ).length;

    const partTime = list.filter(
      (emp) => emp.employeeType === "PART_TIME"
    ).length;

    const contract = list.filter(
      (emp) => emp.employeeType === "CONTRACT"
    ).length;

    const stats = {
      total,
      fullTime,
      partTime,
      contract,
      fullTimePercentage: total
        ? Math.round((fullTime / total) * 100)
        : 0,
      partTimePercentage: total
        ? Math.round((partTime / total) * 100)
        : 0,
      contractPercentage: total
        ? Math.round((contract / total) * 100)
        : 0,
    };

    /* =========================
      GROWTH DATA (12 MONTHS)
    ========================== */
    const growthData = useMemo(() => {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      const joined = new Array(12).fill(0);
      const leave = new Array(12).fill(0);

      list.forEach((emp) => {
        if (emp.joinDate) {
          const date = new Date(emp.joinDate);
          const month = date.getMonth();
          joined[month] += 1;
        }

        if (emp.status && emp.status !== "ACTIVE") {
          if (emp.updatedAt) {
            const leaveDate = new Date(emp.updatedAt);
            const leaveMonth = leaveDate.getMonth();
            leave[leaveMonth] += 1;
          }
        }
      });

      return { months, joined, leave };
    }, [list]);

    /* =========================
      RETURN
    ========================== */
    return {
      employees: list,
      paginatedEmployees,
      selectedEmployee,
      stats,
      growthData,
      filters,
      setSearchFilter,
      setDepartmentFilter,
      setStatusFilter,
      pagination,
      setPage,
      loading,
      error,

      fetchEmployees: () => dispatch(fetchEmployees()),
      createEmployee: (data) => dispatch(createEmployee(data)),
      updateEmployee: (employee) =>
        dispatch(updateEmployee(employee)),
      deleteEmployee: (id) => dispatch(deleteEmployee(id)).unwrap(),
    };
  };