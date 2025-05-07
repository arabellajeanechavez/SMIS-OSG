// File: /utils/notificationUtils.ts

import Notifications from '@/models/notification';
import { connectDatabase } from '@/lib/database';

/**
 * Creates a notification for attachment uploads
 * @param studentData Student information
 * @param scholarshipData Scholarship information
 */


{/* TODO: change name again*/ }
export async function createAttachmentNotification(studentData: any, scholarshipData: any) {
    await connectDatabase();

    const notification = new Notifications({
        title: 'New Attachment Uploaded',
        message: `${studentData.name} (${studentData.student_id}) has uploaded a new attachment for their ${scholarshipData.scholarship_type} scholarship.`,
        category: 'scholarship',
        requires_action: true,
        recipients: ['admin'], // Target admin users
        published_by: 'System',
        student_id: studentData.student_id,
        name: studentData.name,
        program: studentData.program,
        year_level: studentData.year_level,
        gender: studentData.gender,
        college: studentData.college,
        reference: scholarshipData._id,
    });

    await notification.save();
    return notification;
}

/**
 * Creates notifications for approaching contract expirations
 * @param daysThreshold Number of days before expiration to trigger notification (default: 30)
 */
export async function checkExpiringContracts(daysThreshold = 30) {
    await connectDatabase();
    const Scholarship = (await import('@/models/scholarship')).default;
    const Student = (await import('@/models/student')).default;

    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    // Find scholarships with contracts expiring within the threshold
    const expiringScholarships = await Scholarship.find({
        contract_expiration: {
            $gte: today,
            $lte: thresholdDate
        },
        is_revoked: false
    });

    for (const scholarship of expiringScholarships) {
        // Check if notification already exists for this scholarship
        const existingNotification = await Notifications.findOne({
            reference: scholarship._id,
            category: 'reminder',
            title: { $regex: 'Contract Expiring' }
        });

        // If notification doesn't exist, create it
        if (!existingNotification) {
            // Optional: Get more student details if needed
            const student = await Student.findOne({ email: scholarship.email });

            // Calculate days until expiration
            const daysUntilExpiration = Math.ceil(
                (new Date(scholarship.contract_expiration).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            const notification = new Notifications({
                title: 'Contract Expiring Soon',
                message: `${scholarship.name}'s ${scholarship.scholarship_type} scholarship contract will expire in ${daysUntilExpiration} days (${new Date(scholarship.contract_expiration).toLocaleDateString()}).`,
                category: 'reminder',
                requires_action: true,
                deadline: scholarship.contract_expiration,
                recipients: ['admin'], // Target admin users
                published_by: 'System',
                student_id: scholarship.student_id,
                name: scholarship.name,
                program: scholarship.program,
                year_level: scholarship.year_level,
                gender: scholarship.gender,
                college: scholarship.college,
                reference: scholarship._id,
            });

            await notification.save();
        }
    }
}

/**
 * Creates a notification when a student submits a form or application
 */
export async function createApplicationSubmissionNotification(studentData: any, applicationType: string) {
    await connectDatabase();

    const notification = new Notifications({
        title: 'New Application Submitted',
        message: `${studentData.name} (${studentData.student_id}) has submitted a new ${applicationType} application.`,
        category: 'scholarship',
        requires_action: true,
        recipients: ['admin'], // Target admin users
        published_by: 'System',
        student_id: studentData.student_id,
        name: studentData.name,
        program: studentData.program,
        year_level: studentData.year_level,
    });

    await notification.save();
    return notification;
}