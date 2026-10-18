import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRepositories } from '@/adapters';
import { MediaVaultRecord } from '@/domain/models';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';
    const title = (formData.get('title') as string) || '';
    const profileId = (formData.get('profileId') as string) || 'profile-satya-default';
    const ownerUid = (formData.get('ownerUid') as string) || 'user-demo-1';
    const isCompressed = formData.get('compressed') === 'true';
    const originalSizeBytes = Number(formData.get('originalSize')) || file?.size || 0;
    const reductionPercent = Number(formData.get('reductionPercent')) || 0;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const mimeType = file.type || 'application/octet-stream';
    const size = file.size;

    let fileType: 'image' | 'audio' | 'document' = 'document';
    if (mimeType.startsWith('image/')) {
      fileType = 'image';
    } else if (mimeType.startsWith('audio/')) {
      fileType = 'audio';
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const mediaId = `media_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Target Storage Path based on mimeType
    let folder = 'documents';
    if (fileType === 'image') folder = 'portraits';
    if (fileType === 'audio') folder = 'audio';

    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const destinationPath = `profiles/${profileId}/${folder}/${mediaId}_${cleanFilename}`;

    const repos = getRepositories();
    const uploadResult = await repos.storageService.uploadFile(destinationPath, buffer, mimeType);

    // In local fallback or if signedUrl is unavailable, provide dataUrl for immediate playback
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;
    const publicUrl = uploadResult.signedUrl || dataUrl;

    const mediaRecord: MediaVaultRecord = {
      id: mediaId,
      profileId,
      ownerUid,
      type: fileType,
      title: title || filename.replace(/\.[^/.]+$/, ''),
      category,
      filename,
      storageUri: uploadResult.storageUri,
      signedUrl: uploadResult.signedUrl,
      mimeType,
      sizeBytes: size,
      originalSizeBytes,
      compressed: isCompressed,
      reductionPercent,
      checksumSha256,
      uploadedAt: new Date().toISOString(),
    };

    // Atomically persist metadata record in database
    await repos.mediaRepo.save(mediaRecord);

    return NextResponse.json({
      success: true,
      mediaId,
      filename,
      fileType,
      mimeType,
      size,
      originalSizeBytes,
      compressed: isCompressed,
      reductionPercent,
      category,
      title: mediaRecord.title,
      fileUrl: publicUrl,
      storageUri: uploadResult.storageUri,
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  } catch (error: any) {
    console.error('[Upload API Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get('profileId') || 'profile-satya-default';
    const type = searchParams.get('type') as 'image' | 'audio' | 'document' | null;

    const repos = getRepositories();
    const mediaList = await repos.mediaRepo.listByProfile(profileId, type || undefined, 50);

    return NextResponse.json({
      success: true,
      count: mediaList.length,
      mode: repos.isCloudMode ? 'FIRESTORE_CLOUD' : 'IN_MEMORY_FALLBACK',
      media: mediaList,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to list media' }, { status: 500 });
  }
}
