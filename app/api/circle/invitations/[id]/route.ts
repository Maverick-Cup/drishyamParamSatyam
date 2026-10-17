import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/services/InvitationService';

/**
 * DELETE /api/circle/invitations/[id]
 * Revokes a pending invitation without deleting audit trail
 */

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invitationId } = await context.params;
    const searchParams = req.nextUrl.searchParams;
    const profileId = searchParams.get('profileId') || 'profile-satya-default';
    const inviterUid = searchParams.get('inviterUid') || 'user-owner-default';

    const result = await invitationService.revokeInvitation({
      invitationId,
      profileId,
      inviterUid,
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
      { success: false, error: err.message || 'Failed to revoke invitation' },
      { status: 500 }
    );
  }
}
