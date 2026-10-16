import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';
    const title = (formData.get('title') as string) || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const mimeType = file.type;
    const size = file.size;

    let fileType: 'image' | 'audio' | 'document' = 'document';
    if (mimeType.startsWith('image/')) {
      fileType = 'image';
    } else if (mimeType.startsWith('audio/')) {
      fileType = 'audio';
    }

    // Convert file buffer to Data URL / Base64 for instant browser rendering and playback
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      filename,
      fileType,
      mimeType,
      size,
      category,
      title: title || filename.replace(/\.[^/.]+$/, ''),
      fileUrl: dataUrl,
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
