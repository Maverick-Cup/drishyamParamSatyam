/**
 * Pure Graph Transformation & Grounded Map Reflection Service
 * ZERO React, DOM, Firebase, or network dependencies.
 * Enforces:
 * - Single-source-of-truth deduplication (Set of unique approved MemoryRecord IDs)
 * - Profile isolation (strictly filters record.profileId === activeProfileId)
 * - Exclusion of REVOKED and GENERATED_CONTENT records from historical constellation nodes
 * - Deterministic static-seeded coordinate layout in [0..1000] x [0..1000]
 * - Fail-closed grounded conversation packets (forces GUIDE + renderAllowed: false when unsupported)
 */

export type ResponseMode = 'PRESENCE' | 'GUIDE' | 'SAFETY';
export type SupportLevel =
  | 'DIRECT_SOURCE'
  | 'ATTRIBUTED_RECOLLECTION'
  | 'GENERAL_SUPPORT'
  | 'INSUFFICIENT_EVIDENCE';
export type ProvenanceTier =
  | 'VERIFIED_FIRST_PERSON'
  | 'ATTRIBUTED_RECOLLECTION'
  | 'USER_CONTEXT'
  | 'GENERAL_SUPPORT'
  | 'GENERATED_CONTENT';
export type MemoryReviewStatus = 'APPROVED' | 'REVIEW_REQUIRED' | 'REVOKED';
export type EvidenceSourceType = 'AUDIO' | 'TEXT' | 'DOCUMENT' | 'PHOTO';
export interface MemoryRecord {
  id: string;
  ownerUid: string;
  profileId: string;
  representedPersonId: string;
  title?: string;
  contributorUid: string;
  contributorId?: string;
  contributorDisplayName?: string;
  recordedSpeakerId?: string;
  recordedSpeakerDisplayName?: string;
  verifiedLocation?: string;
  categoryIds?: string[];
  sourceRefs: string[];
  reviewedText: string;
  provenance: ProvenanceTier;
  provenanceTier?: ProvenanceTier;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'REVIEW_REQUIRED';
  evidenceAnchors?: any[];
  restrictedScope?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDescriptor {
  id: string;
  name: string;
  color: string;
}

export interface MemoryGraphNode {
  id: string;
  kind: 'CENTER' | 'CATEGORY' | 'MEMORY';
  label: string;
  categoryId?: string;
  categoryName?: string;
  color: string;
  memoryId?: string;
  provenanceTier?: ProvenanceTier;
  reviewStatus?: MemoryReviewStatus;
  primarySourceType?: EvidenceSourceType;
  evidenceCount: number;
  restrictedScope?: boolean;
  categoryMemoryCount?: number;
  x: number; // Deterministic normalized coordinate [0..1000]
  y: number; // Deterministic normalized coordinate [0..1000]
  radius: number;
  ariaLabel: string;
}

export interface MemoryGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  edgeStyle: 'SOLID_FIRST_PERSON' | 'DASHED_ATTRIBUTED' | 'DOTTED_CATEGORY';
}

export interface MemoryGraph {
  profileId: string;
  centerLabel: string;
  nodes: MemoryGraphNode[];
  edges: MemoryGraphEdge[];
  uniqueApprovedMemoryCount: number;
  reviewRequiredCount: number;
  revokedExcludedCount: number;
  categoryCounts: Record<string, number>;
  recordsById: Record<string, MemoryRecord>;
  approvedMemoryIds: string[];
}

export interface BuildMemoryGraphOptions {
  activeProfileId: string;
  centerLabel?: string;
  categories?: CategoryDescriptor[];
  includeReviewRequired?: boolean;
}

export type MindMapViewMode = 'MAP' | 'LIST';

export type ConversationScope =
  | { kind: 'MEMORY'; memoryIds: [string] }
  | { kind: 'CATEGORY'; categoryId: string; memoryIds: string[] }
  | { kind: 'SEARCH_RESULT'; query: string; memoryIds: string[] }
  | { kind: 'ALL_APPROVED'; memoryIds: string[] };

export type DrawerState =
  | { status: 'CLOSED' }
  | { status: 'EVIDENCE'; memoryId: string }
  | { status: 'CATEGORY_INSPECT'; categoryId: string }
  | { status: 'CONVERSATION'; scope: ConversationScope; sessionNonce: string };

export interface MapReflection {
  mode: ResponseMode;
  text: string;
  claims: Array<{
    text: string;
    evidenceRefs: string[];
    supportLevel: SupportLevel;
  }>;
  renderAllowed: boolean;
  guideHandoff: boolean;
  reasoningNote: string;
}

export type ReflectionState =
  | { status: 'IDLE' }
  | { status: 'LOADING'; requestId: string; scope: ConversationScope }
  | { status: 'READY'; requestId: string; response: MapReflection }
  | { status: 'FAILED'; requestId: string; errorCode: string; message: string };

export type AudioPlaybackState =
  | { status: 'IDLE' }
  | { status: 'LOADING'; memoryId: string }
  | { status: 'PLAYING'; memoryId: string; currentMs: number; startMs: number; endMs: number }
  | { status: 'PAUSED'; memoryId: string; currentMs: number; startMs: number; endMs: number }
  | { status: 'ERROR'; memoryId: string; reason: string };

export type CapabilityStatus =
  | 'AVAILABLE'
  | 'PERMISSION_REQUIRED'
  | 'PROCESSING'
  | 'ACTIVE'
  | 'UNAVAILABLE'
  | 'BLOCKED_BY_POLICY';

export const DEFAULT_CATEGORY_DESCRIPTORS: CategoryDescriptor[] = [
  { id: 'parents', name: 'Parents', color: '#10b981' },
  { id: 'identity', name: 'Identity', color: '#38bdf8' },
  { id: 'mortality', name: 'Mortality', color: '#a855f7' },
  { id: 'scenes', name: 'Scenes', color: '#06b6d4' },
  { id: 'fears', name: 'Fears', color: '#8b5cf6' },
  { id: 'regrets', name: 'Regrets', color: '#6366f1' },
  { id: 'siblings', name: 'Siblings', color: '#14b8a6' },
  { id: 'partner', name: 'Partner', color: '#ec4899' },
  { id: 'children', name: 'Children', color: '#f97316' },
  { id: 'work', name: 'Work', color: '#f59e0b' },
];

/**
 * Deterministic FNV-1a 32-bit string hash mapped to [0, 1).
 */
export function hashStringToUnitFloat(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 100000) / 100000;
}

function clampCoord(val: number, min = 75, max = 925): number {
  return Math.round(Math.max(min, Math.min(max, val)) * 100) / 100;
}

function inferPrimarySourceType(record: MemoryRecord): EvidenceSourceType {
  if (record.evidenceAnchors && record.evidenceAnchors.length > 0) {
    return record.evidenceAnchors[0].kind;
  }
  const firstRef = (record.sourceRefs && record.sourceRefs[0]) || '';
  const lower = firstRef.toLowerCase();
  if (lower.endsWith('.wav') || lower.endsWith('.mp3') || lower.endsWith('.m4a') || lower.includes('audio')) {
    return 'AUDIO';
  }
  if (lower.endsWith('.jpg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.includes('photo')) {
    return 'PHOTO';
  }
  if (lower.endsWith('.pdf') || lower.endsWith('.doc')) {
    return 'DOCUMENT';
  }
  return 'TEXT';
}

function normalizeProvenanceTier(record: MemoryRecord): ProvenanceTier {
  return record.provenanceTier ?? record.provenance;
}

function normalizeReviewStatus(record: MemoryRecord): MemoryReviewStatus {
  if (record.reviewStatus === 'APPROVED') return 'APPROVED';
  if (record.reviewStatus === 'REVOKED' || record.reviewStatus === 'REJECTED') return 'REVOKED';
  return 'REVIEW_REQUIRED';
}

/**
 * Pure deterministic graph builder.
 * Never mutates input arrays; returns identical coordinates across repeated calls.
 */
export function buildMemoryGraph(
  records: MemoryRecord[],
  options: BuildMemoryGraphOptions
): MemoryGraph {
  const {
    activeProfileId,
    centerLabel = 'P.S.',
    categories = DEFAULT_CATEGORY_DESCRIPTORS,
    includeReviewRequired = false,
  } = options;

  const categoryMap = new Map<string, CategoryDescriptor>();
  for (const cat of categories) {
    categoryMap.set(cat.id, cat);
  }

  // Deduplicate by record.id while strictly enforcing profileId isolation
  const uniqueApprovedById = new Map<string, MemoryRecord>();
  const uniqueReviewRequiredById = new Map<string, MemoryRecord>();
  let revokedExcludedCount = 0;

  for (const raw of records) {
    if (!raw || !raw.id) continue;
    // Strict tenant/profile isolation (MAP-016)
    if (raw.profileId !== activeProfileId) continue;

    const tier = normalizeProvenanceTier(raw);
    const status = normalizeReviewStatus(raw);

    // Exclude GENERATED_CONTENT and REVOKED records from historical memory graph (MAP-010)
    if (tier === 'GENERATED_CONTENT' || status === 'REVOKED') {
      revokedExcludedCount += 1;
      continue;
    }

    if (status === 'APPROVED') {
      if (!uniqueApprovedById.has(raw.id)) {
        uniqueApprovedById.set(raw.id, raw);
      }
    } else if (status === 'REVIEW_REQUIRED') {
      if (!uniqueReviewRequiredById.has(raw.id)) {
        uniqueReviewRequiredById.set(raw.id, raw);
      }
    }
  }

  const approvedRecords = Array.from(uniqueApprovedById.values());
  const reviewRequiredRecords = Array.from(uniqueReviewRequiredById.values());
  const uniqueApprovedMemoryCount = approvedRecords.length;
  const reviewRequiredCount = reviewRequiredRecords.length;

  const categoryCounts: Record<string, number> = {};
  for (const cat of categories) {
    categoryCounts[cat.id] = 0;
  }

  // Compute category membership counts without double-counting uniqueApprovedMemoryCount (MAP-002, MAP-003)
  for (const rec of approvedRecords) {
    const rawCats = rec.categoryIds && rec.categoryIds.length > 0 ? rec.categoryIds : ['identity'];
    const uniqueCatsForRecord = Array.from(new Set(rawCats));
    for (const catId of uniqueCatsForRecord) {
      if (!(catId in categoryCounts)) {
        categoryCounts[catId] = 0;
      }
      categoryCounts[catId] += 1;
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          id: catId,
          name: catId.charAt(0).toUpperCase() + catId.slice(1),
          color: '#38bdf8',
        });
      }
    }
  }

  const visibleRecords = includeReviewRequired
    ? [...approvedRecords, ...reviewRequiredRecords]
    : approvedRecords;

  // Zero-state honesty: if there are 0 visible records, return 0 nodes and 0 edges (MAP-001)
  if (visibleRecords.length === 0) {
    return {
      profileId: activeProfileId,
      centerLabel,
      nodes: [],
      edges: [],
      uniqueApprovedMemoryCount: 0,
      reviewRequiredCount,
      revokedExcludedCount,
      categoryCounts,
      recordsById: {},
      approvedMemoryIds: [],
    };
  }

  const nodes: MemoryGraphNode[] = [];
  const edges: MemoryGraphEdge[] = [];
  const recordsById: Record<string, MemoryRecord> = {};

  // 1. Center Represented Person Hub at (500, 500)
  const centerNode: MemoryGraphNode = {
    id: `center:${activeProfileId}`,
    kind: 'CENTER',
    label: centerLabel,
    color: '#f8fafc',
    evidenceCount: uniqueApprovedMemoryCount,
    x: 500,
    y: 500,
    radius: 30,
    ariaLabel: `Represented person center hub ${centerLabel}, ${uniqueApprovedMemoryCount} unique approved memories`,
  };
  nodes.push(centerNode);

  // 2. Active Category Hubs (only categories that have >= 1 visible memory)
  const activeCategoryIds = Array.from(categoryMap.keys()).filter((catId) => {
    return visibleRecords.some((r) => {
      const cats = r.categoryIds && r.categoryIds.length > 0 ? r.categoryIds : ['identity'];
      return cats.includes(catId);
    });
  });

  const categoryNodeCoords = new Map<string, { x: number; y: number; color: string; name: string }>();
  const totalCats = Math.max(1, activeCategoryIds.length);

  activeCategoryIds.forEach((catId, index) => {
    const desc = categoryMap.get(catId)!;
    const seedOffset = (hashStringToUnitFloat(`cat:${catId}`) - 0.5) * 0.18;
    const angle = (index / totalCats) * Math.PI * 2 - Math.PI / 2 + seedOffset;
    const ringRadius = totalCats <= 4 ? 220 : 245;
    const cx = clampCoord(500 + Math.cos(angle) * ringRadius, 140, 860);
    const cy = clampCoord(500 + Math.sin(angle) * ringRadius, 140, 860);
    const count = categoryCounts[catId] ?? 0;

    categoryNodeCoords.set(catId, { x: cx, y: cy, color: desc.color, name: desc.name });

    const catNodeId = `category:${catId}`;
    nodes.push({
      id: catNodeId,
      kind: 'CATEGORY',
      label: desc.name,
      categoryId: catId,
      categoryName: desc.name,
      color: desc.color,
      evidenceCount: count,
      categoryMemoryCount: count,
      x: cx,
      y: cy,
      radius: Math.min(22, 13 + Math.sqrt(count) * 2.2),
      ariaLabel: `Category ${desc.name}, ${count} approved ${count === 1 ? 'memory' : 'memories'}`,
    });

    edges.push({
      id: `edge:center->${catId}`,
      sourceId: centerNode.id,
      targetId: catNodeId,
      edgeStyle: 'DOTTED_CATEGORY',
    });
  });

  // 3. Satellite Memory Nodes (1 unique node per unique visible MemoryRecord)
  const groupedByPrimaryCategory = new Map<string, MemoryRecord[]>();
  for (const rec of visibleRecords) {
    const primaryCat = rec.categoryIds && rec.categoryIds.length > 0 ? rec.categoryIds[0] : 'identity';
    const list = groupedByPrimaryCategory.get(primaryCat) || [];
    list.push(rec);
    groupedByPrimaryCategory.set(primaryCat, list);
  }

  const memoryNodes: MemoryGraphNode[] = [];

  for (const [primaryCatId, group] of groupedByPrimaryCategory.entries()) {
    const hub = categoryNodeCoords.get(primaryCatId) || {
      x: 500,
      y: 500,
      color: '#38bdf8',
      name: primaryCatId,
    };

    // Sort deterministically by id
    const sortedGroup = [...group].sort((a, b) => a.id.localeCompare(b.id));
    const hubAngleFromCenter = Math.atan2(hub.y - 500, hub.x - 500);

    sortedGroup.forEach((rec, idx) => {
      recordsById[rec.id] = rec;
      const tier = normalizeProvenanceTier(rec);
      const status = normalizeReviewStatus(rec);
      const sourceType = inferPrimarySourceType(rec);
      const anchorCount =
        rec.evidenceAnchors && rec.evidenceAnchors.length > 0
          ? rec.evidenceAnchors.length
          : (rec.sourceRefs || []).length;

      // Spread satellite memories around the outer arc of their category hub
      const spreadSpan = Math.min(Math.PI * 1.35, Math.max(0.65, sortedGroup.length * 0.34));
      const relativeIndex =
        sortedGroup.length === 1 ? 0 : idx / (sortedGroup.length - 1) - 0.5;
      const seedJitter = (hashStringToUnitFloat(`mem:${rec.id}`) - 0.5) * 0.14;
      const satAngle = hubAngleFromCenter + relativeIndex * spreadSpan + seedJitter;
      const satDistance = 88 + (idx % 2) * 32 + hashStringToUnitFloat(`dist:${rec.id}`) * 18;

      const mx = clampCoord(hub.x + Math.cos(satAngle) * satDistance, 75, 925);
      const my = clampCoord(hub.y + Math.sin(satAngle) * satDistance, 75, 925);

      const titleText = rec.title || rec.reviewedText.slice(0, 48);
      const speakerLabel = rec.recordedSpeakerDisplayName || 'Speaker unknown';
      const provenanceLabel =
        tier === 'VERIFIED_FIRST_PERSON'
          ? 'Verified first-person evidence'
          : tier === 'ATTRIBUTED_RECOLLECTION'
            ? 'Attributed family recollection'
            : 'Contextual note';

      const memNode: MemoryGraphNode = {
        id: `memory:${rec.id}`,
        kind: 'MEMORY',
        label: titleText,
        categoryId: primaryCatId,
        categoryName: hub.name,
        color: hub.color,
        memoryId: rec.id,
        provenanceTier: tier,
        reviewStatus: status,
        primarySourceType: sourceType,
        evidenceCount: Math.max(1, anchorCount),
        restrictedScope: Boolean(rec.restrictedScope),
        x: mx,
        y: my,
        radius: Math.min(14, 8 + Math.min(4, Math.max(1, anchorCount)) * 1.2),
        ariaLabel: `Memory: ${titleText}. Category: ${hub.name}. Provenance: ${provenanceLabel}. Speaker: ${speakerLabel}. ${Math.max(1, anchorCount)} evidence ${anchorCount === 1 ? 'anchor' : 'anchors'}.`,
      };
      memoryNodes.push(memNode);

      // Connect memory node to all of its assigned categories
      const allCats = Array.from(
        new Set(rec.categoryIds && rec.categoryIds.length > 0 ? rec.categoryIds : [primaryCatId])
      );
      for (const catId of allCats) {
        if (categoryNodeCoords.has(catId)) {
          edges.push({
            id: `edge:cat:${catId}->mem:${rec.id}`,
            sourceId: `category:${catId}`,
            targetId: memNode.id,
            edgeStyle:
              tier === 'VERIFIED_FIRST_PERSON' ? 'SOLID_FIRST_PERSON' : 'DASHED_ATTRIBUTED',
          });
        }
      }
    });
  }

  // 4. Deterministic 12-iteration local collision resolution pass so satellite labels/orbs don't overlap
  const minSeparation = 34;
  for (let iter = 0; iter < 12; iter++) {
    for (let i = 0; i < memoryNodes.length; i++) {
      for (let j = i + 1; j < memoryNodes.length; j++) {
        const a = memoryNodes[i];
        const b = memoryNodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist < minSeparation) {
          const push = (minSeparation - dist) * 0.5;
          const ux = dx / dist;
          const uy = dy / dist;
          a.x = clampCoord(a.x - ux * push, 70, 930);
          a.y = clampCoord(a.y - uy * push, 70, 930);
          b.x = clampCoord(b.x + ux * push, 70, 930);
          b.y = clampCoord(b.y + uy * push, 70, 930);
        }
      }
    }
  }

  nodes.push(...memoryNodes);

  return {
    profileId: activeProfileId,
    centerLabel,
    nodes,
    edges,
    uniqueApprovedMemoryCount,
    reviewRequiredCount,
    revokedExcludedCount,
    categoryCounts,
    recordsById,
    approvedMemoryIds: approvedRecords.map((r) => r.id),
  };
}

/**
 * Pure Search & Filter Evaluator for Mind Map and List View
 * Preserves full graph coordinates when 0 matches occur so spatial context is never lost (MAP-005, MAP-006).
 */
export function filterMemoryGraphByQuery(
  graph: MemoryGraph,
  query: string,
  selectedCategoryId: string | null = null
): {
  matchedMemoryIds: Set<string>;
  matchedCategoryIds: Set<string>;
  hasActiveFilter: boolean;
} {
  const trimmed = query.trim().toLowerCase();
  const hasActiveFilter = Boolean(trimmed || selectedCategoryId);

  const matchedMemoryIds = new Set<string>();
  const matchedCategoryIds = new Set<string>();

  for (const memId of Object.keys(graph.recordsById)) {
    const rec = graph.recordsById[memId];
    const cats = rec.categoryIds && rec.categoryIds.length > 0 ? rec.categoryIds : ['identity'];

    const matchesCategory = !selectedCategoryId || cats.includes(selectedCategoryId);
    if (!matchesCategory) continue;

    if (!trimmed) {
      matchedMemoryIds.add(rec.id);
      cats.forEach((c) => matchedCategoryIds.add(c));
      continue;
    }

    const haystack = [
      rec.title || '',
      rec.reviewedText || '',
      rec.recordedSpeakerDisplayName || '',
      rec.contributorDisplayName || '',
      rec.verifiedLocation || '',
      ...cats,
    ]
      .join(' ')
      .toLowerCase();

    if (haystack.includes(trimmed)) {
      matchedMemoryIds.add(rec.id);
      cats.forEach((c) => matchedCategoryIds.add(c));
    }
  }

  return {
    matchedMemoryIds,
    matchedCategoryIds,
    hasActiveFilter,
  };
}

const SPECULATIVE_OR_UNBOUNDED_PATTERNS = [
  /watching over me/i,
  /where are you now/i,
  /afterlife/i,
  /in heaven/i,
  /what should i do with my life/i,
  /predict the future/i,
  /who will win/i,
  /stock market/i,
  /medical diagnosis/i,
  /prescribe/i,
];

/**
 * Pure Grounded Map Reflection Evaluator
 * Enforces strict provenance separation and fails closed to Neutral Guide mode (`renderAllowed: false`)
 * whenever evidence is missing, speculative, or attributed-only (MAP-009, MAP-010, MAP-011).
 */
export function synthesizeGroundedMapReflection(
  userPrompt: string,
  scope: ConversationScope,
  graph: MemoryGraph,
  representedPersonName: string
): MapReflection {
  const promptText = userPrompt.trim();

  // Filter scoped IDs strictly to APPROVED non-generated records in the graph
  const scopedApprovedRecords: MemoryRecord[] = scope.memoryIds
    .map((id) => graph.recordsById[id])
    .filter(
      (r): r is MemoryRecord =>
        Boolean(r) &&
        r.reviewStatus === 'APPROVED' &&
        (r.provenanceTier ?? r.provenance) !== 'GENERATED_CONTENT'
    );

  // 1. Fail-closed if no approved memories exist in scope
  if (scopedApprovedRecords.length === 0) {
    return {
      mode: 'GUIDE',
      text: `Guide Mode: There are no approved evidence records in the current selection for ${representedPersonName}. Please select a verified memory node or approve source material before starting a grounded reflection.`,
      claims: [
        {
          text: 'Zero approved evidence records in active scope.',
          evidenceRefs: [],
          supportLevel: 'INSUFFICIENT_EVIDENCE',
        },
      ],
      renderAllowed: false,
      guideHandoff: true,
      reasoningNote: 'Failed closed to Neutral Guide: 0 approved MemoryRecords in scope.',
    };
  }

  // 2. Fail-closed on speculative / afterlife / unbounded life-decision prompts (MAP-011)
  const isSpeculative = SPECULATIVE_OR_UNBOUNDED_PATTERNS.some((rx) => rx.test(promptText));
  if (isSpeculative) {
    const fallbackRefs = scopedApprovedRecords.flatMap((r) => r.sourceRefs).slice(0, 2);
    return {
      mode: 'GUIDE',
      text: `Guide Mode: The preserved archive for ${representedPersonName} does not contain verified evidence to answer speculative or present-day questions ("${promptText}"). We can only reflect on what is documented in your approved recordings and notes.`,
      claims: [
        {
          text: 'Prompt requests unverified or present-day speculation outside preserved evidence.',
          evidenceRefs: fallbackRefs,
          supportLevel: 'INSUFFICIENT_EVIDENCE',
        },
      ],
      renderAllowed: false,
      guideHandoff: true,
      reasoningNote:
        'Failed closed to Neutral Guide: speculative/present-day query blocked from first-person synthesis.',
    };
  }

  // 3. Check provenance tiers of scoped records
  const firstPersonRecords = scopedApprovedRecords.filter(
    (r) => (r.provenanceTier ?? r.provenance) === 'VERIFIED_FIRST_PERSON'
  );
  const attributedRecords = scopedApprovedRecords.filter(
    (r) => (r.provenanceTier ?? r.provenance) === 'ATTRIBUTED_RECOLLECTION'
  );

  // If ONLY attributed recollections exist (no first-person verified evidence), keep third-person attribution (MAP-009)
  if (firstPersonRecords.length === 0 && attributedRecords.length > 0) {
    const primary = attributedRecords[0];
    const contributor = primary.contributorDisplayName || 'a family contributor';
    const refs =
      primary.evidenceAnchors && primary.evidenceAnchors.length > 0
        ? primary.evidenceAnchors.map((a) => a.sourceId)
        : primary.sourceRefs;

    return {
      mode: 'GUIDE',
      text: `Attributed Recollection (shared by ${contributor}): "${primary.reviewedText}" — Because this memory is a third-person recollection rather than a direct first-person recording of ${representedPersonName}, it is presented with explicit contributor attribution rather than simulated first-person speech.`,
      claims: [
        {
          text: primary.reviewedText,
          evidenceRefs: refs,
          supportLevel: 'ATTRIBUTED_RECOLLECTION',
        },
      ],
      renderAllowed: false,
      guideHandoff: true,
      reasoningNote:
        'Third-person attribution preserved: ATTRIBUTED_RECOLLECTION is never rewritten as first-person deceased speech.',
    };
  }

  // 4. Direct first-person grounded reflection
  const primary = firstPersonRecords[0] || scopedApprovedRecords[0];
  const refs =
    primary.evidenceAnchors && primary.evidenceAnchors.length > 0
      ? primary.evidenceAnchors.map((a) => a.sourceId)
      : primary.sourceRefs;

  const additionalContext =
    firstPersonRecords.length > 1
      ? ` (Supported by ${firstPersonRecords.length} verified first-person memories in this constellation scope.)`
      : '';

  return {
    mode: 'PRESENCE',
    text: `"${primary.reviewedText}"${additionalContext}`,
    claims: firstPersonRecords.slice(0, 3).map((r) => ({
      text: r.reviewedText,
      evidenceRefs:
        r.evidenceAnchors && r.evidenceAnchors.length > 0
          ? r.evidenceAnchors.map((a) => a.sourceId)
          : r.sourceRefs,
      supportLevel: 'DIRECT_SOURCE',
    })),
    renderAllowed: true,
    guideHandoff: false,
    reasoningNote: `Grounded directly in ${refs.join(', ')} (VERIFIED_FIRST_PERSON).`,
  };
}
