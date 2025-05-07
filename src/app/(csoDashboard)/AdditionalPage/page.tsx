"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import { programOptions } from '@/constants/programOptions';

const AddModulesPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        schoolYear: '',
        benefactor: '',
        program: '',
        college: '',
        scholarship_type: '',
    });
    const [showCustomCollege, setShowCustomCollege] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'college' && e.target instanceof HTMLSelectElement) {
            if (value === 'Other') {
                setShowCustomCollege(true);
                setFormData(prev => ({
                    ...prev,
                    college: '',
                }));
            } else {
                setShowCustomCollege(false);
                setFormData(prev => ({
                    ...prev,
                    college: value,
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
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

    const validateForm = () => {
        // No validation required; allow empty fields
        setErrors({});
        return true;
    };

    const handleClear = () => {
        setFormData({
            schoolYear: '',
            benefactor: '',
            program: '',
            college: '',
            scholarship_type: '',
        });
        setShowCustomCollege(false);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch('/api/modules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to add module');
            }

            router.push('/'); // Redirect to dashboard or modules list
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const scholarshipCategories = [
        'University Funded Scholarships',
        'Externally Funded Scholarships',
        'Government Funded Scholarships',
    ];

    const colleges = Object.keys(programOptions).concat('Other');

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-[#283971] mb-6">Add New Modules</h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        {/* Module Information Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-[#283971] mb-3">Module Information</h3>
                        </div>

                        {/* Year Field */}
                        <InputField
                            id="schoolYear"
                            name="schoolYear"
                            label="Academic Year"
                            type="text"
                            value={formData.schoolYear}
                            onChange={handleChange}
                            error={errors.schoolYear}
                            placeholder="e.g. 2023-2024"
                        />

                        {/* Scholarship Type Field */}
                        <div>
                            <label htmlFor="scholarship_type" className="block text-sm font-medium text-gray-700 mb-1">
                                Scholarship Type
                            </label>
                            <select
                                id="scholarship_type"
                                name="scholarship_type"
                                value={formData.scholarship_type}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] ${errors.scholarship_type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Select scholarship type</option>
                                {scholarshipCategories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {errors.scholarship_type && <p className="mt-1 text-sm text-red-500">{errors.scholarship_type}</p>}
                        </div>

                        {/* Benefactor Field */}
                        <InputField
                            id="benefactor"
                            name="benefactor"
                            label="Benefactor"
                            type="text"
                            value={formData.benefactor}
                            onChange={handleChange}
                            error={errors.benefactor}
                            placeholder="e.g. City Scholar"
                        />

                        {/* College Field */}
                        <div>
                            <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                                College
                            </label>
                            <select
                                id="college"
                                name="college"
                                value={showCustomCollege ? 'Other' : formData.college}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] ${errors.college ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Select college</option>
                                {colleges.map((college) => (
                                    <option key={college} value={college}>
                                        {college}
                                    </option>
                                ))}
                            </select>
                            {errors.college && <p className="mt-1 text-sm text-red-500">{errors.college}</p>}
                        </div>

                        {/* Custom College Field (shown when Other is selected) */}
                        {showCustomCollege && (
                            <InputField
                                id="customCollege"
                                name="college"
                                label="Custom College"
                                type="text"
                                value={formData.college}
                                onChange={handleChange}
                                error={errors.college}
                                placeholder="e.g. College of Fine Arts"
                            />
                        )}

                        {/* Program Field */}
                        <InputField
                            id="program"
                            name="program"
                            label="Program"
                            type="text"
                            value={formData.program}
                            onChange={handleChange}
                            error={errors.program}
                            placeholder="e.g. Computer Science"
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#A19158] text-white rounded-lg hover:bg-[#283971] transition-colors"
                        >
                            Add Modules
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddModulesPage;