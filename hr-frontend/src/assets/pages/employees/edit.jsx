import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePhotograph, 
  HiOutlineDocument, 
  HiOutlineUpload, 
  HiOutlineTrash, 
  HiOutlineDownload,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineX,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineInformationCircle
} from 'react-icons/hi';
import { useEmployee } from '../../../redux/hooks/useEmployee';
import { useDepartment } from '../../../redux/hooks/useDepartment';
import API from "../../../api/api";

const EditEmployee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employeeData = location.state?.employee;
  const { updateEmployee, options } = useEmployee();
  const { departments, fetchDepartments } = useDepartment();
  const { employees, fetchEmployees } = useEmployee();
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(employeeData?.photo || null);
  const [currentSection, setCurrentSection] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk error per field
  const [errors, setErrors] = useState({});

  // State untuk toast notification
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Auto hide toast setelah 3 detik
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // State untuk menyimpan dokumen per section
  const [documents, setDocuments] = useState({
    basic: [], // CONTRACT
    private: [], // BANK_BOOK, BPJS_CARD
    citizenship: [], // KTP, PASSPORT_SCAN, FAMILY_CARD
    education: [], // CERTIFICATE, TRANSCRIPT
    family: [] // MARRIAGE_CERT, CHILD_CERT
  });

  // Fetch departments dan employees untuk dropdown
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  // ✅ formData dengan semua field
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    jobTitle: '',
    workEmail: '',
    workPhone: '',
    workMobile: '',
    departmentId: '',
    managerId: '',
    coachId: '',
    jobPosition: '',
    employeeType: '',
    status: '',
    relatedUser: '',
    
    // Private Information
    privateAddress: '',
    privateEmail: '',
    privatePhone: '',
    accountNumber: '',
    bankName: '',
    homeToWorkDistance: '',
    bpjs: '',
    monthlyCost: '',
    
    // Citizenship
    nationality: '',
    identificationNumber: '',
    passportNumber: '',
    gender: '',
    dateOfBirth: '',
    placeOfBirth: '',
    countryOfBirth: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    
    // Education
    certificateLevel: '',
    fieldOfStudy: '',
    school: '',
    
    // Family Status
    maritalStatus: '',
    dependentChildren: '',
  });

  // ✅ Semua field wajib diisi
  const requiredFields = {
    basic: ['name', 'jobTitle', 'workEmail', 'workPhone', 'workMobile', 'departmentId', 'managerId', 'jobPosition', 'employeeType', 'status', 'relatedUser'],
    private: ['privateAddress', 'privateEmail', 'privatePhone', 'accountNumber', 'bankName', 'homeToWorkDistance', 'bpjs', 'monthlyCost'],
    citizenship: ['nationality', 'identificationNumber', 'passportNumber', 'gender', 'dateOfBirth', 'placeOfBirth', 'countryOfBirth'],
    emergency: ['emergencyName', 'emergencyPhone'],
    education: ['certificateLevel', 'fieldOfStudy', 'school'],
    family: ['maritalStatus', 'dependentChildren']
  };

  // Konfigurasi dokumen per section
  const documentConfig = {
    basic: [
      { type: 'CONTRACT', label: 'Employment Contract', section: 'BASIC', required: true },
    ],
    private: [
      { type: 'BANK_BOOK', label: 'Bank Book / Account Statement', section: 'PRIVATE', required: false },
      { type: 'BPJS_CARD', label: 'BPJS Card', section: 'PRIVATE', required: false }
    ],
    citizenship: [
      { type: 'KTP', label: 'KTP (ID Card)', section: 'CITIZENSHIP', required: true },
      { type: 'FAMILY_CARD', label: 'Kartu Keluarga', section: 'CITIZENSHIP', required: false },
      { type: 'PASSPORT_SCAN', label: 'Passport', section: 'CITIZENSHIP', required: false }
    ],
    education: [
      { type: 'CERTIFICATE', label: 'Ijazah / Certificate', section: 'EDUCATION', required: false },
      { type: 'TRANSCRIPT', label: 'Academic Transcript', section: 'EDUCATION', required: false }
    ],
    family: [
      { type: 'MARRIAGE_CERT', label: 'Marriage Certificate', section: 'FAMILY', required: false },
      { type: 'CHILD_CERT', label: 'Birth Certificate (Child)', section: 'FAMILY', required: false }
    ]
  };

  // ✅ Validasi form per section
  const validateSection = (section) => {
    const sectionErrors = {};
    const fields = requiredFields[section] || [];
    
    fields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        sectionErrors[field] = 'Field ini wajib diisi';
      }
    });

    // Validasi email ketat
    if (section === 'basic' && formData.workEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.workEmail)) {
        sectionErrors.workEmail = 'Format email tidak valid (contoh: nama@domain.com)';
      }
    }

    // Validasi private email jika diisi
    if (section === 'private' && formData.privateEmail && formData.privateEmail.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.privateEmail)) {
        sectionErrors.privateEmail = 'Format email tidak valid';
      }
    }

    // Validasi monthlyCost > 0
    if (section === 'private' && formData.monthlyCost) {
      if (parseFloat(formData.monthlyCost) <= 0) {
        sectionErrors.monthlyCost = 'Monthly cost harus lebih dari 0';
      }
    }

    // Validasi homeToWorkDistance tidak negatif
    if (section === 'private' && formData.homeToWorkDistance) {
      if (parseFloat(formData.homeToWorkDistance) < 0) {
        sectionErrors.homeToWorkDistance = 'Distance tidak boleh negatif';
      }
    }

    // Validasi dependentChildren tidak negatif
    if (section === 'family' && formData.dependentChildren) {
      if (parseInt(formData.dependentChildren) < 0) {
        sectionErrors.dependentChildren = 'Jumlah anak tidak boleh negatif';
      }
    }

    return sectionErrors;
  };

  const validateAllSections = () => {
    const allErrors = {};
    Object.keys(requiredFields).forEach(section => {
      const sectionErrors = validateSection(section);
      Object.assign(allErrors, sectionErrors);
    });
    return allErrors;
  };

  const isSectionValid = (section) => {
    const sectionErrors = validateSection(section);
    return Object.keys(sectionErrors).length === 0;
  };

  // Handle next section
  const goToNextSection = (e) => {
    e.preventDefault();
    
    const sectionErrors = validateSection(currentSection);
    if (Object.keys(sectionErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...sectionErrors }));
      setToast({
        show: true,
        message: 'Harap isi semua field yang wajib diisi dengan benar',
        type: 'error'
      });
      return;
    }

    const newErrors = { ...errors };
    requiredFields[currentSection].forEach(field => {
      delete newErrors[field];
    });
    setErrors(newErrors);

    const sections = ['basic', 'private', 'citizenship', 'emergency', 'education', 'family'];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
    }
  };

  const goToPrevSection = (e) => {
    e.preventDefault();
    const sections = ['basic', 'private', 'citizenship', 'emergency', 'education', 'family'];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
    }
  };

  // ✅ Prefill form data dari employeeData
  useEffect(() => {
    if (employeeData) {
      setFormData({
        name: employeeData.name || '',
        jobTitle: employeeData.jobTitle || '',
        workEmail: employeeData.workEmail || '',
        workPhone: employeeData.workPhone || '',
        workMobile: employeeData.workMobile || '',
        departmentId: employeeData.departmentId || '',
        managerId: employeeData.managerId || '',
        coachId: employeeData.coachId || '',
        jobPosition: employeeData.jobPosition || '',
        employeeType: employeeData.employeeType || '',
        status: employeeData.status || '',
        relatedUser: employeeData.relatedUser || '',
        
        privateAddress: employeeData.privateAddress || '',
        privateEmail: employeeData.privateEmail || '',
        privatePhone: employeeData.privatePhone || '',
        accountNumber: employeeData.accountNumber || '',
        bankName: employeeData.bankName || '',
        homeToWorkDistance: employeeData.homeToWorkDistance || '',
        bpjs: employeeData.bpjsId || '',
        monthlyCost: employeeData.monthlyCost || '',
        
        nationality: employeeData.nationality || '',
        identificationNumber: employeeData.identificationNumber || '',
        passportNumber: employeeData.passportNumber || '',
        gender: employeeData.gender || '',
        dateOfBirth: employeeData.dateOfBirth || '',
        placeOfBirth: employeeData.placeOfBirth || '',
        countryOfBirth: employeeData.countryOfBirth || '',
        
        emergencyName: employeeData.emergencyContactName || '',
        emergencyPhone: employeeData.emergencyContactPhone || '',
        
        certificateLevel: employeeData.certificateLevel || '',
        fieldOfStudy: employeeData.fieldOfStudy || '',
        school: employeeData.school || '',
        
        maritalStatus: employeeData.maritalStatus || '',
        dependentChildren: employeeData.numberOfDependentChildren || '',
      });
    }
  }, [employeeData]);

  // ✅ Prefill dokumen
  useEffect(() => {
    if (!employeeData) return;

    setDocuments({
      basic: employeeData.contractDocument
        ? [{
            id: employeeData.contractDocumentId,
            documentType: "CONTRACT",
            fileName: "Employment Contract",
            fileUrl: employeeData.contractDocument,
          }]
        : [],

      private: [
        ...(employeeData.bankBookDocument
          ? [{
              id: "server-bank",
              documentType: "BANK_BOOK",
              fileName: "Bank Book",
              fileUrl: employeeData.bankBookDocument,
            }]
          : []),
        ...(employeeData.bpjsCardDocument
          ? [{
              id: "server-bpjs",
              documentType: "BPJS_CARD",
              fileName: "BPJS Card",
              fileUrl: employeeData.bpjsCardDocument,
            }]
          : [])
      ],

      citizenship: [
        ...(employeeData.ktpDocument
          ? [{
              id: "server-ktp",
              documentType: "KTP",
              fileName: "KTP",
              fileUrl: employeeData.ktpDocument,
            }]
          : []),
        ...(employeeData.passportDocument
          ? [{
              id: "server-passport",
              documentType: "PASSPORT_SCAN",
              fileName: "Passport",
              fileUrl: employeeData.passportDocument,
            }]
          : []),
        ...(employeeData.familyCardDocument
          ? [{
              id: "server-family",
              documentType: "FAMILY_CARD",
              fileName: "Family Card",
              fileUrl: employeeData.familyCardDocument,
            }]
          : [])
      ],

      education: [
        ...(employeeData.certificateDocument
          ? [{
              id: "server-cert",
              documentType: "CERTIFICATE",
              fileName: "Certificate",
              fileUrl: employeeData.certificateDocument,
            }]
          : []),
        ...(employeeData.transcriptDocument
          ? [{
              id: "server-transcript",
              documentType: "TRANSCRIPT",
              fileName: "Transcript",
              fileUrl: employeeData.transcriptDocument,
            }]
          : [])
      ],

      family: [
        ...(employeeData.marriageCertificateDocument
          ? [{
              id: "server-marriage",
              documentType: "MARRIAGE_CERT",
              fileName: "Marriage Certificate",
              fileUrl: employeeData.marriageCertificateDocument,
            }]
          : []),
        ...(employeeData.childCertificateDocument
          ? [{
              id: "server-child",
              documentType: "CHILD_CERT",
              fileName: "Child Certificate",
              fileUrl: employeeData.childCertificateDocument,
            }]
          : [])
      ],
    });

  }, [employeeData]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDocumentUpload = (section, documentType, file) => {
    if (file) {
      const newDocument = {
        id: "temp-" + Date.now(),
        documentType,
        fileName: file.name,
        file,
        fileUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        section: documentConfig[section].find(doc => doc.type === documentType)?.section
      };

      setDocuments(prev => ({
        ...prev,
        [section]: [
          ...prev[section].filter(doc => doc.documentType !== documentType),
          newDocument
        ]
      }));
    }
  };

  const handleRemoveDocument = async (section, documentId, documentType) => {
    if (documentId && !String(documentId).startsWith('temp')) {
      try {
        await API.delete(`/documents/${documentId}`);
      } catch (error) {
        console.error('Error deleting document:', error);
        return;
      }
    }

    setDocuments(prev => ({
      ...prev,
      [section]: prev[section].filter(doc => 
        doc.documentType !== documentType && doc.id !== documentId
      )
    }));
  };

  const handleDownloadDocument = async (docItem) => {
    try {
      const link = document.createElement('a');
      link.href = docItem.fileUrl;
      link.download = docItem.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  // ✅ handleChange dengan validasi
  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // Numeric only fields
    if (
      [
        'workPhone',
        'workMobile',
        'privatePhone',
        'emergencyPhone',
        'accountNumber',
        'bpjs',
        'identificationNumber',
        'passportNumber',
        'homeToWorkDistance',
        'dependentChildren',
        'departmentId',
        'coachId',
        'managerId',
        'monthlyCost'
      ].includes(name)
    ) {
      newValue = value.replace(/[^0-9]/g, '');
    }

    // Text only fields
    if (
      [
        'name',
        'jobTitle',
        'jobPosition',
        'placeOfBirth',
        'countryOfBirth',
        'emergencyName',
        'fieldOfStudy',
        'school',
        'relatedUser',
        'privateAddress'
      ].includes(name)
    ) {
      newValue = value.replace(/[^a-zA-Z\s\-',.]/g, '');
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'departmentId') {
      const selectedDept = departments.find(
        (d) => d.id === parseInt(newValue)
      );

      setFormData((prev) => ({
        ...prev,
        departmentId: newValue,
        coachId: selectedDept?.managerId || '',
        managerId: prev.managerId
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue
      }));
    }
  };

  const validateRequiredDocuments = () => {
    const requiredDocs = [];
    
    Object.entries(documentConfig).forEach(([section, docs]) => {
      docs.forEach(doc => {
        if (doc.required) {
          const hasDoc = documents[section].some(d => d.documentType === doc.type);
          if (!hasDoc) {
            requiredDocs.push(doc.label);
          }
        }
      });
    });

    return requiredDocs;
  };

  const uploadFile = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error("File upload failed");
    }

    return response.data.data;
  };

  // ✅ handleSubmit dengan payload sesuai DTO
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const allErrors = validateAllSections();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setToast({
        show: true,
        message: 'Harap isi semua field yang wajib diisi dengan benar',
        type: 'error'
      });
      
      const sections = ['basic', 'private', 'citizenship', 'emergency', 'education', 'family'];
      for (const section of sections) {
        const hasErrorInSection = requiredFields[section].some(field => allErrors[field]);
        if (hasErrorInSection) {
          setCurrentSection(section);
          break;
        }
      }
      return;
    }

    const missingDocs = validateRequiredDocuments();
    if (missingDocs.length > 0) {
      setToast({
        show: true,
        message: `Please upload the following required documents:\n- ${missingDocs.join('\n- ')}`,
        type: 'error'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const isNewDocument = (doc) => {
        return doc && doc.id && doc.id.toString().startsWith('temp');
      };

      // Upload new files only
      const contractDoc = documents.basic.find(d => 
        d.documentType === "CONTRACT" && isNewDocument(d)
      );
      const contractUrl = contractDoc ? await uploadFile(contractDoc.file) : employeeData.contractDocument;

      const bankDoc = documents.private.find(d => 
        d.documentType === "BANK_BOOK" && isNewDocument(d)
      );
      const bankBookUrl = bankDoc ? await uploadFile(bankDoc.file) : employeeData.bankBookDocument;

      const bpjsDoc = documents.private.find(d => 
        d.documentType === "BPJS_CARD" && isNewDocument(d)
      );
      const bpjsCardUrl = bpjsDoc ? await uploadFile(bpjsDoc.file) : employeeData.bpjsCardDocument;

      const ktpDoc = documents.citizenship.find(d => 
        d.documentType === "KTP" && isNewDocument(d)
      );
      const ktpUrl = ktpDoc ? await uploadFile(ktpDoc.file) : employeeData.ktpDocument;

      const passportDoc = documents.citizenship.find(d => 
        d.documentType === "PASSPORT_SCAN" && isNewDocument(d)
      );
      const passportUrl = passportDoc ? await uploadFile(passportDoc.file) : employeeData.passportDocument;

      const familyCardDoc = documents.citizenship.find(d => 
        d.documentType === "FAMILY_CARD" && isNewDocument(d)
      );
      const familyCardUrl = familyCardDoc ? await uploadFile(familyCardDoc.file) : employeeData.familyCardDocument;

      const certDoc = documents.education.find(d => 
        d.documentType === "CERTIFICATE" && isNewDocument(d)
      );
      const certificateUrl = certDoc ? await uploadFile(certDoc.file) : employeeData.certificateDocument;

      const transcriptDoc = documents.education.find(d => 
        d.documentType === "TRANSCRIPT" && isNewDocument(d)
      );
      const transcriptUrl = transcriptDoc ? await uploadFile(transcriptDoc.file) : employeeData.transcriptDocument;

      const marriageDoc = documents.family.find(d => 
        d.documentType === "MARRIAGE_CERT" && isNewDocument(d)
      );
      const marriageUrl = marriageDoc ? await uploadFile(marriageDoc.file) : employeeData.marriageCertificateDocument;

      const childDoc = documents.family.find(d => 
        d.documentType === "CHILD_CERT" && isNewDocument(d)
      );
      const childUrl = childDoc ? await uploadFile(childDoc.file) : employeeData.childCertificateDocument;

      const photoUrl = photo ? await uploadFile(photo) : employeeData.photo;

      // Build payload
      const payload = {
        id: employeeData.id,
        employeeCode: employeeData.employeeCode,
        
        name: formData.name,
        jobTitle: formData.jobTitle,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        managerId: formData.managerId ? parseInt(formData.managerId) : null,
        coachId: formData.coachId ? parseInt(formData.coachId) : null,
        relatedUser: formData.relatedUser || null,
        jobPosition: formData.jobPosition,
        workEmail: formData.workEmail,
        workPhone: formData.workPhone,
        workMobile: formData.workMobile,
        employeeType: formData.employeeType,
        status: formData.status,
        joinDate: employeeData.joinDate,

        photo: photoUrl,
        contractDocument: contractUrl,

        privateAddress: formData.privateAddress,
        privateEmail: formData.privateEmail,
        privatePhone: formData.privatePhone,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        homeToWorkDistance: parseFloat(formData.homeToWorkDistance) || null,
        bpjsId: formData.bpjs,
        monthlyCost: formData.monthlyCost ? parseFloat(formData.monthlyCost) : null,
        bankBookDocument: bankBookUrl,
        bpjsCardDocument: bpjsCardUrl,

        nationality: formData.nationality,
        identificationNumber: formData.identificationNumber,
        passportNumber: formData.passportNumber,
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
        placeOfBirth: formData.placeOfBirth,
        countryOfBirth: formData.countryOfBirth,
        ktpDocument: ktpUrl,
        passportDocument: passportUrl,
        familyCardDocument: familyCardUrl,

        emergencyContactName: formData.emergencyName,
        emergencyContactPhone: formData.emergencyPhone,

        certificateLevel: formData.certificateLevel,
        fieldOfStudy: formData.fieldOfStudy,
        school: formData.school,
        certificateDocument: certificateUrl,
        transcriptDocument: transcriptUrl,

        maritalStatus: formData.maritalStatus || null,
        numberOfDependentChildren: parseInt(formData.dependentChildren) || null,
        marriageCertificateDocument: marriageUrl,
        childCertificateDocument: childUrl,
      };

      console.log("UPDATE PAYLOAD:", payload);

      await updateEmployee(payload);
      
      setToast({
        show: true,
        message: `Employee ${formData.name} has been successfully updated`,
        type: 'success'
      });
      
      setTimeout(() => {
        navigate("/employees");
      }, 1500);

    } catch (error) {
      console.error("Update employee failed:", error);
      setToast({
        show: true,
        message: "Failed to update employee: " + error.message,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'basic', name: 'Basic Information' },
    { id: 'private', name: 'Private Information' },
    { id: 'citizenship', name: 'Citizenship' },
    { id: 'emergency', name: 'Emergency Contact' },
    { id: 'education', name: 'Education' },
    { id: 'family', name: 'Family Status' },
  ];

  // Komponen upload dokumen
  const DocumentUploadSection = ({ section }) => {
    const docs = documentConfig[section] || [];
    
    return (
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4">Required Documents</h3>
        <div className="space-y-4">
          {docs.map((doc) => {
            const uploadedDoc = documents[section]?.find(d => d.documentType === doc.type);
            
            return (
              <div key={doc.type} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <HiOutlineDocument className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-700">
                      {doc.label}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    {doc.required && !uploadedDoc && (
                      <span className="ml-2 text-xs text-red-500">Required</span>
                    )}
                  </div>
                  
                  {uploadedDoc ? (
                    <div className="mt-2 flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center space-x-2 flex-1">
                        <HiOutlineDocument className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                          {uploadedDoc.fileName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(uploadedDoc)}
                          className="text-indigo-500 hover:text-indigo-700"
                          title="Download"
                        >
                          <HiOutlineDownload className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(section, uploadedDoc.id, doc.type)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <input
                        type="file"
                        id={`doc-${section}-${doc.type}`}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleDocumentUpload(section, doc.type, file);
                          }
                        }}
                      />
                      <label
                        htmlFor={`doc-${section}-${doc.type}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <HiOutlineUpload className="w-4 h-4 mr-2" />
                        Upload {doc.label}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ✅ Filter: Hanya employee ACTIVE dan TIDAK termasuk diri sendiri
  const otherEmployees = employees.filter(emp => 
    emp.status === 'ACTIVE' && emp.id !== employeeData?.id
  );

  // Dropdown options
  const bankOptions = options?.banks || ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Danamon', 'Permata'];
  const nationalityOptions = options?.nationalities || ['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Vietnam', 'Philippines', 'India', 'China', 'Japan', 'Korea', 'USA', 'UK', 'Australia'];
  const genderOptions = ['MALE', 'FEMALE'];
  const certificateOptions = ['HIGH_SCHOOL', 'DIPLOMA', 'BACHELOR', 'MASTER', 'DOCTORATE'];
  const maritalOptions = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'];
  const employeeTypeOptions = ['FULL_TIME', 'PART_TIME', 'CONTRACT'];
  const statusOptions = ['ACTIVE', 'RESIGNED', 'TERMINATED'];

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (!employeeData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">No employee data found</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 py-6">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border-l-4 animate-slideIn ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}
          style={{ minWidth: '320px' }}
        >
          <div className={`mr-3 flex-shrink-0 ${
            toast.type === 'success' ? 'text-green-500' : 'text-red-500'
          }`}>
            {toast.type === 'success' ? (
              <HiOutlineCheckCircle className="w-6 h-6" />
            ) : (
              <HiOutlineXCircle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 mr-2">
            <p className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {toast.message}
            </p>
          </div>
          <button 
            onClick={closeToast}
            className={`flex-shrink-0 ${
              toast.type === 'success' 
                ? 'text-green-600 hover:text-green-800' 
                : 'text-red-600 hover:text-red-800'
            }`}
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Employee</h1>
      </div>

      {/* Progress Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => {
            const isValid = isSectionValid(section.id);
            const hasErrors = requiredFields[section.id].some(field => errors[field]);
            
            return (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  currentSection === section.id
                    ? 'bg-indigo-600 text-white'
                    : hasErrors
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : isValid
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {section.name}
                {hasErrors && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {isValid && !hasErrors && requiredFields[section.id].length > 0 && (
                  <HiOutlineCheckCircle className="ml-2 w-4 h-4" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Photo Upload */}
        <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-200">
          <div className="relative">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <HiOutlinePhotograph className="w-8 h-8 text-indigo-400" />
              </div>
            )}
            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </label>
            <input
              type="file"
              id="photo-upload"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Employee Photo</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (Max. 2MB)</p>
          </div>
        </div>

        {/* SECTION 1: BASIC INFORMATION */}
        {currentSection === 'basic' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700 flex items-start">
                <HiOutlineInformationCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Related User</strong> adalah employee lain yang terhubung dengan employee ini.
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.jobTitle ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.jobTitle && <p className="mt-1 text-xs text-red-500">{errors.jobTitle}</p>}
              </div>
              
              {/* Work Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleChange}
                  placeholder="e.g., john.doe@company.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.workEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.workEmail && <p className="mt-1 text-xs text-red-500">{errors.workEmail}</p>}
              </div>
              
              {/* Work Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="workPhone"
                  value={formData.workPhone}
                  onChange={handleChange}
                  placeholder="e.g., 628123456789"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.workPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.workPhone && <p className="mt-1 text-xs text-red-500">{errors.workPhone}</p>}
              </div>
              
              {/* Work Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="workMobile"
                  value={formData.workMobile}
                  onChange={handleChange}
                  placeholder="e.g., 628123456789"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.workMobile ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.workMobile && <p className="mt-1 text-xs text-red-500">{errors.workMobile}</p>}
              </div>
              
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.departmentId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                  ))}
                </select>
                {errors.departmentId && <p className="mt-1 text-xs text-red-500">{errors.departmentId}</p>}
              </div>

              {/* Manager */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager <span className="text-red-500">*</span>
                </label>
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.managerId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Manager</option>
                  {otherEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
                {errors.managerId && <p className="mt-1 text-xs text-red-500">{errors.managerId}</p>}
              </div>

              {/* Coach (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coach (Auto from Department)
                </label>
                <input
                  type="text"
                  value={
                    formData.coachId
                      ? employees.find(emp => emp.id === parseInt(formData.coachId))?.name || ''
                      : formData.departmentId ? 'Coach will be set automatically' : 'Select department first'
                  }
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-600"
                />
              </div>

              {/* Related User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related User <span className="text-red-500">*</span>
                </label>
                <select
                  name="relatedUser"
                  value={formData.relatedUser}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.relatedUser ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Related User</option>
                  {otherEmployees.map(emp => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} ({emp.employeeCode} - {emp.jobTitle})
                    </option>
                  ))}
                </select>
                {errors.relatedUser && <p className="mt-1 text-xs text-red-500">{errors.relatedUser}</p>}
              </div>

              {/* Job Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jobPosition"
                  value={formData.jobPosition}
                  onChange={handleChange}
                  placeholder="e.g., Senior Developer"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.jobPosition ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.jobPosition && <p className="mt-1 text-xs text-red-500">{errors.jobPosition}</p>}
              </div>

              {/* Employee Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="employeeType"
                  value={formData.employeeType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.employeeType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Type</option>
                  {employeeTypeOptions.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
                {errors.employeeType && <p className="mt-1 text-xs text-red-500">{errors.employeeType}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.status ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
              </div>
            </div>

            <DocumentUploadSection section="basic" />
          </div>
        )}

        {/* SECTION 2: PRIVATE INFORMATION */}
        {currentSection === 'private' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Private Information</h2>
            
            {/* Monthly Cost Section */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
              <h3 className="text-md font-semibold text-indigo-800 mb-3 flex items-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 mr-2" />
                Monthly Cost
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Cost (Rp) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                      type="text"
                      name="monthlyCost"
                      value={formData.monthlyCost}
                      onChange={handleChange}
                      placeholder="0"
                      className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.monthlyCost ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.monthlyCost && <p className="mt-1 text-xs text-red-500">{errors.monthlyCost}</p>}
                </div>
                <div className="flex items-end">
                  <p className="text-xs text-gray-500 pb-2">* Format: tanpa titik atau koma (contoh: 5000000)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Private Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Private Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="privateAddress"
                  value={formData.privateAddress}
                  onChange={handleChange}
                  rows="2"
                  placeholder="e.g., Jl. Sudirman No. 123"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.privateAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.privateAddress && <p className="mt-1 text-xs text-red-500">{errors.privateAddress}</p>}
              </div>
              
              {/* Private Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Private Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="privateEmail"
                  value={formData.privateEmail}
                  onChange={handleChange}
                  placeholder="e.g., john.doe@gmail.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.privateEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.privateEmail && <p className="mt-1 text-xs text-red-500">{errors.privateEmail}</p>}
              </div>
              
              {/* Private Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Private Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="privatePhone"
                  value={formData.privatePhone}
                  onChange={handleChange}
                  placeholder="e.g., 628123456789"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.privatePhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.privatePhone && <p className="mt-1 text-xs text-red-500">{errors.privatePhone}</p>}
              </div>
              
              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.accountNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.accountNumber && <p className="mt-1 text-xs text-red-500">{errors.accountNumber}</p>}
              </div>
              
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.bankName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Bank</option>
                  {bankOptions.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                {errors.bankName && <p className="mt-1 text-xs text-red-500">{errors.bankName}</p>}
              </div>
              
              {/* Home to Work Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home to Work Distance (km) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="homeToWorkDistance"
                  value={formData.homeToWorkDistance}
                  onChange={handleChange}
                  placeholder="e.g., 12.5"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.homeToWorkDistance ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.homeToWorkDistance && <p className="mt-1 text-xs text-red-500">{errors.homeToWorkDistance}</p>}
              </div>
              
              {/* BPJS ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BPJS ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bpjs"
                  value={formData.bpjs}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890123"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.bpjs ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.bpjs && <p className="mt-1 text-xs text-red-500">{errors.bpjs}</p>}
              </div>
            </div>

            <DocumentUploadSection section="private" />
          </div>
        )}

        {/* SECTION 3: CITIZENSHIP */}
        {currentSection === 'citizenship' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Citizenship</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nationality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.nationality ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Nationality</option>
                  {nationalityOptions.map(nat => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                </select>
                {errors.nationality && <p className="mt-1 text-xs text-red-500">{errors.nationality}</p>}
              </div>
              
              {/* Identification Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identification Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleChange}
                  placeholder="e.g., 3273010203940001"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.identificationNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.identificationNumber && <p className="mt-1 text-xs text-red-500">{errors.identificationNumber}</p>}
              </div>
              
              {/* Passport Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  placeholder="e.g., A1234567"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.passportNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.passportNumber && <p className="mt-1 text-xs text-red-500">{errors.passportNumber}</p>}
              </div>
              
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
                {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
              </div>
              
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.dateOfBirth ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>}
              </div>
              
              {/* Place of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={handleChange}
                  placeholder="e.g., Jakarta"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.placeOfBirth ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.placeOfBirth && <p className="mt-1 text-xs text-red-500">{errors.placeOfBirth}</p>}
              </div>
              
              {/* Country of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="countryOfBirth"
                  value={formData.countryOfBirth}
                  onChange={handleChange}
                  placeholder="e.g., Indonesia"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.countryOfBirth ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.countryOfBirth && <p className="mt-1 text-xs text-red-500">{errors.countryOfBirth}</p>}
              </div>
            </div>

            <DocumentUploadSection section="citizenship" />
          </div>
        )}

        {/* SECTION 4: EMERGENCY CONTACT */}
        {currentSection === 'emergency' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  placeholder="e.g., Jane Doe"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.emergencyName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.emergencyName && <p className="mt-1 text-xs text-red-500">{errors.emergencyName}</p>}
              </div>
              
              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="e.g., 628123456789"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.emergencyPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.emergencyPhone && <p className="mt-1 text-xs text-red-500">{errors.emergencyPhone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: EDUCATION */}
        {currentSection === 'education' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Certificate Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="certificateLevel"
                  value={formData.certificateLevel}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.certificateLevel ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Level</option>
                  {certificateOptions.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.certificateLevel && <p className="mt-1 text-xs text-red-500">{errors.certificateLevel}</p>}
              </div>
              
              {/* Field of Study */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field of Study <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.fieldOfStudy ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.fieldOfStudy && <p className="mt-1 text-xs text-red-500">{errors.fieldOfStudy}</p>}
              </div>
              
              {/* School */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="e.g., University of Indonesia"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.school ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.school && <p className="mt-1 text-xs text-red-500">{errors.school}</p>}
              </div>
            </div>

            <DocumentUploadSection section="education" />
          </div>
        )}

        {/* SECTION 6: FAMILY STATUS */}
        {currentSection === 'family' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Family Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Marital Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.maritalStatus ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Status</option>
                  {maritalOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.maritalStatus && <p className="mt-1 text-xs text-red-500">{errors.maritalStatus}</p>}
              </div>
              
              {/* Dependent Children */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Dependent Children <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="dependentChildren"
                  value={formData.dependentChildren}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.dependentChildren ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.dependentChildren && <p className="mt-1 text-xs text-red-500">{errors.dependentChildren}</p>}
              </div>
            </div>

            <DocumentUploadSection section="family" />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {currentSection !== 'basic' && (
              <button
                type="button"
                onClick={goToPrevSection}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {currentSection !== 'family' ? (
              <button
                type="button"
                onClick={goToNextSection}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={isSubmitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Employee'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;