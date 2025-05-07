"use server";

import Notifications from "@/models/notification";
import { connectDatabase } from "@/lib/database";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function getNotifications(email: string): Promise<{
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
}[]> {
  await connectDatabase();
  const notification = await Notifications.find({ recipients: { $in: ["everyone", email] } }).sort({ createdAt: -1 });
  return notification.map((notif) => ({
    id: notif._id.toString(),
    title: notif.title,
    message: notif.message,
    category: notif.category,
    requires_action: notif.requires_action,
    deadline: notif.deadline,
    recipients: notif.recipients,
    date_posted: notif.date_posted,
    published_by: notif.published_by,
    is_read_by: notif.is_read_by,
    is_acted_by: notif.is_acted_by,
  }));
}


export async function addNotification(notification: {
  title: string;
  message: string;
  category: 'scholarship' | 'announcement' | 'reminder';
  requires_action: boolean;
  deadline: Date | null;
  recipients: string[];
  date_posted: Date;
  published_by: string;
}) {
  await connectDatabase();
  await Notifications.create(notification);
  revalidatePath("/");
}



export async function readNotification(id: string, email: string) {
  await connectDatabase();

  console.log(id);

  const updatedNotification = await Notifications.findByIdAndUpdate(
    new mongoose.Types.ObjectId(id),
    { $addToSet: { is_read_by: email } },
    { new: true }
  );

  if (!updatedNotification) {
    throw new Error("Notification not found");
  }

  return updatedNotification;


}