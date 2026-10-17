/**
 * TemporalTranscriptionService
 * Provides verified time-offset formatting (mm:ss.sss), bounded audio segment seeking/playback
 * (startMs -> endMs), and deterministic Presence Readiness metrics calculation from approved records.
 */

// Types used for runtime logic in TemporalTranscriptionService
export interface AudioEvidenceAnchor {
  kind: 'AUDIO';
  sourceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  transcriptSegmentId: string;
  startMs: number;
  endMs: number;
  quotedText?: string;
  checksumSha256?: string;
}

export interface MemoryRecord {
  id: string;
  profileId?: string;
  title?: string;
  reviewedText?: string;
  provenance?: string;
  provenanceTier?: string;
  reviewStatus?: string;
  sourceRefs?: string[];
  evidenceAnchors?: any[];
  recordedSpeakerDisplayName?: string;
  contributorDisplayName?: string;
}

export interface PresenceReadinessMetrics {
  sourceCount: number;
  approvedMemoryCount: number;
  firstPersonCount: number;
  voiceMinutes: number;
  voiceSecondsTotal: number;
  connectedPeopleCount: number;
  unreviewedCount: number;
  status: 'EMPTY' | 'SOURCE_ADDED' | 'REVIEW_REQUIRED' | 'GROUNDED' | 'VOICE_AVAILABLE';
}

export interface AudioLikeElement {
  src: string;
  currentTime: number;
  paused: boolean;
  play(): Promise<void>;
  pause(): void;
}

export class TemporalTranscriptionService {
  /**
   * Formats milliseconds into exact human-readable broadcast time offset: mm:ss.sss
   * e.g. 43200 ms -> 00:43.200
   */
  public static formatMsToTimecode(ms: number): string {
    if (!ms || Number.isNaN(ms) || ms < 0) return '00:00.000';
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const millis = Math.floor(ms % 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  /**
   * Formats seconds into mm:ss
   */
  public static formatSeconds(totalSec: number): string {
    if (!totalSec || Number.isNaN(totalSec) || totalSec < 0) return '00:00';
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /**
   * Calculates honest, measurable Presence Readiness metrics from actual stored material
   * (Zero arbitrary percentages or synthetic counters).
   */
  public static calculatePresenceReadiness(
    memories: MemoryRecord[],
    sourceCountInput = 0,
    activeProfileId?: string
  ): PresenceReadinessMetrics {
    const uniqueById = new Map<string, MemoryRecord>();
    for (const m of memories) {
      if (m && m.id && !uniqueById.has(m.id)) {
        if (!activeProfileId || m.profileId === activeProfileId) {
          uniqueById.set(m.id, m);
        }
      }
    }
    const deduped = Array.from(uniqueById.values());

    const approved = deduped.filter(
      (m) =>
        m.reviewStatus === 'APPROVED' &&
        (m.provenanceTier ?? m.provenance) !== 'GENERATED_CONTENT'
    );
    const firstPerson = approved.filter(
      (m) => (m.provenanceTier ?? m.provenance) === 'VERIFIED_FIRST_PERSON'
    );
    const unreviewed = deduped.filter(
      (m) => m.reviewStatus === 'PENDING' || m.reviewStatus === 'REVIEW_REQUIRED'
    );

    let voiceSeconds = 0;
    const uniqueSources = new Set<string>();
    const people = new Set<string>();

    approved.forEach((m) => {
      (m.sourceRefs || []).forEach((s) => uniqueSources.add(s));
      (m.evidenceAnchors || []).forEach((anchor) => {
        uniqueSources.add(anchor.sourceId);
        if (anchor.kind === 'AUDIO') {
          const audioAnchor = anchor as AudioEvidenceAnchor;
          const durSec = Math.max(0, (audioAnchor.endMs - audioAnchor.startMs) / 1000);
          voiceSeconds += durSec;
        }
      });
      if (m.recordedSpeakerDisplayName) people.add(m.recordedSpeakerDisplayName);
      if (m.contributorDisplayName && m.contributorDisplayName !== 'Self') {
        people.add(m.contributorDisplayName);
      }
    });

    const totalSources = Math.max(sourceCountInput, uniqueSources.size);

    let status: PresenceReadinessMetrics['status'] = 'EMPTY';
    if (approved.length === 0 && totalSources === 0) {
      status = 'EMPTY';
    } else if (approved.length === 0 && totalSources > 0) {
      status = 'SOURCE_ADDED';
    } else if (unreviewed.length > 0) {
      status = 'REVIEW_REQUIRED';
    } else if (voiceSeconds >= 30) {
      status = 'VOICE_AVAILABLE';
    } else if (approved.length >= 3) {
      status = 'GROUNDED';
    } else {
      status = 'SOURCE_ADDED';
    }

    return {
      sourceCount: totalSources,
      approvedMemoryCount: approved.length,
      firstPersonCount: firstPerson.length,
      voiceMinutes: Math.round(voiceSeconds / 60),
      voiceSecondsTotal: Math.round(voiceSeconds),
      connectedPeopleCount: people.size,
      unreviewedCount: unreviewed.length,
      status,
    };
  }

  /**
   * Exact Audio Segment Seeker
   * Seeks immediately to startMs / 1000, plays, and automatically pauses when reaching endMs / 1000.
   * Returns a cleanup function that halts the interval and pauses playback immediately.
   */
  public static playAudioSegment(
    audioElement: AudioLikeElement,
    audioUrl: string,
    startMs: number,
    endMs: number,
    onPlaybackUpdate?: (currentMs: number, isPlaying: boolean) => void,
    onEnded?: () => void,
    pollIntervalMs = 80
  ): () => void {
    const startSec = Math.max(0, startMs / 1000);
    const endSec = Math.max(startSec + 0.1, endMs / 1000);

    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const stopTracking = () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    };

    if (audioUrl && audioElement.src !== audioUrl) {
      audioElement.src = audioUrl;
    }

    audioElement.currentTime = startSec;
    audioElement
      .play()
      .then(() => {
        if (cancelled) {
          audioElement.pause();
          return;
        }
        if (onPlaybackUpdate) onPlaybackUpdate(startMs, true);

        checkInterval = setInterval(() => {
          if (cancelled) {
            stopTracking();
            return;
          }
          const currentMs = audioElement.currentTime * 1000;
          if (onPlaybackUpdate) onPlaybackUpdate(currentMs, !audioElement.paused);

          if (audioElement.currentTime >= endSec) {
            audioElement.pause();
            audioElement.currentTime = endSec;
            stopTracking();
            if (onPlaybackUpdate) onPlaybackUpdate(endMs, false);
            if (onEnded) onEnded();
          }
        }, pollIntervalMs);
      })
      .catch(() => {
        stopTracking();
        if (onPlaybackUpdate) onPlaybackUpdate(startMs, false);
      });

    return () => {
      cancelled = true;
      stopTracking();
      try {
        audioElement.pause();
      } catch {
        // Ignore pause error on unmounted audio element
      }
    };
  }
}
