"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '../profileContext';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Notification {
    id: string;
    message: string;
    is_read_by: string[];
    is_acted_by: string[];
    date_posted: string;
}

const Announcements = () => {
    const { profile } = useProfile();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!profile.email) {
            setError('Profile email is missing');
            return;
        }

        // Initial fetch with retry logic
        const fetchInitialNotifications = async (retries = 3, delay = 1000) => {
            setIsLoading(true);
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(`/scholarNotification/api/initialNotifications?email=${encodeURIComponent(profile.email)}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    const sortedNotifications = data
                        .sort((a: Notification, b: Notification) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime())
                        .slice(0, 2);
                    setNotifications(sortedNotifications);
                    setError(null);
                    setIsLoading(false);
                    return;
                } catch (err) {
                    console.error(`Attempt ${i + 1} failed:`, err);
                    if (i < retries - 1) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    setError('Failed to fetch announcements. Please try again later.');
                    setIsLoading(false);
                }
            }
        };

        fetchInitialNotifications();

        // Real-time updates
        const eventSource = new EventSource(`/scholarNotification/api?email=${encodeURIComponent(profile.email)}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const sortedNotifications = data
                    .sort((a: Notification, b: Notification) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime())
                    .slice(0, 2);
                setNotifications(sortedNotifications);
                setError(null);
            } catch (err) {
                console.error('Error parsing EventSource data:', err);
                setError('Error processing real-time updates');
            }
        };

        eventSource.onerror = () => {
            console.error('EventSource connection failed');
            setError('Failed to connect to real-time announcements');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [profile.email]);

    const handleNotificationClick = async (notificationId: string) => {
        if (!profile.email) return;

        // Optimistic update
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

        try {
            const response = await fetch('/scholarNotification/api', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: profile.email, id: notificationId }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Notification marked as read:', data);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            setError('Failed to mark announcement as read');
            // Revert optimistic update on failure
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) => {
                    if (notification.id === notificationId) {
                        return {
                            ...notification,
                            is_read_by: notification.is_read_by.filter(email => email !== profile.email),
                        };
                    }
                    return notification;
                })
            );
        }
    };

    return (
        <div className="rounded-[20px] shadow-lg overflow-hidden">
            <div className="bg-[#283971] text-white px-6 py-4 flex justify-between items-center shadow-sm">
                <h2 className="text-xl font-bold">Announcements</h2>
                <Link
                    href="/scholarNotification"
                    className="flex items-center text-sm border border-white text-white font-medium px-3 py-1 rounded-full hover:bg-white hover:text-[#283971] transition-all duration-200"
                >
                    See All
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
            <div className="bg-gradient-to-b from-[#283971]/10 to-[#D9D9D9] p-6">
                <div className="space-y-4">
                    {isLoading ? (
                        <p className="text-gray-600 text-center py-4 font-medium">Loading announcements...</p>
                    ) : error ? (
                        <p className="text-red-600 text-center py-4 font-medium">{error}</p>
                    ) : notifications.length === 0 ? (
                        <p className="text-gray-600 text-center py-4 font-medium">No new announcements</p>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id)}
                                className={`bg-white rounded-lg p-4 cursor-pointer transition-all duration-300 relative ${notification.is_read_by.includes(profile.email)
                                    ? 'opacity-90 shadow-sm'
                                    : 'shadow-md hover:shadow-xl border-l-4 border-gradient-to-r from-[#283971] to-[#3A50A0]'
                                    }`}
                            >
                                {!notification.is_read_by.includes(profile.email) && (
                                    <span className="absolute top-4 right-4 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                                <p className="text-sm text-gray-800 pr-8 font-medium">
                                    {notification.message.length > 100
                                        ? `${notification.message.substring(0, 100)}...`
                                        : notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {new Date(notification.date_posted).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Announcements;
