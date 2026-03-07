import { Injectable, Logger } from '@nestjs/common';
import { KeysService } from '../keys/keys.service';
import { sign as edSign, verify as edVerify } from 'crypto';

@Injectable()
export class SigningService {
  private readonly logger = new Logger(SigningService.name);

  constructor(private readonly keysService: KeysService) {}

  async sign(data: Buffer, keyId?: string, purpose = 'general'): Promise<{ signature: string; key_id: string; algorithm: string }> {
    const key = keyId
      ? this.keysService.getKey(keyId)
      : this.keysService.getActiveKey(purpose);

    if (!key) {
      throw new Error(`No key found for purpose=${purpose} keyId=${keyId}`);
    }
    if (key.revoked) {
      throw new Error(`Key ${key.keyId} is revoked`);
    }

    const signature = edSign(null, data, key.privateKey).toString('base64');

    this.logger.debug(`Signed data with key=${key.keyId} purpose=${purpose}`);
    return { signature, key_id: key.keyId, algorithm: 'Ed25519' };
  }

  async verify(data: Buffer, signature: string, keyId: string): Promise<boolean> {
    const key = this.keysService.getKey(keyId);
    if (!key || key.revoked) return false;
    return edVerify(null, data, key.publicKey, Buffer.from(signature, 'base64'));
  }
}
