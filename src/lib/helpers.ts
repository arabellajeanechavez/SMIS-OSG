
import { HOST } from "@/constants/host";
import { User } from "@/types/user";
import { encrypt } from "@/lib/encryption";
import { Token } from "@/types/token";
import { Auth } from "@/types/token";
import { cookies } from "next/headers";

export async function generateVerifyLink({ email, password, type, expires, signature }: Token): string {
    const raw = await encrypt(JSON.stringify({ type, email, password, expires, signature }));
    return `${HOST}/verify/${raw}`;
}

export  function getUserType(email: string): User {
    if (email.endsWith("@my.xu.edu.ph")) return "scholar";
    if (email.endsWith("@xu.edu.ph")) return "cso";
    return "" as User;
}

export async function addAccessTokenCookie({ email, password, type }: Auth): Promise<void> {
    const accessToken = await encrypt(JSON.stringify({ email, password, type }));
    const cookieStore = await cookies();
    cookieStore.set("token", accessToken);
}