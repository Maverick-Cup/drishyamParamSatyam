/**
 * Firestore Repositories implementing zero-dependency domain interfaces
 */

import { FieldValue, Firestore } from 'firebase-admin/firestore';
import {
  MemoryRecord,
  PermissionGrant,
  AuditEvent
} from '../../domain/models';
import {
  MemoryRepository,
  PermissionRepository,
  AuditRepository
} from '../../domain/repositories';

export class FirestoreMemoryRepository implements MemoryRepository {
  constructor(private readonly db: Firestore) {}

  async findById(id: string, profileId: string): Promise<MemoryRecord | null> {
    const docSnap = await this.db
      .collection('profiles')
      .doc(profileId)
      .collection('memories')
      .doc(id)
      .get();

    if (!docSnap.exists) {
      return null;
    }

    return docSnap.data() as MemoryRecord;
  }

  async searchVector768(embedding: number[], profileId: string, limit: number): Promise<MemoryRecord[]> {
    const collRef = this.db
      .collection('profiles')
      .doc(profileId)
      .collection('memories');

    try {
      // Native Firestore Vector Search using findNearest
      const vectorQuery = collRef
        .where('reviewStatus', '==', 'APPROVED')
        .findNearest('embedding768', FieldValue.vector(embedding), {
          limit,
          distanceMeasure: 'COSINE',
        });

      const snapshot = await vectorQuery.get();
      return snapshot.docs.map(doc => doc.data() as MemoryRecord);
    } catch (err) {
      console.warn('[FirestoreMemoryRepository] Native findNearest query failed, falling back to standard query:', err);
      const fallbackSnap = await collRef
        .where('reviewStatus', '==', 'APPROVED')
        .limit(limit)
        .get();
      return fallbackSnap.docs.map(doc => doc.data() as MemoryRecord);
    }
  }

  async save(record: MemoryRecord): Promise<void> {
    const docRef = this.db
      .collection('profiles')
      .doc(record.profileId)
      .collection('memories')
      .doc(record.id);

    // If embedding is present, store as Firestore Vector
    const dataToSave: Record<string, unknown> = { ...record };
    if (record.embedding768 && Array.isArray(record.embedding768)) {
      dataToSave.embedding768 = FieldValue.vector(record.embedding768);
    }

    await docRef.set(dataToSave, { merge: true });
  }
}

export class FirestorePermissionRepository implements PermissionRepository {
  constructor(private readonly db: Firestore) {}

  async getGrant(userId: string, profileId: string): Promise<PermissionGrant | null> {
    const docSnap = await this.db
      .collection('profiles')
      .doc(profileId)
      .collection('permission_grants')
      .doc(userId)
      .get();

    if (!docSnap.exists) {
      return null;
    }

    return docSnap.data() as PermissionGrant;
  }

  async saveGrant(grant: PermissionGrant): Promise<void> {
    await this.db
      .collection('profiles')
      .doc(grant.profileId)
      .collection('permission_grants')
      .doc(grant.granteeUid)
      .set(grant, { merge: true });
  }
}

export class FirestoreAuditRepository implements AuditRepository {
  constructor(private readonly db: Firestore) {}

  async logEvent(event: AuditEvent): Promise<void> {
    await this.db
      .collection('profiles')
      .doc(event.profileId)
      .collection('audit_events')
      .doc(event.id)
      .set(event);
  }

  async listEventsByProfile(profileId: string, limit = 100): Promise<AuditEvent[]> {
    const snapshot = await this.db
      .collection('profiles')
      .doc(profileId)
      .collection('audit_events')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as AuditEvent);
  }
}
