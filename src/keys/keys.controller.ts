import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { KeysService } from './keys.service';

@Controller('keys')
export class KeysController {
  constructor(private readonly svc: KeysService) {}

  @Get()
  list(@Query('purpose') purpose?: string) {
    return this.svc.listKeys(purpose).map(k => ({
      key_id: k.keyId, purpose: k.purpose, algorithm: k.algorithm,
      active: k.active, revoked: k.revoked, created_at: k.createdAt,
      public_key: k.publicKey,
    }));
  }

  @Get(':keyId')
  get(@Param('keyId') keyId: string) {
    const k = this.svc.getKey(keyId);
    if (!k) return { error: 'Key not found' };
    return {
      key_id: k.keyId,
      purpose: k.purpose,
      public_key: k.publicKey,
      algorithm: k.algorithm,
      active: k.active,
      revoked: k.revoked,
      revoked_at: k.revokedAt,
      revoked_reason: k.revokeReason,
    };
  }

  @Post('rotate')
  rotate(@Body() body: { purpose: string }) {
    return this.svc.rotateKey(body.purpose);
  }

  @Post(':keyId/revoke')
  revoke(@Param('keyId') keyId: string, @Body() body?: { reason?: string }) {
    return this.svc.revokeKey(keyId, body?.reason);
  }
}
