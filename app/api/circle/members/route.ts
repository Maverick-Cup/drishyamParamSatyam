import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/services/InvitationService';

/**
 * GET /api/circle/members?profileId=xyz
 * Returns the active members of the connected family circle
 */

export async function GET(req: NextRequest) {
  try {
    const profileId = req.nextUrl.searchParams.get('profileId') || 'profile-satya-default';
    const members = await invitationService.listMemberships(profileId);

    return NextResponse.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list members' },
      { status: 500 }
    );
  }
}
