import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    health() {
      return {
        status: 'ok',
        apiRevision: '2026.2',
        service: 'fieldops-lite',
      };
    }
}
