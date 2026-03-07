import { Module } from '@nestjs/common';
import { MetricsModule } from '@campuscast/shared-libs';
import { ConfigModule } from '@nestjs/config';
import { SigningModule } from './signing/signing.module';
import { KeysModule } from './keys/keys.module';
import { HealthController } from './common/health.controller';
import { appConfig, validate } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate,
    }),
    SigningModule,
    KeysModule,
      MetricsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
