import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const SuperAdminLayout = () => {
  // true = open/visible, false = closed/hidden
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* 
        Pass state control down to the Sidebar.
        The top header configuration sits shared globally via fixed structures.
      */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main content area wrapper below the top layout header */}
      <div className="flex flex-1 pt-16 h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* 
          This structural spacer replicates layout width ONLY on desktop profiles.
          Transitions accurately when sidebarOpen changes state.
        */}
        <div 
          className={`
            hidden md:block transition-all duration-300 ease-in-out flex-shrink-0
            ${sidebarOpen ? "w-72" : "w-0"}
          `}
        />

        {/* 
          Main Dashboard Content Body.
          flex-1 ensures it automatically takes 100% full screen space when sidebar is collapsed.
        */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;