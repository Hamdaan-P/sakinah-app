/**
 * shareService.ts
 * Orchestrates sharing Q&A conversations as branded PNG images.
 * Three modes: Instagram, Web Share API, and direct download.
 * Zero external dependencies — pure browser APIs.
 */

import { generateShareCard, type ShareCardData } from './chatImageGenerator';

export interface ShareResult {
  success: boolean;
  message: string;
}

/** Trigger a file download via invisible <a> element */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Small delay before cleanup so the browser registers the download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 5000);
}

function buildFilename(companionName: string): string {
  const slug = companionName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const ts = Date.now();
  return `zaryahplus-${slug}-${ts}.png`;
}

function buildCaption(data: ShareCardData): string {
  const question = data.userQuestion.length > 100
    ? data.userQuestion.slice(0, 100) + '...'
    : data.userQuestion;
  return `I asked ${data.companionName} on ZaryahPlus:\n"${question}"\n\n#ZaryahPlus #IslamicFinance #HalalInvesting #AI`;
}

/**
 * Share to Instagram:
 * 1. Generate branded PNG
 * 2. Download the image
 * 3. Copy caption to clipboard
 * Returns result — does NOT auto-open Instagram (that caused the download to fail).
 * The UI layer opens Instagram after showing the result.
 */
export async function shareToInstagram(data: ShareCardData): Promise<ShareResult> {
  const blob = await generateShareCard(data);
  const filename = buildFilename(data.companionName);

  // Download the image
  triggerDownload(blob, filename);

  // Copy caption to clipboard
  const caption = buildCaption(data);
  let captionCopied = false;
  try {
    await navigator.clipboard.writeText(caption);
    captionCopied = true;
  } catch {
    // Clipboard may fail in non-secure contexts
  }

  return {
    success: true,
    message: captionCopied
      ? 'Image downloaded & caption copied!'
      : 'Image downloaded!',
  };
}

/**
 * Share to Apps (Web Share API):
 * Uses navigator.share with file support if available.
 * Falls back to direct download if not supported.
 */
export async function shareToApps(data: ShareCardData): Promise<ShareResult> {
  const blob = await generateShareCard(data);
  const filename = buildFilename(data.companionName);

  // Try Web Share API with file support
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: 'image/png' });
    const shareData = {
      title: `${data.companionName} on ZaryahPlus`,
      text: buildCaption(data),
      files: [file],
    };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return { success: true, message: 'Shared successfully!' };
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return { success: false, message: 'Share cancelled' };
        }
      }
    }
  }

  // Fallback: download the image
  triggerDownload(blob, filename);
  return { success: true, message: 'Image downloaded!' };
}

/**
 * Download the branded PNG directly.
 */
export async function downloadShareImage(data: ShareCardData): Promise<ShareResult> {
  const blob = await generateShareCard(data);
  const filename = buildFilename(data.companionName);
  triggerDownload(blob, filename);
  return { success: true, message: 'Image saved to downloads!' };
}
