/**
 * Cloud Storage / Firebase Storage Service
 * Handles uploading and generating signed download URLs for audio WAV clips, portrait images, and MuseTalk MP4 renders.
 */

import { getStorageBucket } from './admin';

export class CloudStorageService {
  async uploadFile(
    destinationPath: string,
    fileBuffer: Buffer | ArrayBuffer,
    contentType: string
  ): Promise<{ storageUri: string; signedUrl?: string }> {
    const bucket = getStorageBucket();
    if (!bucket) {
      // In local mode without credentials, return a local mock URI
      return {
        storageUri: `mock://storage/${destinationPath}`,
        signedUrl: `/mock-media/${destinationPath}`,
      };
    }

    const file = bucket.file(destinationPath);
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

    await file.save(buffer, {
      metadata: {
        contentType,
      },
      resumable: false,
    });

    // Generate signed URL valid for 2 hours
    try {
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
      });

      return {
        storageUri: `gs://${bucket.name}/${destinationPath}`,
        signedUrl,
      };
    } catch {
      return {
        storageUri: `gs://${bucket.name}/${destinationPath}`,
      };
    }
  }

  async getSignedUrl(destinationPath: string): Promise<string | null> {
    const bucket = getStorageBucket();
    if (!bucket) return null;

    const file = bucket.file(destinationPath);
    const [exists] = await file.exists();
    if (!exists) return null;

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 2 * 60 * 60 * 1000,
    });

    return signedUrl;
  }
}
