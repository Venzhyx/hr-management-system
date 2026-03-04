import React, { useState, useEffect } from 'react';
import { 
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineSortAscending,
  HiOutlineSortDescending,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamation,
  HiOutlineRefresh           
} from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { useDepartment } from '../../../redux/hooks/useDepartment';
import { useEmployee } from '../../../redux/hooks/useEmployee';
import { useCompany } from '../../../redux/hooks/useCompany'; // ✅ Import useCompany
import DepartmentTreeModal from '../../components/DepartmentTreeModal';

const DepartmentsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'departmentName', direction: 'asc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // State untuk department tree modal
  const [showDepartmentTree, setShowDepartmentTree] = useState(false);
  
  // PAKAI REDUX HOOK
  const {
    departments,
    loading: deptLoading,
    deleteDepartment,
    fetchDepartments
  } = useDepartment();

  // AMBIL EMPLOYEES DARI REDUX
  const {
    employees,
    loading: empLoading
  } = useEmployee();

  // ✅ AMBIL COMPANIES DARI REDUX
  const {
    companies,
    loading: companyLoading
  } = useCompany();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
  fetchDepartments();
}, []);
  // Helper untuk dapat manager berdasarkan ID
  const getManager = (managerId) => {
    return employees.find(emp => emp.id === managerId);
  };

  // ✅ Helper untuk dapat company berdasarkan ID
  const getCompany = (companyId) => {
    return companies.find(comp => comp.id === companyId);
  };

  // ✅ Build department hierarchy for tree view
  const buildDepartmentHierarchy = () => {
    const deptMap = new Map();
    const rootDepts = [];

    // Buat semua node department
    departments.forEach(dept => {
      deptMap.set(dept.id, {
        ...dept,
        children: [],
        employees: employees.filter(emp => emp.departmentId === dept.id),
        company: getCompany(dept.companyId)
      });
    });

    // Bangun hierarki berdasarkan parentId
    departments.forEach(dept => {
      if (dept.parentDepartmentId && deptMap.has(dept.parentDepartmentId)) {
        const parent = deptMap.get(dept.parentDepartmentId);
        parent.children.push(deptMap.get(dept.id));
      } else {
        rootDepts.push(deptMap.get(dept.id));
      }
    });

    return rootDepts;
  };

  // Toast auto hide
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter data based on search only
  const filteredData = departments.filter(item => {
    const company = getCompany(item.companyId);
    return item.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.managerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.field] || '';
    const bValue = b[sortConfig.field] || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };
const handleViewDetails = (department) => {
  navigate(`/departments/detail/${department.id}`);
}
const handleEdit = (department) => {
  navigate('/departments/edit', { state: { department } });
};

  // DELETE FUNCTION DENGAN MODAL
  const handleDeleteClick = (department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleConfirmDelete = async () => {
    if (selectedDepartment) {
      try {
        await deleteDepartment(selectedDepartment.id).unwrap();
        setShowDeleteModal(false);
        setSelectedDepartment(null);
        document.body.style.overflow = 'unset';
        setToast({
          show: true,
          message: `Department "${selectedDepartment.departmentName}" deleted successfully`,
          type: 'success'
        });
      } catch (error) {
        setToast({
          show: true,
          message: error?.message || 'Failed to delete department',
          type: 'error'
        });
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedDepartment(null);
    document.body.style.overflow = 'unset';
  };

  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field) return <HiOutlineSortAscending className="w-3 h-3 ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <HiOutlineSortAscending className="w-3 h-3 ml-1 text-indigo-600" />
      : <HiOutlineSortDescending className="w-3 h-3 ml-1 text-indigo-600" />;
  };

  // STATS
  const stats = {
    total: departments.length,
    totalEmployees: employees.length
  };

  // LOADING STATE
  if (deptLoading || empLoading || companyLoading) {
    return (
      <div className="w-full px-4 md:px-6 py-6 flex justify-center items-center h-64">
        <div className="text-gray-400">Loading departments...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 py-6 space-y-6 relative">
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
            onClick={() => setToast({ show: false, message: '', type: '' })}
            className={`flex-shrink-0 ${
              toast.type === 'success' 
                ? 'text-green-600 hover:text-green-800' 
                : 'text-red-600 hover:text-red-800'
            }`}
          >
            <HiOutlineXCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Departments</h1>
          <p className="text-gray-500 mt-1">Manage your departments and organizational structure</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Departments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Departments</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <HiOutlineOfficeBuilding className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            All departments in organization
          </div>
        </div>

        {/* Total Employees */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <HiOutlineUsers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Employees across all departments
          </div>
        </div>
      </div>

      {/* Search Bar dengan Tombol Department Tree */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center shadow-sm">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search departments by name, manager or company..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-transparent focus:outline-none text-base"
          />
        </div>
        
        {/* TOMBOL DEPARTMENT TREE */}
        <button 
          onClick={() => setShowDepartmentTree(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors ml-2 border border-indigo-200"
        >
          <HiOutlineOfficeBuilding className="w-5 h-5" />
          <span className="text-sm font-medium">Organization Chart</span>
        </button>
      </div>

      {/* Departments List Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Departments List</h2>
            <p className="text-sm text-gray-500 mt-1">{sortedData.length} total departments</p>
          </div>
          
          {/* TOMBOL ADD */}
          <Link
            to="/departments/add"
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#4361EE] text-white rounded-lg hover:bg-[#3651d4] transition-colors text-base shadow-sm"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>Add Department</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                  onClick={() => handleSort('departmentName')}
                >
                  <div className="flex items-center">
                    DEPARTMENT NAME
                    <SortIcon field="departmentName" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                  onClick={() => handleSort('companyName')}
                >
                  <div className="flex items-center">
                    COMPANY
                    <SortIcon field="companyName" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                  onClick={() => handleSort('managerName')}
                >
                  <div className="flex items-center">
                    MANAGER
                    <SortIcon field="managerName" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  PARENT DEPT
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((dept) => {
                const manager = getManager(dept.managerId);
                const company = getCompany(dept.companyId);
                const parentDept = departments.find(d => d.id === dept.parentDepartmentId);
                
                return (
                  <tr 
                    key={dept.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleViewDetails(dept)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                          <HiOutlineOfficeBuilding className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <span className="text-base font-medium text-gray-900">{dept.departmentName}</span>
                          {parentDept && (
                            <p className="text-xs text-gray-400 mt-1">Sub-dept of: {parentDept.departmentName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-600">{company?.companyName || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm mr-2">
                          {manager?.photo ? (
                            <img
                              src={manager.photo}
                              alt={dept.managerName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                              {dept.managerName?.split(' ').map(n => n[0]).join('') || 'NA'}
                            </div>
                          )}
                        </div>
                        <span className="text-base text-gray-600">{dept.managerName || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-600">{parentDept?.departmentName || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(dept);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded hover:bg-indigo-50 transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(dept);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(dept);
                          }}
                          className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center">
                      <HiOutlineOfficeBuilding className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-base">No departments found</p>
                      <p className="text-sm text-gray-300 mt-1">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sortedData.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(startIndex + itemsPerPage, sortedData.length)}</span> of{' '}
              <span className="font-medium">{sortedData.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === i + 1
                      ? 'bg-[#4361EE] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedDepartment && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCancelDelete}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <HiOutlineExclamation className="w-5 h-5 text-red-500 mr-2" />
                Confirm Delete
              </h3>
              <button 
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HiOutlineXCircle className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body Modal */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <HiOutlineTrash className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-700">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-gray-900">{selectedDepartment.departmentName}</span>?
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <span className="font-medium">Warning:</span> All employees and sub-departments will be affected.
              </p>
            </div>
            
            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm flex items-center"
              >
                <HiOutlineTrash className="w-4 h-4 mr-2" />
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENT TREE MODAL */}
      <DepartmentTreeModal
        isOpen={showDepartmentTree}
        onClose={() => setShowDepartmentTree(false)}
        departments={buildDepartmentHierarchy()}
      />
    </div>
  );
};

export default DepartmentsList;