"use client";

import React, { useState } from 'react';
import { ChartPie } from 'lucide-react';
import { useStatus } from '../StatusContext';
import Link from 'next/link';

const ScholarshipStatusPage = () => {
  const { status } = useStatus();
  const { grouped } = status;

  const predefinedScholarships = {
    "University Funded Scholarships": [
      "Academic Excellence Scholarship",
      "Academic Scholarship",
      "Athletics Scholarship",
      "Fr. Araneta Scholarship",
      "Fr. Moggi Scholarship",
      "Janitorial Services",
      "Merit Scholarship",
      "Performing Arts Scholarship",
      "Police Grant-in-Aid",
      "President's Scholarship",
      "Security Guard",
      "Seminarians Scholarship",
      "St. Francis Xavier",
      "St. Ignatius 1",
      "St. Ignatius 2",
      "XU-AFPEBSO",
      "XU Band Scholarship"
    ],
    "Externally Funded Scholarships": [
      "AAABC",
      "BBFAA",
      "Del Monte Foundation Inc.",
      "Fondacion De Familia Tagud Inc.",
      "Fondation Families Lauzon et Provencher",
      "Henry Howard Scholarship",
      "PHILDEV Science and Engineering Scholarship",
      "Rebisco Foundation, Inc.",
      "SM Foundation Inc.",
      "UT Foundation Inc., Scholarship",
      "Vicente B. Bello",
      "XUCCCO"
    ],
    "Government Funded Scholarships": [
      "City College Scholarship Program",
      "Commission on Higher Education (CHED) Scholarships",
      "Department of Science and Technology (DOST)",
      "Philippine Veterans Affairs Office (PVAO)"
    ]
  };

  const allScholarships = Object.values(predefinedScholarships).flat();

  const scholarshipCategories = Object.keys(predefinedScholarships).map((category) => ({
    title: category,
    scholarships: predefinedScholarships[category].map((name) => {
      const found = grouped.find((item) => item.scholarship_type === name);
      return { name, count: found ? found.count : 0 };
    })
  }));

  const totalScholars = grouped.reduce((total, item) => total + item.count, 0);

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen p-8">
      <div>
        <div className="flex items-center space-x-4 mb-8">
          <ChartPie className="w-6 h-6 text-[#283971]" />
          <h1 className="text-3xl font-bold text-[#283971]">Scholarship Overview</h1>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          {scholarshipCategories.map((category, index) => (
            <button
              key={index}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors duration-300 ${activeTab === index ? 'border-[#283971] text-[#283971]' : 'border-transparent text-gray-700'
                }`}
              onClick={() => setActiveTab(index)}
            >
              {category.title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarshipCategories[activeTab].scholarships.map((scholarship, idx) => (
              <Link href={`/verifyAttachments?category=${scholarship.name}`} key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-lg cursor-pointer">
                <h3 className="font-semibold text-[#283971] mb-2">{scholarship.name}</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Scholars:</span>
                  <span className="text-xl font-bold text-[#A19158]">{scholarship.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[#A19158] h-2.5 rounded-full"
                    style={{ width: `${(totalScholars > 0 ? (scholarship.count / totalScholars) * 100 : 0).toFixed(1)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-right mt-2 text-gray-500">
                  {(totalScholars > 0 ? (scholarship.count / totalScholars) * 100 : 0).toFixed(1)}% of total
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipStatusPage;
