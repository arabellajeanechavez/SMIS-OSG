import React from 'react';
import AnnouncementForm from "./AnnouncementForm";
import { headers } from "next/headers";
import { addNotification } from '@/actions/notification';

export default async function Announcements() {

  const headersList = await headers();
  const email = headersList.get('email');
  const password = headersList.get('password');

  async function handleFormAction(formData: FormData) {
    "use server";

    if (!email || !password) {
      throw new Error("Email or password is missing in the headers.");
    }

    await addNotification(
      {
        deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string) : null,
        title: formData.get('title') as string,
        message: formData.get('message') as string,
        category: formData.get('category') as 'scholarship' | 'announcement' | 'reminder',
        requires_action: formData.get('requires_action') === 'true',
        recipients: formData.getAll('recipients') as string[],
        date_posted: new Date(formData.get('date_posted') as string),
        published_by: formData.get('published_by') as string
      });
  };

  return (
    <AnnouncementForm action={handleFormAction} />
  );
}