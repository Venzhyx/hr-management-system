import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePhoto,
  HiOutlineArrowUpTray,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineXMark,
  HiOutlineBuildingOffice2,
  HiOutlineGlobeAlt,
  HiOutlineMap,
  HiOutlineHome,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineLink,
  HiOutlineTag,
  HiOutlineCreditCard
} from 'react-icons/hi2';
import API from "../../../api/api";

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
        <HiOutlineXMark className="w-5 h-5" />
      </button>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const CompanyInfoCard = ({ formData, handleChange, logoPreview, handleLogoChange, isLoading }) => {
  // Gunakan formData dengan field camelCase untuk tampilan
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName || ''}
                  onChange={handleChange}
                  placeholder="Company Name *"
                  className="text-2xl font-bold text-gray-800 w-full mb-1 px-2 py-1 border-b border-transparent focus:border-indigo-300 focus:outline-none"
                  required
                />
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    ID: {formData.companyId || '-'}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex-shrink-0 ml-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-indigo-100 shadow-md bg-gray-50">
                {isLoading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                ) : logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : formData.logo ? (
                  <img src={formData.logo} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiOutlineBuildingOffice2 className="w-10 h-10 text-indigo-300" />
                  </div>
                )}
              </div>
              <label htmlFor="logo-upload" className={`absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 shadow-lg transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <HiOutlineArrowUpTray className="w-3 h-3" />
              </label>
              <input 
                type="file" 
                id="logo-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={handleLogoChange}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Logo (max 2MB)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const EditCompany = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FIX: Gunakan camelCase sesuai backend
  const [formData, setFormData] = useState({
    companyName: '',
    companyId: '',
    address: '',
    country: '',
    city: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
    logo: ''
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch Company Data
  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const fetchCompanyData = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`/companies/${id}`);
      
      if (response.data.success) {
        const data = response.data.data;
        // ✅ FIX: Mapping dari camelCase backend ke camelCase frontend
        setFormData({
          companyName: data.companyName || '',
          companyId: data.companyId || '',
          address: data.address || '',
          country: data.country || '',
          city: data.city || '',
          zip: data.zip || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          logo: data.logo || ''
        });
      } else {
        setToast({ show: true, message: response.data.message || 'Failed to load company data', type: 'error' });
      }
    } catch (error) {
      console.error('Fetch company failed:', error);
      setToast({ show: true, message: error.response?.data?.message || 'Failed to load company data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToast({ show: true, message: 'Logo size must be less than 2MB', type: 'error' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setToast({ show: true, message: 'File must be an image', type: 'error' });
        return;
      }
      
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.companyId) newErrors.companyId = 'Company ID is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zip) newErrors.zip = 'ZIP code is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    return newErrors;
  };

  // File Upload
  const uploadFile = async (file) => {
    if (!file) return null;
    
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    
    try {
      // ✅ FIX: Jangan set header manual
      const response = await API.post("/files/upload", uploadFormData);
      return response.data.data?.fileUrl || response.data.data;
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setToast({ show: true, message: 'Please fill in all required fields', type: 'error' });
      
      const firstErrorField = Object.keys(validationErrors)[0];
      document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      return;
    }

    setIsSubmitting(true);

    try {
      let logoUrl = formData.logo;
      if (logo) {
        logoUrl = await uploadFile(logo);
      }

      // ✅ FIX: Payload dengan camelCase sesuai backend
      const payload = {
        companyName: formData.companyName,
        companyId: formData.companyId,
        address: formData.address,
        country: formData.country,
        city: formData.city,
        zip: formData.zip,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || null,
        logo: logoUrl
      };

      console.log('Updating company with payload:', payload);
      
      await API.put(`/companies/${id}`, payload);
      
      setToast({ show: true, message: `Company ${formData.companyName} has been successfully updated`, type: 'success' });
      
      setTimeout(() => navigate('/companies'), 1500);

    } catch (error) {
      console.error('Update company failed:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setToast({ show: true, message: error.response.data.message || 'Validation error', type: 'error' });
      } else {
        setToast({ show: true, message: error.response?.data?.message || 'Failed to update company', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeToast = () => setToast(prev => ({ ...prev, show: false }));

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-6 py-6 bg-gray-50 min-h-screen">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <CompanyInfoCard isLoading={true} />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full px-4 md:px-6 py-6 bg-gray-50 min-h-screen">
      <Toast toast={toast} onClose={closeToast} />

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          type="button"
          onClick={() => navigate('/companies')} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-white shadow-sm"
          disabled={isSubmitting}
        >
          <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Company</h1>
      </div>

      {/* Company Info Card */}
      <CompanyInfoCard 
        formData={formData}
        handleChange={handleChange}
        logoPreview={logoPreview}
        handleLogoChange={handleLogoChange}
        isLoading={isLoading}
      />

      {/* Main Card with Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <div className="flex space-x-6">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General Information
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* GENERAL INFORMATION TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-md font-medium text-gray-700 mb-3 pb-1 border-b border-gray-200 flex items-center">
                <HiOutlineHome className="w-5 h-5 mr-2 text-indigo-500" />
                General Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                    {errors.address && (
                      <span className="text-red-500 text-xs ml-2">{errors.address}</span>
                    )}
                  </label>
                  <div className="flex items-start border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
                    <div className="px-3 bg-gray-50 py-3 border-r border-gray-300">
                      <HiOutlineMap className="w-5 h-5 text-gray-400" />
                    </div>
                    <textarea 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      rows="3" 
                      className={`flex-1 px-3 py-2 focus:outline-none ${errors.address ? 'border-red-500' : ''}`}
                      placeholder="Jl. Raya No 10, Kelurahan, Kecamatan"
                      required
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                    {errors.country && (
                      <span className="text-red-500 text-xs ml-2">{errors.country}</span>
                    )}
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
                    <div className="px-3 bg-gray-50 py-2 border-r border-gray-300">
                      <HiOutlineGlobeAlt className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="country" 
                      value={formData.country} 
                      onChange={handleChange} 
                      className={`flex-1 px-3 py-2 focus:outline-none ${errors.country ? 'border-red-500' : ''}`}
                      placeholder="e.g., Indonesia"
                      required
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                    {errors.city && (
                      <span className="text-red-500 text-xs ml-2">{errors.city}</span>
                    )}
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
                    <div className="px-3 bg-gray-50 py-2 border-r border-gray-300">
                      <HiOutlineBuildingOffice2 className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange} 
                      className={`flex-1 px-3 py-2 focus:outline-none ${errors.city ? 'border-red-500' : ''}`}
                      placeholder="e.g., Bandung"
                      required
                    />
                  </div>
                </div>

                {/* ZIP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                    {errors.zip && (
                      <span className="text-red-500 text-xs ml-2">{errors.zip}</span>
                    )}
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
                    <div className="px-3 bg-gray-50 py-2 border-r border-gray-300">
                      <HiOutlineTag className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="zip" 
                      value={formData.zip} 
                      onChange={handleChange} 
                      className={`flex-1 px-3 py-2 focus:outline-none ${errors.zip ? 'border-red-500' : ''}`}
                      placeholder="e.g., 40123"
                      required
                    />
                  </div>
                </div>

                {/* Company ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company ID *
                    {errors.companyId && (
                      <span className="text-red-500 text-xs ml-2">{errors.companyId}</span>
                    )}
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
                    <div className="px-3 bg-gray-50 py-2 border-r border-gray-300">
                      <HiOutlineCreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="companyId" 
                      value={formData.companyId} 
                      onChange={handleChange} 
                      className={`flex-1 px-3 py-2 focus:outline-none ${errors.companyId ? 'border-red-500' : ''}`}
                      placeholder="e.g., VC-001"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                    {errors.phone && (
                      <span className="text-red-500 text-xs ml-2">{errors.phone}</span>
                    )}
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
                    <div className="px-3 bg-gray-50 py-2 border-r border-gray-300">
                      <HiOutlinePhone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className={`flex-1 px-3 py-2 focus:outline-none ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="e.g., 021-1234567"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                    {errors.email && (
                      <span className="text-red-500 text-xs ml-2">{errors.email}</span>
                    )}
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
                    <div className="px-3 bg-gray-50 py-2 border-r border-gray-300">
                      <HiOutlineEnvelope className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className={`flex-1 px-3 py-2 focus:outline-none ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="e.g., info@vancourse.com"
                      required
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent overflow-hidden">
                    <div className="px-3 bg-gray-50 py-2 border-r border-gray-300">
                      <HiOutlineLink className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="url" 
                      name="website" 
                      value={formData.website} 
                      onChange={handleChange} 
                      className="flex-1 px-3 py-2 focus:outline-none"
                      placeholder="e.g., https://vancourse.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/companies')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : 'Update Company'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditCompany;