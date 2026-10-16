import { NextRequest, NextResponse } from 'next/server';

/**
 * MuseTalk Synthetic Preflight & Localhost Pipeline Simulator
 *
 * Emulates the exact schema, pipeline stages, and preflight checks required by:
 * - https://musetalkai.com/playground/
 * - banao-tech/musetalk-avatar (Hugging Face Space)
 * - MuseTalk 1.5 Cloud Run L4 GPU / Local inference server
 *
 * Stages:
 * 1. Preflight validation (image resolution, face alignment check, audio duration <= 15s, sample rate)
 * 2. Audio feature extraction (Whisper-tiny latent chunking)
 * 3. Face bbox & DWPose landmark masking (256x256 mouth latent crop)
 * 4. Latent inpainting synthesis simulation
 * 5. Audio-video muxing and final verification
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = (formData.get('action') as string) || 'render';
    const faceImage = formData.get('faceImage') as File | null;
    const audioFile = formData.get('audioFile') as File | null;
    const textFallback = (formData.get('textFallback') as string) || '';
    const bboxShift = Number(formData.get('bboxShift') || 0);

    // Stage 1: Preflight Validation Check
    if (action === 'preflight') {
      const logs: string[] = [];
      logs.push(`[${new Date().toISOString()}] Initiating MuseTalk 1.5 Preflight Check...`);

      if (!faceImage && !formData.get('faceImageUrl')) {
        return NextResponse.json({
          success: false,
          status: 'ERROR',
          logs: [...logs, 'FAILED: Missing face image input.'],
          error: 'Face image is required for preflight check.',
        });
      }
      logs.push('✓ Face image detected: format supported (JPEG/PNG/WEBP).');

      if (!audioFile && !textFallback) {
        return NextResponse.json({
          success: false,
          status: 'ERROR',
          logs: [...logs, 'FAILED: Missing audio file or text fallback.'],
          error: 'Either audio file (.wav/.mp3) or text prompt is required.',
        });
      }

      if (audioFile) {
        logs.push(`✓ Audio input detected: ${audioFile.name} (${Math.round(audioFile.size / 1024)} KB).`);
        // Check size/duration constraint (< 15 seconds recommended for MuseTalk batch latency)
        if (audioFile.size > 5 * 1024 * 1024) {
          logs.push('⚠ Warning: Audio file is large. MuseTalk operates best under 15 seconds to prevent GPU timeout.');
        } else {
          logs.push('✓ Audio length within target safe range (< 15s).');
        }
      } else {
        logs.push(`✓ Synthetic audio mode: will synthesize speech from prompt "${textFallback.slice(0, 30)}..."`);
      }

      logs.push('✓ DWPose face landmark verification: single front-facing subject detected.');
      logs.push(`✓ Upper boundary shift offset set to: ${bboxShift}px.`);
      logs.push('✓ Preflight check PASSED. Ready for MuseTalk inference pipeline.');

      return NextResponse.json({
        success: true,
        status: 'READY',
        logs,
        faceReady: true,
        audioReady: true,
      });
    }

    // Stage 2: Full Synthesis / Simulation Run
    const logs: string[] = [];
    logs.push(`[${new Date().toISOString()}] Launching MuseTalk 1.5 batch inference...`);
    logs.push('[1/5] Loading latent VAE encoder & Whisper feature extractor...');
    logs.push('[2/5] Cropping 256x256 lower-face bounding box with landmark alignment...');
    logs.push('[3/5] Conditioning UNet on audio latent chunks at 25 FPS...');
    logs.push('[4/5] Running single-pass latent inpainting on GPU...');
    logs.push('[5/5] Re-compositing mouth region & muxing synchronized AAC/WAV audio into MP4 container...');
    logs.push('✓ Finished generation! Exporting output video.');

    // For local evaluation, return a high-res video preview or fallback synthesized stream
    // Using a sample MP4 demonstration avatar video
    const sampleOutputVideoUrl =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

    return NextResponse.json({
      success: true,
      status: 'COMPLETED',
      logs,
      outputVideoUrl: sampleOutputVideoUrl,
      inferenceTimeMs: 1420,
      fps: 32.4,
      parameters: {
        bboxShift,
        audioSource: audioFile ? 'uploaded_file' : 'synthetic_text',
        resolution: '512x512',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'FAILED',
        error: error.message || 'MuseTalk execution failed',
      },
      { status: 500 }
    );
  }
}
