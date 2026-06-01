import { Injectable, Logger } from '@nestjs/common';
import type { EmailMessage, EmailPort } from '../domain/ports/email.port';

/**
 * Mock email adapter — logs instead of sending. Per night-shift Constraint 1
 * (no real external sends until a provider key is provisioned, see PH-005).
 */
@Injectable()
export class MockEmailAdapter implements EmailPort {
  private readonly logger = new Logger(MockEmailAdapter.name);

  async send(message: EmailMessage): Promise<void> {
    this.logger.log(
      `[EMAIL MOCK] to=${message.to} subject="${message.subject}" (${message.text.length} chars body)`,
    );
  }
}
