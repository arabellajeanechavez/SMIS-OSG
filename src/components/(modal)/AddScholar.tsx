//AddScholar.tsx
import React, { useState } from 'react';
import { scholarshipOptions } from '@/constants/scholarshipOptions';
import { programOptions } from '@/constants/programOptions';
import { validateAddScholarForm } from '../../utils/validation';
import InputField from '../../components/InputField';

// TODO: fix the upload
interface AddScholarModalProps {
  onClose: () => void;
  onAddScholar: (newScholar: any) => void;
}

const AddScholarModal: React.FC<AddScholarModalProps> = ({ onClose, onAddScholar }) => {
  const [formData, setFormData] = useState({
    // Student model fields
    name: '',
    email: '',
    password: '1234567890',
    school: 'Xavier University',
    program: '',
    year_level: '',
    status: 'Active',
    schoolYear: '2023-2024',
    student_id: '',
    university: 'Xavier University',
    gender: '',
    college: '',

    // Scholarship model fields
    scholarship_type: '',
    gpa_requirement: '3.0',
    benefactor: '',
    academic_year: '2023-2024',
    contract_expiration: '',
    is_revoked: false,
    attachment: null as File | null

  });

  const [showCustomSchool, setShowCustomSchool] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileSelected, setFileSelected] = useState<string[]>([]);

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'school' && e.target instanceof HTMLSelectElement) {
      if (value === 'Other') {
        setShowCustomSchool(true);
      } else {
        setShowCustomSchool(false);
        setFormData(prev => ({
          ...prev,
          school: value,
          university: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'school' ? { university: value } : {})
      }));
    }

    if (errors.school) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.school;
        return newErrors;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Special handling for year_level from yearLevel dropdown
    if (name === 'yearLevel') {
      setFormData(prev => ({
        ...prev,
        yearLevel: value,
        year_level: value // Update the API-required field
      }));
    }
    // Special handling for scholarship_type from scholarshipType dropdown
    else if (name === 'scholarshipType') {
      setFormData(prev => ({
        ...prev,
        scholarshipType: value,
        scholarship_type: value // Update the API-required field
      }));
    }

    else if (name === 'programType') {
      // Map program to corresponding college
      const selectedProgram = value;
      const college = Object.keys(programOptions).find(college =>
        programOptions[college].includes(selectedProgram)
      );
      setFormData(prev => ({
        ...prev,
        program: value,
        college: college || '',
      }));
    }

    // For checkbox fields
    else if (e.target.type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    }
    // For number fields
    else if (e.target.type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
    // For all other fields
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // New handler for file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({
        ...prev,
        attachment: file
      }));
      setFileSelected(file.name);
    } else {
      setFormData(prev => ({
        ...prev,
        attachment: null
      }));
      setFileSelected('');
    }
  };

  const validateForm = () => {
    const newErrors = validateAddScholarForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Create a FormData object for multipart/form-data submission
      const formDataToSubmit = new FormData();

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'attachment') {
          formDataToSubmit.append(key, String(value));
        }
      });

      // Add file if it exists
      if (formData.attachment) {
        formDataToSubmit.append('attachment', formData.attachment);
      }

      console.log(formData.attachment);


      // TODO: Handle file upload
      let attachmentBuffers = null;

      // Add all text fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'attachment') {
          formDataToSubmit.append(key, String(value));
        }
      });


      if (formData.attachment) {
        console.log(formData.attachment);

        const filesToProcess = Array.isArray(formData.attachment) ? formData.attachment : [formData.attachment];
        let attachmentBuffers = [];

        try {
          attachmentBuffers = await Promise.all(filesToProcess.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return buffer;
          }));
        } catch (error) {
          console.error("Error converting attachment to Buffer:", error);
          return;
        }
      }

      // const buffers = await Promise.all(formData.attachment.map(async (file) => {
      //   const arrayBuffer = await file.arrayBuffer();
      //   return Buffer.from(arrayBuffer);
      // }));

      // Send the API request
      {/*change these fields since new name is added, gender: male or female, firstname, lastname, middlename, college, program*/ }
      const response = await fetch('/verifyAttachments/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set Content-Type to application/json
        },
        body: JSON.stringify({
          attachmentBuffers: attachmentBuffers, // Send the array of Buffers
          name: formData.name,
          email: formData.email,
          school: formData.school,
          program: formData.program,
          college: formData.college,
          year_level: formData.year_level,
          status: formData.status,
          student_id: formData.student_id,
          university: formData.university,
          scholarship_type: formData.scholarship_type,
          gpa_requirement: formData.gpa_requirement,
          benefactor: formData.benefactor,
          academic_year: formData.academic_year,
          contract_expiration: formData.contract_expiration,
          is_revoked: formData.is_revoked,
        }),
      });


      console.log('Response:', response);


      // Call onAddScholar only if it exists and is a function
      if (onAddScholar && typeof onAddScholar === 'function') {
        onAddScholar(formData);
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-[#283971]">Add New Scholar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Information Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-[#283971] mb-3">Student Information</h3>
            </div>
            <InputField
              id="name"
              name="name"
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            {/* Email Field */}
            <InputField
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="e.g. student@example.com"
              required
            />

            {/* Student ID Field */}
            <InputField
              id="student_id"
              name="student_id"
              label="Student ID"
              type="text"
              value={formData.student_id}
              onChange={handleChange}
              error={errors.student_id}
              placeholder="e.g. 2020-0001"
              required
            />
            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Sex <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] ${errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
            </div>

            {/* College Field */}
            <div>
              <label htmlFor="programType" className="block text-sm font-medium text-gray-700 mb-1">
                Program <span className="text-red-500">*</span>
              </label>
              <select
                id="programType"
                name="programType"
                value={formData.program}
                onChange={handleChange}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] ${errors.scholarship_type ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select College Program </option>
                <optgroup label="College of Agriculture">
                  {programOptions["College of Agriculture"].map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="College of Arts and Sciences">
                  {programOptions["College of Arts and Sciences"].map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="College of Computer Studies">
                  {programOptions["College of Computer Studies"].map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="College of Engineering">
                  {programOptions["College of Engineering"].map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="College of Nursing">
                  {programOptions["College of Nursing"].map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="School of Business and Management">
                  {programOptions["School of Business and Management"].map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="College of Education">
                  {programOptions["College of Education"].map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>
              </select>
              {errors.program && <p className="mt-1 text-sm text-red-500">{errors.program}</p>}
            </div>

            {/* Year Level Field */}
            <div>
              <label htmlFor="yearLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Year Level <span className="text-red-500">*</span>
              </label>
              <select
                id="yearLevel"
                name="yearLevel"
                value={formData.year_level}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] ${errors.year_level ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select year level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
              </select>
              {errors.year_level && <p className="mt-1 text-sm text-red-500">{errors.year_level}</p>}
            </div>

            {/* Status Field */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Scholarship Information Section */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-semibold text-[#283971] mb-3">Scholarship Information</h3>
            </div>

            {/* Scholarship Type Field */}
            <div className="md:col-span-2">
              <label htmlFor="scholarshipType" className="block text-sm font-medium text-gray-700 mb-1">
                Scholarship Type <span className="text-red-500">*</span>
              </label>
              <select
                id="scholarshipType"
                name="scholarshipType"
                value={formData.scholarship_type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] ${errors.scholarship_type ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select scholarship type</option>
                <optgroup label="University Funded Scholarships">
                  {scholarshipOptions["University Funded Scholarships"].map((scholarship) => (
                    <option key={scholarship} value={scholarship}>
                      {scholarship}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Externally Funded Scholarships">
                  {scholarshipOptions["Externally Funded Scholarships"].map((scholarship) => (
                    <option key={scholarship} value={scholarship}>
                      {scholarship}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Government Funded Scholarships">
                  {scholarshipOptions["Government Funded Scholarships"].map((scholarship) => (
                    <option key={scholarship} value={scholarship}>
                      {scholarship}
                    </option>
                  ))}
                </optgroup>
              </select>
              {errors.scholarship_type && <p className="mt-1 text-sm text-red-500">{errors.scholarship_type}</p>}
            </div>

            {/* Benefactor Field */}
            <InputField
              id="benefactor"
              name="benefactor"
              label="Benefactor/Sponsor"
              type="text"
              value={formData.benefactor}
              onChange={handleChange}
              error={errors.benefactor}
              placeholder="e.g. XU Alumni Association"
              required
            />

            {/* GPA Requirement Field */}
            <InputField
              id="gpa_requirement"
              name="gpa_requirement"
              label="GPA Requirement"
              type="number"
              value={formData.gpa_requirement}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="4.0"
            />

            {/* Academic Year Field */}
            <div>
              <label htmlFor="academic_year"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Academic Year
              </label>
              <select
                id="academic_year"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971]"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
                <option value="2021-2022">2021-2022</option>
              </select>
            </div>

            {/* Contract Expiration Field */}
            <InputField
              id="contract_expiration"
              name="contract_expiration"
              label="Contract Expiration Date"
              type="date"
              value={formData.contract_expiration}
              onChange={handleDateChange}
              error={errors.contract_expiration}
              required
            />

            {/* Is Revoked Field */}
            <div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="is_revoked"
                  name="is_revoked"
                  checked={formData.is_revoked}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#283971] focus:ring-[#283971] border-gray-300 rounded"
                />
                <label htmlFor="is_revoked" className="ml-2 block text-sm text-gray-700">
                  Is Scholarship Revoked
                </label>
              </div>
            </div>

            {/* Attachment Field - Changed to file upload */}
            <div className="md:col-span-2">
              <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                Attachment
              </label>
              <div className="flex items-center">
                <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#283971]">
                  <span className="text-sm text-gray-600">Choose file</span>
                  <input
                    type="file"
                    id="attachment"
                    name="attachment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {fileSelected ? fileSelected : "No file selected"}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload scholarship documents, agreements, or any relevant files.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#A19158] text-white rounded-lg hover:bg-[#283971] transition-colors"
            >
              Add Scholar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScholarModal;