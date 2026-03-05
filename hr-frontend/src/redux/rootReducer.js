import { combineReducers } from 'redux';
import employeeReducer from './slices/employeeSlice';
import departmentReducer from './slices/departmentSlice';
import companyReducer from './slices/companySlice';

const rootReducer = combineReducers({
  employees: employeeReducer,
  departments: departmentReducer,
  companies: companyReducer, // TAMBAHKAN INI
});

export default rootReducer;