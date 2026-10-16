/**
 * SyncLabsService: Wrapper for Sync.so API v2
 * Supports:
 * 1. Synchronous & Asynchronous Text-to-Speech (/v2/tts and /v2/tts/jobs)
 * 2. Voice Listing & Voice Cloning (/v2/voices)
 * 3. Pre-signed Asset Uploads (/v2/assets/upload)
 */

export interface SyncVoice {
  id: string;
  name: string;
  provider: string;
  previewUrl?: string;
  voiceId?: string;
}

export class SyncLabsService {
  private apiKey: string;
  private baseUrl: string = 'https://api.sync.so/v2';

  constructor() {
    this.apiKey = process.env.SYNC_API_KEY || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * List all available voices (built-in and cloned)
   */
  public async listVoices(): Promise<SyncVoice[]> {
    if (!this.isConfigured()) return [];
    try {
      const res = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.voices || [];
    } catch (e) {
      console.warn('SyncLabs listVoices failed:', e);
      return [];
    }
  }

  /**
   * Synthesize speech using cloned voiceId
   * First attempts synchronous /v2/tts for instant response; falls back to async /v2/tts/jobs if needed
   */
  public async synthesizeSpeech(voiceId: string, script: string): Promise<string | null> {
    if (!this.isConfigured()) return null;

    // 1. Try synchronous /v2/tts
    try {
      const res = await fetch(`${this.baseUrl}/tts`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'elevenlabs',
          voiceId,
          script,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url || data.synthesizedAudioUrl) {
          return data.url || data.synthesizedAudioUrl;
        }
      }
    } catch (syncErr) {
      console.warn('Sync synchronous TTS failed, trying async job endpoint:', syncErr);
    }

    // 2. Fallback to async /v2/tts/jobs
    try {
      const idempotencyKey = `tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const jobRes = await fetch(`${this.baseUrl}/tts/jobs`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          provider: 'elevenlabs',
          voiceId,
          script,
        }),
      });

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        const jobId = jobData.id;

        // Poll job up to 6 times (max ~12s)
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const checkRes = await fetch(`${this.baseUrl}/tts/jobs/${jobId}`, {
            headers: { 'x-api-key': this.apiKey },
          });
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.status === 'SUCCESS' && checkData.url) {
              return checkData.url;
            }
            if (checkData.status === 'FAILED') break;
          }
        }
      }
    } catch (asyncErr) {
      console.warn('Sync async TTS failed:', asyncErr);
    }

    return null;
  }

  /**
   * Clone a voice from an audio sample buffer
   */
  public async cloneVoice(sampleBuffer: Buffer, fileName: string, voiceName: string): Promise<{ id: string; voiceId: string } | null> {
    if (!this.isConfigured()) return null;

    try {
      // 1. Get pre-signed upload URL
      const uploadInitRes = await fetch(`${this.baseUrl}/assets/upload`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: fileName }),
      });

      if (!uploadInitRes.ok) {
        throw new Error(`Asset upload initialization failed (${uploadInitRes.status})`);
      }

      const uploadData = await uploadInitRes.json();
      const uploadUrl = uploadData.uploadUrl || uploadData.url;
      const assetId = uploadData.assetId || uploadData.id;

      // 2. PUT file bytes to pre-signed URL
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: new Uint8Array(sampleBuffer),
        headers: {
          'Content-Type': fileName.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav',
        },
      });

      if (!putRes.ok) {
        throw new Error('Failed to upload audio sample bytes to sync storage');
      }

      // 3. Clone voice using assetId
      const cloneRes = await fetch(`${this.baseUrl}/voices`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: voiceName,
          assetId,
        }),
      });

      if (!cloneRes.ok) {
        const errJson = await cloneRes.json().catch(() => ({}));
        throw new Error(errJson.message || `Voice clone call failed (${cloneRes.status})`);
      }

      const cloneData = await cloneRes.json();
      return {
        id: cloneData.id,
        voiceId: cloneData.voiceId || cloneData.id,
      };
    } catch (e: any) {
      console.warn('SyncLabs cloneVoice error:', e.message);
      return null;
    }
  }
}

export const syncLabsService = new SyncLabsService();
