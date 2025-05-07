"use client";
import { useProfile } from "../profileContext";
import { useState, useEffect } from "react";
import { getScholarDetail } from "@/actions/scholarship";

export default function ProfileView() {
  const { profile, setIsEditProfileModalOpen } = useProfile();
  const [scholarshipData, setScholarshipData] = useState({
    id: "",
    status: "Open",
    scholarshipType: "N/A",
    gpaRequirement: "N/A",
    benefactor: "N/A",
    academicYear: "N/A",
    contractExpiration: "N/A",
  });

  useEffect(() => {
    async function fetchScholarship() {
      try {
        const scholarship = await getScholarDetail(profile.email);

        let id = "";
        let status = "Open";
        let scholarshipType = "N/A";
        let gpaRequirement = "N/A";
        let benefactor = "N/A";
        let academicYear = "N/A";
        let contractExpiration = "N/A";

        if (scholarship) {
          id = scholarship.id || "N/A";
          scholarshipType = scholarship.scholarship_type || "N/A";
          gpaRequirement =
            scholarship.gpa_requirement !== undefined
              ? String(scholarship.gpa_requirement)
              : "N/A";
          benefactor = scholarship.benefactor || "N/A";
          academicYear = scholarship.academic_year || "N/A";
          contractExpiration = scholarship.contract_expiration
            ? new Date(scholarship.contract_expiration).toLocaleDateString()
            : "N/A";

          if (scholarship.is_revoked) {
            status = "Revoked";
          } else if (
            scholarship.contract_expiration &&
            new Date(scholarship.contract_expiration) < new Date()
          ) {
            status = "Expired";
          } else if (scholarship.date_verified) {
            status = "Active";
          } else if (scholarship.created_at) {
            status = "Pending";
          }
        }

        setScholarshipData({
          id,
          status,
          scholarshipType,
          gpaRequirement,
          benefactor,
          academicYear,
          contractExpiration,
        });
      } catch (error) {
        console.error("Failed to fetch scholarship data:", error);
      }
    }

    if (profile.email) {
      fetchScholarship();
    }
  }, [profile.email]);

  let bgColor = "bg-gray-500";
  if (scholarshipData.status === "Active") {
    bgColor = "bg-[#A19158]";
  } else if (scholarshipData.status === "Revoked") {
    bgColor = "bg-red-500";
  } else if (scholarshipData.status === "Expired") {
    bgColor = "bg-gray-500";
  } else if (scholarshipData.status === "Pending") {
    bgColor = "bg-yellow-500";
  } else if (scholarshipData.status === "Open") {
    bgColor = "bg-blue-500";
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#D9D9D9] rounded-2xl shadow-lg p-10">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Left Column: Avatar, Status Label, Status Badge */}
          <div className="flex flex-col items-center space-y-4 w-[100px]">
            <div className="h-30 w-30 rounded-full bg-[#283971] text-white flex items-center justify-center text-2xl font-bold">
              {profile.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
            <p className="text-gray-800 font-medium text-sm text-center w-full">
              Status
            </p>
            <span
              className={`text-white text-base font-semibold px-4 py-2 rounded-[18px] ${bgColor}`}
              style={{
                width: "120px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {scholarshipData.status}
            </span>
          </div>

          {/* Right Column: Profile Name, ID, and Text Fields */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2
                className="font-bold break-words"
                style={{ color: "#283971", fontSize: "30px" }}
              >
                {profile.name}
              </h2>
              <p className="text-[#3E3E3E] font-semibold break-words mt-2 md:mt-0">
                Student ID: {profile.student_id}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid employégrid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-800 text-sm block mb-1">
                    Year Level:
                  </label>
                  <div className="bg-[#FFFFFF] rounded-lg p-4 border border-gray-300 w-full">
                    <span className="font-semibold text-gray-800 text-sm break-words">
                      {profile.year_level}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-800 text-sm block mb-1">
                    Academic Year:
                  </label>
                  <div className="bg-[#FFFFFF] rounded-lg p-4 border border-gray-300 w-full">
                    <span className="font-semibold text-gray-800 text-sm break-words">
                      {scholarshipData.academicYear}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-800 text-sm block mb-1">
                    University:
                  </label>
                  <div className="bg-[#FFFFFF] rounded-lg p-4 border border-gray-300 w-full">
                    <span className="font-semibold text-gray-800 text-sm break-words">
                      {profile.university}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-800 text-sm block mb-1">
                    Course:
                  </label>
                  <div className="bg-[#FFFFFF] rounded-lg p-4 border border-gray-300 w-full">
                    <span className="font-semibold text-gray-800 text-sm break-words">
                      {profile.program}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <label className="font-medium text-gray-800 text-sm block mb-1">
                    Scholarship Type:
                  </label>
                  <div className="bg-[#FFFFFF] rounded-lg p-4 border border-gray-300 w-full">
                    <span className="font-semibold text-gray-800 text-sm break-words">
                      {scholarshipData.scholarshipType}
                    </span>
                  </div>
                </div> */}
                <div>
                  <label className="font-medium text-gray-800 text-sm block mb-1">
                    Benefactor:
                  </label>
                  <div className="bg-[#FFFFFF] rounded-lg p-4 border border-gray-300 w-full">
                    <span className="font-semibold text-gray-800 text-sm break-words">
                      {scholarshipData.benefactor}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                {/* <button
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="w-[200px] h-[50px] bg-[#283971] text-white px-4 py-2 rounded-lg hover:bg-[#1e2a5c] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Edit Profile
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}