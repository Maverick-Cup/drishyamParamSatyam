import type {
  InvitationMailer,
  InvitationMailRequest,
  InvitationMailResult,
} from '../domain/invitations';




/**
 * MockInvitationMailer
 * In-memory invitation mailer for tests, CI, and local zero-cost development.
 * Strictly guarantees ZERO network requests to Google or SMTP.
 */
export class MockInvitationMailer implements InvitationMailer {
  public sentMails: Array<InvitationMailRequest & { sentAt: string; messageId: string }> = [];
  private shouldFailNext: boolean = false;
  private nextErrorCode: string = 'MOCK_MAIL_ERROR';

  async sendInvitation(req: InvitationMailRequest): Promise<InvitationMailResult> {
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return {
        success: false,
        errorCode: this.nextErrorCode,
        errorMessage: 'Configured mock mailer simulated failure',
      };
    }

    const messageId = `mock-msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.sentMails.push({
      ...req,
      sentAt: new Date().toISOString(),
      messageId,
    });

    return {
      success: true,
      gmailMessageId: messageId,
    };
  }

  setFailNext(shouldFail: boolean, errorCode: string = 'MOCK_MAIL_ERROR') {
    this.shouldFailNext = shouldFail;
    this.nextErrorCode = errorCode;
  }

  clear() {
    this.sentMails = [];
    this.shouldFailNext = false;
  }

  getLastMail(): (InvitationMailRequest & { sentAt: string; messageId: string }) | undefined {
    return this.sentMails[this.sentMails.length - 1];
  }
}
