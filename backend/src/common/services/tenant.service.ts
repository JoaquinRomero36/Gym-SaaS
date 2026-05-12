import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

interface TenantRequest extends Request {
  gymId?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
  constructor(@Inject(REQUEST) private readonly request: TenantRequest) {}

  get gymId(): string {
    return this.request.gymId!;
  }

  throwIfNoTenant(): void {
    if (!this.gymId) {
      throw new Error('No gymId found in request. TenantGuard must be active.');
    }
  }
}