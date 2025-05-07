
"use client";
import { useProfile } from "../profileContext";
import { X } from "lucide-react";

//TODO: change this rather than modal it will directly edit here

export function EditFormModal({ action }: { action: (formData: FormData) => Promise<void> }) {

    const { setProfile, profile, isEditProfileModalOpen, handleCancel, handleProfileUpdate } = useProfile();

    async function handleAction(formdata: FormData) {
        try {
            await action(formdata);
            handleProfileUpdate();
        }
        catch (error) {
            console.error("Error updating profile:", error);
            alert("Invalid input when updating profile. Please try again.");
        }
    }

    if (!isEditProfileModalOpen)
        return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>

                    <button
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>

                </div>
                <form action={handleAction} className="space-y-4">


                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            required
                            id="name"
                            name="name"
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                        <input
                            required
                            id="student_id"
                            name="student_id"
                            type="number"
                            value={profile.student_id}
                            onChange={(e) => setProfile({ ...profile, student_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">University</label>
                        <input
                            required
                            id="university"
                            name="university"
                            type="text"
                            value={profile.university}
                            onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                        <input
                            required
                            id="program"
                            name="program"
                            type="text"
                            value={profile.program}
                            onChange={(e) => setProfile({ ...profile, program: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="year_level" className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                        <input
                            required
                            id="year_level"
                            name="year_level"
                            type="number"
                            value={profile.year_level}
                            onChange={(e) => setProfile({ ...profile, year_level: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">

                        <button
                            type="button"
                            onClick={handleCancel}
                            className="font-semibold px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="font-semibold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}