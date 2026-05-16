import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Password hashing service.
 *
 * Bcrypt cost 12 — balance security vs latency (SRS NFR §4.2).
 * Bcrypt has a hard input limit of 72 bytes; DTO validates length.
 */
@Injectable()
export class PasswordHasher {
  private readonly cost = 12;

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.cost);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
