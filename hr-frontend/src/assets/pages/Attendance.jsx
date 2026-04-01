import React, { useState, useEffect } from 'react';
import { 
  HiOutlineCheckCircle, 
  HiOutlineXCircle, 
  HiOutlineClock,
  HiOutlineBan,
  HiOutlinePencilAlt,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendar
} from 'react-icons/hi';

const AttendanceDashboard = () => {
  // State for current view date
  const [currentDate, setCurrentDate] = useState(new Date(2018, 6)); // July 2018
  const [selectedYear, setSelectedYear] = useState(2018);
  
  // Attendance summary data
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 24,
    absent: 0,
    lates: 3,
    leave: 2
  });
  
  // Dummy calendar data for July 1 - August 11, 2018
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Activity data for heatmap (like GitHub contributions)
  const [activityData, setActivityData] = useState([]);
  
  // Generate activity heatmap data (like GitHub contributions)
  useEffect(() => {
    // Generate 52 weeks of activity data
    const weeks = [];
    const startDate = new Date(2018, 0, 1); // Start from Jan 1, 2018
    
    for (let week = 0; week < 52; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (week * 7) + day);
        
        // Generate random activity level (0-4)
        // 0: no activity, 4: very high activity
        let level = 0;
        const month = date.getMonth();
        
        // Make it look like real data with patterns
        if (month >= 3 && month <= 8) { // Apr - Sep (busy months)
          if (Math.random() > 0.3) {
            level = Math.floor(Math.random() * 4) + 1;
          }
        } else if (month >= 9 && month <= 11) { // Oct - Dec
          if (Math.random() > 0.5) {
            level = Math.floor(Math.random() * 3) + 1;
          }
        } else { // Jan - Mar
          if (Math.random() > 0.6) {
            level = Math.floor(Math.random() * 2) + 1;
          }
        }
        
        // Add some specific patterns based on the original data
        const dateStr = date.toISOString().split('T')[0];
        if (dateStr >= '2018-04-01' && dateStr <= '2018-10-31') {
          // For the months shown in original, make data consistent
          const dayOfMonth = date.getDate();
          if (dayOfMonth <= 27) {
            // Match the pattern from original: 100, 102, 103, etc.
            const baseValue = [100, 102, 103, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150][dayOfMonth - 1];
            if (baseValue >= 140) level = 4;
            else if (baseValue >= 120) level = 3;
            else if (baseValue >= 110) level = 2;
            else if (baseValue > 100) level = 1;
            else level = 0;
          } else {
            level = Math.floor(Math.random() * 3) + 1;
          }
        }
        
        days.push({
          date: date,
          dateStr,
          level,
          value: level === 0 ? 0 : (level * 25) + 75 // Convert level to actual value
        });
      }
      weeks.push(days);
    }
    
    setActivityData(weeks);
  }, []);
  
  // Generate calendar data for July 1 - August 11, 2018
  useEffect(() => {
    const days = [];
    const startDate = new Date(2018, 6, 1); // July 1, 2018
    const endDate = new Date(2018, 7, 11); // August 11, 2018
    
    // Dummy attendance status for each date
    const attendanceStatus = {
      '2018-07-01': 'weekend',
      '2018-07-02': 'present',
      '2018-07-03': 'absent',
      '2018-07-04': 'present',
      '2018-07-05': 'present',
      '2018-07-06': 'present',
      '2018-07-07': 'present',
      '2018-07-08': 'weekend',
      '2018-07-09': 'present',
      '2018-07-10': 'present',
      '2018-07-11': 'present',
      '2018-07-12': 'present',
      '2018-07-13': 'present',
      '2018-07-14': 'present',
      '2018-07-15': 'weekend',
      '2018-07-16': 'present',
      '2018-07-17': 'present',
      '2018-07-18': 'present',
      '2018-07-19': 'present',
      '2018-07-20': 'present',
      '2018-07-21': 'present',
      '2018-07-22': 'weekend',
      '2018-07-23': 'present',
      '2018-07-24': 'present',
      '2018-07-25': 'present',
      '2018-07-26': 'absent',
      '2018-07-27': 'present',
      '2018-07-28': 'present',
      '2018-07-29': 'weekend',
      '2018-07-30': 'present',
      '2018-07-31': 'present',
      '2018-08-01': 'present',
      '2018-08-02': 'present',
      '2018-08-03': 'present',
      '2018-08-04': 'present',
      '2018-08-05': 'weekend',
      '2018-08-06': 'present',
      '2018-08-07': 'present',
      '2018-08-08': 'present',
      '2018-08-09': 'present',
      '2018-08-10': 'present',
      '2018-08-11': 'present',
    };
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let status = attendanceStatus[dateStr] || 'present';
      if (isWeekend && !attendanceStatus[dateStr]) {
        status = 'weekend';
      }
      
      days.push({
        date: new Date(d),
        dateStr,
        day: d.getDate(),
        month: d.getMonth(),
        status,
        events: []
      });
    }
    
    setCalendarDays(days);
  }, []);
  
  // Format date range display
  const formatDateRange = () => {
    return `Jul 1 - Aug 11, 2018`;
  };
  
  // Get status color and icon
  const getStatusStyle = (status) => {
    switch(status) {
      case 'present':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: HiOutlineCheckCircle, label: 'Attend' };
      case 'absent':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: HiOutlineXCircle, label: 'Non Present' };
      case 'weekend':
        return { bg: 'bg-gray-100', text: 'text-gray-500', icon: null, label: 'Weekend' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', icon: null, label: '' };
    }
  };
  
  // Get color for activity level (like GitHub)
  const getActivityColor = (level) => {
    switch(level) {
      case 0: return 'bg-gray-100 hover:bg-gray-200';
      case 1: return 'bg-green-100 hover:bg-green-200';
      case 2: return 'bg-green-300 hover:bg-green-400';
      case 3: return 'bg-green-500 hover:bg-green-600';
      case 4: return 'bg-green-700 hover:bg-green-800';
      default: return 'bg-gray-100';
    }
  };
  
  // Group days by week for calendar
  const getWeeks = () => {
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < calendarDays.length; i++) {
      const day = calendarDays[i];
      const dayOfWeek = day.date.getDay();
      
      if (dayOfWeek === 1 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      if (i === calendarDays.length - 1 && currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
    }
    
    return weeks;
  };
  
  const weeks = getWeeks();
  
  // Month labels for heatmap (Jan - Dec)
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Mon', 'Wed', 'Fri']; // Show fewer day labels
  
  return (
    <div className="w-full px-4 md:px-6 py-6 space-y-6">
      {/* Header with date range */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Working Time: 8hrs (8am - 4pm)
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
          <HiOutlinePencilAlt className="w-4 h-4" />
          <span className="text-sm font-medium">Request To Change</span>
        </button>
      </div>
      
      {/* Two Cards Row: Attendance Summary and Activity (GitHub style) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Attendance Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Present */}
              <div className="text-center p-4 rounded-lg bg-green-50">
                <div className="flex justify-center mb-2">
                  <HiOutlineCheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-700">{attendanceSummary.present}</div>
                <div className="text-sm text-green-600 font-medium">Present</div>
              </div>
              
              {/* Absent */}
              <div className="text-center p-4 rounded-lg bg-red-50">
                <div className="flex justify-center mb-2">
                  <HiOutlineXCircle className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-700">{attendanceSummary.absent}</div>
                <div className="text-sm text-red-600 font-medium">Absent</div>
              </div>
              
              {/* Lates */}
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <div className="flex justify-center mb-2">
                  <HiOutlineClock className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-700">{attendanceSummary.lates}</div>
                <div className="text-sm text-yellow-600 font-medium">Lates</div>
              </div>
              
              {/* Leave */}
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <div className="flex justify-center mb-2">
                  <HiOutlineBan className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-700">{attendanceSummary.leave}</div>
                <div className="text-sm text-purple-600 font-medium">Leave</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Activity Card - GitHub style heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Activity Overview</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-gray-500">Less</span>
                <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-100 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                <span className="text-gray-500 ml-1">More</span>
              </div>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={2018}>2018</option>
                <option value={2019}>2019</option>
                <option value={2020}>2020</option>
              </select>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Month labels */}
              <div className="flex ml-8 mb-2">
                {monthLabels.map((month, idx) => {
                  // Position months roughly where they start
                  const weekPosition = idx * 4.33; // Approximately 4.33 weeks per month
                  return (
                    <div 
                      key={month} 
                      className="text-xs text-gray-500"
                      style={{ marginLeft: idx === 0 ? 0 : `${weekPosition * 12}px` }}
                    >
                      {month}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex">
                {/* Day labels */}
                <div className="flex flex-col justify-around mr-2 h-[130px]">
                  {dayLabels.map(day => (
                    <div key={day} className="text-xs text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap grid */}
                <div className="flex-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                    <div key={dayIndex} className="flex mb-1">
                      {activityData.map((week, weekIndex) => {
                        const day = week[dayIndex];
                        if (!day) return <div key={weekIndex} className="w-3 h-3 mr-1"></div>;
                        
                        return (
                          <div
                            key={weekIndex}
                            className={`w-3 h-3 mr-1 rounded-sm ${getActivityColor(day.level)} transition-colors cursor-pointer group relative`}
                            title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${day.value} activities`}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                              {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {day.value} activities
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Stats summary */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>Total activities: <span className="font-medium text-gray-700">
                  {activityData.flat().reduce((sum, day) => sum + day.value, 0)}
                </span></span>
                <span>Average: <span className="font-medium text-gray-700">
                  {Math.round(activityData.flat().reduce((sum, day) => sum + day.value, 0) / 365)}
                </span> per day</span>
                <span>Peak: <span className="font-medium text-gray-700">
                  {Math.max(...activityData.flat().map(day => day.value))}
                </span> activities</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Attendance Calendar</h2>
            <p className="text-sm text-gray-500 mt-1">{formatDateRange()}</p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-x-auto">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
              {week.map((day, dayIndex) => {
                const statusStyle = getStatusStyle(day.status);
                const StatusIcon = statusStyle.icon;
                
                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[100px] p-2 rounded-lg border ${statusStyle.bg} border-gray-100 hover:shadow-md transition-shadow`}
                  >
                    <div className={`text-sm font-medium mb-1 ${statusStyle.text}`}>
                      {day.day}
                    </div>
                    {StatusIcon && (
                      <div className="flex justify-center mb-1">
                        <StatusIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="text-xs text-center font-medium">
                      {statusStyle.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer with info */}
      <div className="text-center text-xs text-gray-400 pt-4">
        <p>Attendance data for Jul 1 - Aug 11, 2018 | Working Hours: 8:00 AM - 4:00 PM</p>
      </div>
    </div>
  );
};

export default AttendanceDashboard;