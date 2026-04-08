import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Dashboard from '../pages/Dashboard';
import EmployeesList from '../pages/employees/index';
import AddEmployee from '../pages/employees/add';
import EditEmployee from '../pages/employees/edit';
import EmployeeDetail from '../pages/employees/detail';
import Attendance from '../pages/Attendance';
import AttendanceCorrection from '../pages/attendance/AttendanceCorrection';
import Overtime from '../pages/attendance/Overtime';
import DepartmentsList from '../pages/departments/index';
import AddDepartment from '../pages/departments/add';
import EditDepartment from '../pages/departments/edit';
import DepartmentDetailModal from '../pages/departments/detail';
import Payroll from '../pages/Payroll';
import Settings from '../pages/Settings';

// Companies
import CompanyList   from '../pages/companies/index';
import AddCompany    from '../pages/companies/add';
import EditCompany   from '../pages/companies/edit';
import CompanyDetail from '../pages/companies/detail';

// Reimbursements
import ReimbursementIndex  from '../pages/reimbursements/index';
import CreateReimbursement from '../pages/reimbursements/add';
import EditReimbursement   from '../pages/reimbursements/edit';
import ReimbursementDetail from '../pages/reimbursements/detail';

// Approvals
import ApprovalPage              from '../pages/approvals/index';
import ApprovalReimbursementPage from '../pages/approvals/reimbursement';
import ApprovalTimeOffPage       from '../pages/approvals/timeoff';

// Time Off
import TimeOffIndex  from '../pages/timeoffs/index';
import TimeOffAdd    from '../pages/timeoffs/add';
import TimeOffDetail from '../pages/timeoffs/detail';
import TimeOffEdit   from '../pages/timeoffs/edit';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Employees */}
        <Route path="employees"            element={<EmployeesList />} />
        <Route path="employees/add"        element={<AddEmployee />} />
        <Route path="employees/edit/:id"   element={<EditEmployee />} />
        <Route path="employees/detail/:id" element={<EmployeeDetail />} />

        {/* Departments */}
        <Route path="departments"            element={<DepartmentsList />} />
        <Route path="departments/add"        element={<AddDepartment />} />
        <Route path="departments/edit/:id"   element={<EditDepartment />} />
        <Route path="departments/detail/:id" element={<DepartmentDetailModal />} />

        {/* Companies */}
        <Route path="companies"            element={<CompanyList />} />
        <Route path="companies/add"        element={<AddCompany />} />
        <Route path="companies/edit/:id"   element={<EditCompany />} />
        <Route path="companies/detail/:id" element={<CompanyDetail />} />

        {/* Reimbursements */}
        <Route path="reimbursements"            element={<ReimbursementIndex />} />
        <Route path="reimbursements/add"        element={<CreateReimbursement />} />
        <Route path="reimbursements/edit/:id"   element={<EditReimbursement />} />
        <Route path="reimbursements/detail/:id" element={<ReimbursementDetail />} />

        {/* Approvals */}
        <Route path="approvals"               element={<ApprovalPage />} />
        <Route path="approvals/reimbursement" element={<ApprovalReimbursementPage />} />
        <Route path="approvals/timeoff"       element={<ApprovalTimeOffPage />} />

        {/* Time Off */}
        <Route path="time-off"          element={<TimeOffIndex />} />
        <Route path="time-off/add"      element={<TimeOffAdd />} />
        <Route path="time-off/edit/:id" element={<TimeOffEdit />} />
        <Route path="time-off/:id"      element={<TimeOffDetail />} />

        {/* Attendance */}
        <Route path="attendance"            element={<Attendance />} />
        <Route path="attendance/correction" element={<AttendanceCorrection />} />
        <Route path="attendance/overtime"   element={<Overtime />} />

        {/* Other */}
        <Route path="payroll"    element={<Payroll />} />
        <Route path="settings"   element={<Settings />} />
        <Route path="profile"    element={<div className="p-6">Profile Page</div>} />
        <Route path="help"       element={<div className="p-6">Help & Support</div>} />
        <Route path="logout"     element={<div className="p-6">Logging out...</div>} />
        <Route path="account"    element={<div className="p-6">Account Page</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
