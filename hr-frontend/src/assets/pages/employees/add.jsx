import React, { useState, useEffect, useCallback } from 'react';
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
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlinePlus,
  HiOutlineGlobe,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineDocument,
  HiOutlineIdentification,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import { useEmployee } from '../../../redux/hooks/useEmployee';
import { useDepartment } from '../../../redux/hooks/useDepartment';
import { useCompany } from '../../../redux/hooks/useCompany';
import API from "../../../api/api";

// ==================== CONSTANTS ====================
const EMPLOYEE_TYPE_OPTIONS = [
  { label: "Full Time",  value: "FULL_TIME"  },
  { label: "Part Time",  value: "PART_TIME"  },
  { label: "Contract",   value: "CONTRACT"   }
];
const GENDER_OPTIONS = [
  { label: "Male",   value: "MALE"   },
  { label: "Female", value: "FEMALE" }
];
const MARITAL_OPTIONS = [
  { label: "Single",   value: "SINGLE"   },
  { label: "Married",  value: "MARRIED"  },
  { label: "Divorced", value: "DIVORCED" },
  { label: "Widowed",  value: "WIDOWED"  }
];
const CERTIFICATE_OPTIONS = [
  { label: "High School", value: "HIGH_SCHOOL" },
  { label: "Diploma",     value: "DIPLOMA"     },
  { label: "Bachelor",    value: "BACHELOR"    },
  { label: "Master",      value: "MASTER"      },
  { label: "Doctorate",   value: "DOCTORATE"   }
];
const BANK_OPTIONS = [
  { id: 1, name: "BCA"        },
  { id: 2, name: "Mandiri"    },
  { id: 3, name: "BNI"        },
  { id: 4, name: "BRI"        },
  { id: 5, name: "CIMB Niaga" },
  { id: 6, name: "Danamon"    },
  { id: 7, name: "Permata"    }
];
const NATIONALITY_OPTIONS = [
  'Indonesia','Malaysia','Singapore','Thailand','Vietnam',
  'Philippines','India','China','Japan','Korea','USA','UK','Australia'
];
const INSURANCE_TYPE_OPTIONS = [
  { label: "Health Insurance",   value: "HEALTH"   },
  { label: "Life Insurance",     value: "LIFE"     },
  { label: "Vehicle Insurance",  value: "VEHICLE"  },
  { label: "Property Insurance", value: "PROPERTY" },
  { label: "Travel Insurance",   value: "TRAVEL"   },
  { label: "Other",              value: "OTHER"    }
];

// ==================== HELPERS ====================
// Input restriction
const onlyNumber = (v) => v.replace(/[^0-9]/g, "");
const onlyText   = (v) => v.replace(/[^a-zA-Z\s]/g, "");

// Fix #2: paste guard – number fields
const pasteNumberOnly = (e) => {
  const paste = e.clipboardData.getData("text");
  if (!/^\d+$/.test(paste)) e.preventDefault();
};
// Fix #3: paste guard – text fields
const pasteTextOnly = (e) => {
  const paste = e.clipboardData.getData("text");
  if (!/^[a-zA-Z\s]+$/.test(paste)) e.preventDefault();
};

// Required field labels (used for error messages)
const FIELD_LABELS = {
  name: "Name", jobTitle: "Job Title", workEmail: "Work Email",
  workPhone: "Work Phone", companyId: "Company", departmentId: "Department",
  joinDate: "Join Date", employeeType: "Employee Type"
};
const REQUIRED_FIELDS = Object.keys(FIELD_LABELS);

// ==================== UI HELPERS ====================
const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;
  const ok = toast.type === 'success';
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border-l-4 ${
      ok ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
    }`} style={{ minWidth: 320 }}>
      <div className={`mr-3 flex-shrink-0 ${ok ? 'text-green-500' : 'text-red-500'}`}>
        {ok ? <HiOutlineCheckCircle className="w-6 h-6" /> : <HiOutlineXCircle className="w-6 h-6" />}
      </div>
      <p className={`flex-1 mr-2 text-sm font-medium ${ok ? 'text-green-800' : 'text-red-800'}`}>{toast.message}</p>
      <button onClick={onClose} className={ok ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}>
        <HiOutlineX className="w-5 h-5" />
      </button>
    </div>
  );
};

const RequiredLabel = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {children} <span className="text-red-500">*</span>
  </label>
);

const ErrorMsg = ({ error }) =>
  error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null;

// Dynamic class helpers
const wrapperCls = (err) =>
  `flex items-center border rounded-lg focus-within:ring-2 overflow-hidden ${
    err ? 'border-red-500 focus-within:ring-red-400'
        : 'border-gray-300 focus-within:ring-indigo-500 focus-within:border-transparent'
  }`;
const innerCls = (err, extra = "") =>
  `flex-1 px-3 py-3 focus:outline-none text-base ${extra} ${err ? 'bg-red-50' : ''}`;
const standaloneCls = (err) =>
  `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
    err ? 'border-red-500 focus:ring-red-400 bg-red-50'
        : 'border-gray-300 focus:ring-indigo-500'
  }`;

// ==================== PROFILE CARD ====================
const ProfileCard = ({ formData, handleChange, photoPreview, handlePhotoChange, errors }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
    <div className="p-8">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className={`border-b-2 pb-2 mb-4 ${errors.name ? 'border-red-400' : 'border-indigo-200'}`}>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              onPaste={pasteTextOnly} placeholder="Employee's Name *" autoComplete="name"
              className={`text-3xl font-bold text-gray-800 w-full px-2 py-1 bg-transparent focus:outline-none transition-colors ${errors.name ? 'placeholder-red-300' : ''}`}
            />
            <ErrorMsg error={errors.name} />
          </div>
          <div className={`border-b pb-1 ${errors.jobTitle ? 'border-red-400' : 'border-gray-200'}`}>
            <input
              type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
              onPaste={pasteTextOnly} placeholder="Job Title *"
              className={`text-base text-gray-600 w-full px-2 py-1 bg-transparent focus:outline-none transition-colors ${errors.jobTitle ? 'placeholder-red-300' : ''}`}
            />
            <ErrorMsg error={errors.jobTitle} />
          </div>
        </div>

        <div className="flex-shrink-0 ml-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md">
              {photoPreview
                ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                    <HiOutlinePhotograph className="w-10 h-10 text-indigo-300" />
                  </div>
              }
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

// ==================== WORK INFORMATION CARD ====================
const WorkInformationCard = ({
  formData, handleChange, companies, departments,
  activeEmployees, companyLoading, departmentLoading,
  onManagerAutoFill, errors
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
    <div className="p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Work Information</h2>
      {companyLoading || departmentLoading ? (
        <div className="text-center py-12 text-gray-400">Loading reference data…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Work Email */}
          <div>
            <RequiredLabel>Work Email</RequiredLabel>
            <div className={wrapperCls(!!errors.workEmail)}>
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300"><HiOutlineMail className="w-5 h-5 text-gray-400" /></div>
              {/* Fix #9: autoComplete */}
              <input type="email" name="workEmail" value={formData.workEmail} onChange={handleChange}
                placeholder="e.g., john@company.com" autoComplete="email" className={innerCls(!!errors.workEmail)} />
            </div>
            <ErrorMsg error={errors.workEmail} />
          </div>

          {/* Work Phone */}
          <div>
            <RequiredLabel>Work Phone</RequiredLabel>
            <div className={wrapperCls(!!errors.workPhone)}>
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300"><HiOutlinePhone className="w-5 h-5 text-gray-400" /></div>
              {/* Fix #7: inputMode + pattern; Fix #2: onPaste; Fix #9: autoComplete */}
              <input type="tel" inputMode="numeric" pattern="[0-9]*" name="workPhone"
                value={formData.workPhone} onChange={handleChange} onPaste={pasteNumberOnly}
                placeholder="e.g., 0211234567" autoComplete="tel" className={innerCls(!!errors.workPhone)} />
            </div>
            <ErrorMsg error={errors.workPhone} />
          </div>

          {/* Work Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Mobile</label>
            <div className={wrapperCls(false)}>
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300"><HiOutlinePhone className="w-5 h-5 text-gray-400" /></div>
              <input type="tel" inputMode="numeric" pattern="[0-9]*" name="workMobile"
                value={formData.workMobile} onChange={handleChange} onPaste={pasteNumberOnly}
                placeholder="e.g., 08123456789" autoComplete="tel" className={innerCls(false)} />
            </div>
          </div>

          {/* Company */}
          <div>
            <RequiredLabel>Company</RequiredLabel>
            <div className={wrapperCls(!!errors.companyId)}>
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300"><HiOutlineOfficeBuilding className="w-5 h-5 text-gray-400" /></div>
              <select name="companyId" value={formData.companyId} onChange={handleChange}
                className={innerCls(!!errors.companyId, "bg-transparent")}>
                <option value="">Select Company</option>
                {companies?.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <ErrorMsg error={errors.companyId} />
          </div>

          {/* Department */}
          <div>
            <RequiredLabel>Department</RequiredLabel>
            <div className={wrapperCls(!!errors.departmentId)}>
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300"><HiOutlineOfficeBuilding className="w-5 h-5 text-gray-400" /></div>
              <select name="departmentId" value={formData.departmentId}
                onChange={(e) => { handleChange(e); onManagerAutoFill(e.target.value); }}
                className={innerCls(!!errors.departmentId, "bg-transparent")}>
                <option value="">Select Department</option>
                {departments?.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
              </select>
            </div>
            <ErrorMsg error={errors.departmentId} />
          </div>

          {/* Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
            <div className={wrapperCls(false)}>
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300"><HiOutlineUser className="w-5 h-5 text-gray-400" /></div>
              <select
                name="managerId"
                value={formData.managerId}
                disabled
                className={innerCls(false, "bg-gray-100 cursor-not-allowed")}
              >
                <option value="">Auto by Department</option>
                {activeEmployees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coach */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coach</label>
            <div className={wrapperCls(false)}>
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300"><HiOutlineUserGroup className="w-5 h-5 text-gray-400" /></div>
              <select name="coachId" value={formData.coachId} onChange={handleChange} className={innerCls(false, "bg-transparent")}>
                <option value="">Select Coach</option>
                {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>

          {/* Join Date */}
          <div>
            <RequiredLabel>Join Date</RequiredLabel>
            <div className={wrapperCls(!!errors.joinDate)}>
              <div className="px-3 bg-gray-50 py-3 border-r border-gray-300"><HiOutlineCalendar className="w-5 h-5 text-gray-400" /></div>
              <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange}
                className={innerCls(!!errors.joinDate)} />
            </div>
            <ErrorMsg error={errors.joinDate} />
          </div>

        </div>
      )}
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const AddEmployee = () => {
  const navigate = useNavigate();

  const { createEmployee, employees, fetchEmployees } = useEmployee();
  const { departments, fetchDepartments, loading: departmentLoading } = useDepartment();
  const { companies,   fetchCompanies,   loading: companyLoading   } = useCompany();

  const [photo,        setPhoto]        = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('private');
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [errors,  setErrors]  = useState({});
  const [toast,   setToast]   = useState({ show: false, message: '', type: 'success' });

  // Fix #1: proper useEffect deps
  useEffect(() => {
    fetchCompanies();
    fetchDepartments();
    fetchEmployees();
  }, []);

  // Fix #6: revoke object URL on change to prevent memory leak
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '', jobTitle: '', workEmail: '', workPhone: '',
    workMobile: '', companyId: '', departmentId: '',
    joinDate: '', managerId: '', coachId: ''
  });
  const [privateContact,   setPrivateContact]   = useState({ address: '', email: '', phone: '' });
  const [banks,            setBanks]            = useState([{ bankName: '', accountNumber: '', accountHolder: '' }]);
  const [insurances,       setInsurances]       = useState([{ type: '', provider: '', policyNumber: '', expiryDate: '' }]);
  const [taxInfo,          setTaxInfo]          = useState({ npwp: '', workDistance: 0 });
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '' });
  const [familyInfo,       setFamilyInfo]       = useState({ maritalStatus: '', numberOfChildren: 0 });
  const [citizenship, setCitizenship] = useState({
    nationality: '', countryOfBirth: '', idNumber: '',
    passportNumber: '', gender: '', dateOfBirth: '', placeOfBirth: ''
  });
  const [education,  setEducation]  = useState({ certificateLevel: '', fieldOfStudy: '', school: '' });
  const [documents,  setDocuments]  = useState({
    idCard: null, familyCard: null, drivingLicense: null,
    insurance: null, npwpCard: null, certificate: null
  });
  const [settings, setSettings] = useState({
    employeeType: '', relatedUserId: '', monthlyCost: '',
    attendanceBadgeId: '', enableNotifications: true,
    allowRemoteAccess: false, overtimeEligible: true
  });

  const activeEmployees = employees?.filter(e => e.status === 'ACTIVE') || [];

  // Fix #5: string-safe department comparison
  const handleManagerAutoFill = useCallback((departmentId) => {
    if (!departmentId) { setFormData(p => ({ ...p, managerId: '' })); return; }
    const dept = departments?.find(d => String(d.id) === String(departmentId));
    setFormData(p => ({ ...p, managerId: dept?.managerId ? String(dept.managerId) : '' }));
  }, [departments]);

  // handleChange with real-time validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let val = value;
    if (["workPhone", "workMobile"].includes(name)) val = onlyNumber(value);
    if (["name", "jobTitle"].includes(name))         val = onlyText(value);
    setFormData(p => ({ ...p, [name]: val }));

    if (REQUIRED_FIELDS.includes(name)) {
      if (!val.trim()) {
        setErrors(p => ({ ...p, [name]: `${FIELD_LABELS[name]} is required` }));
      } else if (name === 'workEmail' && !/\S+@\S+\.\S+/.test(val)) {
        setErrors(p => ({ ...p, [name]: 'Email is invalid' }));
      } else {
        setErrors(p => { const n = { ...p }; delete n[name]; return n; });
      }
    }
  }, []);

  const handlePrivateContactChange = (e) => {
    const { name, value } = e.target;
    setPrivateContact(p => ({ ...p, [name]: name === 'phone' ? onlyNumber(value) : value }));
  };

  const addBank    = () => setBanks(p => [...p, { bankName: '', accountNumber: '', accountHolder: '' }]);
  const removeBank = (i) => { if (banks.length > 1) setBanks(p => p.filter((_, idx) => idx !== i)); };
  const handleBankChange = (i, field, value) => {
    let v = value;
    if (field === 'accountNumber') v = onlyNumber(value);
    if (field === 'accountHolder') v = onlyText(value);
    setBanks(p => { const n = [...p]; n[i][field] = v; return n; });
  };

  const addInsurance    = () => setInsurances(p => [...p, { type: '', provider: '', policyNumber: '', expiryDate: '' }]);
  const removeInsurance = (i) => { if (insurances.length > 1) setInsurances(p => p.filter((_, idx) => idx !== i)); };
  const handleInsuranceChange = (i, field, value) => {
    setInsurances(p => { const n = [...p]; n[i][field] = value; return n; });
  };

  const handleCitizenshipChange = (e) => {
    const { name, value } = e.target;
    setCitizenship(p => ({ ...p, [name]: name === 'placeOfBirth' ? onlyText(value) : value }));
  };
  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducation(p => ({ ...p, [name]: ['school','fieldOfStudy'].includes(name) ? (value) : value }));
  };
  const handleFamilyChange = (e) => {
    const { name, value } = e.target;
    setFamilyInfo(p => ({ ...p, [name]: name === 'numberOfChildren' ? onlyNumber(value) : value }));
  };
  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setEmergencyContact(p => ({
      ...p,
      [name]: name === 'name' ? onlyText(value) : name === 'phone' ? onlyNumber(value) : value
    }));
  };
  const handleTaxChange = (e) => {
    const { name, value } = e.target;
    setTaxInfo(p => ({ ...p, [name]: ['npwp','workDistance'].includes(name) ? onlyNumber(value) : value }));
  };

  const handleDocumentUpload = (type, file) => {
    if (file) setDocuments(p => ({ ...p, [type]: { file, fileName: file.name, fileUrl: URL.createObjectURL(file) } }));
  };
  const handleRemoveDocument = (type) => setDocuments(p => ({ ...p, [type]: null }));

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === 'checkbox' ? checked : value;
    if (name === 'attendanceBadgeId') v = onlyNumber(value);
    setSettings(p => ({ ...p, [name]: v }));
    if (name === 'employeeType') {
      if (!v) setErrors(p => ({ ...p, employeeType: 'Employee Type is required' }));
      else    setErrors(p => { const n = { ...p }; delete n.employeeType; return n; });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!formData.name.trim())      e.name      = 'Name is required';
    if (!formData.jobTitle.trim())  e.jobTitle  = 'Job Title is required';
    if (!formData.workEmail.trim()) e.workEmail = 'Work Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.workEmail)) e.workEmail = 'Email is invalid';
    if (!formData.workPhone.trim()) e.workPhone = 'Work Phone is required';
    if (!formData.companyId)        e.companyId    = 'Company is required';
    if (!formData.departmentId)     e.departmentId = 'Department is required';
    if (!formData.joinDate)         e.joinDate     = 'Join Date is required';
    if (!settings.employeeType)     e.employeeType = 'Employee Type is required';
    return e;
  };

  // Fix #8: guard incomplete bank rows
  const hasBankIncomplete = () =>
    banks.some(b => b.bankName && (!b.accountNumber || !b.accountHolder));

  const uploadFile = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    const res = await API.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.data?.fileUrl || res.data.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setToast({ show: true, message: 'Please fill in all required fields', type: 'error' });
      const first = Object.keys(validationErrors)[0];
      if (first === 'employeeType') {
        setActiveMainTab('settings');
        setTimeout(() => document.querySelector(`[name="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      } else {
        document.querySelector(`[name="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Fix #8: incomplete bank check
    if (hasBankIncomplete()) {
      setToast({ show: true, message: 'Please complete all bank account information', type: 'error' });
      setActiveMainTab('private');
      return;
    }

    setIsSubmitting(true);
    try {
      const photoUrl      = photo                    ? await uploadFile(photo)                       : null;
      const idCardUrl     = documents.idCard         ? await uploadFile(documents.idCard.file)       : null;
      const familyCardUrl = documents.familyCard     ? await uploadFile(documents.familyCard.file)   : null;
      const drivingLicUrl = documents.drivingLicense ? await uploadFile(documents.drivingLicense.file) : null;
      const insuranceUrl  = documents.insurance      ? await uploadFile(documents.insurance.file)    : null;
      const npwpCardUrl   = documents.npwpCard       ? await uploadFile(documents.npwpCard.file)     : null;

      const payload = {
        name: formData.name, jobTitle: formData.jobTitle,
        workMobile: formData.workMobile || null,
        workPhone: formData.workPhone,   workEmail: formData.workEmail,
        joinDate: formData.joinDate || null, photo: photoUrl || null,

        companyId:    parseInt(formData.companyId,    10),
        departmentId: parseInt(formData.departmentId, 10),
        managerId:    formData.managerId ? parseInt(formData.managerId, 10) : null,
        coachId:      formData.coachId   ? parseInt(formData.coachId,   10) : null,

        privateAddress: privateContact.address || null,
        privateEmail:   privateContact.email   || null,
        privatePhone:   privateContact.phone   || null,

        banks: banks
          .filter(b => b.bankName && b.accountNumber && b.accountHolder)
          .map(({ bankName, accountNumber, accountHolder }) => ({ bankName, accountNumber, accountHolder })),

        insurances: insurances
          .filter(i => i.type && i.provider && i.policyNumber)
          .map(({ type, provider, policyNumber, expiryDate }) => ({ type, provider, policyNumber, expiryDate: expiryDate || null })),

        npwpId:             taxInfo.npwp        || null,
        homeToWorkDistance: taxInfo.workDistance ? Number(taxInfo.workDistance) : null,

        nationality:          citizenship.nationality    || null,
        identificationNumber: citizenship.idNumber       || null,
        passportNumber:       citizenship.passportNumber || null,
        gender:               citizenship.gender         || null,
        dateOfBirth:          citizenship.dateOfBirth    || null,
        placeOfBirth:         citizenship.placeOfBirth   || null,
        countryOfBirth:       citizenship.countryOfBirth || null,

        emergencyContactName:  emergencyContact.name  || null,
        emergencyContactPhone: emergencyContact.phone || null,

        certificateLevel: education.certificateLevel || null,
        fieldOfStudy:     education.fieldOfStudy     || null,
        school:           education.school           || null,

        maritalStatus: familyInfo.maritalStatus || null,
        numberOfDependentChildren: familyInfo.numberOfChildren
          ? parseInt(familyInfo.numberOfChildren, 10) : null,

        status: "ACTIVE",
        employeeType: settings.employeeType,
        relatedUser:  settings.relatedUserId  ? String(settings.relatedUserId) : null,
        monthlyCost:  settings.monthlyCost !== '' ? parseFloat(settings.monthlyCost) : null,
        attendanceBadgeId: settings.attendanceBadgeId || null,

        idCardCopy:         idCardUrl,
        familyCardCopy:     familyCardUrl,
        drivingLicenseCopy: drivingLicUrl,
        assuranceCardCopy:  insuranceUrl,
        npwpCardCopy:       npwpCardUrl,
      };

      await createEmployee(payload);
      navigate('/employees', {
        state: { toast: { show: true, message: `Employee ${formData.name} has been successfully created`, type: 'success' } }
      });

    } catch (err) {
      console.error('Create employee failed:', err);
      setToast({ show: true, message: err.response?.data?.message || err.message || 'Failed to create employee', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <form onSubmit={handleSubmit} className="w-full px-4 md:px-6 py-6 bg-gray-50 min-h-screen">
      <Toast toast={toast} onClose={() => setToast(p => ({ ...p, show: false }))} />

      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button type="button" onClick={() => navigate('/employees')} disabled={isSubmitting}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-white shadow-sm">
          <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Employee</h1>
      </div>

      <ProfileCard
        formData={formData} handleChange={handleChange}
        photoPreview={photoPreview} handlePhotoChange={handlePhotoChange}
        errors={errors}
      />

      <WorkInformationCard
        formData={formData} handleChange={handleChange}
        companies={companies} departments={departments}
        activeEmployees={activeEmployees}
        companyLoading={companyLoading} departmentLoading={departmentLoading}
        onManagerAutoFill={handleManagerAutoFill}
        errors={errors}
      />

      {/* ── Tab Panel ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <div className="flex space-x-6">
            {[
              { key: 'private',   label: 'Private Information' },
              { key: 'documents', label: 'Documents'           },
              { key: 'settings',  label: 'Settings'            }
            ].map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setActiveMainTab(key)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeMainTab === key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* =================== PRIVATE TAB =================== */}
          {activeMainTab === 'private' && (
            <div className="space-y-8">

              {/* 2.1 Private Contact */}
              <section>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlineHome className="w-5 h-5 mr-2 text-indigo-500" /> 2.1 Private Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Private Address</label>
                    <textarea name="address" value={privateContact.address} onChange={handlePrivateContactChange}
                      rows="3" placeholder="Street, City, Province, Postal Code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Private Email</label>
                    <input type="email" name="email" value={privateContact.email}
                      onChange={handlePrivateContactChange} placeholder="personal@email.com" autoComplete="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Private Phone</label>
                    <input type="tel" inputMode="numeric" pattern="[0-9]*" name="phone"
                      value={privateContact.phone} onChange={handlePrivateContactChange}
                      onPaste={pasteNumberOnly} placeholder="+62 XXX XXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* Bank Accounts */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-md font-medium text-gray-700">Bank Accounts</span>
                    <button type="button" onClick={addBank}
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm">
                      <HiOutlinePlus className="w-4 h-4" /><span>Add Bank</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {banks.map((bank, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                        {banks.length > 1 && (
                          <button type="button" onClick={() => removeBank(i)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Bank Name</label>
                            <select value={bank.bankName} onChange={e => handleBankChange(i, 'bankName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                              <option value="">Select Bank</option>
                              {BANK_OPTIONS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                            {/* Fix #2: onPaste guard */}
                            <input type="text" inputMode="numeric" value={bank.accountNumber}
                              onChange={e => handleBankChange(i, 'accountNumber', e.target.value)}
                              onPaste={pasteNumberOnly} placeholder="Numbers only"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Account Holder</label>
                            {/* Fix #3: onPaste guard */}
                            <input type="text" value={bank.accountHolder}
                              onChange={e => handleBankChange(i, 'accountHolder', e.target.value)}
                              onPaste={pasteTextOnly} placeholder="Full Name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insurance */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-md font-medium text-gray-700">Insurance</span>
                    <button type="button" onClick={addInsurance}
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm">
                      <HiOutlinePlus className="w-4 h-4" /><span>Add Insurance</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {insurances.map((ins, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                        {insurances.length > 1 && (
                          <button type="button" onClick={() => removeInsurance(i)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Type</label>
                            <select value={ins.type} onChange={e => handleInsuranceChange(i, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                              <option value="">Select Type</option>
                              {INSURANCE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Provider</label>
                            <input type="text" value={ins.provider}
                              onChange={e => handleInsuranceChange(i, 'provider', e.target.value)}
                              placeholder="e.g., BPJS" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Policy Number</label>
                            <input type="text" value={ins.policyNumber}
                              onChange={e => handleInsuranceChange(i, 'policyNumber', e.target.value)}
                              placeholder="Policy Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Expiry Date</label>
                            <input type="date" value={ins.expiryDate}
                              onChange={e => handleInsuranceChange(i, 'expiryDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tax */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NPWP ID</label>
                    <input type="text" inputMode="numeric" name="npwp" value={taxInfo.npwp}
                      onChange={handleTaxChange} onPaste={pasteNumberOnly} placeholder="Numbers only"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home-Work Distance (KM)</label>
                    <div className="relative">
                      <input type="text" inputMode="numeric" name="workDistance" value={taxInfo.workDistance}
                        onChange={handleTaxChange} onPaste={pasteNumberOnly} placeholder="0"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">KM</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2.2 Emergency */}
              <section>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlinePhone className="w-5 h-5 mr-2 text-red-500" /> 2.2 Emergency
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input type="text" name="name" value={emergencyContact.name}
                      onChange={handleEmergencyChange} onPaste={pasteTextOnly} placeholder="Letters only"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input type="tel" inputMode="numeric" pattern="[0-9]*" name="phone"
                      value={emergencyContact.phone} onChange={handleEmergencyChange}
                      onPaste={pasteNumberOnly} placeholder="Numbers only"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </section>

              {/* 2.3 Family */}
              <section>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlineUsers className="w-5 h-5 mr-2 text-green-500" /> 2.3 Family Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <select name="maritalStatus" value={familyInfo.maritalStatus} onChange={handleFamilyChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Status</option>
                      {MARITAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  {/* Fix #4: type="number" min="0" */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Dependent Children</label>
                    <input type="number" min="0" name="numberOfChildren" value={familyInfo.numberOfChildren}
                      onChange={handleFamilyChange} placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </section>

              {/* 2.4 Citizenship */}
              <section>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlineGlobe className="w-5 h-5 mr-2 text-blue-500" /> 2.4 Citizenship
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Citizenship</label>
                    <select name="nationality" value={citizenship.nationality} onChange={handleCitizenshipChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Citizenship</option>
                      {NATIONALITY_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country of Birth</label>
                    <input type="text" name="countryOfBirth" value={citizenship.countryOfBirth}
                      onChange={handleCitizenshipChange} placeholder="Country"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Identification No</label>
                    <input type="text" name="idNumber" value={citizenship.idNumber}
                      onChange={handleCitizenshipChange} placeholder="KTP / ID Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport No</label>
                    <input type="text" name="passportNumber" value={citizenship.passportNumber}
                      onChange={handleCitizenshipChange} placeholder="Passport Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select name="gender" value={citizenship.gender} onChange={handleCitizenshipChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={citizenship.dateOfBirth}
                      onChange={handleCitizenshipChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth</label>
                    <input type="text" name="placeOfBirth" value={citizenship.placeOfBirth}
                      onChange={handleCitizenshipChange} onPaste={pasteTextOnly} placeholder="City of Birth"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </section>

              {/* 2.5 Education */}
              <section>
                <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <HiOutlineAcademicCap className="w-5 h-5 mr-2 text-purple-500" /> 2.5 Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Level</label>
                    <select name="certificateLevel" value={education.certificateLevel} onChange={handleEducationChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Level</option>
                      {CERTIFICATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                    <input type="text" name="fieldOfStudy" value={education.fieldOfStudy}
                      onChange={handleEducationChange} onPaste={pasteTextOnly}
                      placeholder="e.g., Computer Science"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School / University</label>
                    <input type="text" name="school" value={education.school}
                      onChange={handleEducationChange} onPaste={pasteTextOnly}
                      placeholder="Institution Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* =================== DOCUMENTS TAB =================== */}
          {activeMainTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'idCard',         label: 'ID Card / KTP',  icon: HiOutlineIdentification },
                  { key: 'familyCard',     label: 'Family Card',    icon: HiOutlineUsers          },
                  { key: 'drivingLicense', label: 'Driving License',icon: HiOutlineDocument       },
                  { key: 'insurance',      label: 'Insurance',      icon: HiOutlineShieldCheck    },
                  { key: 'npwpCard',       label: 'NPWP Card',      icon: HiOutlineDocument       },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-5 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-indigo-500" />
                        <span className="text-base font-medium text-gray-700">{label}</span>
                      </div>
                      {documents[key] ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 truncate max-w-[150px]">{documents[key].fileName}</span>
                          <button type="button" onClick={() => handleRemoveDocument(key)}
                            className="text-red-500 hover:text-red-700 p-1">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1">
                          <HiOutlineUpload className="w-4 h-4" /><span>Upload</span>
                          <input type="file" className="hidden"
                            onChange={e => handleDocumentUpload(key, e.target.files[0])} />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================== SETTINGS TAB =================== */}
          {activeMainTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Employee Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Employee Type */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Type <span className="text-red-500">*</span>
                    {errors.employeeType && <span className="text-red-500 text-xs ml-2">{errors.employeeType}</span>}
                  </label>
                  <select name="employeeType" value={settings.employeeType} onChange={handleSettingsChange}
                    className={standaloneCls(!!errors.employeeType)}>
                    <option value="">Select Type</option>
                    {EMPLOYEE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Related User */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Related User</label>
                  <select name="relatedUserId" value={settings.relatedUserId} onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Related User</option>
                    {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>

                {/* Monthly Cost */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Cost</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                    <input type="number" min="0" name="monthlyCost" value={settings.monthlyCost}
                      onChange={handleSettingsChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* Attendance Badge ID */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Badge ID</label>
                  {/* Fix #2: onPaste; Fix #7: inputMode */}
                  <input type="text" inputMode="numeric" name="attendanceBadgeId"
                    value={settings.attendanceBadgeId} onChange={handleSettingsChange}
                    onPaste={pasteNumberOnly} placeholder="Numbers only (e.g., 12345)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/employees')} disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-base">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating…
              </>
            ) : 'Create Employee'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddEmployee;
