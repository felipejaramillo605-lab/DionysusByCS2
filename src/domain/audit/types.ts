import type { OrganizationId, UserId, VenueId } from '../shared/tenant';

export type AuditResult = 'SUCCESS' | 'DENIED' | 'WARNING' | 'ERROR';
export type AuditRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuditEntry {
  id: string;
  organizationId: OrganizationId;
  venueId?: VenueId;
  actorUserId?: UserId;
  action: string;
  resourceType: string;
  resourceId?: string;
  result: AuditResult;
  riskLevel: AuditRiskLevel;
  occurredAt: string;
  correlationId: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}
