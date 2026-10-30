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

/** Which status color a barangay request shows (plan §4.2: blue = in progress, yellow = ready, green = done, red = stopped). */
export function requestStatusTone(
  status: RequestStatus,
): 'inProgress' | 'ready' | 'done' | 'problem' {
  switch (status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'APPROVED':
      return 'inProgress';
    case 'READY_FOR_PICKUP':
      return 'ready';
    case 'RELEASED':
      return 'done';
    case 'REJECTED':
    case 'CANCELLED':
      return 'problem';
  }
}

/** The happy path a resident sees on the status timeline. */
export const REQUEST_TIMELINE: RequestStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'READY_FOR_PICKUP',
  'RELEASED',
];

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
  if (!Number.isInteger(seq) || seq < 1)
    throw new RangeError('Ticket sequence must be a positive integer');
  return `BRGY-${String(seq).padStart(4, '0')}`;
}

/** Fees are stored in centavos to avoid floating point errors. */
export function formatPeso(centavos: number): string {
  if (centavos === 0) return 'Free';
  const pesos = centavos / 100;
  return (
    '₱' +
    pesos.toLocaleString('en-PH', {
      minimumFractionDigits: pesos % 1 ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

export type TimelineStepState = 'done' | 'current' | 'upcoming' | 'stopped';

/**
 * Steps for the resident's status timeline. Finished steps are done, the current one is highlighted,
 * later ones are upcoming. A rejected or cancelled request shows the steps it reached, then the stop.
 */
export function timelineSteps(
  status: RequestStatus,
  reached: ReadonlySet<RequestStatus> = new Set(),
): Array<{ status: RequestStatus; state: TimelineStepState }> {
  if (status === 'REJECTED' || status === 'CANCELLED') {
    const last = Math.max(-1, ...REQUEST_TIMELINE.map((s, i) => (reached.has(s) ? i : -1)));
    return [
      ...REQUEST_TIMELINE.slice(0, last + 1).map((s) => ({ status: s, state: 'done' as const })),
      { status, state: 'stopped' },
    ];
  }
  const current = REQUEST_TIMELINE.indexOf(status);
  return REQUEST_TIMELINE.map((s, i) => ({
    status: s,
    state:
      i < current || (s === 'RELEASED' && i === current)
        ? 'done'
        : i === current
          ? 'current'
          : 'upcoming',
  }));
}
