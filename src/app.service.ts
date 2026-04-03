import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'isp.billing.be',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
