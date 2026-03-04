import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePhotograph, 
  HiOutlineUpload, 
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlinePlus,
  HiOutlineCog,
  HiOutlineGlobe,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineDocument,
  HiOutlineDocumentText,
  HiOutlineIdentification,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import { useEmployee } from '../../../redux/hooks/useEmployee';
import { useDepartment } from '../../../redux/hooks/useDepartment';
import { useCompany } from '../../../redux/hooks/useCompany';
import API from "../../../api/api";

// ==================== CONSTANTS ====================
const EMPLOYEE_TYPE_OPTIONS = [
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" }
];

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" }
];

const MARITAL_OPTIONS = [
  { label: "Single", value: "SINGLE" },
  { label: "Married", value: "MARRIED" },
  { label: "Divorced", value: "DIVORCED" },
  { label: "Widowed", value: "WIDOWED" }
];

const CERTIFICATE_OPTIONS = [
  { label: "High School", value: "HIGH_SCHOOL" },
  { label: "Diploma", value: "DIPLOMA" },
  { label: "Bachelor", value: "BACHELOR" },
  { label: "Master", value: "MASTER" },
  { label: "Doctorate", value: "DOCTORATE" }
];

const BANK_OPTIONS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Danamon', 'Permata'];
const NATIONALITY_OPTIONS = ['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Vietnam', 'Philippines', 'India', 'China', 'Japan', 'Korea', 'USA', 'UK', 'Australia'];

// ==================== SUB COMPONENTS ====================
const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border-l-4 animate-slideIn ${
        toast.type === 'success' 
          ? 'bg-green-50 border-green-500' 
          : 'bg-red-50 border-red-500'
      }`}
      style={{ minWidth: '320px' }}
    >
      <div className={`mr-3 flex-shrink-0 ${toast.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
        {toast.type === 'success' ? (
          <HiOutlineCheckCircle className="w-6 h-6" />
        ) : (
          <HiOutlineXCircle className="w-6 h-6" />
        )}
      </div>
      <div className="flex-1 mr-2">
        <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
          {toast.message}
        </p>
      </div>
      <button onClick={onClose} className={`flex-shrink-0 ${toast.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}>
        <HiOutlineX className="w-5 h-5" />
      </button>
    </div>
  );
};

// ProfileCard dengan garis bawah untuk nama dan job title
const ProfileCard = ({ formData, handleChange, photoPreview, handlePhotoChange }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
    <div className="p-8">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="border-b-2 border-indigo-200 pb-2 mb-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Employee's Name *"
              className="text-3xl font-bold text-gray-800 w-full px-2 py-1 bg-transparent focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
          <div className="border-b border-gray-200 pb-1">
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Job Title *"
              className="text-base text-gray-600 w-full px-2 py-1 bg-transparent focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                  <HiOutlinePhotograph className="w-10 h-10 text-indigo-300" />
                </div>
              )}
            </div>
            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 shadow-lg transition-all">
              <HiOutlineUpload className="w-4 h-4" />
            </label>
            <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// WorkInformationCard dengan ukuran lebih besar dan manager otomatis
const WorkInformationCard = ({ 
  formData, 
  handleChange, 
  companies, 
  departments, 
  employees,
  activeEmployees,
  companyLoading,
  departmentLoading,
  onManagerAutoFill
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
    <div className="p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Work Information</h2>
      {companyLoading || departmentLoading ? (
        <div className="text-center py-12 text-gray-400">Loading reference data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Work Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Email *</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                <HiOutlineMail className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                name="workEmail" 
                value={formData.workEmail} 
                onChange={handleChange} 
                placeholder="e.g., john@company.com" 
                className="flex-1 px-3 py-3 focus:outline-none text-base" 
                required
              />
            </div>
          </div>

          {/* Work Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Phone *</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                <HiOutlinePhone className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="tel" 
                name="workPhone" 
                value={formData.workPhone} 
                onChange={handleChange} 
                placeholder="e.g., 021-1234567" 
                className="flex-1 px-3 py-3 focus:outline-none text-base" 
                required
              />
            </div>
          </div>

          {/* Work Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Mobile</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                <HiOutlinePhone className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="tel" 
                name="workMobile" 
                value={formData.workMobile} 
                onChange={handleChange} 
                placeholder="e.g., 08123456789" 
                className="flex-1 px-3 py-3 focus:outline-none text-base" 
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                <HiOutlineOfficeBuilding className="w-5 h-5 text-gray-400" />
              </div>
              <select 
                name="companyId" 
                value={formData.companyId} 
                onChange={handleChange} 
                className="flex-1 px-3 py-3 bg-transparent focus:outline-none text-base"
                required
              >
                <option value="">Select Company</option>
                {companies?.map(company => (
                  <option key={company.id} value={company.id}>{company.companyName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                <HiOutlineOfficeBuilding className="w-5 h-5 text-gray-400" />
              </div>
              <select 
                name="departmentId" 
                value={formData.departmentId} 
                onChange={(e) => {
                  handleChange(e);
                  onManagerAutoFill(e.target.value);
                }} 
                className="flex-1 px-3 py-3 bg-transparent focus:outline-none text-base"
                required
              >
                <option value="">Select Department</option>
                {departments?.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                <HiOutlineUser className="w-5 h-5 text-gray-400" />
              </div>
              <select 
                name="managerId" 
                value={formData.managerId} 
                onChange={handleChange} 
                className="flex-1 px-3 py-3 bg-transparent focus:outline-none text-base"
              >
                <option value="">Select Manager</option>
                {activeEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Coach */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coach</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                <HiOutlineUserGroup className="w-5 h-5 text-gray-400" />
              </div>
              <select 
                name="coachId" 
                value={formData.coachId} 
                onChange={handleChange} 
                className="flex-1 px-3 py-3 bg-transparent focus:outline-none text-base"
              >
                <option value="">Select Coach</option>
                {activeEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Join Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Join Date *</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="date" 
                name="joinDate" 
                value={formData.joinDate} 
                onChange={handleChange} 
                className="flex-1 px-3 py-3 focus:outline-none text-base" 
                required
              />
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const AddEmployee = () => {
  const navigate = useNavigate();
  
  const { 
    createEmployee, 
    employees,
    fetchEmployees
  } = useEmployee();
  
  const { departments, fetchDepartments, loading: departmentLoading } = useDepartment();
  const { companies, fetchCompanies, loading: companyLoading } = useCompany();
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('private');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== FETCH REFERENCE DATA =====
  useEffect(() => {
    fetchCompanies();
    fetchDepartments();
    fetchEmployees();
  }, []);

  // ===== FORM DATA =====
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    workEmail: '',
    workPhone: '',
    workMobile: '',
    companyId: '',
    departmentId: '',
    joinDate: '',
    managerId: '',
    coachId: ''
  });

  // ===== PRIVATE INFORMATION SECTIONS =====
  const [privateContact, setPrivateContact] = useState({
    address: '',
    email: '',
    phone: ''
  });

  // 🔥 BANK MULTIPLE - ARRAY
  const [banks, setBanks] = useState([
    { bankName: '', accountNumber: '' }
  ]);

  // 🔥 ASSURANCE MULTIPLE - ARRAY
  const [assurances, setAssurances] = useState([
    { assurance: '', assuranceId: '' }
  ]);

  const [taxInfo, setTaxInfo] = useState({
    npwp: '',
    workDistance: 0
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: ''
  });

  const [familyInfo, setFamilyInfo] = useState({
    maritalStatus: '',
    numberOfChildren: 0
  });

  const [citizenship, setCitizenship] = useState({
    nationality: '',
    countryOfBirth: '',
    idNumber: '',
    passportNumber: '',
    gender: '',
    dateOfBirth: '',
    placeOfBirth: ''
  });

  const [education, setEducation] = useState({
    certificateLevel: '',
    fieldOfStudy: '',
    school: ''
  });

  // ===== DOCUMENTS STATE =====
  const [documents, setDocuments] = useState({
    idCard: null,
    familyCard: null,
    drivingLicense: null,
    insurance: null,
    npwpCard: null,
    certificate: null
  });

  const [settings, setSettings] = useState({
    employeeType: '',
    relatedUserId: '',
    monthlyCost: '',
    attendanceBadgeId: '',
    enableNotifications: true,
    allowRemoteAccess: false,
    overtimeEligible: true
  });

  // ===== UI STATES =====
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // ===== HELPER =====
  const activeEmployees = employees?.filter(emp => emp.status === 'ACTIVE') || [];

  // Fungsi untuk auto-fill manager berdasarkan department
  const handleManagerAutoFill = (departmentId) => {
    if (!departmentId) {
      setFormData(prev => ({ ...prev, managerId: '' }));
      return;
    }

    const selectedDept = departments?.find(dept => dept.id === parseInt(departmentId, 10));
    
    if (selectedDept?.managerId) {
      setFormData(prev => ({ ...prev, managerId: selectedDept.managerId.toString() }));
    } else {
      setFormData(prev => ({ ...prev, managerId: '' }));
    }
  };

  // ===== HANDLERS =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePrivateContactChange = (e) => {
    const { name, value } = e.target;
    setPrivateContact(prev => ({ ...prev, [name]: value }));
  };

  // 🔥 BANK HANDLERS - MULTIPLE
  const addBank = () => {
    setBanks(prev => [...prev, { bankName: '', accountNumber: '' }]);
  };

  const removeBank = (index) => {
    if (banks.length > 1) {
      setBanks(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleBankChange = (index, field, value) => {
    setBanks(prev => {
      const newBanks = [...prev];
      newBanks[index][field] = value;
      return newBanks;
    });
  };

  // 🔥 ASSURANCE HANDLERS - MULTIPLE
  const addAssurance = () => {
    setAssurances(prev => [...prev, { assurance: '', assuranceId: '' }]);
  };

  const removeAssurance = (index) => {
    if (assurances.length > 1) {
      setAssurances(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAssuranceChange = (index, field, value) => {
    setAssurances(prev => {
      const newAssurances = [...prev];
      newAssurances[index][field] = value;
      return newAssurances;
    });
  };

  const handleCitizenshipChange = (e) => {
    const { name, value } = e.target;
    setCitizenship(prev => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducation(prev => ({ ...prev, [name]: value }));
  };

  const handleFamilyChange = (e) => {
    const { name, value } = e.target;
    setFamilyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setEmergencyContact(prev => ({ ...prev, [name]: value }));
  };

  const handleTaxChange = (e) => {
    const { name, value } = e.target;
    setTaxInfo(prev => ({ ...prev, [name]: value }));
  };

  // ===== DOCUMENT HANDLERS =====
  const handleDocumentUpload = (type, file) => {
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [type]: {
          file,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file)
        }
      }));
    }
  };

  const handleRemoveDocument = (type) => {
    setDocuments(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
    
    if (name === 'employeeType' && errors.employeeType) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.employeeType;
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // ===== VALIDATION =====
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
    if (!formData.workEmail) {
      newErrors.workEmail = 'Work email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.workEmail)) {
      newErrors.workEmail = 'Email is invalid';
    }
    if (!formData.workPhone) newErrors.workPhone = 'Work phone is required';
    if (!formData.companyId) newErrors.companyId = 'Company is required';
    if (!formData.departmentId) newErrors.departmentId = 'Department is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    if (!settings.employeeType) newErrors.employeeType = 'Employee type is required';
    
    return newErrors;
  };

  // ===== FILE UPLOAD =====
  const uploadFile = async (file) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data.data?.fileUrl || response.data.data;
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    }
  };

  // ===== SUBMIT HANDLER =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setToast({
        show: true,
        message: 'Please fill in all required fields',
        type: 'error'
      });
      
      const firstErrorField = Object.keys(validationErrors)[0];
      
      if (firstErrorField === 'employeeType') {
        setActiveMainTab('settings');
        setTimeout(() => {
          document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
      } else {
        document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photo
      const photoUrl = photo ? await uploadFile(photo) : null;

      // Upload dokumen-dokumen (opsional)
      const idCardUrl = documents.idCard ? await uploadFile(documents.idCard.file) : null;
      const familyCardUrl = documents.familyCard ? await uploadFile(documents.familyCard.file) : null;
      const drivingLicenseUrl = documents.drivingLicense ? await uploadFile(documents.drivingLicense.file) : null;
      const insuranceUrl = documents.insurance ? await uploadFile(documents.insurance.file) : null;
      const npwpCardUrl = documents.npwpCard ? await uploadFile(documents.npwpCard.file) : null;
      const certificateUrl = documents.certificate ? await uploadFile(documents.certificate.file) : null;

      // ✅ PAYLOAD SESUAI DTO BACKEND (ambil data pertama untuk sementara)
      const payload = {
        // BASIC
        name: formData.name,
        jobTitle: formData.jobTitle,
        workMobile: formData.workMobile || null,
        workPhone: formData.workPhone,
        workEmail: formData.workEmail,
        joinDate: formData.joinDate || null,
        photo: photoUrl || null,

        companyId: parseInt(formData.companyId, 10),
        departmentId: parseInt(formData.departmentId, 10),
        managerId: formData.managerId ? parseInt(formData.managerId, 10) : null,
        coachId: formData.coachId ? parseInt(formData.coachId, 10) : null,

        // PRIVATE
        privateAddress: privateContact.address || null,
        privateEmail: privateContact.email || null,
        privatePhone: privateContact.phone || null,
        
        // 🔥 BANK - ambil dari array pertama
        bankName: banks[0]?.bankName || null,
        accountNumber: banks[0]?.accountNumber || null,
        
        // 🔥 ASSURANCE - ambil dari array pertama
        assurance: assurances[0]?.assurance || null,
        assuranceId: assurances[0]?.assuranceId || null,
        
        npwpId: taxInfo.npwp || null,
        homeToWorkDistance: taxInfo.workDistance ? Number(taxInfo.workDistance) : null,

        // CITIZENSHIP
        nationality: citizenship.nationality || null,
        identificationNumber: citizenship.idNumber || null,
        passportNumber: citizenship.passportNumber || null,
        gender: citizenship.gender || null,
        dateOfBirth: citizenship.dateOfBirth || null,
        placeOfBirth: citizenship.placeOfBirth || null,
        countryOfBirth: citizenship.countryOfBirth || null,

        // EMERGENCY
        emergencyContactName: emergencyContact.name || null,
        emergencyContactPhone: emergencyContact.phone || null,

        // EDUCATION
        certificateLevel: education.certificateLevel || null,
        fieldOfStudy: education.fieldOfStudy || null,
        school: education.school || null,

        // FAMILY
        maritalStatus: familyInfo.maritalStatus || null,
        numberOfDependentChildren: familyInfo.numberOfChildren ? parseInt(familyInfo.numberOfChildren, 10) : null,

        // SETTINGS
        status: "ACTIVE",
        employeeType: settings.employeeType,
        relatedUser: settings.relatedUserId ? settings.relatedUserId.toString() : null,
        monthlyCost: settings.monthlyCost !== '' ? parseFloat(settings.monthlyCost) : null,
        attendanceBadgeId: settings.attendanceBadgeId || null,

        // DOCUMENTS
        idCardCopy: idCardUrl,
        familyCardCopy: familyCardUrl,
        drivingLicenseCopy: drivingLicenseUrl,
        assuranceCardCopy: insuranceUrl,
        npwpCardCopy: npwpCardUrl,
      };

      console.log('Submitting payload:', payload);
      await createEmployee(payload);
      
      setToast({
        show: true,
        message: `Employee ${formData.name} has been successfully created`,
        type: 'success'
      });
      
      setTimeout(() => {
        navigate('/employees');
      }, 1500);

    } catch (error) {
      console.error('Create employee failed:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || error.message || 'Failed to create employee',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-4 md:px-6 py-6 bg-gray-50 min-h-screen">
      <Toast toast={toast} onClose={closeToast} />

      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button 
          type="button"
          onClick={() => navigate('/employees')} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-white shadow-sm"
          disabled={isSubmitting}
        >
          <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Employee</h1>
      </div>

      {/* Cards */}
      <ProfileCard 
        formData={formData}
        handleChange={handleChange}
        photoPreview={photoPreview}
        handlePhotoChange={handlePhotoChange}
      />

      <WorkInformationCard 
        formData={formData}
        handleChange={handleChange}
        companies={companies}
        departments={departments}
        employees={employees}
        activeEmployees={activeEmployees}
        companyLoading={companyLoading}
        departmentLoading={departmentLoading}
        onManagerAutoFill={handleManagerAutoFill}
      />

      {/* Additional Information Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <div className="flex space-x-6">
            <button
              type="button"
              onClick={() => setActiveMainTab('private')}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeMainTab === 'private'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Private Information
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab('documents')}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeMainTab === 'documents'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab('settings')}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeMainTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* PRIVATE INFORMATION TAB */}
          {activeMainTab === 'private' && (
            <div className="space-y-8">
              {/* 2.1 Private Contact */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlineHome className="w-5 h-5 mr-2 text-indigo-500" />
                  2.1 Private Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Private Address</label>
                    <textarea 
                      name="address" 
                      value={privateContact.address} 
                      onChange={handlePrivateContactChange} 
                      rows="3" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="Street, City, Province, Postal Code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Private Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={privateContact.email} 
                      onChange={handlePrivateContactChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="personal@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Private Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={privateContact.phone} 
                      onChange={handlePrivateContactChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="+62 XXX XXXX"
                    />
                  </div>
                </div>

                {/* 🔥 BANK ACCOUNTS - MULTIPLE */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-md font-medium text-gray-700">Bank Accounts</label>
                    <button 
                      type="button"
                      onClick={addBank} 
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      <span>Add Bank</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {banks.map((bank, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                        {banks.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeBank(index)} 
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Bank Name</label>
                            <select 
                              value={bank.bankName} 
                              onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                              <option value="">Select Bank</option>
                              {BANK_OPTIONS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                            <input 
                              type="text" 
                              value={bank.accountNumber} 
                              onChange={(e) => handleBankChange(index, 'accountNumber', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                              placeholder="Account Number"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 🔥 ASSURANCE - MULTIPLE */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-md font-medium text-gray-700">Assurance / Insurance</label>
                    <button 
                      type="button"
                      onClick={addAssurance} 
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      <span>Add Insurance</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {assurances.map((assurance, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                        {assurances.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeAssurance(index)} 
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Insurance Name</label>
                            <input 
                              type="text" 
                              value={assurance.assurance} 
                              onChange={(e) => handleAssuranceChange(index, 'assurance', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                              placeholder="e.g., BPJS Kesehatan"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Policy / ID Number</label>
                            <input 
                              type="text" 
                              value={assurance.assuranceId} 
                              onChange={(e) => handleAssuranceChange(index, 'assuranceId', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                              placeholder="Policy Number"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NPWP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NPWP ID</label>
                    <input 
                      type="text" 
                      name="npwp" 
                      value={taxInfo.npwp} 
                      onChange={handleTaxChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="XX.XXX.XXX.X-XXX.XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home-Work Distance (KM)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        name="workDistance" 
                        value={taxInfo.workDistance} 
                        onChange={handleTaxChange} 
                        min="0" 
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12" 
                        placeholder="0.0"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">KM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2.2 Emergency */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlinePhone className="w-5 h-5 mr-2 text-red-500" />
                  2.2 Emergency
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={emergencyContact.name} 
                      onChange={handleEmergencyChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="Emergency Contact Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={emergencyContact.phone} 
                      onChange={handleEmergencyChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="Emergency Contact Phone"
                    />
                  </div>
                </div>
              </div>

              {/* 2.3 Family Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlineUsers className="w-5 h-5 mr-2 text-green-500" />
                  2.3 Family Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <select 
                      name="maritalStatus" 
                      value={familyInfo.maritalStatus} 
                      onChange={handleFamilyChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Status</option>
                      {MARITAL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Dependent Children</label>
                    <input 
                      type="number" 
                      name="numberOfChildren" 
                      value={familyInfo.numberOfChildren} 
                      onChange={handleFamilyChange} 
                      min="0" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* 2.4 Citizenship */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlineGlobe className="w-5 h-5 mr-2 text-blue-500" />
                  2.4 Citizenship
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Citizenship</label>
                    <select 
                      name="nationality" 
                      value={citizenship.nationality} 
                      onChange={handleCitizenshipChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Citizenship</option>
                      {NATIONALITY_OPTIONS.map(nat => <option key={nat} value={nat}>{nat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality (Country)</label>
                    <input 
                      type="text" 
                      name="countryOfBirth" 
                      value={citizenship.countryOfBirth} 
                      onChange={handleCitizenshipChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Identification No</label>
                    <input 
                      type="text" 
                      name="idNumber" 
                      value={citizenship.idNumber} 
                      onChange={handleCitizenshipChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="KTP / ID Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport No</label>
                    <input 
                      type="text" 
                      name="passportNumber" 
                      value={citizenship.passportNumber} 
                      onChange={handleCitizenshipChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="Passport Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select 
                      name="gender" 
                      value={citizenship.gender} 
                      onChange={handleCitizenshipChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input 
                      type="date" 
                      name="dateOfBirth" 
                      value={citizenship.dateOfBirth} 
                      onChange={handleCitizenshipChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth</label>
                    <input 
                      type="text" 
                      name="placeOfBirth" 
                      value={citizenship.placeOfBirth} 
                      onChange={handleCitizenshipChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="City of Birth"
                    />
                  </div>
                </div>
              </div>

              {/* 2.5 Education */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlineAcademicCap className="w-5 h-5 mr-2 text-purple-500" />
                  2.5 Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Level</label>
                    <select 
                      name="certificateLevel" 
                      value={education.certificateLevel} 
                      onChange={handleEducationChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Level</option>
                      {CERTIFICATE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                    <input 
                      type="text" 
                      name="fieldOfStudy" 
                      value={education.fieldOfStudy} 
                      onChange={handleEducationChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School / University</label>
                    <input 
                      type="text" 
                      name="school" 
                      value={education.school} 
                      onChange={handleEducationChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="Institution Name"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeMainTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'idCard', label: 'ID Card / KTP', icon: HiOutlineIdentification },
                  { key: 'familyCard', label: 'Family Card', icon: HiOutlineUsers },
                  { key: 'drivingLicense', label: 'Driving License', icon: HiOutlineDocument },
                  { key: 'insurance', label: 'Insurance', icon: HiOutlineShieldCheck },
                  { key: 'npwpCard', label: 'NPWP Card', icon: HiOutlineDocument },
                ].map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <div key={doc.key} className="border border-gray-200 rounded-lg p-5 hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-indigo-500" />
                          <span className="text-base font-medium text-gray-700">{doc.label}</span>
                        </div>
                        {documents[doc.key] ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 truncate max-w-[150px]">
                              {documents[doc.key].fileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc.key)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1">
                            <HiOutlineUpload className="w-4 h-4" />
                            <span>Upload</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(doc.key, e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeMainTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Employee Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Type */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Type *
                    {errors.employeeType && (
                      <span className="text-red-500 text-xs ml-2">{errors.employeeType}</span>
                    )}
                  </label>
                  <select 
                    name="employeeType" 
                    value={settings.employeeType} 
                    onChange={handleSettingsChange} 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.employeeType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Type</option>
                    {EMPLOYEE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Related User */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Related User</label>
                  <select 
                    name="relatedUserId" 
                    value={settings.relatedUserId} 
                    onChange={handleSettingsChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Related User</option>
                    {activeEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                {/* Monthly Cost */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Cost</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                    <input 
                      type="number" 
                      name="monthlyCost" 
                      value={settings.monthlyCost} 
                      onChange={handleSettingsChange} 
                      min="0" 
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                </div>

                {/* Badge ID */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Badge ID</label>
                  <input 
                    type="text" 
                    name="attendanceBadgeId" 
                    value={settings.attendanceBadgeId} 
                    onChange={handleSettingsChange} 
                    placeholder="e.g., RFID-12345" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>

              
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-base"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : 'Create Employee'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddEmployee;