
// Updated StatusContext
"use client";
import React, { createContext, ReactNode, useContext, useState, Dispatch, SetStateAction } from "react";

// Define the shape of your status data
interface StatusData {
    grouped: {
        scholarship_type: string | null;
        count: number;
        active: number;
        expired: number;
        total: number; // Added total
        percent: number;
    }[];
    totalCount: number;
    totalActive: number;
    totalPending: number;
}

// Default status data (if no initial data is provided)
const defaultStatusData: StatusData = {
    grouped: [],
    totalCount: 0,
    totalActive: 0,
    totalPending: 0,
};

// Define the context type
interface StatusContextType {
    status: StatusData;
    setStatus: Dispatch<SetStateAction<StatusData>>;
}

// Create the context
const StatusContext = createContext<StatusContextType | undefined>(undefined);

// Define the provider props
interface StatusProviderProps {
    children: ReactNode;
    statusData?: StatusData;
}

// Create the provider component
export const StatusProvider = ({ children, statusData }: StatusProviderProps) => {
    const [status, setStatus] = useState<StatusData>(statusData || defaultStatusData);

    return (
        <StatusContext.Provider value={{ status, setStatus }}>
            {children}
        </StatusContext.Provider>
    );
};

// Create the hook to use the context
export const useStatus = () => {
    const context = useContext(StatusContext);
    if (!context) {
        throw new Error("useStatus must be used within a StatusProvider");
    }
    return context;
};