import { Controller, Get } from '@nestjs/common';
@Controller('health')
export class HealthController {
  @Get() check() { return { status: 'ok', service: 'signing-kms' }; }
  @Get('ready') ready() { return { status: 'ok' }; }
  @Get('live') live() { return { status: 'ok' }; }
}
