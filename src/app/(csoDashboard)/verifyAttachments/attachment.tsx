//attachment.tsx
"use client";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Mail, FileUp, CheckCircle, XCircle, Paperclip, Printer, AlertTriangle, X, Calendar, School, User } from "lucide-react";
import { useProfile } from "../ProfileContext";
// import ScholarshipSummary from "./ScholarshipSummary";
import StudentEmailSummary from "./StudentEmailSummary";
import AddScholar from "@/components/(modal)/AddScholar";

interface ScholarDetails {
  id: string;
  email: string;
  name: string;
  gender: string;
  program: string;
  college: string;
  student_id: string;
  year_level: number;
  university: string;
  scholarship_type?: string;
  gpa_requirement?: number;
  benefactor?: string;
  academic_year?: string;
  contract_expiration?: Date | null;
  is_revoked: boolean;
  date_verified?: Date | null;
  created_at: Date | string;
}

interface VerificationFormData {
  scholarship_type: string;
  gpa_requirement: string;
  benefactor: string;
  academic_year: string;
  contract_expiration: string;
}

interface AlertData {
  type: "success" | "error" | "info";
  message: string;
}

const scholarshipTypes = [
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
  "XU Band Scholarship",
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
  "XUCCCO",
  "City College Scholarship Program",
  "Commission on Higher Education (CHED) Scholarships",
  "Department of Science and Technology (DOST)",
  "Philippine Veterans Affairs Office (PVAO)"
];

export default function Attachments({
  scholarData,
}: {
  scholarData: ScholarDetails[];
}) {
  const { profile } = useProfile();
  const router = useRouter();
  const [students, setStudents] = useState<ScholarDetails[]>(scholarData);
  const [searchQuery, setSearchQuery] = useState("");

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ScholarDetails | null>(null);
  const [formData, setFormData] = useState<VerificationFormData>({
    scholarship_type: scholarshipTypes[0],
    gpa_requirement: "3.0",
    benefactor: "",
    academic_year: "2023-2024",
    contract_expiration: "",
  });

  // TODO: change email summary to the View Scholarship Contract
  // Add a new state to control the visibility of the email summary modal
  const [showEmailSummary, setShowEmailSummary] = useState(false);
  const [showAddScholar, setShowAddScholar] = useState(false);

  // New states for confirmation modal and notifications
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<{
    type: "revoke" | "verify" | "print";
    studentId?: string;
    callback: () => void;
  } | null>(null);
  const [alert, setAlert] = useState<AlertData | null>(null);

  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const scholarshipTypeFilter = searchParams.get("category");

  useEffect(() => {
    const eventSource = new EventSource("/verifyAttachments/api/applications");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("ang mensahe", data);
      setStudents(data);
    };

    eventSource.onerror = () => {
      console.error("EventSource failed");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const filteredStudents = students
    .filter((student) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true; // Show all if query is empty

      // Parse comma-separated terms
      const terms = query
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term.length > 0);

      if (terms.length === 0) return true; // Show all if no valid terms

      // Compute status dynamically, as in the table
      const isExpired = student.contract_expiration && student.contract_expiration < new Date();
      const status = student.is_revoked
        ? "revoked"
        : isExpired
          ? "expired"
          : student.date_verified
            ? "verified"
            : "pending";

      // Searchable fields
      const searchableFields = [
        student.name?.toLowerCase(),
        student.email?.toLowerCase(),
        student.university?.toLowerCase(),
        student.program?.toLowerCase(),
        student.student_id?.toLowerCase(),
        student.scholarship_type?.toLowerCase(),
        student.year_level?.toString().toLowerCase(),
        student.gender?.toLowerCase(),
        status.toLowerCase(),
      ];

      // Require all terms to match at least one field
      return terms.every((term) =>
        searchableFields.some((field) => field?.includes(term))
      );
    })
    .filter(
      (student) =>
        !scholarshipTypeFilter ||
        student.scholarship_type?.toLowerCase() === scholarshipTypeFilter.toLowerCase()
    );

  const sortedStudents = filteredStudents.sort((a, b) => {
    if (a.is_revoked && !b.is_revoked) {
      return 1;
    }
    if (!a.is_revoked && b.is_revoked) {
      return -1;
    }

    const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at);
    const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);

    return dateA.getTime() - dateB.getTime();
  });

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setAlert({ type, message });
  };

  const handleRowClick = (student: ScholarDetails) => {
    if ((student.date_verified || student.contract_expiration) && !student.is_revoked) {
      setSelectedStudent(student);
      setFormData({
        scholarship_type: student.scholarship_type || scholarshipTypes[0],
        gpa_requirement: student.gpa_requirement?.toString() || "3.0",
        benefactor: student.benefactor || "",
        academic_year: student.academic_year || "2024-2025",
        contract_expiration:
          student.contract_expiration && typeof student.contract_expiration === "string"
            ? student.contract_expiration
            : student.contract_expiration instanceof Date
              ? student.contract_expiration.toISOString().split("T")[0]
              : "",
      });
      setShowVerificationModal(true);
    }
  };

  const handleViewAttachment = (student: ScholarDetails, e: React.MouseEvent) => {
    const handleDownload = async () => {
      try {
        const response = await fetch(`/api/${student.id}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a hidden anchor element
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `scholarship-attachments-${student.id}.zip`;

        // Add to body, trigger click, and then remove
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

      } catch (err) {
        console.error('Download failed:', err);
      } finally {
      }
    };

    e.stopPropagation();
    showAlert("info", `Downloading attachment for ${student.id}`);
    handleDownload();
  };

  const handleVerify = (student: ScholarDetails, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudent(student);
    setShowVerificationModal(true);
  };

  const prepareRevocation = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmationAction({
      type: "revoke",
      studentId: id,
      callback: async () => {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.id === id ? { ...student, is_revoked: true } : student
          )
        );

        try {
          await fetch("/verifyAttachments/api/applications", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reference_id: id,
              email: profile.email,
            }),
          });
          showAlert("success", `Scholarship for ${name} has been revoked.`);
        } catch (error) {
          console.error("Error revoking scholarship application:", error);
          showAlert("error", "Failed to revoke scholarship application.");
        }
      },
    });
    setShowConfirmationModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      setShowVerificationModal(false);

      setConfirmationAction({
        type: "verify",
        callback: async () => {
          try {
            await fetch("/verifyAttachments/api/applications", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: selectedStudent.id,
                email: profile.email,
                scholarship_type: formData.scholarship_type,
                gpa_requirement: parseFloat(formData.gpa_requirement),
                benefactor: formData.benefactor,
                academic_year: formData.academic_year,
                contract_expiration: new Date(formData.contract_expiration),
              }),
            });

            setStudents((prevStudents) =>
              prevStudents.map((student) =>
                student.id === selectedStudent.id
                  ? {
                    ...student,
                    date_verified: new Date(),
                    scholarship_type: formData.scholarship_type,
                    gpa_requirement: parseFloat(formData.gpa_requirement),
                    benefactor: formData.benefactor,
                    academic_year: formData.academic_year,
                    contract_expiration: new Date(formData.contract_expiration),
                  }
                  : student
              )
            );

            showAlert("success", `Contract for ${selectedStudent.name} verified successfully!`);
          } catch (error) {
            console.error("Error verifying scholarship application:", error);
            showAlert("error", "Failed to verify scholarship application.");
          }
          setSelectedStudent(null);
        },
      });
      setShowConfirmationModal(true);
    }
  };

  const handlePrintList = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmationAction({
      type: "print",
      callback: () => {
        const verifiedStudents = sortedStudents.filter(student => student.date_verified && !student.is_revoked);
        if (verifiedStudents.length > 0) {
          const csvContent = "data:text/csv;charset=utf-8," +
            ["Name", "Sex", "Email", "Student ID", "University", "Program", "Year Level", "Date Applied", "Scholarship Type", "GPA Requirement", "Benefactor", "Academic Year", "Contract Expiration" /*, "Cost Awarded"*/].join(",") + "\r\n" +
            verifiedStudents.map(student => [
              student.name,
              student.gender,
              student.email,
              student.student_id,
              student.university,
              student.program,
              student.year_level,
              new Date(student.created_at).toLocaleDateString("en-US"),
              student.scholarship_type,
              student.gpa_requirement,
              student.benefactor,
              student.academic_year,
              student.contract_expiration ? new Date(student.contract_expiration).toLocaleDateString("en-US") : '',
            ].join(",")).join("\r\n");

          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "verified_students.csv");
          document.body.appendChild(link); // Required for Firefox

          link.click();
          showAlert("info", "Verified students list exported to CSV.");
        } else {
          showAlert("info", "No verified students to export.");
        }
      },
    });
    setShowConfirmationModal(true);
  };

  return (
    <div className="min-h-screen p-8 relative">
      {/* Alert Notification */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg shadow-lg p-4 max-w-md flex items-center gap-3 animate-fade-in 
          ${alert.type === "success" ? "bg-green-100 text-green-800 border-l-4 border-green-500" :
            alert.type === "error" ? "bg-red-100 text-red-800 border-l-4 border-red-500" :
              "bg-blue-100 text-blue-800 border-l-4 border-blue-500"}`}>
          {alert.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : alert.type === "error" ? (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="flex-1">{alert.message}</p>
          <button
            onClick={() => setAlert(null)}
            className="p-1 rounded-full hover:bg-opacity-20 hover:bg-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-8xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <FileUp className="w-6 h-6 text-[#283971]" />
          <h1 className="text-3xl font-bold text-[#283971]">
            Scholar Records
          </h1>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 w-full max-w-xl">
            <div className="w-full relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-[#283971]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, etc. (separate with commas)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white border border-[#A19158]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A19158] focus:border-[#A19158] text-[#283971] placeholder-[#283971]/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  title="Clear search"
                >
                  <X className="w-4 h-4 text-[#283971] hover:text-[#A19158] transition-colors" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowAddScholar(true)}
              className="font-semibold px-6 py-2 bg-[#283971] text-white rounded-lg hover:bg-[#1C2A4E] transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Add Scholar
            </button>

            {/* <button
              onClick={() => setShowEmailSummary(true)}
              className="font-semibold px-6 py-2 bg-white border border-[#283971] text-[#283971] rounded-lg hover:bg-[#f0f2f8] transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Summary
            </button> */}

            <button
              onClick={handlePrintList}
              className="font-semibold px-6 py-2 bg-[#283971] text-white rounded-lg hover:bg-[#1C2A4E] transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print List
            </button>
          </div>
        </div>
        {/* <ScholarshipSummary students={students} /> */}

        {scholarshipTypeFilter && (
          <div className="flex justify-between px-1 pb-4 text-gray-500">
            <p>Showing: {scholarshipTypeFilter}</p>
            <button className="cursor-pointer" onClick={() => {
              router.push(currentPath)
              // setScholarshipTypeFilter("")
            }}>Show all</button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#283971] text-white">
              <tr>
                {/* <th className="px-4 py-3 text-left font-medium">
                  Reference ID
                </th> */}
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">
                  Student ID
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  University
                </th>
                <th className="px-4 py-3 text-left font-medium">Program</th>
                <th className="px-4 py-3 text-left font-medium">
                  Year Level
                </th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">
                  Date Applied
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {sortedStudents.map((student) => {
                const isExpired = student.contract_expiration && student.contract_expiration < new Date();

                const status =
                  student.is_revoked
                    ? "Revoked"
                    : isExpired
                      ? "Expired"
                      : student.date_verified
                        ? "Verified"
                        : "Pending";

                const statusClass =
                  student.is_revoked
                    ? "bg-red-100 text-red-800"
                    : isExpired
                      ? "bg-gray-100 text-gray-800"
                      : student.date_verified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800";

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(student)}
                  >
                    {/* <td className="px-4 py-3 text-gray-700">{student.id}</td> */}
                    <td className="px-4 py-3 text-gray- Mourinho">{student.name}</td>
                    <td className="px-4 py-3 text-gray-700">{student.email}</td>
                    <td className="px-4 py-3 text-gray-700">{student.student_id}</td>
                    <td className="px-4 py-3 text-gray-700">{student.university}</td>
                    <td className="px-4 py-3 text-gray-700">{student.program}</td>
                    <td className="px-4 py-3 text-gray-700">{student.year_level}</td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(student.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>

                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAttachment(student, e);
                        }}
                        className="p-2 cursor-pointer text-blue-600 hover:text-blue-700 transition-colors"
                        title="View Attachments"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      {!student.is_revoked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prepareRevocation(student.id, student.name, e);
                          }}
                          className="p-2 cursor-pointer text-red-600 hover:text-red-700 transition-colors"
                          title="Revoke Scholarship"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {!student.date_verified && !student.is_revoked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(student, e);
                          }}
                          className="p-2 cursor-pointer text-[#A19158] hover:text-[#283971] transition-colors"
                          title="Verify Contract"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <StudentEmailSummary
              students={students}
              visible={showEmailSummary}
              onClose={() => setShowEmailSummary(false)}
            />
          </table>
        </div>
      </div>

      {/* View Scholarship Overview Modal */}
      {showVerificationModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#283971] flex items-center">
                <School className="w-6 h-6 mr-3 text-[#A19158]" />
                {selectedStudent.date_verified ? "View" : "Verify"} Scholar Overview
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowVerificationModal(false);
                  setSelectedStudent(null);
                }}
                className="p-1 rounded-full hover:bg-gray-200 flex justify-end"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-lg mb-6">
              <h3 className="text-lg text-[#283971] font-small">
                Student: <span className="text-xl font-medium">{selectedStudent.name}</span>
              </h3>
            </div>

            <form onSubmit={handleVerifySubmit}>
              {/* Student Information */}
              {selectedStudent.date_verified && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-[#283971] flex items-center">
                      <User className="w-5 h-5 mr-2 text-[#A19158]" />
                      Student Information
                    </h3>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-[#A19158]/20 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[#283971]/70 font-medium text-sm">Email</p>
                        <p className="mt-1 text-base font-semibold text-[#283971]">{selectedStudent.email}</p>
                      </div>
                      <div>
                        <p className="text-[#283971]/70 font-medium text-sm">Student ID</p>
                        <p className="mt-1 text-base font-semibold text-[#283971]">{selectedStudent.student_id}</p>
                      </div>
                      <div>
                        <p className="text-[#283971]/70 font-medium text-sm">Program</p>
                        <p className="mt-1 text-base font-semibold text-[#283971]">{selectedStudent.program}</p>
                      </div>
                      <div>
                        <p className="text-[#283971]/70 font-medium text-sm">Year Level</p>
                        <p className="mt-1 text-base font-semibold text-[#283971]">{selectedStudent.year_level}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[#283971]/70 font-medium text-sm">University</p>
                        <p className="mt-1 text-base font-semibold text-[#283971]">{selectedStudent.university}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards (Scholarship Type and Contract Expiration) */}
              {selectedStudent.date_verified && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scholarship Card */}
                    <div className="bg-white p-6 rounded-lg border border-[#A19158]/20 w-full">
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#A19158]/20 p-2 rounded-full">
                          <School className="w-5 h-5 text-[#283971]" />
                        </div>
                        <div>
                          <p className="text-sm text-[#283971]/70 font-medium">Scholarship Type</p>
                          <p className="mt-1 text-base font-semibold text-[#283971]">{selectedStudent.scholarship_type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contract Expiration Card */}
                    <div className="bg-white p-6 rounded-lg border border-[#A19158]/20 w-full">
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#A19158]/20 p-2 rounded-full">
                          <Calendar className="w-5 h-5 text-[#283971]" />
                        </div>
                        <div>
                          <p className="text-sm text-[#283971]/70 font-medium">Contract Expiration</p>
                          <p className="mt-1 text-base font-semibold text-[#283971]">
                            {selectedStudent.contract_expiration
                              ? new Date(selectedStudent.contract_expiration).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scholarship History */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-[#283971]">Scholarship History</h3>
                </div>

                {!selectedStudent.date_verified ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm font-medium">
                        Scholarship Type
                      </label>
                      <select
                        required
                        name="scholarship_type"
                        value={formData.scholarship_type}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] focus:border-[#283971] text-sm"
                      >
                        {scholarshipTypes.map((type) => (
                          <option key={type} value={type} className="text-sm">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1 text-sm font-medium">
                        GPA Requirement
                      </label>
                      <input
                        required
                        type="text"
                        name="gpa_requirement"
                        value={formData.gpa_requirement}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] focus:border-[#283971] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1 text-sm font-medium">
                        Benefactor
                      </label>
                      <input
                        required
                        type="text"
                        name="benefactor"
                        value={formData.benefactor}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] focus:border-[#283971] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1 text-sm font-medium">
                        Academic Year
                      </label>
                      <input
                        required
                        type="text"
                        name="academic_year"
                        value={formData.academic_year}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] focus:border-[#283971] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1 text-sm font-medium">
                        Contract Expiration
                      </label>
                      <input
                        required
                        type="date"
                        name="contract_expiration"
                        value={formData.contract_expiration}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] focus:border-[#283971] text-sm"
                      />
                    </div>
                  </div>
                ) : (
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
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#283971] uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#A19158]/10">
                          <tr>
                            <td className="px-6 py-4 text-sm font-medium text-[#283971]">{selectedStudent.scholarship_type || "Unspecified"}</td>
                            <td className="px-6 py-4 text-sm font-medium text-[#283971]">{selectedStudent.academic_year || "Unspecified"}</td>
                            <td className="px-6 py-4 text-sm font-medium text-[#283971]">{selectedStudent.benefactor || "Unspecified"}</td>
                            <td className="px-6 py-4 text-sm font-medium text-[#283971]">{selectedStudent.gpa_requirement || "N/A"}</td>
                            <td className="px-6 py-4 text-sm font-medium text-[#283971]">
                              {selectedStudent.contract_expiration
                                ? new Date(selectedStudent.contract_expiration).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#283971]">
                              {!selectedStudent.is_revoked && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    prepareRevocation(selectedStudent.id, selectedStudent.name, e);
                                  }}
                                  className="p-2 cursor-pointer text-red-600 hover:text-red-700 transition-colors"
                                  title="Revoke Scholarship"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-4 mt-6 pt-4">
                {!selectedStudent.date_verified && (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#283971] text-white rounded-lg hover:bg-[#1C2A4E] transition-colors text-sm font-medium"
                  >
                    Verify Contract
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ----------------------------------------------------------------- */}

      {/* Confirmation Modal */}
      {showConfirmationModal && confirmationAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4 flex items-center gap-3">
              {confirmationAction.type === "revoke" ? (
                <>
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Confirm Revocation</h3>
                </>
              ) : confirmationAction.type === "verify" ? (
                <>
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Confirm Verification</h3>
                </>
              ) : (
                <>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Printer className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Confirm Print</h3>
                </>
              )}
            </div>

            <p className="mb-6 text-gray-700">
              {confirmationAction.type === "revoke"
                ? "Are you sure you want to revoke this scholarship? This action cannot be undone."
                : confirmationAction.type === "verify"
                  ? "Please confirm the verification of this scholarship contract. This will activate the student's scholarship status."
                  : "Do you want to print the current list of scholarship students?"}
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  confirmationAction.callback();
                }}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${confirmationAction.type === "revoke"
                  ? "bg-red-600 hover:bg-red-700"
                  : confirmationAction.type === "verify"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-[#283971] hover:bg-[#1C2A4E]"
                  }`}
              >
                {confirmationAction.type === "revoke"
                  ? "Revoke Scholarship"
                  : confirmationAction.type === "verify"
                    ? "Verify Contract"
                    : "Print List"}
              </button>
            </div>
          </div>
        </div>
      )}
      {
        /* Add Scholar Modal */
      }
      {showAddScholar && (
        <AddScholar
          visible={showAddScholar}
          onClose={() => setShowAddScholar(false)}
          onSuccess={(newScholar) => {
            setStudents((prev) => [...prev, newScholar]);
            showAlert("success", "Scholar added successfully!");
          }}
        />
      )}
    </div>
  );
}