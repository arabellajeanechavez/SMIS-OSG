'use client';

import React, { useState, useRef } from 'react';
import { Upload, Check, X, BellRing, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { scholarshipOptions } from '@/constants/scholarshipOptions';
import { useProfile } from './ProfileContext';

interface FormData {
    contractFile: File | null;
    scholarship: string;
    deadline: string;
    message: string;
    recipientTargeting: 'all' | 'specific';
    recipients: string[];
}

interface AlertProps {
    type: 'success' | 'error' | 'warning';
    message: string;
}

interface ContractUploadCardProps {
    action: (formData: FormData) => Promise<any>;
}

const ContractUploadCard: React.FC<ContractUploadCardProps> = ({ action }) => {
    const { profile } = useProfile();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        contractFile: null,
        scholarship: '',
        deadline: '',
        message: '',
        recipientTargeting: 'all',
        recipients: [],
    });

    const [fileName, setFileName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [recipientInput, setRecipientInput] = useState('');
    const [emailError, setEmailError] = useState('');
    const [alertInfo, setAlertInfo] = useState<AlertProps | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recipientInputRef = useRef<HTMLTextAreaElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        if (isModalOpen) {
            resetForm();
        }
    };

    const resetForm = () => {
        setFormData({
            contractFile: null,
            scholarship: '',
            deadline: '',
            message: '',
            recipientTargeting: 'all',
            recipients: [],
        });
        setFileName('');
        setErrors({});
        setUploadSuccess(false);
        setUploadError('');
        setRecipientInput('');
        setEmailError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateFile = (file: File): boolean => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const isValidType = ['pdf', 'doc', 'docx'].includes(extension || '');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        if (!isValidType) {
            setErrors((prev) => ({ ...prev, contractFile: 'Only PDF and DOC/DOCX files are allowed' }));
            return false;
        }
        if (!isValidSize) {
            setErrors((prev) => ({ ...prev, contractFile: 'File size exceeds 10MB limit' }));
            return false;
        }
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFormData((prev) => ({ ...prev, contractFile: selectedFile }));
            setFileName(selectedFile.name);
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.contractFile;
                return newErrors;
            });
        } else {
            setFormData((prev) => ({ ...prev, contractFile: null }));
            setFileName('');
            if (e.target.value) {
                e.target.value = '';
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const selectedFile = e.dataTransfer.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFormData((prev) => ({ ...prev, contractFile: selectedFile }));
            setFileName(selectedFile.name);
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(selectedFile);
                fileInputRef.current.files = dataTransfer.files;
            }
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.contractFile;
                return newErrors;
            });
        } else {
            setFormData((prev) => ({ ...prev, contractFile: null }));
            setFileName('');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleRemoveFile = () => {
        setFormData((prev) => ({ ...prev, contractFile: null }));
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.contractFile;
            return newErrors;
        });
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRecipientInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRecipientInput(e.target.value);
        setEmailError('');
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.recipients;
            return newErrors;
        });
    };

    const processEmails = () => {
        const emails = recipientInput
            .split(',')
            .map((email) => email.trim())
            .filter((email) => email !== '');
        if (emails.length === 0) {
            setEmailError('Please enter at least one email address');
            return;
        }

        const invalidEmails: string[] = [];
        const duplicateEmails: string[] = [];
        const validEmails: string[] = [];

        emails.forEach((email) => {
            if (!isValidEmail(email)) {
                invalidEmails.push(email);
            } else if (formData.recipients.includes(email)) {
                duplicateEmails.push(email);
            } else {
                validEmails.push(email);
            }
        });

        if (invalidEmails.length > 0) {
            setEmailError(`Invalid email format: ${invalidEmails.join(', ')}`);
            return;
        }
        if (duplicateEmails.length > 0) {
            setEmailError(`Duplicate emails: ${duplicateEmails.join(', ')}`);
            return;
        }

        setFormData((prev) => ({
            ...prev,
            recipients: [...prev.recipients, ...validEmails],
        }));
        setRecipientInput('');
    };

    const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processEmails();
        }
    };

    const handleRecipientBlur = () => {
        if (recipientInput.trim() !== '') {
            processEmails();
        }
    };

    const handleRemoveRecipient = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            recipients: prev.recipients.filter((_, i) => i !== index),
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'scholarship' && prev.recipientTargeting === 'all' ? { recipients: [] } : {}),
        }));
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const validateForm = (): Record<string, string> => {
        const newErrors: Record<string, string> = {};
        if (!formData.contractFile) {
            newErrors.contractFile = 'Please select a contract file';
        }
        if (!formData.scholarship) {
            newErrors.scholarship = 'Please select a scholarship type';
        }
        if (!formData.deadline) {
            newErrors.deadline = 'Please select a deadline date';
        }
        if (formData.recipientTargeting === 'specific' && formData.recipients.length === 0) {
            newErrors.recipients = 'Please add at least one recipient email address';
        }
        return newErrors;
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        // Open the confirmation modal instead of submitting immediately
        setIsConfirmModalOpen(true);
    };

    const confirmPublish = async () => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("message", FormData.message);
            if (FormData.deadline) {
                formData.append("deadline", FormData.deadline);
            }
            if (FormData.recipientTargeting === 'specific') {
                FormData.recipients.forEach((email) => {
                    formData.append('recipients', email);
                })
            }
            else if (FormData.recipientTargeting === 'everyone') {
                formData.append('recipients', 'everyone');
            }
            formData.append("date_posted", new Date().toISOString());
            formData.append("published_by", profile.email);

            setIsConfirmModalOpen(false);
            await action(FormData);

            setAlertInfo({
                type: "success",
                message: "Announcement published successfully!"
            });

            // Reset form after successful submission
            resetForm();
        }
        catch (error) {
            console.error("Error publishing announcement:", error);
            setAlertInfo({
                type: "error",
                message: "Failed to publish announcement. Please try again."
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['pdf'].includes(extension || '')) {
            return '📄';
        } else if (['doc', 'docx'].includes(extension || '')) {
            return '📝';
        }
        return '📁';
    };

    const formatFileSize = (size: number) => {
        if (size < 1024) {
            return size + ' B';
        } else if (size < 1024 * 1024) {
            return (size / 1024).toFixed(2) + ' KB';
        } else {
            return (size / (1024 * 1024)).toFixed(2) + ' MB';
        }
    };

    // Alert component
    const AlertNotification = ({ alert, onClose }: { alert: AlertProps, onClose: () => void }) => {
        const bgColor = alert.type === "success" ? "bg-green-100" :
            alert.type === "error" ? "bg-red-100" : "bg-yellow-100";
        const textColor = alert.type === "success" ? "text-green-800" :
            alert.type === "error" ? "text-red-800" : "text-yellow-800";
        const Icon = alert.type === "success" ? CheckCircle :
            alert.type === "error" ? XCircle : AlertTriangle;

        return (
            <div className={`fixed top-4 right-4 z-50 rounded-lg shadow-md p-4 ${bgColor} flex items-start space-x-3 max-w-sm animate-fade-in`}>
                <Icon className={`w-5 h-5 ${textColor} mt-0.5`} />
                <div className="flex-1">
                    <p className={`font-medium ${textColor}`}>{alert.message}</p>
                </div>
                <button onClick={onClose} className={`${textColor} hover:text-black`}>
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow mb-8 border border-gray-200">
            {alertInfo && (
                <AlertNotification
                    alert={alertInfo}
                    onClose={() => setAlertInfo(null)}
                />
            )}

            <div className="bg-blue-900 text-white p-6 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <Upload className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Upload Contract</h2>
                </div>
            </div>
            <div className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-gray-700 mb-2">Upload contract documents for scholars to review and sign</p>
                    <p className="text-sm text-gray-500">Set deadlines and add messages for specific instructions</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="bg-amber-700/10 p-3 rounded-full">
                        <BellRing className="w-6 h-6 text-blue-900" />
                    </div>
                    <button
                        onClick={toggleModal}
                        className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-blue-900 transition-colors"
                    >
                        Open Upload Form
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Only close if clicking the backdrop
                        if (e.target === e.currentTarget) {
                            toggleModal();
                        }
                    }}
                >
                    <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-blue-900">Upload Contract</h2>
                            <button
                                onClick={toggleModal}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-1 gap-6">
                                {uploadSuccess ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
                                        <Check className="w-6 h-6 text-green-500 mr-3" />
                                        <span className="text-green-700">Contract uploaded successfully!</span>
                                    </div>
                                ) : uploadError ? (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                                        <X className="w-6 h-6 text-red-500 mr-3" />
                                        <span className="text-red-700">{uploadError}</span>
                                    </div>
                                ) : null}

                                <div>
                                    <label htmlFor="contractFile" className="block text-sm font-medium text-gray-700 mb-1">
                                        Contract File <span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                                            ? 'border-amber-700 bg-amber-700/10'
                                            : 'border-gray-300 hover:border-blue-900 hover:bg-gray-50'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragEnter={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        {fileName ? (
                                            <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                                                <span className="flex items-center text-sm text-gray-600">
                                                    {getFileIcon(fileName)} {fileName} ({formatFileSize(formData.contractFile?.size || 0)})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFile}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    Drag & drop your file here or{' '}
                                                    <label
                                                        htmlFor="contractFile"
                                                        className="text-blue-900 hover:underline cursor-pointer"
                                                    >
                                                        click to browse
                                                    </label>
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Only PDF, DOC, DOCX files (Max 10MB)
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            id="contractFile"
                                            name="contractFile"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            ref={fileInputRef}
                                        />
                                    </div>
                                    {errors.contractFile && <p className="mt-1 text-sm text-red-500">{errors.contractFile}</p>}
                                </div>

                                <div>
                                    <label htmlFor="scholarship" className="block text-sm font-medium text-gray-700 mb-1">
                                        Target Scholarship <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="scholarship"
                                        name="scholarship"
                                        value={formData.scholarship}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${errors.scholarship ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select scholarship type</option>
                                        {Object.entries(scholarshipOptions).map(([category, scholarships]) => (
                                            <optgroup key={category} label={category}>
                                                {scholarships.map((scholarship) => (
                                                    <option key={scholarship} value={scholarship}>
                                                        {scholarship}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    {errors.scholarship && <p className="mt-1 text-sm text-red-500">{errors.scholarship}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Recipients <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="recipientTargeting"
                                                value="all"
                                                checked={formData.recipientTargeting === 'all'}
                                                onChange={() =>
                                                    setFormData((prev) => ({ ...prev, recipientTargeting: 'all', recipients: [] }))
                                                }
                                                className="form-radio h-4 w-4 text-blue-900 focus:ring-blue-900"
                                            />
                                            <span className="ml-2">
                                                All scholars in {formData.scholarship || 'selected scholarship'}
                                            </span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="recipientTargeting"
                                                value="specific"
                                                checked={formData.recipientTargeting === 'specific'}
                                                onChange={() =>
                                                    setFormData((prev) => ({ ...prev, recipientTargeting: 'specific' }))
                                                }
                                                className="form-radio h-4 w-4 text-blue-900 focus:ring-blue-900"
                                            />
                                            <span className="ml-2">Specific scholars</span>
                                        </label>
                                    </div>
                                    {formData.recipientTargeting === 'specific' && (
                                        <div className="mt-2">
                                            <textarea
                                                ref={recipientInputRef}
                                                value={recipientInput}
                                                onChange={handleRecipientInputChange}
                                                onKeyDown={handleRecipientKeyDown}
                                                onBlur={handleRecipientBlur}
                                                placeholder="Enter email addresses separated by commas"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${emailError || errors.recipients ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                rows={2}
                                            />
                                            {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
                                            {errors.recipients && <p className="mt-1 text-sm text-red-500">{errors.recipients}</p>}

                                            {formData.recipients.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {formData.recipients.map((email, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            <span className="mr-1">{email}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveRecipient(index)}
                                                                className="text-gray-500 hover:text-red-500"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                                        Response Deadline <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="deadline"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${errors.deadline ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.deadline && <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>}
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional messages
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Add any specific instructions or details for scholars..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                                    />
                                </div>

                                <div className="flex justify-end space-x-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={toggleModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className={`px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center space-x-2 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                <span>Upload Contract</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (e.target === e.currentTarget) {
                            setIsConfirmModalOpen(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Contract Upload</h3>
                        <p className="text-gray-700 mb-4">
                            {formData.recipientTargeting === 'all'
                                ? `This contract will be sent to all scholars in the ${formData.scholarship} scholarship program.`
                                : `This contract will be sent to ${formData.recipients.length} specific scholar(s).`}
                        </p>
                        <p className="text-gray-700 mb-6">
                            Scholars will be notified and must respond by <strong>{formData.deadline}</strong>.
                        </p>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmPublish}
                                disabled={isUploading}
                                className={`px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-blue-900 transition-colors ${isUploading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isUploading ? 'Processing...' : 'Confirm & Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractUploadCard;