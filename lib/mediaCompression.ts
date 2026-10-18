/**
 * Media Compression Utilities for ParamSathya
 * Client-side and in-browser pre-processing to drastically reduce storage footprint,
 * preserve bandwidth, and optimize media before Cloud Storage persistence.
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  mimeType: string;
}

/**
 * Compresses an image file in-browser using HTML5 Canvas.
 * Resizes down to maxWidth/maxHeight (default 1200px) and converts to WebP (quality 0.82).
 * Falls back to JPEG if WebP is unsupported.
 */
export async function compressImageClient(
  file: File,
  options: {
    maxDimension?: number;
    quality?: number;
    preferredMimeType?: 'image/webp' | 'image/jpeg';
  } = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 1200,
    quality = 0.82,
    preferredMimeType = 'image/webp',
  } = options;

  // If not in a browser environment or already tiny (< 50KB) SVG/WebP, return untouched
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercent: 0,
      mimeType: file.type,
    };
  }

  if (file.type === 'image/svg+xml' || (file.size < 50 * 1024 && file.type === 'image/webp')) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercent: 0,
      mimeType: file.type,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
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
        // Fallback to original if 2D context fails
        resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          reductionPercent: 0,
          mimeType: file.type,
        });
        return;
      }

      // Smooth bilinear image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              file,
              originalSize: file.size,
              compressedSize: file.size,
              reductionPercent: 0,
              mimeType: file.type,
            });
            return;
          }

          // If compression somehow produced a larger file, retain original
          if (blob.size >= file.size && file.type === preferredMimeType) {
            resolve({
              file,
              originalSize: file.size,
              compressedSize: file.size,
              reductionPercent: 0,
              mimeType: file.type,
            });
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const extension = preferredMimeType === 'image/webp' ? '.webp' : '.jpg';
          const newFileName = `${baseName}${extension}`;

          const compressedFile = new File([blob], newFileName, {
            type: preferredMimeType,
            lastModified: Date.now(),
          });

          const reductionPercent = Math.max(
            0,
            Math.round(((file.size - compressedFile.size) / file.size) * 100)
          );

          resolve({
            file: compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            reductionPercent,
            mimeType: preferredMimeType,
          });
        },
        preferredMimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback cleanly on decode error
      resolve({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        reductionPercent: 0,
        mimeType: file.type,
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Downsamples an audio buffer into 16kHz mono 16-bit PCM WAV.
 * 16kHz Mono is the gold standard for voice cloning (Sync.so, MuseTalk, ElevenLabs, IndicVoices).
 */
export async function downsampleAudioTo16kMono(file: File): Promise<CompressionResult> {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercent: 0,
      mimeType: file.type,
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Decode user audio
    const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
    
    // Target: 16000Hz, 1 channel (mono)
    const targetSampleRate = 16000;
    const targetLength = Math.round(decodedAudio.duration * targetSampleRate);
    
    const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = decodedAudio;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    await audioCtx.close();

    // Encode rendered mono audio into standard 16-bit PCM WAV
    const wavBlob = encodeWAV16Bit(renderedBuffer.getChannelData(0), targetSampleRate);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const compressedFile = new File([wavBlob], `${baseName}_16k_mono.wav`, {
      type: 'audio/wav',
      lastModified: Date.now(),
    });

    const reductionPercent = Math.max(
      0,
      Math.round(((file.size - compressedFile.size) / file.size) * 100)
    );

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      reductionPercent,
      mimeType: 'audio/wav',
    };
  } catch (err) {
    console.warn('[downsampleAudioTo16kMono] Client audio downsampling fallback to original:', err);
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercent: 0,
      mimeType: file.type,
    };
  }
}

/**
 * Encodes Float32 mono audio samples into a standard 16-bit PCM WAV container
 */
function encodeWAV16Bit(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 1 * 2)
  view.setUint32(28, sampleRate * 2, true);
  // block align (1 * 2)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
