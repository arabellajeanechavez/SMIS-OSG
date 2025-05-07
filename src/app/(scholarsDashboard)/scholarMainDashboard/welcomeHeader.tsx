"use client";
import { User } from 'lucide-react';
import { useProfile } from '../profileContext';

export default function WelcomeHeader() {
    const { profile } = useProfile();

    return (
        <div className="mb-8">
            <div className="flex flex-col lg:flex-row h-[280px] justify-between items-start lg:items-center p-6 rounded-[20px] bg-[#D9D9D9] border-2 border-[#ABABAB]">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4">
                        <User className="w-7 h-7 text-[#343434]" />
                        <h1 className="text-3xl font-bold text-[#343434]">
                            Welcome, <span className="text-[#343434] ">{profile.name}</span>
                        </h1>
                    </div>
                    <p className="text-sm text-[#343434] max-w-md">
                        Stay on top of your journey! View your scholarship status, upload any missing documents, and unlock new opportunities to shine.
                    </p>
                </div>
            </div>
        </div>
    );
}