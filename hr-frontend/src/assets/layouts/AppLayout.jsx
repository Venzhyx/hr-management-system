import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Sidebar - Responsive */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar toggleSidebar={toggleSidebar} />
      </div>

      {/* Overlay saat sidebar terbuka di mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Konten utama */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 px-4 sm:px-6 py-6 mt-20 w-full">
          <div className="w-full max-w-full overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;