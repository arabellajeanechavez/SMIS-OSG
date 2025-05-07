import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Mail, Calendar, School, AlertTriangle, X } from "lucide-react";

const StudentEmailSummary = ({
  students,
  onClose,
  visible,
}) => {
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Handle client-side only rendering for the portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSearch = () => {
    if (!email.trim()) {
      setError("Please enter an email address");
      setSummary(null);
      return;
    }

    const studentMatches = students.filter(student =>
      student.email.toLowerCase() === email.toLowerCase()
    );

    if (studentMatches.length === 0) {
      setError("No student found with this email address");
      setSummary(null);
      return;
    }

    // Create summary data from all scholarships for this student
    const scholarships = studentMatches.filter(s => s.date_verified && !s.is_revoked);

    if (scholarships.length === 0) {
      setError("This student has no active verified scholarships");
      setSummary(null);
      return;
    }

    // Find earliest and latest expiration dates
    const expirationDates = scholarships
      .filter(s => s.contract_expiration)
      .map(s => new Date(s.contract_expiration));

    const earliestExpiration = expirationDates.length ?
      new Date(Math.min(...expirationDates.map(d => d.getTime()))) : null;

    const latestExpiration = expirationDates.length ?
      new Date(Math.max(...expirationDates.map(d => d.getTime()))) : null;

    // Get all scholarship types
    const types = [...new Set(scholarships.map(s => s.scholarship_type || "Unspecified"))];

    // Get student details from first record
    const student = studentMatches[0];

    setSummary({
      studentName: student.name,
      studentId: student.student_id,
      email: student.email,
      program: student.program,
      yearLevel: student.year_level,
      university: student.university,
      totalScholarships: scholarships.length,
      scholarshipTypes: types,
      earliestExpiration,
      latestExpiration,
      scholarships // Include all scholarship records
    });

    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Return null if not visible or not mounted
  if (!visible || !mounted) return null;

  // Create the modal content
  // TODO: change email summary to the View Scholarship Contract
  const modalContent = (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-[#283971]" />
            <h2 className="text-xl font-bold text-[#283971]">
              Student Email Summary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter student email address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] focus:border-[#283971]"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#283971] text-white rounded-lg hover:bg-[#1C2A4E] transition-colors"
            >
              Search
            </button>
          </div>

          {error && (
            <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {summary && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="bg-white p-6 rounded-lg border border-[#A19158]/20 w-full mb-8">
              <h3 className="text-xl font-bold text-[#283971] mb-4">{summary.studentName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-[#283971]/70 font-medium">Email</p>
                  <p className="mt-1 text-base font-semibold text-[#283971]">{summary.email}</p>
                </div>
                <div>
                  <p className="text-[#283971]/70 font-medium">Student ID</p>
                  <p className="mt-1 text-base font-semibold text-[#283971]">{summary.studentId}</p>
                </div>
                <div>
                  <p className="text-[#283971]/70 font-medium">Program</p>
                  <p className="mt-1 text-base font-semibold text-[#283971]">{summary.program}</p>
                </div>
                <div>
                  <p className="text-[#283971]/70 font-medium">Year Level</p>
                  <p className="mt-1 text-base font-semibold text-[#283971]">{summary.yearLevel}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[#283971]/70 font-medium">University</p>
                  <p className="mt-1 text-base font-semibold text-[#283971]">{summary.university}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Active Scholarships Card */}
              <div className="bg-white p-6 rounded-lg border border-[#A19158]/20 duration-200 w-full">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#A19158] p-3 rounded-full">
                    <School className="w-6 h-6 text-[#283971]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#283971] font-medium">Active Scholarships</p>
                    <p className="mt-1 text-2xl font-bold text-[#283971]">{summary.totalScholarships}</p>
                  </div>
                </div>
              </div>

              {/* Contract Expiration Card */}
              <div className="bg-white p-6 rounded-lg border border-[#A19158]/20 w-full">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#A19158] p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-[#283971]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#283971] font-medium">Contract Expiration</p>
                    <p className="mt-1 text-2xl font-bold text-[#283971]">
                      {summary.latestExpiration ? summary.latestExpiration.toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-[#283971] mb-4">Scholarship Details</h3>
              <div className="bg-white rounded-lg border border-[#A19158]/20 flex-1 flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="min-w-full divide-y divide-[#A19158]/10">
                    <thead className="bg-[#A19158]/10 top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#283971] uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#283971] uppercase tracking-wider">Academic Year</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#283971] uppercase tracking-wider">Benefactor</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#283971] uppercase tracking-wider">GPA Req.</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#283971] uppercase tracking-wider">Expires</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#A19158]/10">
                      {summary.scholarships.map((scholarship, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm font-medium text-[#283971]">{scholarship.scholarship_type || "Unspecified"}</td>
                          <td className="px-6 py-4 text-sm font-medium text-[#283971]">{scholarship.academic_year || "Unspecified"}</td>
                          <td className="px-6 py-4 text-sm font-medium text-[#283971]">{scholarship.benefactor || "Unspecified"}</td>
                          <td className="px-6 py-4 text-sm font-medium text-[#283971]">{scholarship.gpa_requirement || "N/A"}</td>
                          <td className="px-6 py-4 text-sm font-medium text-[#283971]">
                            {scholarship.contract_expiration
                              ? new Date(scholarship.contract_expiration).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Use createPortal to render the modal at the document body level
  return createPortal(modalContent, document.body);
};

export default StudentEmailSummary;