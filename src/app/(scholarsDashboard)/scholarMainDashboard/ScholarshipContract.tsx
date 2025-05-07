"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { getScholarDetail } from '@/actions/scholarship';

interface ScholarshipContractProps {
    scholarshipId: string;
    contractUrl?: string;
}

const ScholarshipContract: React.FC<ScholarshipContractProps> = ({ scholarshipId, contractUrl }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contractExpiration, setContractExpiration] = useState<string>("N/A");
    const [daysUntilDeadline, setDaysUntilDeadline] = useState<number | null>(null);
    const [isDeadlinePassed, setIsDeadlinePassed] = useState<boolean>(false);

    useEffect(() => {
        async function fetchScholarship() {
            try {
                const scholarship = await getScholarDetail(scholarshipId);
                if (scholarship?.contract_expiration) {
                    const expirationDate = new Date(scholarship.contract_expiration);
                    setContractExpiration(expirationDate.toLocaleDateString());

                    // Calculate days until deadline
                    const currentDate = new Date();
                    const timeDiff = expirationDate.getTime() - currentDate.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    setDaysUntilDeadline(daysDiff);
                    setIsDeadlinePassed(daysDiff < 0);
                } else {
                    setContractExpiration("N/A");
                    setDaysUntilDeadline(null);
                    setIsDeadlinePassed(false);
                }
            } catch (error) {
                console.error("Failed to fetch scholarship data:", error);
                setContractExpiration("N/A");
                setDaysUntilDeadline(null);
                setIsDeadlinePassed(false);
            }
        }

        if (scholarshipId) {
            fetchScholarship();
        }
    }, [scholarshipId]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setIsModalOpen(true);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('scholarshipId', scholarshipId);

        try {
            const response = await fetch('/api/upload-contract', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Contract uploaded successfully!');
                setSelectedFile(null);
                setIsModalOpen(false);
            } else {
                alert('Failed to upload contract.');
            }
        } catch (error) {
            console.error('Error uploading contract:', error);
            alert('Error uploading contract.');
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="bg-[#D9D9D9] rounded-[20px] p-6 w-[520px] h-[585px] max-w-[100%] max-h-[90%] shadow-lg flex flex-col items-center">
                <div className="flex-1 w-full">
                    <h2 className="text-[#343434] text-lg font-semibold mb-4 text-center">Scholarship Contract</h2>
                    <div className="bg-[#FFFFFF] rounded-lg p-4 w-full mb-4">
                        <div className="text-sm text-gray-800">
                            <p><strong>Deadline:</strong></p>
                            <p>{contractExpiration}</p>
                        </div>
                    </div>
                    <div className="bg-[#FFFFFF] rounded-lg p-4 w-full mb-4">
                        <div className="text-sm text-gray-800">
                            <p className="text-red-600 font-semibold mt-2">
                                Important:
                            </p>
                            <p>
                                {daysUntilDeadline !== null && daysUntilDeadline >= 0
                                    ? `After ${daysUntilDeadline} days, this will be locked`
                                    : "The deadline has passed, uploads are locked"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center space-x-4 mb-4">
                    {contractUrl && (
                        <a
                            href={contractUrl}
                            download
                            className="flex items-center justify-center bg-[#283971] hover:bg-[#1e2a5c] text-white font-semibold py-3 px-3 rounded-[20px] w-[150px] transition-all duration-200 shadow-md hover:shadow-lg text-base"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Download
                        </a>
                    )}
                    <label
                        className={`flex items-center justify-center py-3 px-3 rounded-[20px] w-[150px] transition-all duration-200 shadow-md text-base
                            ${isDeadlinePassed
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-[#283971] hover:bg-[#1e2a5c] text-white font-semibold cursor-pointer hover:shadow-lg'
                            }`}
                    >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={isDeadlinePassed}
                        />
                    </label>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[#343434]">Confirm Upload</h3>
                            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            You have selected: <strong>{selectedFile?.name}</strong>
                            <br />
                            Would you like to submit this file?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleUpload}
                                className="flex items-center justify-center bg-[#283971] hover:bg-[#1e2a5c] text-white font-semibold py-3 px-3 rounded-[20px] w-[150px] transition-all duration-200 shadow-md hover:shadow-lg text-base"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ScholarshipContract;