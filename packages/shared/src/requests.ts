/**
 * Barangay request lifecycle (plan §5). Pure functions so the API, the app and tests share one rulebook.
 */
export const REQUEST_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'READY_FOR_PICKUP',
  'RELEASED',
  'REJECTED',
  'CANCELLED',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export type Actor = 'RESIDENT' | 'STAFF' | 'BRGY_ADMIN' | 'SUPER_ADMIN';

const STAFF_MOVES: Record<RequestStatus, RequestStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['RELEASED'],
  RELEASED: [],
  REJECTED: [],
  CANCELLED: [],
};

export interface TransitionContext {
  /** Release needs a staff member to confirm they checked the claimant's valid ID (plan v1.3). */
  idChecked?: boolean;
  /** Rejection needs a reason the resident can read. */
  reason?: string;
}

export type TransitionResult = { ok: true } | { ok: false; error: string };

export function canTransition(
  from: RequestStatus,
  to: RequestStatus,
  actor: Actor,
  ctx: TransitionContext = {},
): TransitionResult {
  if (actor === 'RESIDENT') {
    // Residents may only cancel their own request before staff start reviewing it.
    if (to === 'CANCELLED' && from === 'SUBMITTED') return { ok: true };
    return { ok: false, error: 'Residents can only cancel a request that is still submitted.' };
  }
  if (actor === 'SUPER_ADMIN') {
    return { ok: false, error: 'Super admins do not process barangay requests.' };
  }
  if (!STAFF_MOVES[from].includes(to)) {
    return { ok: false, error: `Cannot move a request from ${from} to ${to}.` };
  }
  if (to === 'RELEASED' && !ctx.idChecked) {
    return { ok: false, error: 'Confirm that you checked a valid ID before releasing.' };
  }
  if (to === 'REJECTED' && !ctx.reason?.trim()) {
    return { ok: false, error: 'Give the resident a reason for the rejection.' };
  }
  return { ok: true };
}

export function nextStaffStatus(from: RequestStatus): RequestStatus | null {
  const forward = STAFF_MOVES[from].filter((s) => s !== 'REJECTED');
  return forward[0] ?? null;
}

/** Ticket number shown to residents, e.g. BRGY-0241. */
export function formatTicketNo(seq: number): string {
  if (!Number.isInteger(seq) || seq < 1) throw new RangeError('Ticket sequence must be a positive integer');
  return `BRGY-${String(seq).padStart(4, '0')}`;
}

/** Fees are stored in centavos to avoid floating point errors. */
export function formatPeso(centavos: number): string {
  if (centavos === 0) return 'Free';
  const pesos = centavos / 100;
  return '₱' + pesos.toLocaleString('en-PH', { minimumFractionDigits: pesos % 1 ? 2 : 0, maximumFractionDigits: 2 });
}
