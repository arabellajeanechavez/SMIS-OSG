import React, { Suspense } from 'react';
import WelcomeHeader from './welcomeHeader';
import ScholarshipStatus from './scholarshipStatus';
import ProfileView from './profileView';
import ProfileEditModal from './profileEditModal';
import ScholarshipContract from './ScholarshipContract';
import Announcements from './Announcements';

export default async function ScholarMainDashboard() {
  return (
    <div className="p-15">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WelcomeHeader />
        </div>
        <Suspense
          fallback={
            <div className="bg-gray-200 animate-pulse lg:col-span-2 space-y-6 h-72 rounded-lg"></div>
          }
        >
          <div className="lg:col-span-2 space-y-6">
            <ScholarshipStatus />
          </div>
        </Suspense>
      </div>
      <div className="mt-1 mb-10">
        <Announcements />
      </div>
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3">
          <ScholarshipContract scholarshipId="example-id" contractUrl="/path/to/contract.pdf" />
        </div>
        <div className="lg:w-2/3">
          <ProfileView />
        </div>
      </div>
      <ProfileEditModal />
    </div>
  );
}