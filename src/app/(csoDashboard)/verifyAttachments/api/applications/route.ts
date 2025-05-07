import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/database';
import { getScholarDetails, revokeScholarApplication, verifyScholarApplication } from '@/actions/scholarship';
import Scholarship from '@/models/scholarship';
import Student from '@/models/student';

export async function GET() {
  try {
    await connectDatabase();
    const stream = Scholarship.watch([], { fullDocument: 'updateLookup' });
    console.log('Change streams started');

    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        const handleChange = async () => {
          try {
            const application = await getScholarDetails();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(application)}\n\n`));
          } catch (err) {
            console.error('Error fetching application:', err);
          }
        };

        stream.on('change', handleChange);

        const handleError = (err: unknown) => {
          console.error('Stream Error:', err);
          controller.close();
        };

        stream.on('error', handleError);
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
    const { reference_id, email } = await request.json();

    if (!reference_id) {
      return NextResponse.json({ error: 'Application reference ID is required' }, { status: 400 });
    }

    await revokeScholarApplication(reference_id, email);
    return NextResponse.json({ message: 'Application has been revoked' }, { status: 200 });
  }

  catch (error) {
    console.error('Error revoking scholar application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(request: Request) {

  try {
    const details = await request.json();
    verifyScholarApplication(details);

  }
  catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
