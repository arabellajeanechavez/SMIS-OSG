import React, { useState } from 'react';
// TODO: change the name into lastname, firstname, middlename and remove the amount
interface Scholar {
  id: number;
  name: string;
  school: string;
  program: string;
  status: string;
  scholarships: number;
  yearLevel: string;
  schoolYear: string;
}

interface ScholarshipHistory {
  id: number;
  scholarId: number;
  scholarshipName: string;
  amount: number;
  dateAwarded: string;
  status: string;
  duration: string;
}

interface StudentHistoryModalProps {
  scholar: Scholar;
  onClose: () => void;
  onTerminateScholarship?: (scholarshipId: number) => void;
}

const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({
  scholar,
  onClose,
  onTerminateScholarship
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scholarshipToTerminate, setScholarshipToTerminate] = useState<ScholarshipHistory | null>(null);

  // Mock data for scholarship history - in a real app, this would come from an API
  const [scholarshipHistory, setScholarshipHistory] = useState<ScholarshipHistory[]>([
    {
      id: 1,
      scholarId: 1,
      scholarshipName: "Academic Excellence Scholarship",
      amount: 10000,
      dateAwarded: "2022-09-15",
      status: "Completed",
      duration: "1 Year"
    },
    {
      id: 2,
      scholarId: 1,
      scholarshipName: "STEM Scholarship",
      amount: 15000,
      dateAwarded: "2023-01-20",
      status: "Active",
      duration: "2 Years"
    },
  ]);

  // Filter history 
  const scholarHistory = scholarshipHistory.filter(item => item.scholarId === scholar.id);
  const activeScholarships = scholarHistory.filter(s => s.status === 'Active');

  const initiateTermination = (scholarship: ScholarshipHistory) => {
    if (activeScholarships.length <= 1) {
      alert("Cannot revoke the only active scholarship. Students must have at least one active scholarship.");
      return;
    }
    setScholarshipToTerminate(scholarship);
    setShowConfirmModal(true);
  };

  const confirmTermination = () => {
    if (scholarshipToTerminate) {
      // Update the status in local state
      setScholarshipHistory(prev =>
        prev.map(item =>
          item.id === scholarshipToTerminate.id
            ? { ...item, status: "Revoked" }
            : item
        )
      );

      if (onTerminateScholarship) {
        onTerminateScholarship(scholarshipToTerminate.id);
      }

      setShowConfirmModal(false);
      setScholarshipToTerminate(null);
    }
  };

  const cancelTermination = () => {
    setShowConfirmModal(false);
    setScholarshipToTerminate(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#283971]">
              Scholarship History for {scholar.name}
            </h2>
            <div className="flex gap-4 mt-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {scholar.school}
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {scholar.program}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${scholar.status === 'Active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
                }`}>
                {scholar.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">Total Scholarships</h4>
            <p className="text-2xl font-semibold">{scholarHistory.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-600">Active Scholarships</h4>
            <p className="text-2xl font-semibold text-green-700">{activeScholarships.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-600">Total Awarded</h4>
            <p className="text-2xl font-semibold text-blue-700">
              ₱{scholarHistory.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4 text-[#283971]">Scholarship Records</h3>

        {scholarHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#283971] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Scholarship Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Date Awarded</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scholarHistory.map((record) => (
                  <tr key={record.id} className={record.status !== 'Active' ? 'opacity-70' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {record.scholarshipName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      ₱{record.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(record.dateAwarded).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {record.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.status === 'Active' ? 'bg-green-100 text-green-800' :
                          record.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            record.status === 'Revoked' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {record.status === 'Active' && (
                        <button
                          onClick={() => initiateTermination(record)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 text-center rounded-lg">
            <p className="text-gray-500">No scholarship history found for this student.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#283971] text-white rounded-lg hover:bg-[#1C2A4E] transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {showConfirmModal && scholarshipToTerminate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Revoke Scholarship</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>You are about to revoke the following scholarship:</p>
                  <p className="font-semibold mt-1">{scholarshipToTerminate.scholarshipName}</p>
                  <p className="mt-2">This will immediately terminate the student's benefits under this program.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelTermination}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTermination}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHistoryModal;