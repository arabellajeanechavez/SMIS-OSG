import { getNotifications } from "@/actions/notification";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const headersList = await headers();
        const email = headersList.get('email');
        if (!email) {
            return NextResponse.json({ error: 'Email is required to get notifications' }, { status: 400 });
        }
        const notifications = await getNotifications(email);
        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
