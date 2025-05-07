import React from 'react';
import { ProfileProvider } from './profileContext';
import SidebarClient from './Sidebar';
import { headers } from 'next/headers';
import { getStudentDetails } from '@/actions/student';

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  const headersList = await headers();
  const email = headersList.get('email');
  const password = headersList.get('password');
  

  if (!email || !password) {
    throw new Error("Email or password is missing in the headers.");
  }
  const profile = await getStudentDetails(email, password);

  const profileData = {
    email,
    name: profile.name || "",
    program: profile.program || "",
    year_level: profile.year_level || "",
    student_id: profile.student_id || "",
    university: profile.university || "",
  };

  const menuItems = [
    { icon: "Home", label: "Dashboard", href: "/scholarMainDashboard" },
    { icon: "Bell", label: "Notifications", href: "/scholarNotification" },
  ];

  const bottomMenuItems = [
    { icon: "LogOut", label: "Sign Out" },
  ];


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Client Sidebar */}
      <SidebarClient 
        menuItems={menuItems}
        bottomMenuItems={bottomMenuItems}
      />

      <main className="flex-1 overflow-auto p-6 shadow-lg transition-all duration-300 ease-in-out">
        <ProfileProvider profileData={profileData}>
          {children}
        </ProfileProvider>
      </main>
    </div>
  );
}