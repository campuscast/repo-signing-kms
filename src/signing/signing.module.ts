import { Module } from '@nestjs/common';
import { SigningService } from './signing.service';
import { SigningController } from './signing.controller';
import { KeysModule } from '../keys/keys.module';
@Module({
  imports: [KeysModule],
  providers: [SigningService],
  controllers: [SigningController],
  exports: [SigningService],
})
export class SigningModule {}
