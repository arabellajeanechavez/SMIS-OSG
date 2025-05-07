"use client";

import React, { useState } from 'react';
import { Search, Bell, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'scholarship' | 'announcement' | 'reminder';
  requires_action: boolean;
  deadline: Date | null;
  recipients: string[];
  date_posted: Date;
  published_by: string;
  is_read_by: string[];
  is_acted_by: string[];
}

interface ScholarNotificationsProps {
  notifications: Notification[];
  userEmail: string;
  onMarkAllAsRead: (userEmail: string) => void;
  onSubmitDocuments?: (notificationId: string) => void;
  onNotificationClick?: (notificationId: string) => void;
}

const ScholarNotifications: React.FC<ScholarNotificationsProps> = ({
  notifications,
  userEmail,
  onMarkAllAsRead,
  onSubmitDocuments = (id) =>
    console.log(`Submit documents for notification ID: ${id}`),
  onNotificationClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter,
    setFilter] = useState<'all' | 'scholarship' | 'announcement' | 'reminder'>(
      'all'
    );

  const sortNotifications = (notifs: Notification[]) => {
    return [...notifs].sort((a, b) => {
      const isUnreadA = !a.is_read_by.includes(userEmail);
      const isUnreadB = !b.is_read_by.includes(userEmail);

      const requiresActionA =
        a.requires_action && !a.is_acted_by.includes(userEmail);
      const requiresActionB =
        b.requires_action && !b.is_acted_by.includes(userEmail);

      if (isUnreadA && !isUnreadB) return -1;
      if (!isUnreadA && isUnreadB) return 1;

      if (requiresActionA && !requiresActionB) return -1;
      if (!requiresActionA && requiresActionB) return 1;

      if (isUnreadA && isUnreadB) {
        const catPriorityA =
          a.category === 'reminder' ? 0 : a.category === 'announcement' ? 1 : 2;
        const catPriorityB =
          b.category === 'reminder' ? 0 : b.category === 'announcement' ? 1 : 2;
        if (catPriorityA !== catPriorityB) return catPriorityA - catPriorityB;
      }

      const dateA = new Date(a.date_posted).getTime();
      const dateB = new Date(b.date_posted).getTime();
      return dateB - dateA;
    });
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') {
      return matchesSearch;
    } else {
      return matchesSearch && notification.category === filter;
    }
  });

  const sortedNotifications = sortNotifications(filteredNotifications);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'scholarship':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'announcement':
        return <Bell className="w-5 h-5 text-yellow-600" />;
      case 'reminder':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const doesRequireAction = (notification: Notification) => {
    return notification.requires_action && !notification.is_acted_by.includes(userEmail);
  };

  const isUnread = (notification: Notification) => {
    return !notification.is_read_by.includes(userEmail);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return dateObj.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isDeadlinePassed = (deadline: Date | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Bell className="w-7 h-7 text-[#283971]" />
              <h1 className="text-3xl font-bold text-[#283971]">
                Notifications
              </h1>
            </div>
            <button
              onClick={() => onMarkAllAsRead(userEmail)}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-3 rounded-lg text-sm font-semibold capitalize transition-all hover:cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex gap-2">
              {['all', 'scholarship', 'announcement', 'reminder'].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setFilter(
                        category as
                        | 'all'
                        | 'scholarship'
                        | 'announcement'
                        | 'reminder'
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all hover:cursor-pointer ${filter === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </div>

          {sortedNotifications.length === 0 ? (
            <div className="text-center py-16 rounded-lg border border-gray-200">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-500">
                You have no new notifications at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (onNotificationClick) {
                      onNotificationClick(notification.id);
                    }
                  }}
                  className={`
                      p-6 rounded-xl shadow-md transition-all relative
                      ${notification.category === 'scholarship'
                      ? 'bg-blue-50 border-blue-100'
                      : notification.category === 'reminder'
                        ? 'bg-red-50 border-red-100'
                        : 'bg-gray-50 border-gray-100'
                    }
                      border hover:shadow-lg
                      ${isUnread(notification) ? 'opacity-100' : 'opacity-70'}
                    `}
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getIconForCategory(notification.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.date_posted)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {notification.message}
                      </p>

                      {/* <div className="text-sm text-gray-700 mb-3">
                        <span className="font-medium text-gray-500">
                          Reference ID:
                        </span>{' '}
                        {notification.id}
                      </div> */}

                      {notification.deadline && (
                        <div className="text-sm text-gray-700 mb-3">
                          <span className="font-medium text-gray-500">
                            Deadline:
                          </span>{' '}
                          {formatDate(notification.deadline)}
                        </div>
                      )}

                      <div className="text-sm text-gray-700">
                        <span className="font-medium text-gray-500">
                          Published by:
                        </span>{' '}
                        {notification.published_by}
                      </div>

                      {doesRequireAction(notification) && !isDeadlinePassed(notification.deadline) && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSubmitDocuments(notification.id);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all hover:cursor-pointer"
                          >
                            Submit Documents
                          </button>
                        </div>
                      )}

                      {isUnread(notification) && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarNotifications;