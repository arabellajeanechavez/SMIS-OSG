"use server";
import { revalidatePath } from "next/cache";
import Student from "@/models/student";
import { connectDatabase } from "@/lib/database";

export async function getStudentDetails(email: string, password: string) {
  await connectDatabase();
  return await Student.findOne({ email, password });
}
// change also the name into lastname, firstname, middlename
export async function updateStudentDetails(email: string, password: string, student: {
  email: string;
  name: string;
  gender: string;
  college: string;
  student_id: string;
  university: string;
  program: string;
  year_level: string;
}) {
  await connectDatabase();
  await Student.updateOne({ email, password }, student);
  revalidatePath("/"); // This will force Next.js to reload the server component
}