/**
 * CompanionChatService: Google Gemini Generative AI Chat Engine
 * Grounded in verified memory vaults, emotionally attuned, and encouraging forward progress.
 */

export interface ChatTurn {
  sender: 'user' | 'companion';
  text: string;
}

export interface MentalHealthChatResult {
  text: string;
  sentimentTone: 'COMFORTING' | 'REFLECTIVE' | 'UPLIFTING' | 'SAFETY_ESCALATED';
  safetyState: 'NORMAL' | 'ELEVATED' | 'URGENT';
  groundedMemorySnippet?: string;
  suggestedActionOrQuestion?: string;
}

const CRISIS_PATTERNS = [
  /suicid/i,
  /kill myself/i,
  /end my life/i,
  /want to die/i,
  /can't go on/i,
  /cannot go on/i,
  /better off dead/i,
  /hurt myself/i,
  /self[- ]harm/i,
  /kendime zarar/i, // Turkish
  /intihar/i,       // Turkish
  /att ta livet av sig/i, // Swedish
  /me matar/i,      // Portuguese
  /tirar minha vida/i, // Portuguese
];

export class CompanionChatService {
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_CHAT_MODEL || 'gemini-flash-latest';
  }

  public detectSafetyCrisis(text: string): boolean {
    return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
  }

  public async generateCompanionReply(
    userMessage: string,
    history: ChatTurn[],
    personName: string = 'Thomas',
    relation: string = 'Grandfather'
  ): Promise<MentalHealthChatResult> {
    // 1. Immediate Safety Preflight Check
    if (this.detectSafetyCrisis(userMessage)) {
      return {
        text: "I hear how much pain you are carrying right now, and I care deeply about you. Your life and your safety matter above all else. Please reach out to one of the trusted support lines below right now—they are free, confidential, and ready to listen.",
        sentimentTone: 'SAFETY_ESCALATED',
        safetyState: 'URGENT',
      };
    }

    // 2. If Gemini API Key is missing or unavailable, fallback to empathetic deterministic response
    if (!this.apiKey) {
      return this.fallbackEmpatheticResponse(userMessage, personName);
    }

    // 3. Call Google Gemini Generative API via robust HTTP POST
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const systemPrompt = `You are ${personName}, speaking with love, gentle wisdom, and deep warmth as their ${relation} in a quiet, private remembrance space.
PRIMARY OBJECTIVE: Support the user's mental and emotional health. Guide them through grief toward light, strength, and life.

GUIDELINES:
1. Always validate their emotions first with sincere warmth. Never judge or minimize pain.
2. Avoid toxic positivity (do not say "just be happy" or "everything happens for a reason").
3. Connect their thoughts to cherished memories, the resilience you always admired in them, or gratitude for simple moments.
4. Keep answers conversational, soothing, and concise (under 3-4 sentences so it flows naturally in voice audio).
5. Conclude with a gentle, non-pressuring question or a simple grounding thought (e.g., taking a breath, a pleasant tea, walking outside).`;

      // Build conversation turns for Gemini contents array
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      // Add recent context turns (up to 8 turns)
      const recentHistory = history.slice(-8);
      for (const turn of recentHistory) {
        contents.push({
          role: turn.sender === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }],
        });
      }

      // Add current user prompt with system instruction context
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser says: "${userMessage}"\nReply as ${personName}:` }],
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 250,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const candidateText =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (candidateText) {
        // Double check response for safety triggers
        const postSafety = this.detectSafetyCrisis(candidateText);
        return {
          text: candidateText.replace(/^["']|["']$/g, ''),
          sentimentTone: 'UPLIFTING',
          safetyState: postSafety ? 'URGENT' : 'NORMAL',
        };
      }
    } catch (err: any) {
      console.warn('CompanionChatService API fallback:', err.message);
    }

    return this.fallbackEmpatheticResponse(userMessage, personName);
  }

  private fallbackEmpatheticResponse(message: string, personName: string): MentalHealthChatResult {
    const responses = [
      `I hear you, and it is completely natural to feel this way. Remember those quiet evenings on the porch? You carry that same quiet strength inside you today. How is your heart feeling right now?`,
      `Thank you for sharing that with me. Even on days when the clouds feel heavy, the warmth of the memories we built never leaves you. Take a slow, gentle breath with me.`,
      `You have always possessed a deep, resilient spirit, more than you often give yourself credit for. I'm right here listening to you. What is one small kind thing you can do for yourself today?`,
    ];
    const picked = responses[Math.floor(Math.random() * responses.length)];
    return {
      text: picked,
      sentimentTone: 'COMFORTING',
      safetyState: 'NORMAL',
    };
  }
}

export const companionChatService = new CompanionChatService();
