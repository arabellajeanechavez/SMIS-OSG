'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';

interface DownloadAttachmentsProps {
  scholarshipId: string;
}

export default function DownloadAttachments({ scholarshipId }: DownloadAttachmentsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!scholarshipId) {
      setError('No scholarship ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${scholarshipId}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a hidden anchor element
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `scholarship-attachments-${scholarshipId}.zip`;

      // Add to body, trigger click, and then remove
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Download failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to download attachments');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="flex items-center justify-center bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
      aria-label="Download Scholarship Attachments"
    >
      <Download className="h-4 w-4 mr-2" />
      <span>{isLoading ? 'Downloading...' : 'Download Contract'}</span>
      {error && <span className="sr-only">Error: {error}</span>}
    </button>
  );
}