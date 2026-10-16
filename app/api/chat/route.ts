import { NextRequest, NextResponse } from 'next/server';
import { companionChatService, ChatTurn } from '@/services/CompanionChatService';

/**
 * /api/chat: Next.js API route for empathetic multi-turn conversation
 * Handles user messages, grounds in memory context, and escalates to multi-region support if needed.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = (body.message || '').trim();
    const history: ChatTurn[] = Array.isArray(body.history) ? body.history : [];
    const personName = body.personName || 'Thomas';
    const relation = body.relation || 'Grandfather';

    if (!message) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const reply = await companionChatService.generateCompanionReply(
      message,
      history,
      personName,
      relation
    );

    return NextResponse.json({
      success: true,
      reply: reply.text,
      sentimentTone: reply.sentimentTone,
      safetyState: reply.safetyState,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal chat failure',
        reply: "I'm right here with you. Take a slow, quiet breath.",
        safetyState: 'NORMAL',
      },
      { status: 500 }
    );
  }
}
