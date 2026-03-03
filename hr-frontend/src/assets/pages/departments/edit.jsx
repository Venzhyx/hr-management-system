import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineOfficeBuilding, HiOutlineUser } from "react-icons/hi";
import { useDepartment } from "../../../redux/hooks/useDepartment";
import { useEmployee } from "../../../redux/hooks/useEmployee";

const EditDepartment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const departmentData = location.state?.department;

  const { updateDepartment, fetchDepartments } = useDepartment(); // Tambahkan fetchDepartments
  const { employees, fetchEmployees } = useEmployee();

  const [formData, setFormData] = useState({
    departmentName: "",
    managerId: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch employees untuk dropdown manager
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Set form data ketika departmentData tersedia
  useEffect(() => {
    if (departmentData) {
      setFormData({
        departmentName: departmentData.departmentName || "",
        managerId: departmentData.managerId ? departmentData.managerId.toString() : ""
      });
    }
  }, [departmentData]);

  // Validasi form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.departmentName.trim()) {
      newErrors.departmentName = "Department name is required";
    } else if (formData.departmentName.trim().length < 2) {
      newErrors.departmentName = "Department name must be at least 2 characters";
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset error untuk field yang diubah
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id: departmentData.id,
        departmentName: formData.departmentName.trim(),
        managerId: formData.managerId ? parseInt(formData.managerId) : null
      };

      console.log("Updating department with payload:", payload);
      
      // 1. Update department
      await updateDepartment(payload);
      
      // 2. Refresh daftar departments di Redux
      await fetchDepartments();
      
      // 3. Navigate back dengan state untuk trigger refresh di list
      navigate("/departments", { 
        state: { refresh: true } 
      });
      
    } catch (error) {
      console.error("Failed to update department:", error);
      
      // Error handling yang lebih baik
      let errorMessage = "Failed to update department. Please try again.";
      
      if (error.response) {
        // Error dari server
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Other errors
        errorMessage = error.message || errorMessage;
      }
      
      setErrors({
        submit: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter hanya employee yang aktif untuk manager dropdown
  const activeEmployees = employees?.filter(emp => emp.status === 'ACTIVE') || [];

  // Cari nama manager yang terpilih
  const selectedManager = activeEmployees.find(emp => emp.id === parseInt(formData.managerId));

  if (!departmentData) {
    return (
      <div className="w-full px-4 md:px-6 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate("/departments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Edit Department</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex justify-center items-center">
          <div className="text-center">
            <HiOutlineOfficeBuilding className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No department data found</p>
            <p className="text-sm text-gray-400 mt-2">Please select a department to edit</p>
            <button
              onClick={() => navigate("/departments")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Departments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate("/departments")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Department</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        {/* Error Submit */}
        {errors.submit && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Icon */}
          <div className="md:col-span-2 flex items-center space-x-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
              <HiOutlineOfficeBuilding className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Editing Department</p>
              <p className="text-lg font-semibold text-gray-800">{formData.departmentName || 'New Department'}</p>
            </div>
          </div>

          {/* Department Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              placeholder="e.g., Marketing, Engineering, HR"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.departmentName 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.departmentName && (
              <p className="mt-1 text-xs text-red-500">{errors.departmentName}</p>
            )}
          </div>

          {/* Manager Dropdown */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Manager
            </label>
            <select
              name="managerId"
              value={formData.managerId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25rem',
              }}
              disabled={isSubmitting}
            >
              <option value="">Select Manager (Optional)</option>
              {activeEmployees.length > 0 ? (
                activeEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.jobTitle || 'No Title'} 
                    {emp.employeeCode ? ` (${emp.employeeCode})` : ''}
                  </option>
                ))
              ) : (
                <option value="" disabled>No active employees available</option>
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select an active employee to be the department manager
            </p>
          </div>

          {/* Current Manager Info */}
          {selectedManager && (
            <div className="md:col-span-2 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <HiOutlineUser className="w-5 h-5 text-indigo-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-indigo-600 font-medium mb-1">Current Manager</p>
                  <p className="text-sm font-semibold text-indigo-900">
                    {selectedManager.name}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedManager.jobTitle && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                        {selectedManager.jobTitle}
                      </span>
                    )}
                    {selectedManager.employeeCode && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                        ID: {selectedManager.employeeCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Manager Selected Info */}
          {!selectedManager && formData.managerId && (
            <div className="md:col-span-2 bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <p className="text-sm text-yellow-700">
                Selected manager not found in active employees list.
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/departments")}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update Department'
            )}
          </button>
        </div>

        {/* Department Info */}
        <div className="mt-4 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between">
            <span>Department ID: {departmentData.id}</span>
            {departmentData.createdAt && (
              <span>Created: {new Date(departmentData.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditDepartment;