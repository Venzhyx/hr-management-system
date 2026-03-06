import { combineReducers } from 'redux';
import employeeReducer           from './slices/employeeSlice';
import departmentReducer         from './slices/departmentSlice';
import companyReducer            from './slices/companySlice';
import attendanceSettingsReducer from './slices/attendanceSettingsSlice';
import calendarEventReducer      from './slices/calendarEventSlice';
import timeOffTypeReducer        from './slices/timeOffTypeSlice';

const rootReducer = combineReducers({
  employees:          employeeReducer,
  departments:        departmentReducer,
  companies:          companyReducer,
  attendanceSettings: attendanceSettingsReducer,
  calendarEvents:     calendarEventReducer,
  timeOffTypes:       timeOffTypeReducer,
});

export default rootReducer;