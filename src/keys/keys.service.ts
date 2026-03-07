import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { generateKeyPairSync, randomUUID } from 'crypto';

export interface ManagedKey {
  keyId: string;
  purpose: string;
  publicKey: string;
  privateKey: string;
  algorithm: string;
  createdAt: Date;
  active: boolean;
  revoked: boolean;
  revokedAt?: Date;
  revokeReason?: string;
}

@Injectable()
export class KeysService implements OnModuleInit {
  private readonly logger = new Logger(KeysService.name);
  private readonly keys = new Map<string, ManagedKey>();

  onModuleInit(): void {
    // Generate dev keys on startup
    for (const purpose of ['content', 'manifest', 'operation']) {
      this.generateKey(purpose);
    }
    this.logger.log(`Initialized ${this.keys.size} dev keys`);
  }

  generateKey(purpose: string): ManagedKey {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const keyId = `${purpose}-${randomUUID().slice(0, 8)}`;
    const key: ManagedKey = {
      keyId,
      purpose,
      publicKey: publicKey as string,
      privateKey: privateKey as string,
      algorithm: 'Ed25519',
      createdAt: new Date(),
      active: true,
      revoked: false,
    };

    // Deactivate old keys for same purpose
    for (const existing of this.keys.values()) {
      if (existing.purpose === purpose) existing.active = false;
    }

    this.keys.set(keyId, key);
    this.logger.log(`Generated key: ${keyId} purpose=${purpose}`);
    return key;
  }

  getKey(keyId: string): ManagedKey | undefined {
    return this.keys.get(keyId);
  }

  getActiveKey(purpose: string): ManagedKey | undefined {
    for (const key of this.keys.values()) {
      if (key.purpose === purpose && key.active && !key.revoked) return key;
    }
    return undefined;
  }

  listKeys(purpose?: string): ManagedKey[] {
    const all = Array.from(this.keys.values());
    return purpose ? all.filter(k => k.purpose === purpose) : all;
  }

  rotateKey(purpose: string): { new_key_id: string; old_key_id?: string } {
    const old = this.getActiveKey(purpose);
    const newKey = this.generateKey(purpose);
    return { new_key_id: newKey.keyId, old_key_id: old?.keyId };
  }

  revokeKey(keyId: string, reason?: string): { revoked: boolean; key_id: string; reason?: string } {
    const key = this.keys.get(keyId);
    if (!key) return { revoked: false, key_id: keyId, reason: 'KEY_NOT_FOUND' };
    key.active = false;
    key.revoked = true;
    key.revokedAt = new Date();
    key.revokeReason = reason || 'manual_revoke';
    this.keys.set(keyId, key);
    return { revoked: true, key_id: keyId, reason: key.revokeReason };
  }
}
