import { Injectable, Logger } from '@nestjs/common';
import { KeysService } from '../keys/keys.service';

@Injectable()
export class RotationService {
  private readonly logger = new Logger(RotationService.name);
  constructor(private readonly keysService: KeysService) {}

  async rotateAll(): Promise<void> {
    for (const purpose of ['content', 'manifest', 'operation']) {
      const result = this.keysService.rotateKey(purpose);
      this.logger.log(`Rotated ${purpose}: old=${result.old_key_id} new=${result.new_key_id}`);
    }
  }
}
