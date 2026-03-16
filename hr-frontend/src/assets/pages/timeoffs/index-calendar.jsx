import React from "react";
import { HiOutlineCalendar } from "react-icons/hi";

const TimeOffCalendarPage = () => {
  return (
    <div className="w-full px-4 md:px-6 py-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <HiOutlineCalendar className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700">Calendar View</h2>
        <p className="text-sm text-gray-400">Halaman ini masih dalam pengembangan.</p>
      </div>
    </div>
  );
};

export default TimeOffCalendarPage;
