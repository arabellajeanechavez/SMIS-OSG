import { Award } from 'lucide-react';
import { getScholarDetail } from '@/actions/scholarship';
import { headers } from 'next/headers';

// TODO: implement this to the profile view
export default async function ScholarshipStatus() {
  const headersList = await headers();
  const email = headersList.get('email') || '';
  const scholarship = await getScholarDetail(email);

  let id = "";
  let status = "Open"; // Default status is "Open"
  let scholarshipType = "N/A";
  let gpaRequirement = "N/A";
  let benefactor = "N/A";
  let academicYear = "N/A";
  let contractExpiration = "N/A";

  if (scholarship) {
    id = scholarship.id || "N/A";
    scholarshipType = scholarship.scholarship_type || "N/A";
    gpaRequirement = scholarship.gpa_requirement !== undefined ? String(scholarship.gpa_requirement) : "N/A";
    benefactor = scholarship.benefactor || "N/A";
    academicYear = scholarship.academic_year || "N/A";
    contractExpiration = scholarship.contract_expiration ? new Date(scholarship.contract_expiration).toLocaleDateString() : "N/A";

    if (scholarship.is_revoked) {
      status = "Revoked";
    } else if (scholarship.contract_expiration && new Date(scholarship.contract_expiration) < new Date()) {
      status = "Expired";
    } else if (scholarship.date_verified) {
      status = "Active";
    } else if (scholarship.created_at) {
      status = "Pending";
    }
  }

  let statusColor = "gray"; // Default gray color
  let bgColor = "bg-gray-500"; // Default background color

  if (status === "Active") {
    statusColor = "green";
    bgColor = "bg-green-500";
  } else if (status === "Revoked") {
    statusColor = "red";
    bgColor = "bg-red-500";
  } else if (status === "Expired") {
    statusColor = "gray";
    bgColor = "bg-gray-500";
  } else if (status === "Pending") {
    statusColor = "yellow";
    bgColor = "bg-yellow-500";
  } else if (status === "Open") {
    statusColor = "blue";
    bgColor = "bg-blue-500";
  }

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-gradient-to-br from-[#283971] to-[#3A50A0] rounded-2xl shadow-xl p-6 text-white overflow-auto relative min-h-70">
        <div className="absolute top-0 right-0 opacity-20">
          <Award className="h-40 w-40" />
        </div>
        <div className="relative z-10">
          {/* <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <span>Scholarship Overview</span>
                <span className={`ml-3 ${bgColor} text-white text-xs px-3 py-1 rounded-full`}>{status}</span>
              </h2>
            </div>
            {id && id !== "N/A" && (
              <DownloadAttachments scholarshipId={id} />
            )}
          </div> */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-xs text-white/70 mb-1">Scholarship Type</p>
              <p className="font-semibold">{scholarshipType}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-xs text-white/70 mb-1">GPA Requirement</p>
              <p className="font-semibold">{gpaRequirement}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-xs text-white/70 mb-1">Benefactor</p>
              <p className="font-semibold">{benefactor}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-xs text-white/70 mb-1">Academic Year</p>
              <p className="font-semibold">{academicYear}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl col-span-2 md:col-span-1">
              <p className="text-xs text-white/70 mb-1">Contract Expiration</p>
              <p className="font-semibold">{contractExpiration}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}