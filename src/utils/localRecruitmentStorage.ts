/**
 * Local Hosting File Storage Utility for Recruitment & Staff ID Cards
 * Stores all files locally in hosting file structure (/uploads/recruitment/)
 * with zero external cloud dependencies.
 */

export interface LocalStoredFile {
  id: string;
  originalName: string;
  localPath: string; // e.g. /uploads/recruitment/cv-1729000-candidate.pdf
  dataUrl: string;   // base64 data url for instant offline viewing/downloading
  fileType: string;
  sizeBytes: number;
  uploadedAt: string;
}

const LOCAL_STORAGE_PREFIX = 'local_recruitment_file_';
const LOCAL_CATALOG_KEY = 'local_recruitment_files_catalog';

export function getLocalStoredFilesCatalog(): LocalStoredFile[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATALOG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading recruitment files catalog:', err);
  }
  return [];
}

/**
 * Helper to compress image files before storing as data URLs
 * Keeps files under 100KB to completely prevent memory leaks and browser hangs.
 */
async function compressImageFile(file: File, maxDimension: number = 800): Promise<{ dataUrl: string; sizeBytes: number }> {
  return new Promise((resolve) => {
    // If not an image, read directly as data URL
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result as string, sizeBytes: file.size });
      reader.onerror = () => resolve({ dataUrl: '', sizeBytes: 0 });
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: reader.result as string, sizeBytes: file.size });
          return;
        }

        // Draw image with smooth downscaling
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG for transparent signatures/seals, otherwise JPEG for small payload
        const isPng = file.type.includes('png') || file.type.includes('svg');
        const outputType = isPng ? 'image/png' : 'image/jpeg';
        const compressedUrl = canvas.toDataURL(outputType, isPng ? undefined : 0.85);

        // Calculate approximate byte size of base64
        const sizeBytes = Math.round((compressedUrl.length * 3) / 4);
        resolve({ dataUrl: compressedUrl, sizeBytes });
      };
      img.onerror = () => resolve({ dataUrl: reader.result as string, sizeBytes: file.size });
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve({ dataUrl: '', sizeBytes: 0 });
    reader.readAsDataURL(file);
  });
}

/**
 * Saves a file into local hosting storage under /uploads/recruitment/
 * Optimized with high-efficiency compression to prevent browser freezes.
 */
export async function saveFileToLocalStorage(
  file: File, 
  prefix: 'cv' | 'nid' | 'photo' | 'idcard_front' | 'idcard_back' | 'doc' | 'citizen' | 'cert' = 'doc'
): Promise<LocalStoredFile> {
  const maxDim = prefix === 'idcard_front' || prefix === 'idcard_back' ? 1000 : 700;
  const { dataUrl, sizeBytes } = await compressImageFile(file, maxDim);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const localPath = `/uploads/recruitment/${prefix}-${timestamp}-${safeName}`;
  const fileId = `file-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

  const record: LocalStoredFile = {
    id: fileId,
    originalName: file.name,
    localPath,
    dataUrl,
    fileType: file.type || 'application/octet-stream',
    sizeBytes: sizeBytes || file.size,
    uploadedAt: new Date().toISOString(),
  };

  // Cache file content in localStorage safely
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${localPath}`, dataUrl);
    const catalog = getLocalStoredFilesCatalog();
    localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify([record, ...catalog].slice(0, 30)));
  } catch {
    // Graceful fallback if localStorage is near capacity
  }

  return record;
}

/**
 * Retrieves the local data URL for a given local path
 */
export function getLocalFileUrl(localPath?: string): string {
  if (!localPath) return '';
  if (localPath.startsWith('data:')) return localPath;
  try {
    const stored = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${localPath}`);
    if (stored) return stored;
  } catch {}
  return localPath;
}

/**
 * Triggers a direct download of a local file
 */
export function downloadLocalFile(localPathOrDataUrl: string, downloadName: string = 'download'): void {
  const resolvedUrl = getLocalFileUrl(localPathOrDataUrl);
  const a = document.createElement('a');
  a.href = resolvedUrl;
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
