'use client';

import React, { useState, useEffect } from 'react';
import { useStatus } from '../StatusContext';
import { User, Bell, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ContractUploadCard from '../ContractUploadCard';

// Define the notification interface (similar to ScholarNotifications)
interface Notification {
    _id: string;
    title: string;
    message: string;
    date_posted: string;
    deadline?: string;
    is_read_by: string[];
    category?: string;
    requires_action: boolean;
    student_id?: string;
    name?: string;
    program?: string;
    year_level?: string;
    reference?: string;
}

// todo: change cso to osg
export default function CSOMainDashboard() {
    const router = useRouter();
    const { status } = useStatus();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isBrowser, setIsBrowser] = useState(false);

    const adminInfo = {
        name: 'Admin User',
    };

    const scholarshipStatus = status.grouped
        .filter(item => item.scholarship_type)
        .slice(0, 3)
        .map((item) => ({
            name: item.scholarship_type,
            active: item.active,
            expired: item.expired,
            total: item.total,
        }));

    const statusSummary = [
        { name: 'Total Scholars', count: status.totalCount },
        { name: 'Active Scholars', count: status.totalActive },
        { name: 'Pending Application Requests', count: status.totalPending },
    ];

    // Initialize browser-side code
    useEffect(() => {
        setIsBrowser(true);
        // Only try to access localStorage after component is mounted
        const email = localStorage.getItem('userEmail');
        setUserEmail(email);
    }, []);

    // Set up SSE connection after we have the email
    useEffect(() => {
        if (!isBrowser || !userEmail) {
            return;
        }

        // Set up EventSource for real-time notifications using query parameters
        const eventSource = new EventSource(`/api/notifications?email=${encodeURIComponent(userEmail)}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setNotifications(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error parsing notification data:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            eventSource.close();
            setIsLoading(false);
        };

        return () => {
            eventSource.close();
        };
    }, [isBrowser, userEmail]);

    // Handle marking all notifications as read
    const handleMarkAllAsRead = () => {
        if (!userEmail) return;

        console.log("Marking all notifications as read for", userEmail);

        // Update local state
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) => {
                if (!notification.is_read_by.includes(userEmail)) {
                    return {
                        ...notification,
                        is_read_by: [...notification.is_read_by, userEmail],
                    };
                }
                return notification;
            })
        );

        // Loop through notifications and send a PUT request to mark them as read
        notifications.forEach((notification) => {
            if (!notification.is_read_by.includes(userEmail)) {
                fetch('/api/notifications', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: userEmail, id: notification._id }),
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

    // Handle clicking on a notification
    const handleNotificationClick = (notificationId: string) => {
        if (!userEmail) return;

        console.log(`Notification clicked with ID: ${notificationId}`);

        // Update local state
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) => {
                if (notification._id === notificationId && !notification.is_read_by.includes(userEmail)) {
                    return {
                        ...notification,
                        is_read_by: [...notification.is_read_by, userEmail],
                    };
                }
                return notification;
            })
        );

        // Send a PUT request to mark the notification as read
        fetch('/api/notifications', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail, id: notificationId }),
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

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if notification has been read by current user
    const isNotificationRead = (notification: Notification) => {
        if (!userEmail) return false;
        return notification.is_read_by.includes(userEmail);
    };

    // Count unread notifications
    const unreadCount = notifications.filter(notification =>
        !isNotificationRead(notification)
    ).length;

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div className="p-8 bg-white min-h-screen">
            <div className="flex items-center space-x-4 mb-10">
                <div className="bg-[#A19158]/10 p-2.5 rounded-full">
                    <User className="w-8 h-8 text-[#283971]" />
                </div>
                <h1 className="text-4xl font-bold text-[#283971]">Admin Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1 bg-[#A19158] text-white p-6 rounded-[14px] shadow-md">
                    <h2 className="text-xl font-bold mb-4">Welcome, {adminInfo.name}!</h2>
                    <div className="mt-4 pt-4 border-t border-white/30">
                        <p className="text-sm font-medium text-white">
                            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                        </p>
                        <p className="mt-1 text-sm text-white">
                            Our Scholarship Management System helps you efficiently track scholars, monitor scholarship details, and verify attachments, ensuring seamless administration.
                        </p>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-[14px] shadow-sm border border-gray-200">
                    <div className="bg-[#283971] text-white p-6 rounded-t-[14px]">
                        <h2 className="text-2xl font-bold">Scholarship Status</h2>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-[#A19158]/20 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#A19158]/10">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#283971] uppercase tracking-wider rounded-l-lg">Scholarship Type</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-[#283971] uppercase tracking-wider">Active</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-[#283971] uppercase tracking-wider">Expired</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-[#283971] uppercase tracking-wider rounded-r-lg">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#A19158]/10">
                                    {scholarshipStatus.map((scholarship, index) => (
                                        <tr key={index} className="hover:bg-[#A19158]/10 transition-colors duration-200">
                                            <td className="px-6 py-4 text-sm font-medium text-[#283971]">{scholarship.name}</td>
                                            <td className="px-6 py-4 text-center text-sm font-medium text-green-600">{scholarship.active}</td>
                                            <td className="px-6 py-4 text-center text-sm font-medium text-amber-600">{scholarship.expired}</td>
                                            <td className="px-6 py-4 text-center text-sm font-medium text-[#283971]">{scholarship.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contract Upload Component */}
            <ContractUploadCard />

            {/* Notification Panel */}
            <div
                className="bg-white border border-gray-200 rounded-[14px] shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={toggleModal}
            >
                <div className="bg-[#283971] text-white p-6 rounded-t-[14px] flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Bell className="w-6 h-6" />
                        <h2 className="text-2xl font-bold">Notifications</h2>
                    </div>
                    {unreadCount > 0 && (
                        <div className="bg-red-500 text-white rounded-full px-3 py-1 text-sm font-bold flex items-center">
                            <span>{unreadCount}</span>
                            <span className="ml-1">New</span>
                        </div>
                    )}
                </div>

                {/* Preview of first 3 notifications */}
                <div className="divide-y divide-gray-200">
                    {isLoading ? (
                        <div className="p-6 text-center text-gray-500">Loading notifications...</div>
                    ) : notifications.length > 0 ? (
                        notifications.slice(0, 3).map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 ${!isNotificationRead(notification) ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex items-start">
                                    <div className="flex-grow pr-4">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-semibold text-[#283971] truncate">{notification.title}</h3>
                                            {!isNotificationRead(notification) && (
                                                <div className="bg-blue-500 w-2 h-2 rounded-full"></div>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1 line-clamp-1">{notification.message}</p>
                                        <p className="text-gray-400 text-xs mt-1">{formatDate(notification.date_posted)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-500">No notifications available</div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 rounded-b-[14px] text-center">
                    <div className="flex items-center justify-center space-x-1 font-medium text-[#283971] hover:underline">
                        <span>View all notifications</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Notification Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-[14px] shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="bg-[#283971] text-white p-6 rounded-t-[14px] flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <Bell className="w-6 h-6" />
                                <h2 className="text-2xl font-bold">Notifications</h2>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleModal();
                                }}
                                className="text-white hover:text-gray-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-medium text-gray-700">
                                {notifications.length} {notifications.length === 1 ? 'Notification' : 'Notifications'}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAllAsRead();
                                    }}
                                    className="text-sm text-[#283971] hover:underline flex items-center space-x-1"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Mark all as read</span>
                                </button>
                            )}
                        </div>
                        <div className="overflow-y-auto flex-grow">
                            {isLoading ? (
                                <div className="p-6 text-center text-gray-500">Loading notifications...</div>
                            ) : notifications.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {notifications.map((notification) => (
                                        <li
                                            key={notification._id}
                                            className={`p-6 hover:bg-gray-50 ${!isNotificationRead(notification) ? 'bg-blue-50' : ''}`}
                                            onClick={() => handleNotificationClick(notification._id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-[#283971]">{notification.title}</h3>
                                                    <p className="text-gray-700 mt-1">{notification.message}</p>
                                                    <p className="text-gray-500 text-sm mt-2">
                                                        {formatDate(notification.date_posted)}
                                                    </p>
                                                    {notification.deadline && (
                                                        <p className="text-red-500 text-sm mt-1">
                                                            Deadline: {new Date(notification.deadline).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {notification.requires_action && (
                                                        <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                                            Action Required
                                                        </div>
                                                    )}
                                                    {notification.student_id && (
                                                        <div className="mt-2 text-sm">
                                                            <p><span className="font-semibold">Scholar:</span> {notification.name}</p>
                                                            <p><span className="font-semibold">ID:</span> {notification.student_id}</p>
                                                            <p><span className="font-semibold">Program:</span> {notification.program}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {!isNotificationRead(notification) && (
                                                    <div className="bg-blue-500 w-3 h-3 rounded-full mt-1"></div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-gray-500">No notifications available</div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-[14px]">
                            <button
                                className="w-full py-2 bg-[#283971] text-white rounded-lg hover:bg-[#1e2c5a] transition-colors font-medium"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAllAsRead();
                                }}
                            >
                                Mark All as Read
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-10">
                {statusSummary.map((summary, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-lg border border-[#A19158]/20 w-full"
                    >
                        <h3 className="text-xl font-bold text-[#283971]">{summary.name}</h3>
                        <div className="border-t-2 border-[#A19158] pt-2">
                            <p className="mt-1 text-2xl font-bold text-[#283971]">{summary.count.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}