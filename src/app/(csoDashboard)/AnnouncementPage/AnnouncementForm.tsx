"use client";
import React, { useState } from "react";
import { BellRing, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useProfile } from "../ProfileContext";

interface AnnouncementFormInputs {
  title: string;
  message: string;
  deadline?: string;
  contact: string;
  specificDetails?: string;
  emailTargeting: "everyone" | "specific";
  recipients: string[];
}

interface AlertProps {
  type: "success" | "error" | "warning";
  message: string;
}

export default function AnnouncementForm({ action }: { action: (formData: FormData) => Promise<void> }) {

  const { profile } = useProfile();

  const [category, setCategory] = useState("Scholarship Applications");
  const [formInputs, setFormInputs] = useState<AnnouncementFormInputs>({
    title: "",
    message: "",
    deadline: "",
    contact: "",
    specificDetails: "",
    emailTargeting: "everyone",
    recipients: [],
  });

  const [recipientInput, setRecipientInput] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [alertInfo, setAlertInfo] = useState<AlertProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleRecipientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientInput(e.target.value);
    setEmailError(""); // Clear any previous error
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddRecipient = () => {
    const trimmedEmail = recipientInput.trim();
    if (trimmedEmail === "") {
      setEmailError("Email cannot be empty.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Invalid email format.");
      return;
    }

    if (formInputs.recipients.includes(trimmedEmail)) {
      setEmailError("Email already added.");
      return;
    }

    setFormInputs((prev) => ({
      ...prev,
      recipients: [...prev.recipients, trimmedEmail],
    }));
    setRecipientInput("");
  };

  const handleRemoveRecipient = (index: number) => {
    setFormInputs((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate recipients if specific targeting is selected
    if (formInputs.emailTargeting === "specific" && formInputs.recipients.length === 0) {
      setAlertInfo({
        type: "warning",
        message: "Please add at least one recipient email address."
      });
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const resetForm = () => {
    setFormInputs({
      title: "",
      message: "",
      deadline: "",
      contact: "",
      specificDetails: "",
      emailTargeting: "everyone",
      recipients: [],
    });
    setCategory("Scholarship Applications");
  };

  const confirmPublish = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append("title", formInputs.title);
      formData.append("message", formInputs.message);
      if (category === "Scholarship Applications") {
        formData.append("category", "reminder");
        formData.append("requires_action", "true");
      } else if (category === "General Announcements") {
        formData.append("category", "announcement");
        formData.append("requires_action", "false");
      }
      if (formInputs.deadline) {
        formData.append("deadline", formInputs.deadline);
      }
      if (formInputs.emailTargeting === 'specific') {
        formInputs.recipients.forEach((email) => {
          formData.append('recipients', email);
        })
      }
      else if (formInputs.emailTargeting === 'everyone') {
        formData.append('recipients', 'everyone');
      }
      formData.append("date_posted", new Date().toISOString());
      formData.append("published_by", profile.email);

      setIsConfirmModalOpen(false);
      await action(formData);

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
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8">
      <div>
        {alertInfo && (
          <AlertNotification
            alert={alertInfo}
            onClose={() => setAlertInfo(null)}
          />
        )}

        <div className="flex items-center space-x-4 mb-8">
          <BellRing className="w-6 h-6 text-[#283971]" />
          <h1 className="text-3xl font-bold text-[#283971]">Announcements</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#283971] mb-4">Create New Announcement</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#283971] focus:ring-[#283971] p-2"
                required
              >
                <option value="Scholarship Applications">Scholarship Applications</option>
                <option value="General Announcements">General Announcements</option>
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formInputs.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#283971] focus:ring-[#283971] p-2"
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                value={formInputs.message}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#283971] focus:ring-[#283971] p-2"
                placeholder="Enter announcement content"
                required
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                Deadline (Optional)
              </label>
              <input
                type="date"
                id="deadline"
                value={formInputs.deadline}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#283971] focus:ring-[#283971] p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mt-7 mb-2">Recipients</label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    id="emailTargeting"
                    name="emailTargeting"
                    value="everyone"
                    checked={formInputs.emailTargeting === "everyone"}
                    onChange={() => setFormInputs((prev) => ({ ...prev, emailTargeting: "everyone", recipients: [] }))}
                    className="form-radio h-4 w-4 text-[#283971] focus:ring-[#283971]"
                  />
                  <span className="ml-2">Everyone</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    id="emailTargeting"
                    name="emailTargeting"
                    value="specific"
                    checked={formInputs.emailTargeting === "specific"}
                    onChange={() => setFormInputs((prev) => ({ ...prev, emailTargeting: "specific" }))}
                    className="form-radio h-4 w-4 text-[#283971] focus:ring-[#283971]"
                  />
                  <span className="ml-2">Selection</span>
                </label>
              </div>
              {formInputs.emailTargeting === "specific" && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={recipientInput}
                      onChange={handleRecipientInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#283971] focus:ring-[#283971] p-2"
                      placeholder="Enter email address"
                    />
                    <button
                      type="button"
                      onClick={handleAddRecipient}
                      className="px-3 py-2 bg-[#283971] text-white rounded-md hover:bg-[#1C2A4E] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formInputs.recipients.map((recipient, index) => (
                      <div
                        key={index}
                        className="bg-gray-200 rounded-full px-3 py-1 flex items-center space-x-1"
                      >
                        <span>{recipient}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(index)}
                          className="text-gray-500"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="cursor-pointer px-6 py-3 bg-[#283971] text-white rounded-md hover:bg-[#1C2A4E] transition-colors font-semibold"
              >
                Publish
              </button>
            </div>
          </form>
        </div>

        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4 text-[#283971]">Confirm</h2>

              <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                <h3 className="font-medium text-lg mb-2">{formInputs.title}</h3>
                <p className="text-gray-700 mb-2 text-sm">{formInputs.message}</p>

                <div className="mt-3 text-sm">
                  <p><span className="font-medium">Category:</span> {category}</p>
                  {formInputs.deadline && (
                    <p><span className="font-medium">Deadline:</span> {formInputs.deadline}</p>
                  )}
                  <p className="mt-1">
                    <span className="font-medium">Recipients:</span> {' '}
                    {formInputs.emailTargeting === "everyone"
                      ? "All users"
                      : formInputs.recipients.length > 0
                        ? `${formInputs.recipients.length} specific recipient(s)`
                        : "No recipients selected"}
                  </p>
                </div>
              </div>

              <p className="mb-6 text-gray-700">
                Are you sure you want to publish this announcement?
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPublish}
                  className="px-4 py-2 bg-[#283971] text-white rounded-md hover:bg-[#1C2A4E] transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : "Confirm Publish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}