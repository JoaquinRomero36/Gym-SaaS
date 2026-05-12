import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  gymId: string;
}

@Injectable()
export class TenantService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  setTenantContext(gymId: string): void {
    this.storage.enterWith({ gymId });
  }

  get gymId(): string {
    const ctx = this.storage.getStore();
    if (!ctx) {
      throw new Error('Tenant context not available. TenantGuard must be active or gymId must be provided explicitly.');
    }
    return ctx.gymId;
  }

  get safeGymId(): string | undefined {
    return this.storage.getStore()?.gymId;
  }

  async runInTenantContext<T>(gymId: string, fn: () => Promise<T>): Promise<T> {
    return this.storage.run({ gymId }, fn);
  }
}