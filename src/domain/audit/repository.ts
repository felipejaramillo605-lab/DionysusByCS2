import type { TenantScope } from '../shared/tenant';
import type { AuditEntry } from './types';

export interface AuditFilter extends TenantScope {
  action?: string;
  resourceType?: string;
  from?: string;
  to?: string;
}

export interface AuditRepository {
  append(entry: AuditEntry): Promise<void>;
  list(filter: AuditFilter): Promise<AuditEntry[]>;
}
