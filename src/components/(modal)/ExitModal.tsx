"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#283971] mb-4">Confirm Logout</h2>
        <p className="text-gray-700 mb-6">Are you sure you want to sign out?</p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              router.push('/login'); 
            }}
            className="px-4 py-2 bg-[#A19158] text-white rounded-lg hover:bg-[#283971] transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitModal;