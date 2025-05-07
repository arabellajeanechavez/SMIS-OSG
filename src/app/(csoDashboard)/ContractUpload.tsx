import React from "react";
import ContractUploadCard from "./ContractUploadCard";
import { headers } from "next/headers";
import { addContract } from "@/actions/contract";

export default async function ContractUpload() {
    const headersList = await headers();
    const email = headersList.get("email");
    const password = headersList.get("password");

    async function handleFormAction(formData: FormData) {
        "use server";

        if (!email || !password) {
            throw new Error("Email or password is missing in the headers.");
        }

        await addContract({
            file: formData.get("file") as File,
            scholarship: formData.get("scholarship") as string,
            deadline: formData.get("deadline") ? new Date(formData.get("deadline") as string) : null,
            comment: formData.get("comment") as string,
            recipients: formData.get("recipientTargeting") === "all" ? [] : (formData.getAll("recipients") as string[]),
            uploaded_by: email,
        });
    }

    return <ContractUploadCard action={handleFormAction} />;
}