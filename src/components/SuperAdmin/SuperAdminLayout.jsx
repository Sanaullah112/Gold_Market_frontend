import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const SuperAdminLayout = () => {
  // Controlled state managed at the layout level
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Pass the state control variables explicitly to the Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main wrapper area below the top header */}
      <div className="flex flex-1 pt-16 h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* 
          This empty spacer mimics the sidebar width ONLY on desktop.
          It now correctly shifts when sidebarOpen changes!
        */}
        <div 
          className={`
            hidden md:block transition-all duration-300 ease-in-out flex-shrink-0
            ${sidebarOpen ? "w-72" : "w-0"}
          `}
        />

        {/* 
          Main Dashboard Content Body. 
          Using flex-1 ensures it automatically takes 100% width when spacer is w-0.
        */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;