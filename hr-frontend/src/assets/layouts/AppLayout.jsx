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
    <Sidebar />
    <div className="flex-1 flex flex-col lg:ml-64 min-w-0 transition-all duration-300">
      <Navbar toggleSidebar={toggleSidebar} />
      <main className="flex-1 px-6 py-6 mt-16 w-full">
        <div className="w-full"> 
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);
};
export default AppLayout;