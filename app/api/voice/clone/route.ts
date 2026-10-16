import { NextRequest, NextResponse } from 'next/server';
import { syncLabsService } from '@/services/SyncLabsService';

/**
 * /api/voice/clone: Persistent 1:1 Voice Profile Binding
 * Supports:
 * - Option A: Bind an existing Sync Voice ID
 * - Option B: Upload a new audio sample, clone via Sync.so, and store binding
 */

export async function GET() {
  try {
    const voices = await syncLabsService.listVoices();
    return NextResponse.json({ success: true, voices });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handling Option A: JSON Binding with existing Voice ID
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { personId, voiceId, voiceName, consented } = body;

      if (!personId || !voiceId) {
        return NextResponse.json({ error: 'Missing personId or voiceId' }, { status: 400 });
      }

      if (!consented) {
        return NextResponse.json(
          { error: 'Adult consent attestation is required for voice binding' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: 'bound_existing',
        profile: {
          personId,
          voiceId,
          voiceName: voiceName || 'Thomas (Custom Voice)',
          boundAt: new Date().toISOString(),
        },
      });
    }

    // Handling Option B: Multipart Upload of new voice audio sample
    const formData = await request.formData();
    const personId = formData.get('personId') as string;
    const voiceName = (formData.get('voiceName') as string) || 'Thomas (Cloned Voice)';
    const consented = formData.get('consented') === 'true';
    const sampleFile = formData.get('sample') as File | null;

    if (!personId || !sampleFile) {
      return NextResponse.json({ error: 'Missing personId or audio sample file' }, { status: 400 });
    }

    // Security Guard: Prevent file upload exhaustion (max 15MB)
    const MAX_FILE_SIZE = 15 * 1024 * 1024;
    if (sampleFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Audio sample exceeds maximum limit of 15MB.', threatType: 'RESOURCE_EXHAUSTION' },
        { status: 400 }
      );
    }

    // Security Guard: Validate audio extension / MIME
    const allowedExtensions = ['.wav', '.mp3', '.m4a', '.ogg'];
    const hasValidExt = allowedExtensions.some((ext) => sampleFile.name.toLowerCase().endsWith(ext));
    if (!hasValidExt && !sampleFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only audio files (.wav, .mp3, .m4a) are permitted.', threatType: 'MALICIOUS_UPLOAD' },
        { status: 400 }
      );
    }

    if (!consented) {
      return NextResponse.json(
        { error: 'Explicit adult consent is required to clone and bind voice' },
        { status: 403 }
      );
    }

    const buffer = Buffer.from(await sampleFile.arrayBuffer());
    const cloneResult = await syncLabsService.cloneVoice(buffer, sampleFile.name, voiceName);

    if (!cloneResult) {
      return NextResponse.json(
        {
          success: false,
          error: 'Voice cloning service could not process sample (requires 30s-2m clean audio).',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: 'cloned_new',
      profile: {
        personId,
        voiceId: cloneResult.voiceId,
        providerId: cloneResult.id,
        voiceName,
        boundAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
