import { Injectable, Logger } from '@nestjs/common';
import { KeysService } from '../keys/keys.service';
import { createSign, createVerify } from 'crypto';

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

    const signer = createSign('SHA256');
    signer.update(data);
    const signature = signer.sign(key.privateKey, 'base64');

    this.logger.debug(`Signed data with key=${key.keyId} purpose=${purpose}`);
    return { signature, key_id: key.keyId, algorithm: 'RSA-SHA256' };
  }

  async verify(data: Buffer, signature: string, keyId: string): Promise<boolean> {
    const key = this.keysService.getKey(keyId);
    if (!key) return false;

    const verifier = createVerify('SHA256');
    verifier.update(data);
    return verifier.verify(key.publicKey, signature, 'base64');
  }
}
