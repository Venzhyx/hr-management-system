import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineBan,
  HiOutlinePencilAlt,
} from 'react-icons/hi';
import {
  fetchAttendancesByIdentificationNumber,
  selectAttendances,
  selectAttendanceEmployee,
  selectAttendanceSummary,
  selectAttendanceLoading,
  selectAttendanceError,
} from '../../redux/slices/attendanceSlice'; // sesuaikan path

const AttendanceDashboard = ({ employeeIdentificationNumber }) => {
  const dispatch = useDispatch();

  const attendances    = useSelector(selectAttendances);
  const employee       = useSelector(selectAttendanceEmployee);
  const summary        = useSelector(selectAttendanceSummary);
  const loading        = useSelector(selectAttendanceLoading);
  const error          = useSelector(selectAttendanceError);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activityData, setActivityData] = useState([]);
  const [calendarWeeks, setCalendarWeeks] = useState([]);

  // Fetch on mount or when prop changes
  useEffect(() => {
    if (employeeIdentificationNumber) {
      dispatch(fetchAttendancesByIdentificationNumber(employeeIdentificationNumber));
    }
  }, [dispatch, employeeIdentificationNumber]);

  // Build GitHub-style heatmap from real attendance data
  useEffect(() => {
    const startDate = new Date(selectedYear, 0, 1);
    const endDate   = new Date(selectedYear, 11, 31);

    // Map attendance by date string for O(1) lookup
    const attendanceMap = {};
    attendances.forEach((a) => {
      const dateStr = a.workDate; // "YYYY-MM-DD"
      if (!attendanceMap[dateStr]) attendanceMap[dateStr] = [];
      attendanceMap[dateStr].push(a);
    });

    // Build 52 weeks
    const weeks = [];
    const cursor = new Date(startDate);
    // Align to Monday
    const dayOfWeek = cursor.getDay();
    const offset    = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    cursor.setDate(cursor.getDate() + offset);

    while (cursor <= endDate || weeks.length < 53) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date    = new Date(cursor);
        const dateStr = date.toISOString().split('T')[0];
        const recs    = attendanceMap[dateStr] || [];
        let level     = 0;

        if (recs.length > 0) {
          const status = recs[0].status?.toUpperCase();
          if (status === 'PRESENT') level = 4;
          else if (status === 'LATE')    level = 2;
          else if (status === 'LEAVE')   level = 1;
          else if (status === 'ABSENT')  level = 0;
        }

        week.push({ date, dateStr, level, records: recs });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
      if (cursor.getFullYear() > selectedYear && weeks.length >= 52) break;
    }

    setActivityData(weeks);
  }, [attendances, selectedYear]);

  // Build calendar weeks from attendances (last 3 weeks)
  useEffect(() => {
    if (attendances.length === 0) {
      setCalendarWeeks([]);
      return;
    }

    // Sort attendances descending, take last 21 days
    const sorted = [...attendances].sort(
      (a, b) => new Date(b.workDate) - new Date(a.workDate)
    );

    const uniqueDates = [];
    const seen        = new Set();
    sorted.forEach((a) => {
      if (!seen.has(a.workDate)) {
        seen.add(a.workDate);
        uniqueDates.push(a);
      }
    });

    // Group into weeks of 7
    const weeks = [];
    for (let i = 0; i < Math.min(uniqueDates.length, 21); i += 7) {
      const chunk = uniqueDates.slice(i, i + 7);
      weeks.push({
        weekNumber: weeks.length + 1,
        days: chunk.map((a) => {
          const date   = new Date(a.workDate);
          const status = a.status?.toUpperCase();
          return {
            day:    date.getDate(),
            status: status === 'PRESENT' ? 'attend'
                  : status === 'LATE'    ? 'late'
                  : status === 'LEAVE'   ? 'leave'
                  : 'non-present',
            label:  status === 'PRESENT' ? 'Attend'
                  : status === 'LATE'    ? 'Late'
                  : status === 'LEAVE'   ? 'Leave'
                  : 'Non Present',
            checkIn:  a.checkIn  ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
            checkOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
          };
        }),
      });
    }

    setCalendarWeeks(weeks);
  }, [attendances]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'attend':      return { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  };
      case 'late':        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'leave':       return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'non-present': return { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    };
      default:            return { bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200'   };
    }
  };

  const getActivityColor = (level) => {
    switch (level) {
      case 0: return 'bg-gray-100 hover:bg-gray-200';
      case 1: return 'bg-purple-200 hover:bg-purple-300';
      case 2: return 'bg-yellow-300 hover:bg-yellow-400';
      case 3: return 'bg-green-300 hover:bg-green-400';
      case 4: return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-gray-100';
    }
  };

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Available years from attendance data
  const availableYears = [...new Set(attendances.map((a) => new Date(a.workDate).getFullYear()))]
    .sort((a, b) => b - a);
  if (!availableYears.includes(selectedYear)) availableYears.unshift(selectedYear);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">Loading attendance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HiOutlineXCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Dashboard</h1>
          {employee && (
            <p className="text-sm text-gray-500 mt-1">
              {employee.name} &nbsp;·&nbsp; NIK: {employee.employeeIdentificationNumber}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">Working Time: 8hrs (8am – 4pm)</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
          <HiOutlinePencilAlt className="w-4 h-4" />
          <span className="text-sm font-medium">Request To Change</span>
        </button>
      </div>

      {/* Two Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Attendance Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50">
                <HiOutlineCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{summary.present}</div>
                <div className="text-sm text-green-600 font-medium">Present</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50">
                <HiOutlineXCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">{summary.absent}</div>
                <div className="text-sm text-red-600 font-medium">Absent</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <HiOutlineClock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-700">{summary.lates}</div>
                <div className="text-sm text-yellow-600 font-medium">Lates</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <HiOutlineBan className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{summary.leave}</div>
                <div className="text-sm text-purple-600 font-medium">Leave</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Activity Overview</h2>
            <div className="flex items-center space-x-4">
              {/* Legend */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-gray-500">Less</span>
                <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                <div className="w-3 h-3 bg-yellow-300 rounded-sm" title="Late"></div>
                <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-600 rounded-sm" title="Present"></div>
                <span className="text-gray-500 ml-1">More</span>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Month labels */}
              <div className="flex ml-8 mb-2 gap-0">
                {monthLabels.map((month, idx) => (
                  <div
                    key={month}
                    className="text-xs text-gray-500"
                    style={{ width: `${(activityData.length / 12) * 16}px` }}
                  >
                    {month}
                  </div>
                ))}
              </div>

              <div className="flex">
                {/* Day labels */}
                <div className="flex flex-col mr-2 gap-1" style={{ paddingTop: '2px' }}>
                  {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((d, i) => (
                    <div key={i} className="text-xs text-gray-400 h-3 leading-3">{d}</div>
                  ))}
                </div>

                {/* Grid */}
                <div className="flex gap-1">
                  {activityData.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day, di) => {
                        const statusLabel = day.records[0]?.status || 'No data';
                        return (
                          <div
                            key={di}
                            className={`w-3 h-3 rounded-sm ${getActivityColor(day.level)} transition-colors cursor-pointer group relative`}
                            title={`${day.dateStr}: ${statusLabel}`}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                              {day.dateStr}: {statusLabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>Total records: <span className="font-medium text-gray-700">{attendances.length}</span></span>
                <span>Present: <span className="font-medium text-green-700">{summary.present}</span></span>
                <span>Late: <span className="font-medium text-yellow-700">{summary.lates}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar — Recent Attendance */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Attendance</h2>
        </div>
        <div className="p-6">
          {calendarWeeks.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No attendance records found.</p>
          ) : (
            calendarWeeks.map((week, wi) => (
              <div key={wi} className="mb-6">
                <div className="grid grid-cols-7 gap-3">
                  {week.days.map((day, di) => {
                    const style = getStatusStyle(day.status);
                    return (
                      <div
                        key={di}
                        className={`rounded-lg border ${style.border} ${style.bg} overflow-hidden`}
                      >
                        <div className={`text-center py-1 text-xs font-medium ${style.text} border-b ${style.border}`}>
                          {day.label}
                        </div>
                        <div className="text-center py-2">
                          <span className={`text-lg font-semibold ${style.text}`}>{day.day}</span>
                        </div>
                        {(day.checkIn || day.checkOut) && (
                          <div className="px-1 pb-2 text-center">
                            <p className="text-[10px] text-gray-500">{day.checkIn}</p>
                            <p className="text-[10px] text-gray-400">{day.checkOut}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {wi < calendarWeeks.length - 1 && (
                  <div className="border-t border-gray-200 my-3"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pt-2">
        {employee
          ? `Attendance data for ${employee.name} | Working Hours: 8:00 AM – 4:00 PM`
          : 'Attendance Dashboard'}
      </div>
    </div>
  );
};

export default AttendanceDashboard;
