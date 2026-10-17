import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/services/InvitationService';

/**
 * POST /api/circle/invitations/accept
 * Accepts an invitation with cryptographic token match and authenticated email verification.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      rawToken,
      authenticatedUid,
      authenticatedEmail,
      authenticatedDisplayName,
    } = body;

    if (!rawToken) {
      return NextResponse.json(
        { success: false, errorCode: 'MISSING_TOKEN', error: 'Invitation token parameter missing' },
        { status: 400 }
      );
    }

    if (!authenticatedUid || !authenticatedEmail) {
      return NextResponse.json(
        { success: false, errorCode: 'UNAUTHENTICATED', error: 'User must be signed in to accept an invitation' },
        { status: 401 }
      );
    }

    const result = await invitationService.acceptInvitation({
      rawToken,
      authenticatedUid,
      authenticatedEmail,
      authenticatedDisplayName,
    });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        INVALID_TOKEN: 404,
        INVITATION_REVOKED: 410,
        INVITATION_ALREADY_ACCEPTED: 409,
        INVITATION_EXPIRED: 410,
        EMAIL_MISMATCH: 403,
      };

      const status = statusMap[result.errorCode || ''] || 400;

      return NextResponse.json(
        { success: false, errorCode: result.errorCode, error: result.errorMessage },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      membership: result.membership,
      invitation: result.invitation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
