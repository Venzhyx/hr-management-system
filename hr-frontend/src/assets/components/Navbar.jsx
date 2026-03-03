import React, { useState, useEffect, useRef } from 'react';
import { 
  HiOutlineBell, 
  HiOutlineMenu,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineCalendar
} from 'react-icons/hi';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'leave',
      title: 'Leave Request',
      message: 'Jakir Hossen requested 3 days leave',
      time: '5 minutes ago',
      read: false,
      icon: <HiOutlineBriefcase className="w-5 h-5 text-blue-500" />,
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      type: 'attendance',
      title: 'Late Check-in',
      message: 'Eleanor Pena checked in 15 minutes late',
      time: '25 minutes ago',
      read: false,
      icon: <HiOutlineClock className="w-5 h-5 text-orange-500" />,
      bgColor: 'bg-orange-100'
    },
    {
      id: 3,
      type: 'birthday',
      title: 'Birthday Today',
      message: 'Guy Hawkins is celebrating birthday today',
      time: '1 hour ago',
      read: true,
      icon: <HiOutlineCalendar className="w-5 h-5 text-purple-500" />,
      bgColor: 'bg-purple-100'
    },
    {
      id: 4,
      type: 'approval',
      title: 'Reimbursement Approved',
      message: 'Jenny Wilson\'s reimbursement request was approved',
      time: '2 hours ago',
      read: true,
      icon: <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />,
      bgColor: 'bg-green-100'
    },
    {
      id: 5,
      type: 'rejected',
      title: 'Overtime Rejected',
      message: 'Arlene McCoy\'s overtime request was rejected',
      time: '3 hours ago',
      read: true,
      icon: <HiOutlineXCircle className="w-5 h-5 text-red-500" />,
      bgColor: 'bg-red-100'
    }
  ]);

  const notificationRef = useRef(null);
  const buttonRef = useRef(null);

  // Hitung jumlah notifikasi belum dibaca
  const unreadCount = notifications.filter(n => !n.read).length;

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update tanggal
  useEffect(() => {
    const now = new Date();
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    setCurrentDate(`Hari ini ${day}, ${date} ${month} ${year}`);
  }, []);

  // Update page title berdasarkan path
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/dashboard' || path === '/') {
      setPageTitle('Dashboard');
    } else if (path === '/employees') {
      setPageTitle('Employees');
    } else if (path === '/departments') {
      setPageTitle('Departments');
    } else if (path === '/attendance') {
      setPageTitle('Attendance');
    } else if (path === '/timeoff') {
      setPageTitle('Time Off');
    } else if (path === '/payroll') {
      setPageTitle('Payroll');
    } else if (path === '/reimbursement') {
      setPageTitle('Reimbursement');
    } else if (path === '/settings') {
      setPageTitle('Settings');
    } else if (path === '/profile') {
      setPageTitle('Profile');
    } else if (path === '/help') {
      setPageTitle('Help & Support');
    } else {
      setPageTitle('PeopleFlow');
    }
  }, [location]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Daftar hari dalam bahasa Indonesia
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  // Daftar bulan dalam bahasa Indonesia
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <nav 
      className={`fixed top-0 right-0 lg:left-64 h-20 z-30 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-xl' 
          : 'bg-white border-b border-gray-200 shadow-sm'
      }`}
    >
      {/* Background blur layer - hanya muncul saat scroll */}
      {isScrolled && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-50/30 via-white/30 to-purple-50/30 backdrop-blur-xl"></div>
      )}
      
      <div className="h-full px-8 flex items-center justify-between relative z-10">
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <HiOutlineMenu className="w-7 h-7" />
          </button>

          <div>
            <h2 className={`text-2xl font-bold transition-all duration-300 ${
              isScrolled ? 'text-gray-900 drop-shadow-sm' : 'text-gray-800'
            }`}>
              {pageTitle}
            </h2>
            <p className={`text-base transition-all duration-300 ${
              isScrolled ? 'text-gray-700' : 'text-gray-500'
            }`}>
              {currentDate}
            </p>
          </div>
        </div>

        <div className="flex items-center relative">
          {/* Notification Bell */}
          <button 
            ref={buttonRef}
            onClick={toggleNotifications}
            className={`relative transition-all duration-300 p-2 rounded-lg ${
              isScrolled 
                ? 'text-gray-700 hover:text-indigo-600 hover:bg-white/50' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
            } focus:outline-none`}
          >
            <HiOutlineBell className="w-7 h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel - juga dengan efek glass */}
          {showNotifications && (
            <div 
              ref={notificationRef}
              className="absolute top-full right-0 mt-2 w-96 bg-white/90 backdrop-blur-xl rounded-xl border border-white/30 shadow-2xl overflow-hidden z-50 animate-fadeIn"
            >
              {/* Header dengan efek glass */}
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-50/80 via-white/80 to-purple-50/80 backdrop-blur-sm border-b border-white/30 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <div className="flex space-x-2">
                  {notifications.length > 0 && (
                    <>
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-white/50 transition-colors"
                      >
                        Mark all read
                      </button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={clearAll}
                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-white/50 transition-colors"
                      >
                        Clear all
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto bg-white/50 backdrop-blur-sm">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`px-4 py-3 border-b border-white/30 last:border-0 hover:bg-white/60 transition-all duration-200 cursor-pointer ${
                        !notif.read ? 'bg-indigo-50/50' : ''
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 ${notif.bgColor} rounded-lg flex items-center justify-center shadow-sm`}>
                          {notif.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-900">
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <HiOutlineBell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>

              {/* Footer dengan efek glass */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 backdrop-blur-sm border-t border-white/30 text-center">
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;