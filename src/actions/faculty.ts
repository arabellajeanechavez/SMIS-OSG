"use server";
import { revalidatePath } from "next/cache";
import Faculty from "@/models/faculty";
import { connectDatabase } from "@/lib/database";

export async function getFacultyDetails(email: string, password: string) {
  await connectDatabase();
  return await Faculty.findOne({ email, password });
}