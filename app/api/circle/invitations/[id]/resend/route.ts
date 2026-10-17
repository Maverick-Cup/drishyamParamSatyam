import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/services/InvitationService';

/**
 * POST /api/circle/invitations/[id]/resend
 * Resends an invitation with fresh token hash, updated expiration, and new email dispatch
 */

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invitationId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const {
      profileId = 'profile-satya-default',
      inviterUid = 'user-owner-default',
      inviterName = 'Family Member',
      representedPersonName = 'Satya',
    } = body;

    const origin = req.nextUrl.origin || process.env.APP_BASE_URL || 'http://localhost:3000';

    const result = await invitationService.resendInvitation({
      invitationId,
      profileId,
      inviterUid,
      inviterName,
      representedPersonName,
      baseUrl: origin,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, errorCode: result.errorCode, error: result.errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to resend invitation' },
      { status: 500 }
    );
  }
}
