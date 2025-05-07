import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getScholarAttachments } from '@/actions/scholarship';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Scholarship ID is required' },
        { status: 400 }
      );
    }

    const scholarship: { attachment: Buffer[] } | null = await getScholarAttachments(id);
    
    if (!scholarship) {
      return NextResponse.json(
        { error: 'Scholarship not found' },
        { status: 404 }
      );
    }

    if (!scholarship.attachment || scholarship.attachment.length === 0) {
      return NextResponse.json(
        { error: 'No attachments found for this scholarship' },
        { status: 404 }
      );
    }

    // Create a ZIP file with all attachments
    const zip = new JSZip();
    
    // Add each attachment to the ZIP
    scholarship.attachment.forEach((buffer: Buffer, index: number) => {
      // Determine file extension based on the buffer content (simplified)
      // In a real implementation, you might want to store original filenames and extensions
      const fileName = `attachment-${index + 1}.pdf`;
      zip.file(fileName, buffer);
    });

    // Generate the ZIP file
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="scholarship-attachments-${id}.zip"`);

    return new NextResponse(zipContent, {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Error downloading attachments:', error);
    return NextResponse.json(
      { error: 'Failed to download attachments' },
      { status: 500 }
    );
  }
}