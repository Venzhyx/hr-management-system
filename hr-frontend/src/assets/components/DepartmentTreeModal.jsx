import React, { useState } from 'react';
import { 
  HiOutlineXMark,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineUser
} from 'react-icons/hi2';
import { HiOutlineOfficeBuilding as HiOutlineOfficeBuildingOld } from 'react-icons/hi';

const DepartmentTreeNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative">
      {/* Garis vertikal untuk koneksi */}
      {level > 0 && (
        <div 
          className="absolute left-[-20px] top-0 bottom-0 w-px bg-gray-300"
          style={{ left: `${level * 20 - 20}px` }}
        />
      )}
      
      {/* Node container */}
      <div className="relative">
        {/* Garis horizontal ke node */}
        {level > 0 && (
          <div 
            className="absolute top-5 w-5 h-px bg-gray-300"
            style={{ left: `${level * 20 - 20}px` }}
          />
        )}
        
        <div 
          className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* Toggle button untuk child */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 p-1 hover:bg-gray-200 rounded-md transition-colors"
            >
              {isExpanded ? (
                <HiOutlineChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <HiOutlineChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6" /> // Spacer
          )}

          {/* Department card */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <HiOutlineOfficeBuilding className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{node.departmentName}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    {node.company && (
                      <div className="flex items-center text-xs text-gray-500">
                        <HiOutlineOfficeBuildingOld className="w-3 h-3 mr-1" />
                        {node.company.companyName}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <HiOutlineUsers className="w-3 h-3 mr-1" />
                      {node.employees?.length || 0} employees
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Manager info */}
            {node.managerName && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center text-sm">
                <HiOutlineUser className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Manager: {node.managerName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render children jika expanded */}
      {isExpanded && hasChildren && (
        <div className="mt-1">
          {node.children.map((child) => (
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

const DepartmentTreeModal = ({ isOpen, onClose, departments }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <HiOutlineBuildingOffice2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Organization Structure
                  </h3>
                  <p className="text-sm text-gray-500">
                    Department hierarchy tree view
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {departments.length === 0 ? (
                <div className="text-center py-12">
                  <HiOutlineOfficeBuilding className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No departments found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <DepartmentTreeNode key={dept.id} node={dept} level={0} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentTreeModal;