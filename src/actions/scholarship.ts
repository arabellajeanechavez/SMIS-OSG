"use server";

// TODO: change the name, add all the new shit
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import Notification from "@/models/notification";
import Scholarship from "@/models/scholarship";
import { connectDatabase } from "@/lib/database";
import Student from "@/models/student";
import { addNotification } from "./notification";

interface ScholarDetails {
  id: string;
  email: string;
  name: string;
  gender: string;
  college: string;
  program: string;
  student_id: string;
  year_level: number;
  university: string;
  scholarship_type?: string;
  gpa_requirement?: number;
  benefactor?: string;
  academic_year?: string;
  contract_expiration?: Date;
  is_revoked: boolean;
  date_verified?: Date;
  created_at: Date;
}

// Define a type that matches the Student schema
interface StudentDocument extends Document {
  email: string;
  name: string;
  gender: string;
  college: string;
  program: string;
  student_id?: string;
  year_level?: number;
  university: string;
}

// Define a type that matches the Scholarship schema
interface ScholarshipDocument extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  scholarship_type?: string;
  gpa_requirement?: number;
  benefactor?: string;
  academic_year?: string;
  contract_expiration?: Date;
  is_revoked: boolean;
  date_verified?: Date;
  created_at: Date;
  program: string;
  gender: string;
  college: string;
  student_id?: string;
  year_level?: number;
  university: string;
  name: string;

}

export async function getScholarDetail(email: string): Promise<{
  id: string;
  scholarship_type?: string;
  gpa_requirement?: number;
  benefactor?: string;
  academic_year?: string;
  contract_expiration?: Date;
  is_revoked: boolean;
  date_verified?: Date;
  created_at: Date;
} | null> {
  await connectDatabase();

  // get the latest verified scholarship application of the email that is not revoked
  const scholarship = await Scholarship.findOne<ScholarshipDocument>({
    email
  })
    .sort({ created_at: -1 })
    .lean<ScholarshipDocument>();

  if (!scholarship) {
    return null;
  }

  return {
    id: scholarship._id.toString(),
    scholarship_type: scholarship.scholarship_type,
    gpa_requirement: scholarship.gpa_requirement,
    benefactor: scholarship.benefactor,
    academic_year: scholarship.academic_year,
    contract_expiration: scholarship.contract_expiration,
    is_revoked: scholarship.is_revoked,
    date_verified: scholarship.date_verified,
    created_at: scholarship.created_at,
  };
}

export async function getScholarDetails(): Promise<ScholarDetails[]> {
  await connectDatabase();

  // Get the data from the Scholarship collection except for the attachment
  const scholarships = await Scholarship.find().select("-attachment").lean<ScholarshipDocument[]>();

  const scholars: ScholarDetails[] = [];

  for (const sch of scholarships) {
    // Explicitly define the type for better inference
    const student = await Student.findOne<StudentDocument>({ email: sch.email }).lean();

    if (student) {
      scholars.push({
        id: sch._id.toString(),
        email: sch.email,
        name: sch.name,
        gender: sch.gender,
        college: sch.college,
        program: sch.program,
        student_id: sch.student_id ?? "",
        year_level: sch.year_level ?? 0,
        university: sch.university,
        scholarship_type: sch.scholarship_type,
        gpa_requirement: sch.gpa_requirement,
        benefactor: sch.benefactor,
        academic_year: sch.academic_year,
        contract_expiration: sch.contract_expiration,
        is_revoked: sch.is_revoked,
        date_verified: sch.date_verified,
        created_at: sch.created_at,
      });
    }
  }

  return scholars;
}

export async function addScholarAttachment({
  email,
  name,
  gender,
  college,
  reference,
  attachment,
  student_id,
  university,
  program,
  year_level,
}: {
  email: string;
  name: string;
  gender: string;
  college: string;
  reference: string;
  attachment: Buffer[];
  student_id: string;
  university: string;
  program: string;
  year_level: number;
}) {
  await connectDatabase();

  const updatedNotification = await Notification.findByIdAndUpdate(
    new mongoose.Types.ObjectId(reference),
    { $addToSet: { is_read_by: email, is_acted_by: email } },
    { new: true }
  );

  console.log(
    email,
    name,
    gender,
    college,
    reference,
    attachment,
    student_id,
    university,
    program,
    year_level
  );

  const addedScholarAttachment = await Scholarship.create({
    email,
    name,
    gender,
    college,
    reference,
    attachment,
    student_id,
    university,
    program,
    year_level,
  });

  if (!updatedNotification || !addedScholarAttachment) {
    throw new Error("Notification or Attachment not found");
  }

  revalidatePath("/"); // This will force Next.js to reload the server component
}

export async function revokeScholarApplication(id: string, email: string) {
  await connectDatabase();

  const updatedScholar = await Scholarship.findByIdAndUpdate(
    id,
    { is_revoked: true },
    { new: true }
  );

  await addNotification({
    title: "Scholarship Application Revoked",
    message: "Your scholarship application has been revoked.",
    category: "reminder",
    requires_action: false,
    deadline: null,
    recipients: [updatedScholar?.email],
    date_posted: new Date(),
    published_by: email,
  });

  if (!updatedScholar) {
    throw new Error("Scholarship not found");
  }

  revalidatePath("/"); // This will force Next.js to reload the server component
}

export async function verifyScholarApplication(details: {
  id: string;
  email: string;
  scholarship_type?: string;
  gpa_requirement?: number;
  benefactor?: string;
  academic_year?: string;
  contract_expiration?: Date;
}) {
  await connectDatabase();

  console.log(details);

  const application = await Scholarship.findByIdAndUpdate(
    details.id,
    {
      scholarship_type: details.scholarship_type,
      gpa_requirement: details.gpa_requirement,
      benefactor: details.benefactor,
      academic_year: details.academic_year,
      contract_expiration: details.contract_expiration,
      date_verified: new Date(),
    },
    { new: true }
  );
  await addNotification({
    title: "Scholarship Application Verified",
    message: "Your scholarship application has been verified.",
    category: "reminder",
    requires_action: false,
    deadline: null,
    recipients: [application.email],
    date_posted: new Date(),
    published_by: details.email,
  });
  revalidatePath("/"); // This will force Next.js to reload the server component
}

export async function getScholarAttachments(id: string) {
  try {
    // Check if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null; // Or throw an error, depending on your error handling strategy
    }

    const scholarship = await Scholarship.findById(id);
    return scholarship;
  } catch (error) {
    console.error("Error fetching scholarship:", error);
    // Handle the error appropriately (e.g., return null, throw an error, log, etc.)
    return null; // Or throw error
  }
}

// Updated getScholarshipStatistics function
export async function getScholarshipStatistics() {
  await connectDatabase();

  try {
    const currentDate = new Date();

    const groupedData = await Scholarship.aggregate([
      {
        $match: {
          is_revoked: { $ne: true },
          scholarship_type: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$scholarship_type",
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$date_verified", null] },
                    { $ne: ["$contract_expiration", null] },
                    { $gte: ["$contract_expiration", currentDate] }
                  ]
                },
                1,
                0
              ]
            }
          },
          expired: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$contract_expiration", null] },
                    { $lt: ["$contract_expiration", currentDate] }
                  ]
                },
                1,
                0
              ]
            }
          },
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          active: 1,
          expired: 1,
          total: { $sum: ["$active", "$expired"] } //calculate the total active and expired
        }
      }
    ]);

    const totalCount = await Scholarship.countDocuments({
      is_revoked: { $ne: true },
      scholarship_type: { $ne: null }
    });
    const totalActive = await Scholarship.countDocuments({
      is_revoked: { $ne: true },
      date_verified: { $ne: null },
      contract_expiration: { $ne: null, $gte: currentDate },
      scholarship_type: { $ne: null }
    });
    const totalPending = await Scholarship.countDocuments({
      is_revoked: { $ne: true },
      scholarship_type: null
    });

    const result = groupedData.map(item => {
      return {
        scholarship_type: item._id,
        count: item.count,
        active: item.active,
        expired: item.expired,
        total: item.total, //changed from completed to total
        percent: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
      };
    });

    return {
      grouped: result,
      totalCount,
      totalActive,
      totalPending
    };

  } catch (error) {
    console.error("Error fetching scholarship statistics:", error);
    throw error;
  }
}