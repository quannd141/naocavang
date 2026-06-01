/**
 * Email port (Hexagonal Architecture). Adapters:
 *   - MockEmailAdapter — logs to console (night-shift / no provider key).
 *   - ResendEmailAdapter — real send (Sprint with PH-005 credentials).
 */

export const EMAIL_PORT = Symbol('EMAIL_PORT');

export interface EmailMessage {
  to: string;
  subject: string;
  /** Plain-text / lightweight-markdown body. */
  text: string;
}

export interface EmailPort {
  send(message: EmailMessage): Promise<void>;
}
