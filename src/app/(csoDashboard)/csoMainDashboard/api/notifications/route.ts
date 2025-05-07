import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/database';
import Notifications from '@/models/notification';
import { getNotifications } from '@/actions/notification';
import { readNotification } from '@/actions/notification';
import { headers } from 'next/headers';

export async function GET(request: Request) {
    try {
        // Extract email from URL query parameters
        const url = new URL(request.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required to get notifications' }, { status: 400 });
        }

        await connectDatabase();

        // Initial fetch of notifications
        const initialNotifications = await getNotifications(email);

        // Set up change stream
        const stream = Notifications.watch([], { fullDocument: 'updateLookup' });
        const encoder = new TextEncoder();

        // Send initial data immediately
        const initialData = encoder.encode(`data: ${JSON.stringify(initialNotifications)}\n\n`);

        const streamResponse = new ReadableStream({
            async start(controller) {
                // Send initial data
                controller.enqueue(initialData);

                stream.on('change', async (change) => {
                    console.log('Notification Change:', change);

                    try {
                        const notifications = await getNotifications(email);
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