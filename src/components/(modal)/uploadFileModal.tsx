"use client";

import React, { useState, useCallback, useRef } from "react";
import { X, Upload, File as FileIcon, AlertCircle, Trash2 } from "lucide-react";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: File[]) => void;
  maxFileSize?: number; // in MB
  maxFiles?: number;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  maxFileSize = 10, // Default 10MB
  maxFiles = 10,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Define allowed file types
  const allowedFileTypes = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Validate files
  const validateFiles = (filesToValidate: File[]): { valid: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    filesToValidate.forEach(file => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        newErrors.push(`${file.name} exceeds the maximum file size of ${maxFileSize}MB`);
        return;
      }

      // Check file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const isAllowed = allowedFileTypes.some(type => 
        file.type.includes(type.replace('.', '')) || 
        `.${fileExtension}` === type || 
        fileExtension === type.replace('.', '')
      );
      
      if (!isAllowed) {
        newErrors.push(`${file.name} has an unsupported file type. Only PDF, DOC, PNG, and JPG files are allowed.`);
        return;
      }

      validFiles.push(file);
    });

    // Check total number of files
    if (validFiles.length + files.length > maxFiles) {
      newErrors.push(`Cannot upload more than ${maxFiles} files`);
      return { valid: [], errors: newErrors };
    }

    return { valid: validFiles, errors: newErrors };
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const { valid, errors: newErrors } = validateFiles(newFiles);
      
      if (valid.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...valid]);
      }
      
      setErrors(newErrors);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setErrors([]);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length > 0) {
      onSubmit(files);
      setFiles([]);
      setErrors([]);
      onClose();
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const { valid, errors: newErrors } = validateFiles(newFiles);
      
      if (valid.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...valid]);
      }
      
      setErrors(newErrors);
    }
  }, [files.length, maxFileSize, maxFiles]);

  // Click handler for the drop zone
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Close modal with ESC key
  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  // Close modal if click outside
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-2xl shadow-lg w-4/5 max-w-3xl p-8 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">Upload Files</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Drop zone */}
          <div
            className={`mb-5 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <Upload className="h-16 w-16 mx-auto text-gray-400 mb-3" />
            <p className="text-lg text-gray-700 font-medium">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Accepted file types: PDF, DOC, PNG, JPG
              {` (Max: ${maxFileSize}MB per file, ${maxFiles} files)`}
            </p>
          </div>

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} />
                <span className="font-medium">Please fix the following errors:</span>
              </div>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="mb-5 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <FileIcon size={22} className="text-gray-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-base font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-gray-400 hover:text-red-500 shrink-0 p-2 rounded-full hover:bg-gray-100"
                    aria-label="Remove file"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-base font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                files.length === 0
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={files.length === 0}
            >
              Upload {files.length > 0 && `(${files.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadFileModal;