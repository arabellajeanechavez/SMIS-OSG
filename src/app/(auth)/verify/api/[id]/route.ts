import { NextResponse } from "next/server";
import { Token } from "@/types/token";
import { addAccessTokenCookie } from "@/lib/helpers";
import { decrypt } from "@/lib/encryption";
import Student from "@/models/student";
import Faculty from "@/models/faculty";
import { connectDatabase } from "@/lib/database";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDatabase();

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "NOT FOUND OTP CODE" }, { status: 400 });
    }

    const { email, password, type, expires }: Token = JSON.parse(await decrypt(id));

    console.log("is expired? ", expires < Date.now());

    await addAccessTokenCookie({ email, password, type });

    const existingAccount =
      type === "scholar"
        ? await Student.findOne({ where: { email } })
        : await Faculty.findOne({ where: { email } });

    if (existingAccount) {
      return NextResponse.json({ message: "ACCOUNT ALREADY EXISTS" }, { status: 400 });
    }

    if (type === "scholar") {
      await Student.create({ email, password });
      console.log("Student created successfully");
    } 
    else if (type === "cso") {
      await Faculty.create({ email, password });
      console.log("Faculty created successfully");
    }

    return NextResponse.json({ message: "LOGIN SUCCESS", data: { email, type } }, { status: 200 });
  } 
  
  catch (error) {
    console.error(error);
    return NextResponse.json({ message: "INVALID TOKEN" }, { status: 500 });
  }
}