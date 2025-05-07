import process from "process";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { EMAIL_SERVER, EMAIL_USER, EMAIL_PASS } from "@/constants/email";
import { addAccessTokenCookie, generateVerifyLink, getUserType } from "@/lib/helpers";
import Faculty from "@/models/faculty";
import Student from "@/models/student";
import { connectDatabase } from "@/lib/database";

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVER,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    await connectDatabase();

    const { email, password } = await request.json();

    // TODO: remove this in production
    const type = "scholar";
    // TODO: enable this in production
    // const type: User = getUserType(email);

    if (!email || !password) {
      return NextResponse.json({ message: "EMAIL OR PASSWORD NOT FOUND" }, { status: 400 });
    }

    if (type !== "scholar" && type !== "cso") {
      return NextResponse.json({ message: "INVALID USER TYPE" }, { status: 400 });
    }

    console.log("Checking if account exists...");

    let account;
    if (type === "scholar") {
      account = await Student.findOne({ email });
    } else if (type === "cso") {
      account = await Faculty.findOne({ email });
    }

    if (account) {
      if (account.password === password) {
        await addAccessTokenCookie({ email, password, type });
        return NextResponse.json(
          { message: "ACCOUNT ALREADY EXISTS", data: { email, password, type } },
          { status: 200 }
        );
      } else {
        return NextResponse.json({ message: "INCORRECT PASSWORD" }, { status: 400 });
      }
    }

    console.log("Account does not exist, sending OTP code...");

    const expires = Date.now() + 15 * 60 * 1000;
    const signature = process.env.ACCESS_SECRET || "";
    const url = await generateVerifyLink({ type, email, password, expires, signature });
    const from = EMAIL_USER || "";
    const to = email;
    const subject = "Xavier University - Email Verification";

    const response = await transporter.sendMail({ from, to, subject, text: url });
    if (response.rejected.length > 0) {
      return NextResponse.json({ message: "FAILED TO SEND OTP", rejected: response.rejected }, { status: 400 });
    }

    return NextResponse.json({ message: "SUCCESSFULLY SENT OTP CODE" }, { status: 200 });
  }

  catch (error) {
    console.error(error);
    return NextResponse.json({ message: "INTERNAL SERVER ERROR" }, { status: 500 });
  }
}