export type OrganizationId = string;
export type VenueId = string;
export type UserId = string;

export interface TenantScope {
  organizationId: OrganizationId;
  venueId?: VenueId;
}

export interface ActorContext extends TenantScope {
  userId: UserId;
  correlationId: string;
}
