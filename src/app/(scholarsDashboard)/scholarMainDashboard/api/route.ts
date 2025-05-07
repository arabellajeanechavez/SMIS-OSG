import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/database';
import Notifications from '@/models/notification';
import { getNotifications } from '@/actions/notification';
import { readNotification } from '@/actions/notification';
import { addScholarAttachment } from '@/actions/scholarship';
import { headers } from 'next/headers';

export async function GET(request: Request) {
    try {
        // Try getting email from headers first
        const headersList = await headers();
        let email = headersList.get('email');

        // Fallback to query parameter if header is not present
        if (!email) {
            const url = new URL(request.url);
            email = url.searchParams.get('email');
        }

        if (!email) {
            return NextResponse.json({ error: 'Email is required to get notifications' }, { status: 400 });
        }

        await connectDatabase();
        const stream = Notifications.watch([], { fullDocument: 'updateLookup' });

        const encoder = new TextEncoder();
        const streamResponse = new ReadableStream({
            async start(controller) {
                stream.on('change', async (change) => {
                    console.log('Notification Change:', change);

                    try {
                        const notifications = await getNotifications(email!);
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(notifications)}\n\n`));
                    } catch (err) {
                        console.error('Error fetching notifications:', err);
                    }
                });

                stream.on('error', (err) => {
                    console.error('Stream Error:', err);
                    controller.close();
                });
            },
            cancel() {
                stream.close();
            },
        });

        return new Response(streamResponse, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Error in change stream:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { email, id } = await request.json();

        if (!email || !id) {
            return NextResponse.json({ error: 'Email and notification ID are required' }, { status: 400 });
        }

        await readNotification(id, email);
        return NextResponse.json({ message: 'Notification marked as read' }, { status: 200 });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
// TODO: add the new fields lastname, firstname, middlename
export async function POST(request: Request) {
    try {
        const { email, name, gender, college, reference, attachment, student_id, university, program, year_level } = await request.json();
        console.log(email, name, gender, college, reference, student_id, university, program, year_level);

        if (!email || !name || !gender || !college || !reference || !attachment || !student_id || !university || !program || !year_level) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        await addScholarAttachment({
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
        });
        return NextResponse.json({ message: 'Attachment added successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error adding attachment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}