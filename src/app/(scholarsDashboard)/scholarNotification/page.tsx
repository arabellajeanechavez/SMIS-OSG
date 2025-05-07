

import React from 'react';
import Notifications from './notifications';
import { headers } from 'next/headers';
import { getNotifications } from '@/actions/notification';

export default async function ScholarNotification() {

    const headersList = await headers();
    const email = headersList.get('email');

    if (!email) throw Error("Email is required to get notifications");
    const notifications = await getNotifications(email);

    console.log("Notifications: ", notifications);

    return (
        <Notifications notifData={notifications} />
    );
}
