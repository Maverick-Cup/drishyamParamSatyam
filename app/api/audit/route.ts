import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/adapters';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const profileId = searchParams.get('profileId') || 'profile-satya-default';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const repos = getRepositories();

  if (repos.auditRepo.listEventsByProfile) {
    const events = await repos.auditRepo.listEventsByProfile(profileId, limit);
    return NextResponse.json({
      success: true,
      mode: repos.isCloudMode ? 'FIRESTORE_CLOUD' : 'IN_MEMORY_FALLBACK',
      profileId,
      events,
    });
  }

  return NextResponse.json({
    success: true,
    mode: repos.isCloudMode ? 'FIRESTORE_CLOUD' : 'IN_MEMORY_FALLBACK',
    profileId,
    events: [],
  });
}
