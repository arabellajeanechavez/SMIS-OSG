"use client";
import React, { useRef, useEffect, createContext, ReactNode, useContext, useState, Dispatch, SetStateAction } from "react";

// Define the structure of the profile data
interface ProfileData {
  email: string;
  name: string;
  student_id: string;
  university: string;
  program: string;
  year_level: string;
}

// Default profile data
const defaultProfileData: ProfileData = {
  email: "",
  name: "",
  student_id: "",
  university: "",
  program: "",
  year_level: "",
};

// Create the Profile Context with type definition
interface ProfileContextValue {
  profile: ProfileData;
  setProfile: Dispatch<SetStateAction<ProfileData>>;
  handleCancel: () => void;
  handleProfileUpdate: () => void;
  handleOpenModal: () => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: Dispatch<SetStateAction<boolean>>;
  originalProfile: React.MutableRefObject<ProfileData>;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: defaultProfileData, // Use default profile data
  setProfile: () => { },
  handleCancel: () => { },
  handleProfileUpdate: () => { },
  handleOpenModal: () => { },
  isEditProfileModalOpen: false,
  setIsEditProfileModalOpen: () => { },
  originalProfile: { current: defaultProfileData }, // use default profile data
});

// Define the props for the ProfileProvider component
interface ProfileProviderProps {
  children: ReactNode;
  profileData?: ProfileData;
}

// ProfileProvider component to provide the context value
export const ProfileProvider = ({ children, profileData }: ProfileProviderProps) => {
  const [profile, setProfile] = useState<ProfileData>(profileData || defaultProfileData); // Handle undefined profileData
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const originalProfile = useRef<ProfileData>(profileData ? { ...profileData } : defaultProfileData); // Initialize ref correctly

  const handleProfileUpdate = () => {
    setIsEditProfileModalOpen(false);
    originalProfile.current = { ...profile }; // Update original profile
  };

  const handleCancel = () => {
    setIsEditProfileModalOpen(false);
    setProfile({ ...originalProfile.current }); // Restore original profile state
  };

  const handleOpenModal = () => {
    originalProfile.current = { ...profile }; // Store original profile before editing
    setIsEditProfileModalOpen(true);
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      setProfile,
      originalProfile,
      isEditProfileModalOpen,
      setIsEditProfileModalOpen,
      handleCancel,
      handleProfileUpdate,
      handleOpenModal,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to consume the Profile Context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};