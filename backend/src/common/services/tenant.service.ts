import { Injectable, Scope, Inject, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  gymId: string;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
  private readonly als = new AsyncLocalStorage<TenantContext>();

  constructor(@Optional() @Inject(REQUEST) private readonly request?: Record<string, any>) {}

  get gymId(): string {
    if (this.request?.gymId) return this.request.gymId;
    if (this.request?.user?.gymId) return this.request.user.gymId;
    const ctx = this.als.getStore();
    if (ctx) return ctx.gymId;
    throw new Error('Tenant context not available. TenantGuard must be active or gymId must be provided explicitly.');
  }

  get safeGymId(): string | undefined {
    try {
      return this.gymId;
    } catch {
      return undefined;
    }
  }

  async runInTenantContext<T>(gymId: string, fn: () => Promise<T>): Promise<T> {
    return this.als.run({ gymId }, fn);
  }
}
