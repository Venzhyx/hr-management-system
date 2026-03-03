import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePhotograph, 
  HiOutlineDocument, 
  HiOutlineUpload, 
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineX,
  HiOutlineDownload,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineInformationCircle,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineTag,
  HiOutlineCalendar,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlinePlus,
  HiOutlineCog,
  HiOutlineHeart,
  HiOutlineGlobe,
  HiOutlineAcademicCap,
  HiOutlineFolder,
  HiOutlineIdentification,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineShieldCheck,
  HiOutlineBookOpen
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

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Resigned", value: "RESIGNED" },
  { label: "Terminated", value: "TERMINATED" }
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

const ASSURANCE_TYPE_OPTIONS = [
  { label: "Health Insurance", value: "HEALTH" },
  { label: "Life Insurance", value: "LIFE" },
  { label: "Vehicle Insurance", value: "VEHICLE" },
  { label: "Property Insurance", value: "PROPERTY" }
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

// ✅ FIX: ProfileCard dengan garis bawah untuk nama dan job title
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

// ✅ FIX: WorkInformationCard dengan ukuran lebih besar dan manager otomatis
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

          {/* Job Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Position *</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                <HiOutlineBriefcase className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                name="jobPosition" 
                value={formData.jobPosition} 
                onChange={handleChange} 
                placeholder="e.g., Senior Developer" 
                className="flex-1 px-3 py-3 focus:outline-none text-base" 
                required
              />
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
    fetchEmployees,
    loading: employeeLoading 
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
    companyId: '',
    departmentId: '',
    jobPosition: '',
    joinDate: '',
    workMobile: '',
    managerId: '',
    coachId: '',
    employeeCode: ''
  });

  // ===== PRIVATE INFORMATION SECTIONS =====
  const [privateContact, setPrivateContact] = useState({
    address: '',
    email: '',
    phone: ''
  });

  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, bankName: '', accountNumber: '', accountHolder: '' }
  ]);

  const [assurances, setAssurances] = useState([
    { id: 1, type: '', policyNumber: '', provider: '', expiryDate: '' }
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
    familyCardNumber: '',
    gender: '',
    dateOfBirth: '',
    placeOfBirth: ''
  });

  const [education, setEducation] = useState({
    certificateLevel: '',
    fieldOfStudy: '',
    school: ''
  });

  const [documents, setDocuments] = useState({
    idCard: null,
    familyCard: null,
    drivingLicense: null,
    insurance: null,
    npwpCard: null,
    certificate: null,
    transcript: null
  });

  const [settings, setSettings] = useState({
    employeeType: '',
    relatedUserId: '',
    monthlyCost: 0,
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

  // ✅ Fungsi untuk auto-fill manager berdasarkan department
  const handleManagerAutoFill = (departmentId) => {
    if (!departmentId) {
      setFormData(prev => ({ ...prev, managerId: '' }));
      return;
    }

    // Cari department yang dipilih
    const selectedDept = departments?.find(dept => dept.id === parseInt(departmentId));
    
    if (selectedDept?.managerId) {
      // Jika department sudah punya manager, set managerId
      setFormData(prev => ({ ...prev, managerId: selectedDept.managerId.toString() }));
    } else {
      // Jika tidak ada manager, kosongkan
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

  // Bank Account handlers
  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { 
      id: bankAccounts.length + 1, 
      bankName: '', 
      accountNumber: '', 
      accountHolder: '' 
    }]);
  };

  const removeBankAccount = (id) => {
    if (bankAccounts.length > 1) {
      setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
    }
  };

  const handleBankChange = (id, field, value) => {
    setBankAccounts(bankAccounts.map(acc => 
      acc.id === id ? { ...acc, [field]: value } : acc
    ));
  };

  // Assurance handlers
  const addAssurance = () => {
    setAssurances([...assurances, { 
      id: assurances.length + 1, 
      type: '', 
      policyNumber: '', 
      provider: '',
      expiryDate: ''
    }]);
  };

  const removeAssurance = (id) => {
    if (assurances.length > 1) {
      setAssurances(assurances.filter(ass => ass.id !== id));
    }
  };

  const handleAssuranceChange = (id, field, value) => {
    setAssurances(assurances.map(ass => 
      ass.id === id ? { ...ass, [field]: value } : ass
    ));
  };

  // Document handlers
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
    if (!formData.jobPosition) newErrors.jobPosition = 'Job position is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    
    if (!settings.employeeType) {
      newErrors.employeeType = 'Employee type is required';
    }
    
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
      const [
        photoUrl,
        idCardUrl,
        familyCardUrl,
        drivingLicenseUrl,
        insuranceUrl,
        npwpCardUrl,
        certificateUrl,
        transcriptUrl
      ] = await Promise.all([
        photo ? uploadFile(photo) : Promise.resolve(null),
        documents.idCard ? uploadFile(documents.idCard.file) : Promise.resolve(null),
        documents.familyCard ? uploadFile(documents.familyCard.file) : Promise.resolve(null),
        documents.drivingLicense ? uploadFile(documents.drivingLicense.file) : Promise.resolve(null),
        documents.insurance ? uploadFile(documents.insurance.file) : Promise.resolve(null),
        documents.npwpCard ? uploadFile(documents.npwpCard.file) : Promise.resolve(null),
        documents.certificate ? uploadFile(documents.certificate.file) : Promise.resolve(null),
        documents.transcript ? uploadFile(documents.transcript.file) : Promise.resolve(null)
      ]);

      const payload = {
        name: formData.name,
        jobTitle: formData.jobTitle,
        companyId: parseInt(formData.companyId),
        departmentId: parseInt(formData.departmentId),
        managerId: formData.managerId ? parseInt(formData.managerId) : null,
        coachId: formData.coachId ? parseInt(formData.coachId) : null,
        workEmail: formData.workEmail,
        workPhone: formData.workPhone,
        workMobile: formData.workMobile || null,
        jobPosition: formData.jobPosition,
        joinDate: formData.joinDate,
        photoUrl,
        privateAddress: privateContact.address || null,
        privateEmail: privateContact.email || null,
        privatePhone: privateContact.phone || null,
        bankAccounts: bankAccounts.map(acc => ({
          bankName: acc.bankName,
          accountNumber: acc.accountNumber,
          accountHolder: acc.accountHolder
        })).filter(acc => acc.bankName && acc.accountNumber && acc.accountHolder),
        assurances: assurances.map(ass => ({
          type: ass.type,
          policyNumber: ass.policyNumber,
          provider: ass.provider,
          expiryDate: ass.expiryDate || null
        })).filter(ass => ass.type && ass.policyNumber && ass.provider),
        npwpNumber: taxInfo.npwp || null,
        homeToWorkDistance: taxInfo.workDistance ? Number(taxInfo.workDistance) : null,
        emergencyContactName: emergencyContact.name || null,
        emergencyContactPhone: emergencyContact.phone || null,
        maritalStatus: familyInfo.maritalStatus || null,
        numberOfDependentChildren: familyInfo.numberOfChildren ? parseInt(familyInfo.numberOfChildren) : 0,
        nationality: citizenship.nationality || null,
        countryOfBirth: citizenship.countryOfBirth || null,
        idNumber: citizenship.idNumber || null,
        passportNumber: citizenship.passportNumber || null,
        familyCardNumber: citizenship.familyCardNumber || null,
        gender: citizenship.gender || null,
        dateOfBirth: citizenship.dateOfBirth || null,
        placeOfBirth: citizenship.placeOfBirth || null,
        certificateLevel: education.certificateLevel || null,
        fieldOfStudy: education.fieldOfStudy || null,
        school: education.school || null,
        idCardDocument: idCardUrl,
        familyCardDocument: familyCardUrl,
        drivingLicenseDocument: drivingLicenseUrl,
        insuranceDocument: insuranceUrl,
        npwpCardDocument: npwpCardUrl,
        certificateDocument: certificateUrl,
        transcriptDocument: transcriptUrl,
        employeeType: settings.employeeType,
        relatedUserId: settings.relatedUserId ? parseInt(settings.relatedUserId) : null,
        monthlyCost: settings.monthlyCost ? parseFloat(settings.monthlyCost) : null,
        attendanceBadgeId: settings.attendanceBadgeId || null,
        enableNotifications: settings.enableNotifications,
        allowRemoteAccess: settings.allowRemoteAccess,
        overtimeEligible: settings.overtimeEligible
      };

      console.log('Submitting employee:', payload);
      
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

                {/* Bank Accounts */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-md font-medium text-gray-700">Bank Accounts</label>
                    <button 
                      type="button"
                      onClick={addBankAccount} 
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      <span>Add Bank</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                        {bankAccounts.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeBankAccount(account.id)} 
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Bank Name</label>
                            <select 
                              value={account.bankName} 
                              onChange={(e) => handleBankChange(account.id, 'bankName', e.target.value)} 
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
                              value={account.accountNumber} 
                              onChange={(e) => handleBankChange(account.id, 'accountNumber', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                              placeholder="Account Number"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Account Holder</label>
                            <input 
                              type="text" 
                              value={account.accountHolder} 
                              onChange={(e) => handleBankChange(account.id, 'accountHolder', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                              placeholder="Name on Account"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assurance */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-md font-medium text-gray-700">Assurance</label>
                    <button 
                      type="button"
                      onClick={addAssurance} 
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      <span>Add Assurance</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {assurances.map((assurance) => (
                      <div key={assurance.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                        {assurances.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeAssurance(assurance.id)} 
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Type</label>
                            <select 
                              value={assurance.type} 
                              onChange={(e) => handleAssuranceChange(assurance.id, 'type', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                              <option value="">Select Type</option>
                              {ASSURANCE_TYPE_OPTIONS.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Policy Number</label>
                            <input 
                              type="text" 
                              value={assurance.policyNumber} 
                              onChange={(e) => handleAssuranceChange(assurance.id, 'policyNumber', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                              placeholder="Policy Number"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Provider</label>
                            <input 
                              type="text" 
                              value={assurance.provider} 
                              onChange={(e) => handleAssuranceChange(assurance.id, 'provider', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                              placeholder="Insurance Provider"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Expiry Date</label>
                            <input 
                              type="date" 
                              value={assurance.expiryDate} 
                              onChange={(e) => handleAssuranceChange(assurance.id, 'expiryDate', e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Family Card No</label>
                    <input 
                      type="text" 
                      name="familyCardNumber" 
                      value={citizenship.familyCardNumber} 
                      onChange={handleCitizenshipChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="Family Card Number"
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
                  { key: 'idCard', label: 'ID Card / KTP' },
                  { key: 'familyCard', label: 'Family Card' },
                  { key: 'drivingLicense', label: 'Driving License' },
                  { key: 'insurance', label: 'Insurance' },
                  { key: 'npwpCard', label: 'NPWP Card' },
                  { key: 'certificate', label: 'Certificate / Ijazah' },
                  { key: 'transcript', label: 'Academic Transcript' },
                ].map((doc) => (
                  <div key={doc.key} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-gray-700">{doc.label}</span>
                      {documents[doc.key] ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">
                            {documents[doc.key].fileName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc.key)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                          <HiOutlineUpload className="w-5 h-5 inline mr-1" />
                          Upload
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleDocumentUpload(doc.key, e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
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

              {/* Application Settings */}
              <div className="bg-gray-50 p-5 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Application Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      name="enableNotifications" 
                      checked={settings.enableNotifications} 
                      onChange={handleSettingsChange} 
                      className="w-4 h-4 rounded text-indigo-600" 
                    />
                    <span className="text-sm text-gray-700">Enable notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      name="allowRemoteAccess" 
                      checked={settings.allowRemoteAccess} 
                      onChange={handleSettingsChange} 
                      className="w-4 h-4 rounded text-indigo-600" 
                    />
                    <span className="text-sm text-gray-700">Allow remote access</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      name="overtimeEligible" 
                      checked={settings.overtimeEligible} 
                      onChange={handleSettingsChange} 
                      className="w-4 h-4 rounded text-indigo-600" 
                    />
                    <span className="text-sm text-gray-700">Overtime eligible</span>
                  </label>
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