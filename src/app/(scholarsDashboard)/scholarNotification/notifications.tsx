"use client";

import React, { useState, useEffect } from "react";
import ScholarNotifications, { Notification } from "@/components/ScholarNotifications";
import UploadFileModal from "@/components/(modal)/uploadFileModal";
import { useProfile } from "../profileContext";

interface ProfileData {
    email: string;
    name: string;
    student_id: string;
    university: string;
    program: string;
    year_level: string;
}

// Custom Alert Component
const CustomAlert = ({ message, type, onClose }: { message: string; type: "error" | "success"; onClose: () => void }) => {
    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${type === "error" ? "bg-red-100 border-red-400 text-red-800" : "bg-green-100 border-green-400 text-green-800"}`}>
            <div className="flex items-center">
                <div className="mr-3">
                    {type === "error" ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <div>
                    <p className="font-bold">{type === "error" ? "Error" : "Success"}</p>
                    <p>{message}</p>
                </div>
                <button onClick={onClose} className="ml-4">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default function Notifications({ notifData }: { notifData: Notification[] }) {
    const { profile } = useProfile();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[] | []>(notifData);
    const [alert, setAlert] = useState<{ show: boolean; message: string; type: "error" | "success" } | null>(null);

    useEffect(() => {
        const eventSource = new EventSource('/scholarNotification/api');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setNotifications(data);
        };

        eventSource.onerror = () => {
            console.error('EventSource failed');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);


    const handleMarkAllAsRead = (email: string) => {
        console.log("Marking all notifications as read for", email);
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) => {
                if (!notification.is_read_by.includes(email)) {
                    return {
                        ...notification,
                        is_read_by: [...notification.is_read_by, email],
                    };
                }
                return notification;
            })
        );

        // loop through notifications and send a post request to mark them as read
        notifications.forEach((notification) => {
            if (!notification.is_read_by.includes(email)) {
                fetch('/scholarNotification/api', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, id: notification.id }),
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        console.log('Notification marked as read:', data);
                    })
                    .catch((error) => {
                        console.error('Error marking notification as read:', error);
                    });
            }
        });
    };

    const handleSubmitDocuments = (notificationId: string) => {
        console.log(`Submit missing documents for notification ID: ${notificationId}`);
        setSelectedNotificationId(notificationId);
        setIsModalOpen(true);
    };

    // Validate profile data is complete
    const validateProfileData = (): boolean => {
        const requiredFields: Array<keyof ProfileData> = [
            'email', 'name', 'student_id', 'university', 'program', 'year_level'
        ];

        const missingFields = requiredFields.filter(field => !profile[field]);

        if (missingFields.length > 0) {
            const formattedFields = missingFields.map(field => field.replace('_', ' ')).join(', ');
            setAlert({
                show: true,
                message: `Please complete your profile information. Missing fields: ${formattedFields}`,
                type: "error"
            });
            return false;
        }

        return true;
    };

    const handleFileUpload = async (files: File[]) => {
        // Validate profile data before proceeding
        if (!validateProfileData()) {
            return;
        }

        console.log("Uploading files:", files);
        console.log("For notification ID:", selectedNotificationId);

        if (selectedNotificationId) {
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) => {
                    if (notification.id === selectedNotificationId) {
                        return {
                            ...notification,
                            is_read_by: notification.is_read_by.includes(profile.email)
                                ? notification.is_read_by
                                : [...notification.is_read_by, profile.email],
                            is_acted_by: notification.is_acted_by.includes(profile.email)
                                ? notification.is_acted_by
                                : [...notification.is_acted_by, profile.email],
                        };
                    }
                    return notification;
                })
            );
        }

        // Upload the files and update the scholarship model
        try {
            const buffers = await Promise.all(files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                return Buffer.from(arrayBuffer);
            }));

            // Assuming you have the reference or some unique identifier from the notification
            const notification = notifications.find(n => n.id === selectedNotificationId);
            if (notification) {
                const reference = notification.id; // Assuming notification has a reference field

                const response = await fetch('/scholarNotification/api', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: profile.email,
                        name: profile.name,
                        reference: reference,
                        attachment: buffers,
                        student_id: profile.student_id,
                        university: profile.university,
                        program: profile.program,
                        year_level: profile.year_level,
                    }),
                });

                if (response.ok) {
                    setAlert({
                        show: true,
                        message: "Documents successfully uploaded!",
                        type: "success"
                    });
                }
            }
        }
        catch (error) {
            console.error("Error uploading files:", error);
            setAlert({
                show: true,
                message: "Error uploading files. Please try again.",
                type: "error"
            });
        }

        setIsModalOpen(false);


        // send a put request to mark the notification as read
        fetch('/scholarNotification/api', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: profile.email, id: selectedNotificationId }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Notification marked as read:', data);
            })
            .catch((error) => {
                console.error('Error marking notification as read:', error);
            });
    };

    const handleNotificationClick = (notificationId: string) => {
        console.log(`Notification clicked with ID: ${notificationId}`);
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) => {
                if (notification.id === notificationId && !notification.is_read_by.includes(profile.email)) {
                    return {
                        ...notification,
                        is_read_by: [...notification.is_read_by, profile.email],
                    };
                }
                return notification;
            })
        );

        // send a put request to mark the notification as read
        fetch('/scholarNotification/api', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: profile.email, id: notificationId }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Notification marked as read:', data);
            })
            .catch((error) => {
                console.error('Error marking notification as read:', error);
            });
    };

    return (
        <>
            {alert && alert.show && (
                <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}

            <ScholarNotifications
                notifications={notifications}
                userEmail={profile.email}
                onMarkAllAsRead={handleMarkAllAsRead}
                onSubmitDocuments={handleSubmitDocuments}
                onNotificationClick={handleNotificationClick}
            />

            <UploadFileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFileUpload}
            />
        </>
    );
}