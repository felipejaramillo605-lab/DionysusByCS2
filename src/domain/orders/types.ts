import type { OrganizationId, UserId, VenueId } from '../shared/tenant';

export type OrderId = string;
export type OrderStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'SENT_TO_KITCHEN'
  | 'IN_PREPARATION'
  | 'READY'
  | 'DELIVERED'
  | 'PARTIALLY_PAID'
  | 'INVOICED'
  | 'PAID'
  | 'CANCELLED'
  | 'VOIDED'
  | 'REFUNDED'
  | 'FAILED_INTEGRATION';

export type OrderChannel = 'table' | 'delivery' | 'takeaway' | 'qr' | 'web' | 'phone';

export interface OrderLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface OrderStatusEvent {
  from: OrderStatus;
  to: OrderStatus;
  occurredAt: string;
  actorUserId: UserId;
  reason?: string;
}

export interface Order {
  id: OrderId;
  organizationId: OrganizationId;
  venueId: VenueId;
  channel: OrderChannel;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusEvent[];
}
