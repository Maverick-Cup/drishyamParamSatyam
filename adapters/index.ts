/**
 * Unified Repository Provider
 * Automatically selects Cloud Firestore when credentials / GCP environment is present,
 * or deterministic in-memory fallback repositories during local development or offline mode.
 */

import { getFirestoreDb } from './firebase/admin';
import {
  FirestoreMemoryRepository,
  FirestorePermissionRepository,
  FirestoreAuditRepository,
  FirestoreMediaRepository
} from './firebase/FirestoreRepositories';
import { CloudStorageService } from './firebase/CloudStorageService';
import {
  MemoryRepository,
  PermissionRepository,
  AuditRepository,
  MediaRepository
} from '../domain/repositories';
import {
  MemoryRecord,
  PermissionGrant,
  AuditEvent,
  MediaVaultRecord
} from '../domain/models';

// In-Memory Seed Fallbacks for Local / Zero-Cost Development
class InMemoryMemoryRepository implements MemoryRepository {
  private memories: Map<string, MemoryRecord> = new Map();

  constructor() {
    // Seed with standard test memory
    const seedMemory: MemoryRecord = {
      id: 'mem-seed-1',
      ownerUid: 'user-demo-1',
      profileId: 'profile-satya-default',
      representedPersonId: 'person-satya-1',
      contributorUid: 'user-demo-1',
      sourceRefs: ['audio-rec-1994.wav'],
      reviewedText: 'I always believed that quiet persistence outlasts loud urgency. Take care of each other.',
      provenance: 'VERIFIED_FIRST_PERSON',
      reviewStatus: 'APPROVED',
      createdAt: '2026-10-15T10:00:00Z',
      updatedAt: '2026-10-15T10:00:00Z',
    };
    this.memories.set(seedMemory.id, seedMemory);
  }

  async findById(id: string, _profileId: string): Promise<MemoryRecord | null> {
    return this.memories.get(id) || null;
  }

  async searchVector768(_embedding: number[], _profileId: string, limit: number): Promise<MemoryRecord[]> {
    return Array.from(this.memories.values())
      .filter(m => m.reviewStatus === 'APPROVED')
      .slice(0, limit);
  }

  async save(record: MemoryRecord): Promise<void> {
    this.memories.set(record.id, record);
  }
}

class InMemoryPermissionRepository implements PermissionRepository {
  private grants: Map<string, PermissionGrant> = new Map();

  constructor() {
    const seedGrant: PermissionGrant = {
      id: 'grant-seed-1',
      profileId: 'profile-satya-default',
      representedPersonId: 'person-satya-1',
      granteeUid: 'user-demo-1',
      allowPresenceView: true,
      allowVoiceSynthesis: true,
      allowAvatarRender: true,
      isConsentedAdult: true,
      version: 1,
      updatedAt: '2026-10-15T10:00:00Z',
    };
    this.grants.set(`user-demo-1_profile-satya-default`, seedGrant);
  }

  async getGrant(userId: string, profileId: string): Promise<PermissionGrant | null> {
    return this.grants.get(`${userId}_${profileId}`) || {
      // Permissive local default grant for testing
      id: `grant-auto-${userId}`,
      profileId,
      representedPersonId: 'person-satya-1',
      granteeUid: userId,
      allowPresenceView: true,
      allowVoiceSynthesis: true,
      allowAvatarRender: true,
      isConsentedAdult: true,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
  }
}

class InMemoryAuditRepository implements AuditRepository {
  private events: AuditEvent[] = [];

  async logEvent(event: AuditEvent): Promise<void> {
    this.events.unshift(event);
  }

  async listEvents(): Promise<AuditEvent[]> {
    return this.events;
  }

  async listEventsByProfile(profileId: string, limit = 100): Promise<AuditEvent[]> {
    return this.events
      .filter(e => e.profileId === profileId)
      .slice(0, limit);
  }
}

class InMemoryMediaRepository implements MediaRepository {
  private media: Map<string, MediaVaultRecord> = new Map();

  async findById(id: string, _profileId: string): Promise<MediaVaultRecord | null> {
    return this.media.get(id) || null;
  }

  async listByProfile(profileId: string, type?: 'image' | 'audio' | 'document', limit = 50): Promise<MediaVaultRecord[]> {
    return Array.from(this.media.values())
      .filter((m) => m.profileId === profileId && (!type || m.type === type))
      .slice(0, limit);
  }

  async save(record: MediaVaultRecord): Promise<void> {
    this.media.set(record.id, record);
  }

  async delete(id: string, _profileId: string): Promise<void> {
    this.media.delete(id);
  }
}

export interface AppRepositories {
  isCloudMode: boolean;
  memoryRepo: MemoryRepository;
  permissionRepo: PermissionRepository;
  auditRepo: AuditRepository;
  mediaRepo: MediaRepository;
  storageService: CloudStorageService;
}

let cachedRepos: AppRepositories | null = null;

export function getRepositories(): AppRepositories {
  if (cachedRepos) return cachedRepos;

  const db = getFirestoreDb();

  if (db) {
    cachedRepos = {
      isCloudMode: true,
      memoryRepo: new FirestoreMemoryRepository(db),
      permissionRepo: new FirestorePermissionRepository(db),
      auditRepo: new FirestoreAuditRepository(db),
      mediaRepo: new FirestoreMediaRepository(db),
      storageService: new CloudStorageService(),
    };
  } else {
    cachedRepos = {
      isCloudMode: false,
      memoryRepo: new InMemoryMemoryRepository(),
      permissionRepo: new InMemoryPermissionRepository(),
      auditRepo: new InMemoryAuditRepository(),
      mediaRepo: new InMemoryMediaRepository(),
      storageService: new CloudStorageService(),
    };
  }

  return cachedRepos;
}
