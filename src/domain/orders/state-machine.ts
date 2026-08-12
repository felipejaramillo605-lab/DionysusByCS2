import type { OrderStatus } from './types';

const VALID_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SENT_TO_KITCHEN', 'CANCELLED'],
  SENT_TO_KITCHEN: ['IN_PREPARATION', 'CANCELLED'],
  IN_PREPARATION: ['READY', 'VOIDED'],
  READY: ['DELIVERED', 'VOIDED'],
  DELIVERED: ['INVOICED', 'PARTIALLY_PAID'],
  PARTIALLY_PAID: ['PAID', 'REFUNDED'],
  INVOICED: ['PAID', 'REFUNDED', 'VOIDED'],
  PAID: ['REFUNDED'],
  CANCELLED: [],
  VOIDED: [],
  REFUNDED: [],
  FAILED_INTEGRATION: ['INVOICED'],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return VALID_TRANSITIONS[status].length === 0;
}
