import React, { useMemo } from 'react';
import { DollarSign, Users, Award, Calendar } from 'lucide-react';

const ScholarshipSummary = ({ students }) => {
  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    // Filter to only include verified and non-revoked scholarships
    const activeScholarships = students.filter(
      student => student.date_verified && !student.is_revoked
    );

    // Count by scholarship type
    const scholarshipTypeCount = activeScholarships.reduce((acc, student) => {
      const type = student.scholarship_type || 'Unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Get top scholarship type
    let topScholarshipType = 'None';
    let maxCount = 0;

    Object.entries(scholarshipTypeCount).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topScholarshipType = type;
      }
    });

    // Average GPA requirement
    const averageGPA = activeScholarships.length
      ? (activeScholarships.reduce(
        (sum, student) => sum + (student.gpa_requirement || 0),
        0
      ) / activeScholarships.length).toFixed(2)
      : 0;

    // Upcoming expirations (within next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcomingExpirations = activeScholarships.filter(student => {
      if (!student.contract_expiration) return false;
      const expirationDate = new Date(student.contract_expiration);
      return expirationDate > today && expirationDate <= thirtyDaysFromNow;
    }).length;

    return {
      totalStudents: activeScholarships.length,
      topScholarshipType,
      averageGPA,
      upcomingExpirations,
      scholarshipTypes: Object.keys(scholarshipTypeCount).length,
    };
  }, [students]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-[#283971] mb-4">Scholarship Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Amount Awarded */}
        <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-[#283971]" />
          </div>
        </div>

        {/* Active Scholarships */}
        <div className="bg-green-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Scholarships</p>
            <p className="text-2xl font-bold text-green-600">
              {summaryStats.totalStudents}
            </p>
            <p className="text-xs text-gray-500">
              {summaryStats.scholarshipTypes} different types
            </p>
          </div>
        </div>

        {/* Top Scholarship */}
        <div className="bg-purple-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Top Scholarship</p>
            <p className="text-lg font-bold text-purple-600 truncate">
              {summaryStats.topScholarshipType}
            </p>
            <p className="text-xs text-gray-500">
              Avg. GPA Req: {summaryStats.averageGPA}
            </p>
          </div>
        </div>

        {/* Upcoming Expirations */}
        <div className="bg-amber-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Upcoming Expirations</p>
            <p className="text-2xl font-bold text-amber-600">
              {summaryStats.upcomingExpirations}
            </p>
            <p className="text-xs text-gray-500">
              In the next 30 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipSummary;