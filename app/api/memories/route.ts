import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/adapters';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const profileId = searchParams.get('profileId') || 'profile-satya-default';
  const id = searchParams.get('id');

  const repos = getRepositories();

  if (id) {
    const memory = await repos.memoryRepo.findById(id, profileId);
    return NextResponse.json({ success: true, memory });
  }

  // Sample vector search or list
  const dummyEmbedding = new Array(768).fill(0.01);
  const memories = await repos.memoryRepo.searchVector768(dummyEmbedding, profileId, 10);

  return NextResponse.json({
    success: true,
    count: memories.length,
    mode: repos.isCloudMode ? 'FIRESTORE_CLOUD' : 'IN_MEMORY_FALLBACK',
    memories,
  });
}
