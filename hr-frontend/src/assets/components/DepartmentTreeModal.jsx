import React, { useState, useEffect } from 'react';
import { 
  HiOutlineXMark,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineBriefcase
} from 'react-icons/hi2';
import { HiOutlineOfficeBuilding as HiOutlineOfficeBuildingOld } from 'react-icons/hi';

// ==================== PREMIUM TREE NODE COMPONENT ====================
const DepartmentTreeNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  // Warna berbeda untuk tiap level
  const levelColors = [
    'bg-indigo-50 border-indigo-200',
    'bg-blue-50 border-blue-200',
    'bg-cyan-50 border-cyan-200',
    'bg-sky-50 border-sky-200',
    'bg-teal-50 border-teal-200'
  ];

  const levelColor = levelColors[level % levelColors.length];
  const iconColors = [
    'text-indigo-600',
    'text-blue-600',
    'text-cyan-600',
    'text-sky-600',
    'text-teal-600'
  ];
  const iconColor = iconColors[level % iconColors.length];

  return (
    <div className="relative">
      {/* Garis vertikal untuk koneksi - lebih soft */}
      {level > 0 && (
        <div 
          className="absolute left-[-20px] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 to-transparent"
          style={{ left: `${level * 24 - 20}px` }}
        />
      )}
      
      {/* Node container */}
      <div className="relative">
        {/* Garis horizontal ke node - lebih soft */}
        {level > 0 && (
          <div 
            className="absolute top-6 w-5 h-px bg-gradient-to-r from-indigo-200 to-transparent"
            style={{ left: `${level * 24 - 20}px` }}
          />
        )}
        
        <div 
          className="flex items-start space-x-2 transition-all duration-200"
          style={{ marginLeft: `${level * 24}px` }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Toggle button dengan animasi */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`mt-3 p-1.5 rounded-lg transition-all duration-200 ${
                isHovered 
                  ? 'bg-indigo-100 text-indigo-700 scale-110' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {isExpanded ? (
                <HiOutlineChevronDown className="w-4 h-4" />
              ) : (
                <HiOutlineChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-9 h-9" /> // Spacer lebih besar untuk alignment
          )}

          {/* Department card - PREMIUM */}
          <div className={`flex-1 rounded-xl border-2 transition-all duration-300 ${
            isHovered 
              ? `${levelColor} shadow-lg scale-[1.02] border-indigo-300` 
              : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
          }`}>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Icon dengan background gradient */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${levelColor} flex items-center justify-center shadow-inner`}>
                    <HiOutlineOfficeBuildingOld className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{node.departmentName}</h4>
                    
                    {/* Info chips */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {node.company && (
                        <div className="flex items-center px-2 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                          <HiOutlineOfficeBuildingOld className="w-3 h-3 mr-1 text-indigo-500" />
                          <span className="text-xs font-medium text-gray-700">{node.company.companyName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center px-2 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                        <HiOutlineUsers className="w-3 h-3 mr-1 text-emerald-500" />
                        <span className="text-xs font-medium text-gray-700">
                          {node.employees?.length || 0} employees
                        </span>
                      </div>

                      {node.parentDepartmentName && (
                        <div className="flex items-center px-2 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                          <HiOutlineBriefcase className="w-3 h-3 mr-1 text-amber-500" />
                          <span className="text-xs font-medium text-gray-700">Sub Dept</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Employee count badge - premium */}
                {node.employees?.length > 0 && (
                  <div className="flex items-center space-x-1 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                    <HiOutlineUserGroup className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-700">
                      {node.employees.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Manager info dengan card terpisah */}
              {node.managerName && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                  <div className="flex items-center bg-gradient-to-r from-amber-50 to-transparent p-2 rounded-lg">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                      <HiOutlineUser className="w-3 h-3 text-amber-600" />
                    </div>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Manager:</span> {node.managerName}
                    </span>
                  </div>
                </div>
              )}

              {/* Child count indicator */}
              {hasChildren && (
                <div className="mt-2 text-xs text-gray-400 flex items-center">
                  <div className="w-1 h-1 bg-gray-300 rounded-full mr-1"></div>
                  {node.children.length} sub-department{node.children.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children dengan animasi */}
      {isExpanded && hasChildren && (
        <div className="mt-2 ml-4 animate-fadeIn">
          {node.children.map((child, index) => (
            <DepartmentTreeNode
              key={child.id}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== MAIN MODAL COMPONENT ====================
const DepartmentTreeModal = ({ isOpen, onClose, departments }) => {
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

  // Handle click outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Hitung total departments dan employees
  const countTotal = (depts) => {
    let totalDepts = depts.length;
    let totalEmployees = 0;
    
    const countRecursive = (nodes) => {
      nodes.forEach(node => {
        totalEmployees += node.employees?.length || 0;
        if (node.children?.length) {
          totalDepts += node.children.length;
          countRecursive(node.children);
        }
      });
    };
    
    countRecursive(depts);
    return { totalDepts, totalEmployees };
  };

  const totals = countTotal(departments);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto py-10"
      onClick={handleOverlayClick}
    >
      {/* Modal Content */}
      <div 
        className="bg-white rounded-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Sticky dengan gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
              <HiOutlineBuildingOffice2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Organization Structure
              </h2>
              <p className="text-sm text-indigo-100">
                Department hierarchy tree view
              </p>
            </div>
          </div>
          
          {/* Stats badges */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center space-x-2">
              <HiOutlineBuildingOffice2 className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{totals.totalDepts}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center space-x-2">
              <HiOutlineUsers className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{totals.totalEmployees}</span>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors ml-2 bg-white/10 hover:bg-white/20 rounded-lg p-1.5"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable dengan background soft */}
        <div 
          className="p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-white"
          style={{ maxHeight: 'calc(90vh - 140px)' }}
        >
          {departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-indigo-50 rounded-2xl p-6 mb-4">
                <HiOutlineBuildingOffice2 className="w-16 h-16 text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Departments Found</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                Get started by creating your first department. 
                Departments help organize your company structure.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {departments.map((dept, index) => (
                <DepartmentTreeNode key={dept.id} node={dept} level={0} />
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer - dengan informasi tambahan */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-1"></div>
              <span>Level 1</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span>Level 2</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-cyan-500 rounded-full mr-1"></div>
              <span>Level 3+</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentTreeModal;