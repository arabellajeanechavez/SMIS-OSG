"use server";

import { connectDatabase } from "@/lib/database";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import Contract from "@/models/contract";
import { addNotification } from "@/actions/notification";

export async function addContract(formData: FormData) {
    await connectDatabase();

    const email = formData.get("published_by") as string;
    const scholarship = formData.get("scholarship") as string;
    const deadline = formData.get("deadline") ? new Date(formData.get("deadline") as string) : null;
    const comment = formData.get("comment") as string;
    const recipients = formData.getAll("recipients") as string[];
    const file = formData.get("file") as File;

    // Validate input
    if (!file || file.size === 0) {
        throw new Error("File is required");
    }
    if (!scholarship) {
        throw new Error("Scholarship is required");
    }
    if (!deadline) {
        throw new Error("Deadline is required");
    }
    if (!recipients || recipients.length === 0) {
        throw new Error("Recipients are required");
    }
    if (!email) {
        throw new Error("Uploaded_by is required");
    }

    try {
        // Save the file and get the URL
        const fileUrl = await saveFile(file);

        // Determine recipients
        let finalRecipients: string[] = recipients;
        if (recipients.includes("everyone")) {
            // Fetch all students in the scholarship
            const students = await mongoose.models.Student.find({ scholarship }, "email");
            finalRecipients = students.map((student) => student.email);
        }

        // Create the contract in the database
        const contract = await Contract.create({
            fileUrl,
            scholarship,
            deadline,
            comment,
            recipients: finalRecipients,
            uploaded_by: email,
            created_at: new Date(),
        });

        // Update the Scholarship model
        await mongoose.models.Scholarship.findByIdAndUpdate(
            scholarship,
            { $push: { contracts: contract._id } },
            { new: true }
        );

        // Update Student models
        for (const recipient of finalRecipients) {
            await mongoose.models.Student.findOneAndUpdate(
                { email: recipient },
                {
                    $push: {
                        contracts: {
                            contract: contract._id,
                            status: "pending",
                        },
                    },
                },
                { new: true }
            );
        }

        // Create notification
        await addNotification({
            title: `New Contract: ${scholarship}`,
            message: `A new contract has been uploaded for your scholarship. Please review and sign by ${deadline?.toISOString()}. ${comment ? `Comment: ${comment}` : ""}`,
            category: "scholarship",
            requires_action: true,
            deadline,
            recipients: finalRecipients,
            date_posted: new Date(),
            published_by: email,
        });

        // Revalidate the cache
        revalidatePath("/");

        return {
            success: true,
            id: contract._id.toString(),
            fileUrl: contract.fileUrl,
        };
    } catch (error) {
        console.error("Contract upload error:", error);
        throw new Error(error instanceof Error ? error.message : "Unknown error during contract upload");
    }
}

// Save file to the filesystem and return the URL
async function saveFile(file: File): Promise<string> {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);

    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save the file
    await fs.writeFile(filePath, buffer);

    // Return the URL (relative to public directory)
    return `/uploads/${fileName}`;
}