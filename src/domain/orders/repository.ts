import type { ActorContext, TenantScope } from '../shared/tenant';
import type { Order, OrderId, OrderStatus } from './types';

export interface OrderFilter extends TenantScope {
  status?: OrderStatus;
  search?: string;
}

export interface TransitionOrderCommand {
  orderId: OrderId;
  to: OrderStatus;
  reason?: string;
  actor: ActorContext;
}

export interface OrderRepository {
  list(filter: OrderFilter): Promise<Order[]>;
  getById(scope: TenantScope, orderId: OrderId): Promise<Order | null>;
  transition(command: TransitionOrderCommand): Promise<Order>;
}
