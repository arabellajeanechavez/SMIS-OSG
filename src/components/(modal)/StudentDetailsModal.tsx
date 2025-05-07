//StudentDetailsModal.tsx
"use client";
import React, { useState } from "react";

interface Scholar {
  id: number;
  name: string;
  gender: string;
  school: string;
  program: string;
  status: string;
  scholarships: number;
  yearLevel: string;
  schoolYear: string;
  remarks?: string[];
}

interface FileUpload {
  id: number;
  fileName: string;
  uploadDate: string;
  fileType: string;
  fileSize: string;
  status: "Verified" | "Pending" | "Rejected";
}

interface StudentDetailsModalProps {
  scholar: Scholar | null;
  onClose: () => void;
  onStatusChange?: (scholarId: number, newStatus: string) => void;
  onRemarkAdded?: (scholarId: number, remark: string) => void;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  scholar,
  onClose,
  onStatusChange,
  onRemarkAdded
}) => {
  const [newRemark, setNewRemark] = useState("");
  const [statusChange, setStatusChange] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<string[]>(scholar?.remarks || []);

  if (!scholar) return null;

  // Get status badge styling
  const getStatusBadgeStyle = (status: "Verified" | "Pending" | "Rejected") => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get scholar status badge styling
  const getScholarStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "granted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case "docx":
      case "doc":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Handle remark submission
  const handleRemarkSubmit = () => {
    if (newRemark.trim()) {
      const updatedRemarks = [...remarks, newRemark];
      setRemarks(updatedRemarks);
      if (onRemarkAdded) {
        onRemarkAdded(scholar.id, newRemark);
      }
      setNewRemark("");
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setStatusChange(newStatus);
  };

  // Handle save changes
  const handleSaveChanges = () => {
    if (statusChange && onStatusChange) {
      onStatusChange(scholar.id, statusChange);
    }

    if (newRemark.trim() && onRemarkAdded) {
      onRemarkAdded(scholar.id, newRemark);
      setNewRemark("");
    }

    // Alert for demo purposes
    if (statusChange || newRemark.trim()) {
      alert(`Changes saved for ${scholar.name}`);
    }
  };

  // Prevent event propagation to avoid issues
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-0 max-w-5xl w-full shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        {/* Header with color bar */}
        <div className="bg-[#283971] rounded-t-xl p-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white">Scholar Profile</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scholar basic info with highlight */}
        <div className="bg-[#f8f9fa] p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-[#A19158] rounded-full h-16 w-16 flex items-center justify-center text-white text-2xl font-bold">
              {scholar.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{scholar.name}</h3>
              <p className="text-[#283971] font-medium">{scholar.program}</p>
              <div className="flex items-center justify-between">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getScholarStatusStyle(statusChange || scholar.status)
                  }`}>
                  {statusChange || scholar.status}
                </span>

                {/* Status change dropdown */}
                <div className="relative inline-block text-left">
                  <select
                    className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#283971] focus:border-[#283971] sm:text-sm rounded-md"
                    value={statusChange || scholar.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Granted">Granted</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scholar details */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Scholar Information</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">School</p>
              <p className="text-base font-medium">{scholar.school}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Program</p>
              <p className="text-base font-medium">{scholar.program}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Year Level</p>
              <p className="text-base font-medium">{scholar.yearLevel}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">School Year</p>
              <p className="text-base font-medium">{scholar.schoolYear}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Number of Scholarships</p>
              <p className="text-base font-medium">{scholar.scholarships}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="text-base font-medium">#{scholar.id.toString().padStart(4, '0')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="text-base font-medium">{scholar.gender}</p>
            </div>
          </div>
        </div>

        {/* Remarks Section - New Addition */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
            Remarks & Communication
          </h4>

          {/* Existing remarks */}
          <div className="mb-4 max-h-64 overflow-y-auto">
            {remarks.length > 0 ? (
              <div className="space-y-3">
                {remarks.map((remark, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-[#283971]">CSO Admin</span>
                      <span className="text-xs text-gray-500">{formatDate(new Date(Date.now() - index * 86400000))}</span>
                    </div>
                    <p className="text-sm mt-1">{remark}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No remarks have been added yet.</p>
            )}
          </div>

          {/* Add new remark */}
          <div className="mt-4">
            <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1">
              Add Remark
            </label>
            <textarea
              id="remark"
              rows={5} // Increased the number of rows to make the text field bigger
              className="shadow-sm focus:ring-[#283971] focus:border-[#283971] block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter a remark or message for the student..."
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
            ></textarea>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-[#283971] text-white rounded-md hover:bg-[#1C2A4E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#283971]"
                onClick={handleRemarkSubmit}
              >
                Add Remark
              </button>
            </div>
          </div>
        </div>

        {/* File Upload History */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
            Uploaded Files History
          </h4>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-b-xl flex gap-4 sticky bottom-0">
          <button
            className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Close
          </button>
          <button
            className="flex-1 py-3 bg-[#283971] text-white rounded-lg hover:bg-[#1C2A4E] transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveChanges();
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;