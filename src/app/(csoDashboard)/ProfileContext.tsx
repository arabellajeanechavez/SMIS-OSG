"use client";
import React, { createContext, ReactNode, useContext, useState, Dispatch, SetStateAction } from "react";

// Define the structure of the profile data
interface ProfileData {
  email: string;
}

// Default profile data
const defaultProfileData: ProfileData = {
  email: ""
};

// Create the Profile Context with type definition
interface ProfileContextValue {
  profile: ProfileData;
  setProfile: Dispatch<SetStateAction<ProfileData>>;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: defaultProfileData, // Use default profile data
  setProfile: () => {},
});

// Define the props for the ProfileProvider component
interface ProfileProviderProps {
  children: ReactNode;
  profileData?: ProfileData;
}

// ProfileProvider component to provide the context value
export const ProfileProvider = ({ children, profileData }: ProfileProviderProps) => {
  const [profile, setProfile] = useState<ProfileData>(profileData || defaultProfileData); // Handle undefined profileData

  return (
    <ProfileContext.Provider value={{
      profile,
      setProfile,
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