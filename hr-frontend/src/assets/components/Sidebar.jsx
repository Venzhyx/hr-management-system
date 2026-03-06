import React, { useState } from 'react';
import { 
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineClock,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineReceiptRefund,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle,
  HiOutlineLogout,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineClipboardCheck,
  HiOutlineLibrary,
} from 'react-icons/hi';
import { NavLink, useNavigate } from 'react-router-dom';
import companyLogo from '../images/ABE.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const mainMenuItems = [
    { name: 'Dashboard',     icon: <HiOutlineHome className="w-5 h-5" />,             path: '/dashboard' },
    { name: 'Employees',     icon: <HiOutlineUsers className="w-5 h-5" />,            path: '/employees' },
    { name: 'Departments',   icon: <HiOutlineOfficeBuilding className="w-5 h-5" />,   path: '/departments' },
    { name: 'Company',       icon: <HiOutlineOfficeBuilding className="w-5 h-5" />,   path: '/companies' },
    { name: 'Attendance',    icon: <HiOutlineClock className="w-5 h-5" />,            path: '/attendance' },
    { name: 'Time Off',      icon: <HiOutlineBriefcase className="w-5 h-5" />,        path: '/timeoff' },
    { name: 'Payroll',       icon: <HiOutlineCurrencyDollar className="w-5 h-5" />,   path: '/payroll' },
    { name: 'Reimbursement', icon: <HiOutlineReceiptRefund className="w-5 h-5" />,    path: '/reimbursement' },
    { name: 'Approvals',     icon: <HiOutlineClipboardCheck className="w-5 h-5" />,   path: '/approvals' },
    { name: 'Account',       icon: <HiOutlineLibrary className="w-5 h-5" />,          path: '/account' },
  ];

  const bottomMenuItems = [
    { name: 'Settings',     icon: <HiOutlineCog className="w-5 h-5" />,                path: '/settings' },
    { name: 'Help & Support', icon: <HiOutlineQuestionMarkCircle className="w-5 h-5" />, path: '/help' },
  ];

  const profileMenuItems = [
    { name: 'Profile', icon: <HiOutlineUser className="w-5 h-5" />,    path: '/profile' },
    { name: 'Logout',  icon: <HiOutlineLogout className="w-5 h-5" />,  action: 'logout' },
  ];

  const handleLogout = () => {
    console.log('Logout');
    navigate('/login');
  };

  const handleProfileAction = (item) => {
    if (item.action === 'logout') {
      handleLogout();
    } else {
      navigate(item.path);
    }
    setIsProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out z-50">
      {/* Logo Perusahaan */}
      <div className="px-6 py-5 border-gray-200 flex justify-center group">
        <div className="w-20 h-20 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
          <img 
            src={companyLogo} 
            alt="Company Logo" 
            className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-80"
          />
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {mainMenuItems.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={{ animationDelay: `${index * 0.05}s` }}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-md'
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-all duration-300 ${
                  isActive 
                    ? 'text-indigo-600 scale-110' 
                    : 'text-gray-500 group-hover:text-indigo-600 group-hover:scale-110'
                }`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Menu (Settings & Help) */}
      <div className="border-t border-gray-200 pt-4">
        <nav className="px-4 space-y-1">
          {bottomMenuItems.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.path}
              style={{ animationDelay: `${index * 0.05}s` }}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-md'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-all duration-300 ${
                    isActive 
                      ? 'text-indigo-600 scale-110' 
                      : 'text-gray-500 group-hover:text-indigo-600 group-hover:scale-110'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile Section dengan Dropdown */}
        <div className="px-4 mt-4 relative">
          {/* Profile Button */}
          <button
            onClick={toggleProfileMenu}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50 transition-all duration-300 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-200">
                AN
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors duration-300">
                  Admin New
                </p>
                <p className="text-xs text-gray-500 truncate group-hover:text-indigo-400 transition-colors duration-300">
                  HR
                </p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-indigo-600">
              {isProfileMenuOpen ? (
                <HiOutlineChevronUp className="w-4 h-4" />
              ) : (
                <HiOutlineChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden animate-fadeIn">
              {profileMenuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleProfileAction(item)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition-colors duration-200 text-left"
                >
                  <span className={`${
                    item.name === 'Logout' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {item.icon}
                  </span>
                  <span className={`text-sm font-medium ${
                    item.name === 'Logout' ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
