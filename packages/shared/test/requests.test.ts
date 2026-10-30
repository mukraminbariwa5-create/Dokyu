import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, formatPeso, formatTicketNo, nextStaffStatus } from '../src/requests.js';
import { GUIDES } from '../src/seed/guides.js';
import { DEMO_BARANGAY_DOCS } from '../src/seed/barangay.js';

test('staff move a request forward one step at a time', () => {
  assert.deepEqual(canTransition('SUBMITTED', 'UNDER_REVIEW', 'STAFF'), { ok: true });
  assert.equal(canTransition('SUBMITTED', 'READY_FOR_PICKUP', 'STAFF').ok, false);
  assert.equal(nextStaffStatus('APPROVED'), 'READY_FOR_PICKUP');
  assert.equal(nextStaffStatus('RELEASED'), null);
});

test('release requires an ID check', () => {
  assert.equal(canTransition('READY_FOR_PICKUP', 'RELEASED', 'STAFF').ok, false);
  assert.deepEqual(canTransition('READY_FOR_PICKUP', 'RELEASED', 'STAFF', { idChecked: true }), { ok: true });
});

test('rejection requires a reason', () => {
  assert.equal(canTransition('UNDER_REVIEW', 'REJECTED', 'BRGY_ADMIN', { reason: '  ' }).ok, false);
  assert.equal(canTransition('UNDER_REVIEW', 'REJECTED', 'BRGY_ADMIN', { reason: 'Blurry ID' }).ok, true);
});

test('residents can only cancel a submitted request', () => {
  assert.equal(canTransition('SUBMITTED', 'CANCELLED', 'RESIDENT').ok, true);
  assert.equal(canTransition('UNDER_REVIEW', 'CANCELLED', 'RESIDENT').ok, false);
  assert.equal(canTransition('SUBMITTED', 'UNDER_REVIEW', 'RESIDENT').ok, false);
});

test('super admins cannot process barangay requests', () => {
  assert.equal(canTransition('SUBMITTED', 'UNDER_REVIEW', 'SUPER_ADMIN').ok, false);
});

test('ticket numbers and pesos format for display', () => {
  assert.equal(formatTicketNo(241), 'BRGY-0241');
  assert.throws(() => formatTicketNo(0));
  assert.equal(formatPeso(15500), '₱155');
  assert.equal(formatPeso(120000), '₱1,200');
  assert.equal(formatPeso(0), 'Free');
});

test('seed data is complete', () => {
  assert.equal(GUIDES.length, 8);
  for (const g of GUIDES) {
    assert.ok(g.steps.length >= 3, `${g.slug} has steps`);
    assert.ok(g.requirements.length >= 1, `${g.slug} has requirements`);
    assert.ok(g.lastVerified, `${g.slug} has a verification date`);
    if (g.officialUrl) assert.match(g.officialUrl, /^https:\/\//);
  }
  assert.equal(new Set(GUIDES.map((g) => g.slug)).size, 8, 'slugs are unique');
  assert.ok(DEMO_BARANGAY_DOCS.some((d) => d.code === 'FTJ' && d.fee === 0));
});
