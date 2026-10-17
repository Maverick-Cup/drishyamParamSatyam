import { NextRequest, NextResponse } from 'next/server';
import { invitationService } from '@/services/InvitationService';
import { CircleRole } from '@/domain/invitations';

/**
 * GET /api/circle/invitations?profileId=xyz
 * List pending invitations for a profile
 *
 * POST /api/circle/invitations
 * Create and send a new invitation with idempotency check
 */

export async function GET(req: NextRequest) {
  try {
    const profileId = req.nextUrl.searchParams.get('profileId') || 'profile-satya-default';
    const invitations = await invitationService.listInvitations(profileId);

    return NextResponse.json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list invitations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profileId = 'profile-satya-default',
      inviterUid = 'user-owner-default',
      inviterName = 'Family Member',
      representedPersonName = 'Satya',
      email,
      role = 'CONTRIBUTOR',
      requestId,
    } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, errorCode: 'INVALID_EMAIL', error: 'Email is required' },
        { status: 400 }
      );
    }

    if (role !== 'CONTRIBUTOR' && role !== 'VIEWER') {
      return NextResponse.json(
        { success: false, errorCode: 'INVALID_ROLE', error: 'Role must be CONTRIBUTOR or VIEWER' },
        { status: 400 }
      );
    }

    // Determine base URL dynamically or fallback
    const origin = req.nextUrl.origin || process.env.APP_BASE_URL || 'http://localhost:3000';

    const result = await invitationService.sendInvitation({
      profileId,
      inviterUid,
      inviterName,
      representedPersonName,
      email,
      role: role as CircleRole,
      requestId: requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      baseUrl: origin,
    });

    if (!result.success) {
      const statusCode = result.errorCode === 'ALREADY_PENDING' || result.errorCode === 'ALREADY_MEMBER' ? 409 : 400;
      return NextResponse.json(
        { success: false, errorCode: result.errorCode, error: result.errorMessage },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process invitation' },
      { status: 500 }
    );
  }
}
