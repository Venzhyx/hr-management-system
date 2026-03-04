import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Dashboard from '../pages/Dashboard';
import EmployeesList from '../pages/employees/index';
import AddEmployee from '../pages/employees/add';
import EditEmployee from '../pages/employees/edit';
import EmployeeDetail from '../pages/employees/detail';
import Attendance from '../pages/Attendance';
import DepartmentsList from '../pages/departments/index';
import AddDepartment from '../pages/departments/add';
import EditDepartment from '../pages/departments/edit';
import DepartmentDetailModal from '../pages/departments/detail';
import Payroll from '../pages/Payroll';
import Reimbursement from '../pages/Reimbursement';
import Settings from '../pages/Settings';
import TimeOff from '../pages/TimeOff';

// Import Company Components dari folder companies
import CompanyList from '../pages/companies/index';
import AddCompany from '../pages/companies/add';
import EditCompany from '../pages/companies/edit';
import CompanyDetail from '../pages/companies/detail';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Employees Routes */}
        <Route path="employees" element={<EmployeesList />} />
        <Route path="employees/add" element={<AddEmployee />} />
        <Route path="employees/edit/:id" element={<EditEmployee />} />
        <Route path="employees/detail/:id" element={<EmployeeDetail />} />
        
        {/* Departments Routes */}
        <Route path="departments" element={<DepartmentsList />} />
        <Route path="departments/add" element={<AddDepartment />} />
        <Route path="departments/edit" element={<EditDepartment />} />
        <Route path="departments/detail/:id" element={<DepartmentDetailModal />} />

        {/* COMPANIES CRUD ROUTES - folder: companies */}
        <Route path="companies" element={<CompanyList />} />
        <Route path="companies/add" element={<AddCompany />} />
        <Route path="companies/edit/:id" element={<EditCompany />} />
        <Route path="companies/detail/:id" element={<CompanyDetail />} />
        
        {/* Other Routes */}
        <Route path="attendance" element={<Attendance />} />
        <Route path="timeoff" element={<TimeOff />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="reimbursement" element={<Reimbursement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<div className="p-6">Profile Page</div>} />
        <Route path="help" element={<div className="p-6">Help & Support</div>} />
        <Route path="logout" element={<div className="p-6">Logging out...</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;