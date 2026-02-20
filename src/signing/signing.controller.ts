import { Controller, Post, Body } from '@nestjs/common';
import { SigningService } from './signing.service';

@Controller('signing')
export class SigningController {
  constructor(private readonly svc: SigningService) {}

  @Post('sign')
  async sign(@Body() body: { data_base64: string; key_id?: string; purpose?: string }) {
    const data = Buffer.from(body.data_base64, 'base64');
    return this.svc.sign(data, body.key_id, body.purpose);
  }

  @Post('verify')
  async verify(@Body() body: { data_base64: string; signature: string; key_id: string }) {
    const data = Buffer.from(body.data_base64, 'base64');
    const valid = await this.svc.verify(data, body.signature, body.key_id);
    return { valid };
  }
}
