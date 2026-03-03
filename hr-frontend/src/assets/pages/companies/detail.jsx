import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ FIX: Import useNavigate
import { 
  HiOutlineXMark,
  HiOutlineBuildingOffice2,
  HiOutlineGlobeAlt,
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineLink,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePhoto,
  HiOutlinePencil,
  HiOutlineExclamationCircle
} from 'react-icons/hi2';
import API from "../../../api/api";

// ==================== SUB COMPONENTS ====================
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
    <p className="text-sm text-gray-500">Loading company details...</p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="bg-red-100 rounded-full p-3 mb-4">
      <HiOutlineExclamationCircle className="w-8 h-8 text-red-600" />
    </div>
    <p className="text-sm text-gray-700 mb-2">{message || 'Failed to load company data'}</p>
    <button 
      onClick={onRetry}
      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
    >
      Try again
    </button>
  </div>
);

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start space-x-3">
    {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />}
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 break-words">{value || '-'}</p>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const CompanyDetailModal = ({ isOpen, onClose, companyId }) => {
  const navigate = useNavigate(); // ✅ FIX: Gunakan useNavigate
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch company data when modal opens
  useEffect(() => {
    if (isOpen && companyId) {
      fetchCompanyDetail();
    }
  }, [isOpen, companyId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCompany(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchCompanyDetail = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await API.get(`/companies/${companyId}`);
      
      if (response.data.success) {
        setCompany(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load company data');
      }
    } catch (err) {
      console.error('Fetch company detail failed:', err);
      setError(err.response?.data?.message || 'Failed to load company data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle edit navigation
  const handleEdit = () => {
    onClose();
    navigate(`/companies/edit/${companyId}`); // ✅ FIX:yhh Gunakan navigate, bukan window.location
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={handleOverlayClick}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          {/* Modal Content */}
          <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <HiOutlineBuildingOffice2 className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                  Company Details
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorState message={error} onRetry={fetchCompanyDetail} />
              ) : company ? (
                <div className="space-y-8">
                  {/* ✅ FIX: Logo Section - pakai logo, bukan logoUrl */}
                  {company.logo && (
                    <div className="flex justify-center sm:justify-start">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-indigo-100 shadow-md bg-gray-50">
                        <img 
                          src={company.logo} 
                          alt={company.companyName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* ✅ FIX: Basic Information - hanya field yang ada di entity */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                      <HiOutlineBuildingOffice2 className="w-4 h-4 mr-2 text-indigo-500" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InfoRow 
                        label="Company ID" 
                        value={company.companyId} 
                        icon={HiOutlineTag}
                      />
                      <InfoRow 
                        label="Company Name" 
                        value={company.companyName} 
                        icon={HiOutlineBuildingOffice2}
                      />
                      <InfoRow 
                        label="Email" 
                        value={company.email} 
                        icon={HiOutlineEnvelope}
                      />
                      <InfoRow 
                        label="Phone" 
                        value={company.phone} 
                        icon={HiOutlinePhone}
                      />
                      <InfoRow 
                        label="Website" 
                        value={company.website} 
                        icon={HiOutlineLink}
                      />
                    </div>
                  </div>

                  {/* ✅ FIX: Address Information - sesuai entity */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                      <HiOutlineMapPin className="w-4 h-4 mr-2 text-green-500" />
                      Address Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <InfoRow 
                          label="Address" 
                          value={company.address} 
                          icon={HiOutlineMapPin}
                        />
                      </div>
                      <InfoRow 
                        label="City" 
                        value={company.city} 
                        icon={HiOutlineBuildingOffice2}
                      />
                      <InfoRow 
                        label="Country" 
                        value={company.country} 
                        icon={HiOutlineGlobeAlt}
                      />
                      <InfoRow 
                        label="ZIP Code" 
                        value={company.zip} 
                        icon={HiOutlineTag}
                      />
                    </div>
                  </div>

                  {/* ✅ FIX: Informasi Tambahan */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                      <HiOutlineTag className="w-4 h-4 mr-2 text-purple-500" />
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Created At</p>
                        <p className="text-sm text-gray-900">
                          {company.createdAt ? new Date(company.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                        <p className="text-sm text-gray-900">
                          {company.updatedAt ? new Date(company.updatedAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleEdit} // ✅ FIX: Pakai handleEdit
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center"
              >
                <HiOutlinePencil className="w-4 h-4 mr-2" />
                Edit Companies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailModal;