import { CanActivate, ExecutionContext } from '@nestjs/common';
import { TenantService } from '../services/tenant.service';
export declare class TenantGuard implements CanActivate {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    canActivate(context: ExecutionContext): boolean;
}
