import { combineReducers } from 'redux';
import employeeReducer           from './slices/employeeSlice';
import departmentReducer         from './slices/departmentSlice';
import companyReducer            from './slices/companySlice';
import attendanceSettingsReducer from './slices/attendanceSettingsSlice';
import attendanceReducer         from './slices/attendanceSlice'; // ← tambah ini
import calendarEventReducer      from './slices/calendarEventSlice';
import timeOffTypeReducer        from './slices/timeOffTypeSlice';
import timeOffReducer            from './slices/timeoffSlice';
import reimbursementReducer      from './slices/reimbursementSlice';
import approvalReducer           from './slices/approvalSlice';
import attendanceCorrectionReducer from './slices/attendanceCorrectionSlice';

const rootReducer = combineReducers({
  employees: employeeReducer,
  departments: departmentReducer,
  companies: companyReducer,
  attendanceSettings: attendanceSettingsReducer,
  attendance: attendanceReducer,
  attendanceCorrection: attendanceCorrectionReducer, // ✅ INI YANG KURANG
  calendarEvents: calendarEventReducer,
  timeOffTypes: timeOffTypeReducer,
  timeOff: timeOffReducer,
  reimbursements: reimbursementReducer,
  approval: approvalReducer,
});

export default rootReducer;
