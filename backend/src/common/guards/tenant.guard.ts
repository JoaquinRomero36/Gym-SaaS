import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TenantService } from '../services/tenant.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantService: TenantService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user?.gymId) {
      this.tenantService.setTenantContext(user.gymId);
    }
    return true;
  }
}
