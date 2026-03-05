import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  HiOutlineX, 
  HiOutlinePencil, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineCalendar, 
  HiOutlineUser, 
  HiOutlineBriefcase, 
  HiOutlineIdentification,
  HiOutlineHome,
  HiOutlineHeart,
  HiOutlineDocument,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlinePhotograph,
  HiOutlineDownload,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineGlobe,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineCreditCard
} from 'react-icons/hi';
import { useEmployee } from '../../../redux/hooks/useEmployee';
import { useDepartment } from '../../../redux/hooks/useDepartment';
import { useCompany } from '../../../redux/hooks/useCompany';

const EmployeeDetailModal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { 
    fetchEmployeeById, 
    selectedEmployee, 
    loading,
    employees 
  } = useEmployee();
  
  const { departments, fetchDepartments } = useDepartment();
  const { companies, fetchCompanies } = useCompany();
  
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ url: '', label: '', type: '' });

  // Fetch employee by ID saat komponen mount
  useEffect(() => {
    if (id) {
      fetchEmployeeById(parseInt(id));
    }
  }, [id, fetchEmployeeById]);

  // Fetch reference data
  useEffect(() => {
    fetchDepartments();
    fetchCompanies();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    navigate('/employees');
  };


  const handleCloseFileViewer = () => {
    setShowFileViewer(false);
    setSelectedFile({ url: '', label: '', type: '' });
  };

  const getFileType = (url) => {
    if (!url) return 'unknown';
    
    try {
      const extension = url.split('.').pop().toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
        return 'image';
      }
      
      if (extension === 'pdf') {
        return 'pdf';
      }
      
      if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
        return 'office';
      }
      
      if (['txt', 'csv', 'md'].includes(extension)) {
        return 'text';
      }
      
      return 'document';
    } catch (error) {
      return 'unknown';
    }
  };

  const handleViewFile = (url, label) => {
    const type = getFileType(url);
    setSelectedFile({ url, label, type });
    setShowFileViewer(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get company name
  const getCompanyName = (companyId) => {
  if (!companyId) return 'N/A';
  const company = companies?.find(c => c.id === companyId);
  return company?.companyName || 'N/A';
};

  // Get department name
 const getDepartmentName = (deptId) => {
  if (!deptId) return 'N/A';
  const dept = departments?.find(d => d.id === deptId);
  return dept?.departmentName || 'N/A';
};

  // FIXED: Get manager/coach name - tidak fallback ke selectedEmployee
  const getEmployeeName = (empId) => {
    if (!empId) return 'N/A';
    const emp = employees?.find(e => e.id === empId);
    return emp?.name || 'N/A';
  };

  // Loading state
  if (loading || !selectedEmployee || selectedEmployee.id !== parseInt(id)) { 
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  // Employee not found
  if (!selectedEmployee) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl max-w-md w-full mx-4 p-8 shadow-2xl text-center">
          <HiOutlineUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Employee Not Found</h3>
          <p className="text-gray-600 mb-6">The employee you're looking for doesn't exist.</p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const employee = selectedEmployee ?? {};
  const employeeData = {
    // Basic Info
    id: employee.id,
    name: employee.name || 'N/A',
    jobTitle: employee.jobTitle || 'N/A',
    workEmail: employee.workEmail || 'N/A',
    workPhone: employee.workPhone || 'N/A',
    workMobile: employee.workMobile || 'N/A',
    employeeType: employee.employeeType || 'FULL_TIME',
    status: employee.status || 'ACTIVE',
    joinDate: formatDate(employee.joinDate),
    photo: employee.photo || null,
    
    // Relations
    companyId: employee.companyId,
    companyName: getCompanyName(employee.companyId),
    departmentId: employee.departmentId,
    departmentName: getDepartmentName(employee.departmentId),
    managerId: employee.managerId,
    managerName: getEmployeeName(employee.managerId),
    coachId: employee.coachId,
    coachName: getEmployeeName(employee.coachId),
    
    // Related User & Settings
    relatedUser: employee.relatedUserName || employee.relatedUser || 'N/A',
    attendanceBadgeId: employee.attendanceBadgeId || 'N/A',
    monthlyCost: employee.monthlyCost,
    monthlyCostFormatted: formatCurrency(employee.monthlyCost),
    
    // Private Contact
    privateAddress: employee.privateAddress || 'N/A',
    privateEmail: employee.privateEmail || 'N/A',
    privatePhone: employee.privatePhone || 'N/A',

    banks: Array.isArray(employee.banks) ? employee.banks : [],
    insurances: Array.isArray(employee.insurances) ? employee.insurances : [],
    
    npwpId: employee.npwpId || 'N/A',
    homeToWorkDistance: employee.homeToWorkDistance || 0,
    
    // Citizenship
    nationality: employee.nationality || 'N/A',
    identificationNumber: employee.identificationNumber || 'N/A',
    passportNumber: employee.passportNumber || 'N/A',
    gender: employee.gender || 'N/A',
    dateOfBirth: formatDate(employee.dateOfBirth),
    placeOfBirth: employee.placeOfBirth || 'N/A',
    countryOfBirth: employee.countryOfBirth || 'N/A',
    
    // Emergency
    emergencyContactName: employee.emergencyContactName || 'N/A',
    emergencyContactPhone: employee.emergencyContactPhone || 'N/A',
    
    // Education
    certificateLevel: employee.certificateLevel || 'N/A',
    fieldOfStudy: employee.fieldOfStudy || 'N/A',
    school: employee.school || 'N/A',
    
    // Family Status
    maritalStatus: employee.maritalStatus || 'N/A',
    numberOfDependentChildren: employee.numberOfDependentChildren || 0,
    
    // NEW: Documents
    idCardCopy: employee.idCardCopy,
    familyCardCopy: employee.familyCardCopy,
    drivingLicenseCopy: employee.drivingLicenseCopy,
    assuranceCardCopy: employee.assuranceCardCopy,
    npwpCardCopy: employee.npwpCardCopy,
    
    
    // Initials untuk avatar
    initials: employee.name?.split(' ').map(n => n[0]).join('') || 'NA'
  };

  const DocumentItem = ({ label, url, icon: Icon = HiOutlineDocument }) => {
    if (!url) return null;

    const fileType = getFileType(url);
    const isImage = fileType === 'image';
    
    return (
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
        <div className="flex items-center space-x-3">
          {isImage ? (
            <HiOutlinePhotograph className="w-5 h-5 text-indigo-500" />
          ) : (
            <Icon className="w-5 h-5 text-indigo-500" />
          )}
          <span className="text-sm text-gray-700 font-medium">{label}</span>
          <span className="text-xs text-gray-400 uppercase">
            {url?.split('.').pop() || 'file'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewFile(url, label)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View Document"
          >
            <HiOutlineEye className="w-4 h-4" />
          </button>
          <a
            href={url}
            download
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download Document"
          >
            <HiOutlineDownload className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  };

  

  console.log(selectedEmployee)
  console.log("selectedEmployee:", selectedEmployee);
console.log("banks:", selectedEmployee?.banks);
console.log("insurances:", selectedEmployee?.insurances);

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto py-10"
        onClick={handleClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-semibold text-gray-800">Employee Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/employees/edit/${employee.id}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HiOutlinePencil className="w-5 h-5" />
                <span>Edit</span>
              </button>
              <button onClick={handleClose} className="ml-2 text-gray-400 hover:text-gray-600">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                  {/* Foto */}
                  <div className="flex justify-center mb-6">
                    <div className="relative cursor-pointer group" onClick={() => employeeData.photo && handleViewFile(employeeData.photo, 'Profile Photo')}>
                      {employeeData.photo ? (
                        <>
                          <img 
                            src={employeeData.photo}
                            alt={employeeData.name}
                            className="w-40 h-40 rounded-full object-cover border-4 border-indigo-100 group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <HiOutlineEye className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-40 h-40 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-200">
                          <span className="text-4xl font-bold text-indigo-600">{employeeData.initials}</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Nama dan Role */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{employeeData.name}</h2>
                    <p className="text-indigo-600 font-medium">{employeeData.jobTitle}</p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex justify-center space-x-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employeeData.employeeType === 'FULL_TIME' ? 'bg-blue-100 text-blue-800' :
                      employeeData.employeeType === 'PART_TIME' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {employeeData.employeeType.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employeeData.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employeeData.status}
                    </span>
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center text-gray-600">
                      <HiOutlineMail className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-sm">{employeeData.workEmail}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <HiOutlinePhone className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-sm">{employeeData.workPhone || employeeData.workMobile}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <HiOutlineUser className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-sm">{employeeData.gender}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <HiOutlineCalendar className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-sm">Join: {employeeData.joinDate}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <HiOutlineOfficeBuilding className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-sm">{employeeData.companyName}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <HiOutlineBriefcase className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-sm">{employeeData.departmentName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineUser className="w-5 h-5 mr-2 text-indigo-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium">{employeeData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Job Title</p>
                      <p className="text-sm font-medium">{employeeData.jobTitle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Company</p>
                      <p className="text-sm font-medium">{employeeData.companyName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-sm font-medium">{employeeData.departmentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Join Date</p>
                      <p className="text-sm font-medium">{employeeData.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Manager</p>
                      <p className="text-sm font-medium">{employeeData.managerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Coach</p>
                      <p className="text-sm font-medium">{employeeData.coachName}</p>
                    </div>
                  </div>
                </div>

                {/* Related User & Settings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineUserGroup className="w-5 h-5 mr-2 text-indigo-600" />
                    Related User & Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Related User</p>
                      <p className="text-sm font-medium">{employeeData.relatedUser}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Attendance Badge ID</p>
                      <p className="text-sm font-medium">{employeeData.attendanceBadgeId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Monthly Cost</p>
                      <p className="text-sm font-medium text-indigo-600">{employeeData.monthlyCostFormatted}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlinePhone className="w-5 h-5 mr-2 text-indigo-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Work Email</p>
                      <p className="text-sm font-medium">{employeeData.workEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Work Phone</p>
                      <p className="text-sm font-medium">{employeeData.workPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Work Mobile</p>
                      <p className="text-sm font-medium">{employeeData.workMobile}</p>
                    </div>
                  </div>
                </div>

                {/* Private Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineHome className="w-5 h-5 mr-2 text-indigo-600" />
                    Private Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Private Address</p>
                      <p className="text-sm font-medium">{employeeData.privateAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Private Email</p>
                      <p className="text-sm font-medium">{employeeData.privateEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Private Phone</p>
                      <p className="text-sm font-medium">{employeeData.privatePhone}</p>
                    </div>
                    <div>
                    <p className="text-xs text-gray-500">Bank Accounts</p>
                   <div className="space-y-1">
                    {employeeData.banks && employeeData.banks.length > 0 ? (
                      employeeData.banks.map((bank) => (
                        <div key={bank.id || bank.accountNumber} className="text-sm font-medium">
                          <p>{bank.bankName}</p>
                          <p className="text-gray-500 text-xs">
                            {bank.accountNumber} • {bank.accountHolder}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-medium">N/A</p>
                    )}
                  </div>
                  </div>
                    {/* Insurance */}
                    <div>
                      <p className="text-xs text-gray-500">Insurance</p>

                      <div className="space-y-1">
                        {(employeeData.insurances || []).length > 0 ? (
                          (employeeData.insurances || []).map((insurance) => (
                            <div key={insurance.id || insurance.policyNumber} className="text-sm font-medium">
                              <p>{insurance.provider} ({insurance.type})</p>
                              <p className="text-gray-500 text-xs">
                                Policy: {insurance.policyNumber}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm font-medium">N/A</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">NPWP ID</p>
                      <p className="text-sm font-medium">{employeeData.npwpId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Home to Work Distance</p>
                      <p className="text-sm font-medium">
                        {employeeData.homeToWorkDistance !== 0 
                          ? `${employeeData.homeToWorkDistance} km` 
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Citizenship */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineGlobe className="w-5 h-5 mr-2 text-indigo-600" />
                    Citizenship
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Nationality</p>
                      <p className="text-sm font-medium">{employeeData.nationality}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ID Number</p>
                      <p className="text-sm font-medium">{employeeData.identificationNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Passport Number</p>
                      <p className="text-sm font-medium">{employeeData.passportNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="text-sm font-medium">{employeeData.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-sm font-medium">{employeeData.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Place of Birth</p>
                      <p className="text-sm font-medium">{employeeData.placeOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Country of Birth</p>
                      <p className="text-sm font-medium">{employeeData.countryOfBirth}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineHeart className="w-5 h-5 mr-2 text-red-500" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Contact Name</p>
                      <p className="text-sm font-medium">{employeeData.emergencyContactName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contact Phone</p>
                      <p className="text-sm font-medium">{employeeData.emergencyContactPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineAcademicCap className="w-5 h-5 mr-2 text-indigo-600" />
                    Education
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Certificate Level</p>
                      <p className="text-sm font-medium">{employeeData.certificateLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Field of Study</p>
                      <p className="text-sm font-medium">{employeeData.fieldOfStudy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">School</p>
                      <p className="text-sm font-medium">{employeeData.school}</p>
                    </div>
                  </div>
                </div>

                {/* Family Status */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineUsers className="w-5 h-5 mr-2 text-indigo-600" />
                    Family Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Marital Status</p>
                      <p className="text-sm font-medium">{employeeData.maritalStatus}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Dependent Children</p>
                      <p className="text-sm font-medium">{employeeData.numberOfDependentChildren}</p>
                    </div>
                  </div>
                </div>

                {/* NEW: Documents Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineDocument className="w-5 h-5 mr-2 text-indigo-600" />
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocumentItem
                      label="ID Card / KTP"
                      url={employeeData.idCardCopy}
                      icon={HiOutlineIdentification}
                    />
                    <DocumentItem
                      label="Family Card"
                      url={employeeData.familyCardCopy}
                      icon={HiOutlineUsers}
                    />
                    <DocumentItem
                      label="Driving License"
                      url={employeeData.drivingLicenseCopy}
                      icon={HiOutlineDocument}
                    />
                    <DocumentItem
                      label="Insurance Card"
                      url={employeeData.assuranceCardCopy}
                      icon={HiOutlineShieldCheck}
                    />
                    <DocumentItem
                      label="NPWP Card"
                      url={employeeData.npwpCardCopy}
                      icon={HiOutlineDocument}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>


      {/* File Viewer Modal */}
      {showFileViewer && selectedFile.url && (
        <div 
          className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4"
          onClick={handleCloseFileViewer}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-800">{selectedFile.label}</h3>
                <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full uppercase">
                  {selectedFile.url?.split('.').pop() || 'file'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={selectedFile.url}
                  download
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <HiOutlineDownload className="w-5 h-5" />
                </a>
                <button
                  onClick={handleCloseFileViewer}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {selectedFile.type === 'image' && (
                <div className="flex justify-center">
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.label}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                </div>
              )}

              {selectedFile.type === 'pdf' && (
                <div className="w-full">
                  <iframe
                    src={`${selectedFile.url}#toolbar=1&navpanes=1`}
                    title={selectedFile.label}
                    className="w-full h-[70vh] rounded-lg border border-gray-200"
                    frameBorder="0"
                  />
                  <p className="text-xs text-gray-400 text-center mt-2">
                    If PDF doesn't load, {' '}
                    <a 
                      href={selectedFile.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      click here to open in new tab
                    </a>
                  </p>
                </div>
              )}

              {(selectedFile.type === 'office' || selectedFile.type === 'text' || selectedFile.type === 'document') && (
                <div className="flex flex-col items-center justify-center py-12">
                  <HiOutlineDocumentText className="w-24 h-24 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2 text-center">
                    Preview not available for this file type
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    You can download or open it in a new tab
                  </p>
                  <div className="flex space-x-4">
                    <a
                      href={selectedFile.url}
                      download
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}

              {selectedFile.type === 'unknown' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <HiOutlineDocument className="w-24 h-24 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2 text-center">
                    Unknown file type
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    This file cannot be previewed
                  </p>
                  <a
                    href={selectedFile.url}
                    download
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeDetailModal;