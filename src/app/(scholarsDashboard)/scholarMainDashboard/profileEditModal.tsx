import { headers } from "next/headers";
import { EditFormModal } from "./profileEditClient";
import { updateStudentDetails } from '@/actions/student';

export default async function ProfileEditModal() {

    const headersList = await headers();
    const email = headersList.get('email');
    const password = headersList.get('password');

    async function handleFormAction(formData: FormData) {
        "use server";

        if (!email || !password) {
            throw new Error("Email or password is null");
        }
        await updateStudentDetails(
            email, password,
            {
                name: formData.get("name") as string,
                student_id: formData.get("student_id") as string,
                university: formData.get("university") as string,
                program: formData.get("program") as string,
                year_level: formData.get("year_level") as string,
            });
    }

    return (<EditFormModal action={handleFormAction} />);
}