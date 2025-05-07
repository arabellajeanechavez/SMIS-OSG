import React from "react";
import Sidebar from "./Sidebar";
import { headers } from "next/headers";
import { StatusProvider } from "./StatusContext";
import { ProfileProvider } from "./ProfileContext";
import { getFacultyDetails } from "@/actions/faculty";
import { getScholarshipStatistics } from "@/actions/scholarship";


export default async function CSODashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  const headersList = await headers();
  const email = headersList.get('email');
  const password = headersList.get('password');

  if (!email || !password) {
    throw new Error("Email or password is missing in the headers.");
  }

  // TODO: in production use the below line and remove the line next to it
  // const profile = await getFacultyDetails(email, password);
  const profile = { email };
  const status = await getScholarshipStatistics();

  console.log(status);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ProfileProvider profileData={profile}>
        <StatusProvider statusData={status}>
          <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
            {children}
          </main>
        </StatusProvider>
      </ProfileProvider>
    </div>
  );
}