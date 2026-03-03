import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HiOutlineX, 
  HiOutlinePencil, 
  HiOutlineTrash, 
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
  HiOutlineDocumentDownload,
  HiOutlineEye,
  HiOutlinePhotograph,
  HiOutlineDownload,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup
} from 'react-icons/hi';
import API from "../../../api/api";

const EmployeeDetailModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;

  // GUARD: Kalau tidak ada employee, redirect
  useEffect(() => {
    if (!employee) {
      navigate('/employees');
    }
  }, [employee, navigate]);

  const [showModal, setShowModal] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ url: '', label: '', type: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  if (!employee) return null;

  const handleClose = () => {
    setShowModal(false);
    navigate('/employees');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await API.delete(`/employees-complete/${employee.id}`);
      
      setShowDeleteModal(false);
      setShowModal(false);
      
      setTimeout(() => {
        navigate('/employees');
      }, 100);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
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

  const handleCloseFileViewer = () => {
    setShowFileViewer(false);
    setSelectedFile({ url: '', label: '', type: '' });
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

  // ✅ Data dengan Monthly Cost dan Related User (sesuai DTO)
  const employeeData = {
    // Basic Info
    id: employee.id,
    employeeCode: employee.employeeCode || 'N/A',
    name: employee.name || 'N/A',
    jobTitle: employee.jobTitle || 'N/A',
    jobPosition: employee.jobPosition || 'N/A',
    workEmail: employee.workEmail || 'N/A',
    workPhone: employee.workPhone || 'N/A',
    workMobile: employee.workMobile || 'N/A',
    employeeType: employee.employeeType || 'FULL_TIME',
    status: employee.status || 'ACTIVE',
    joinDate: formatDate(employee.joinDate),
    photo: employee.photo || null,
    departmentId: employee.departmentId,
    departmentName: employee.departmentName || 'N/A',
    managerId: employee.managerId,
    managerName: employee.managerName || 'N/A',
    coachId: employee.coachId,
    coachName: employee.coachName || 'N/A',
    
    // ✅ Related User (String)
    relatedUser: employee.relatedUser || 'N/A',
    
    // Private Contact
    privateAddress: employee.privateAddress || 'N/A',
    privateEmail: employee.privateEmail || 'N/A',
    privatePhone: employee.privatePhone || 'N/A',
    bankName: employee.bankName || 'N/A',
    accountNumber: employee.accountNumber || 'N/A',
    homeToWorkDistance: employee.homeToWorkDistance || 0,
    bpjsId: employee.bpjsId || 'N/A',
    
    // ✅ Monthly Cost (Double)
    monthlyCost: employee.monthlyCost,
    monthlyCostFormatted: formatCurrency(employee.monthlyCost),
    
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
    
    // Documents
    contractDocument: employee.contractDocument,
    bankBookDocument: employee.bankBookDocument,
    bpjsCardDocument: employee.bpjsCardDocument,
    ktpDocument: employee.ktpDocument,
    passportDocument: employee.passportDocument,
    familyCardDocument: employee.familyCardDocument,
    certificateDocument: employee.certificateDocument,
    transcriptDocument: employee.transcriptDocument,
    marriageCertificateDocument: employee.marriageCertificateDocument,
    childCertificateDocument: employee.childCertificateDocument,
    
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
    
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
            {url.split('.').pop()}
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
            <HiOutlineDocumentDownload className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
                onClick={() => navigate('/employees/edit', { state: { employee: employee } })}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HiOutlinePencil className="w-5 h-5" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={isDeleting}
              >
                <HiOutlineTrash className="w-5 h-5" />
                <span>Delete</span>
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
                    <p className="text-sm text-gray-500 mt-1">ID: {employeeData.employeeCode}</p>
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
                      employeeData.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
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
                      <p className="text-xs text-gray-500">Employee Code</p>
                      <p className="text-sm font-medium">{employeeData.employeeCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium">{employeeData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Job Title</p>
                      <p className="text-sm font-medium">{employeeData.jobTitle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Job Position</p>
                      <p className="text-sm font-medium">{employeeData.jobPosition}</p>
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

                  {/* Basic Documents */}
                  {(employeeData.contractDocument) && (
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <HiOutlineDocumentText className="w-4 h-4 mr-2 text-indigo-500" />
                        Documents
                      </h4>
                      <DocumentItem 
                        label="Employment Contract" 
                        url={employeeData.contractDocument} 
                        icon={HiOutlineDocumentText}
                      />
                    </div>
                  )}
                </div>

                {/* ✅ Related User Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineUserGroup className="w-5 h-5 mr-2 text-indigo-600" />
                    Related User
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Related User</p>
                      <p className="text-sm font-medium">
                        {employeeData.relatedUser !== 'N/A' 
                          ? employeeData.relatedUser
                          : 'N/A'
                        }
                      </p>
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

                {/* ✅ Private Information dengan Monthly Cost */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineHome className="w-5 h-5 mr-2 text-indigo-600" />
                    Private Information
                  </h3>
                  
                  {/* Monthly Cost Card */}
                  <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <HiOutlineCurrencyDollar className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Monthly Cost</span>
                      </div>
                      <span className="text-lg font-bold text-indigo-700">
                        {employeeData.monthlyCostFormatted}
                      </span>
                    </div>
                  </div>

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
                      <p className="text-xs text-gray-500">Bank Account</p>
                      <p className="text-sm font-medium">
                        {employeeData.bankName !== 'N/A' || employeeData.accountNumber !== 'N/A'
                          ? `${employeeData.bankName} - ${employeeData.accountNumber}`
                          : 'N/A'
                        }
                      </p>
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
                    <div>
                      <p className="text-xs text-gray-500">BPJS ID</p>
                      <p className="text-sm font-medium">{employeeData.bpjsId}</p>
                    </div>
                  </div>

                  {/* Private Documents */}
                  {(employeeData.bankBookDocument || employeeData.bpjsCardDocument) && (
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <HiOutlineDocumentText className="w-4 h-4 mr-2 text-indigo-500" />
                        Documents
                      </h4>
                      <div className="space-y-2">
                        <DocumentItem 
                          label="Bank Book" 
                          url={employeeData.bankBookDocument} 
                          icon={HiOutlineDocument}
                        />
                        <DocumentItem 
                          label="BPJS Card" 
                          url={employeeData.bpjsCardDocument} 
                          icon={HiOutlineDocument}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Citizenship */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineIdentification className="w-5 h-5 mr-2 text-indigo-600" />
                    Citizenship
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Nationality</p>
                      <p className="text-sm font-medium">{employeeData.nationality}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Identification Number</p>
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

                  {/* Citizenship Documents */}
                  {(employeeData.ktpDocument || employeeData.passportDocument || employeeData.familyCardDocument) && (
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <HiOutlineDocumentText className="w-4 h-4 mr-2 text-indigo-500" />
                        Documents
                      </h4>
                      <div className="space-y-2">
                        <DocumentItem 
                          label="KTP" 
                          url={employeeData.ktpDocument} 
                          icon={HiOutlineIdentification}
                        />
                        <DocumentItem 
                          label="Passport" 
                          url={employeeData.passportDocument} 
                          icon={HiOutlineDocument}
                        />
                        <DocumentItem 
                          label="Family Card" 
                          url={employeeData.familyCardDocument} 
                          icon={HiOutlineDocument}
                        />
                      </div>
                    </div>
                  )}
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
                    <HiOutlineBriefcase className="w-5 h-5 mr-2 text-indigo-600" />
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

                  {/* Education Documents */}
                  {(employeeData.certificateDocument || employeeData.transcriptDocument) && (
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <HiOutlineDocumentText className="w-4 h-4 mr-2 text-indigo-500" />
                        Documents
                      </h4>
                      <div className="space-y-2">
                        <DocumentItem 
                          label="Certificate" 
                          url={employeeData.certificateDocument} 
                          icon={HiOutlineDocumentText}
                        />
                        <DocumentItem 
                          label="Transcript" 
                          url={employeeData.transcriptDocument} 
                          icon={HiOutlineDocumentText}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Family Status */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineHeart className="w-5 h-5 mr-2 text-red-500" />
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

                  {/* Family Documents */}
                  {(employeeData.marriageCertificateDocument || employeeData.childCertificateDocument) && (
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <HiOutlineDocumentText className="w-4 h-4 mr-2 text-indigo-500" />
                        Documents
                      </h4>
                      <div className="space-y-2">
                        <DocumentItem 
                          label="Marriage Certificate" 
                          url={employeeData.marriageCertificateDocument} 
                          icon={HiOutlineDocument}
                        />
                        <DocumentItem 
                          label="Child Certificate" 
                          url={employeeData.childCertificateDocument} 
                          icon={HiOutlineDocument}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Created: {employeeData.createdAt ? new Date(employeeData.createdAt).toLocaleString() : 'N/A'}</span>
                    <span>Updated: {employeeData.updatedAt ? new Date(employeeData.updatedAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full mx-4 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Delete Employee</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{employeeData.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {selectedFile.url.split('.').pop()}
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