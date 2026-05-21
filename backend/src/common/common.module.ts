import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TenantService } from './services/tenant.service';
import { AiClientService } from './services/ai-client.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [TenantService, AiClientService],
  exports: [TenantService, AiClientService],
})
export class CommonModule {}
