import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUEST_STATUSES,
  canTransition,
  formatPeso,
  formatTicketNo,
  nextStaffStatus,
  requestStatusTone,
  timelineSteps,
} from '../src/requests';
import { startingFee } from '../src/fees';
import { GUIDES } from '../src/seed/guides';
import { guideSchema, mainAction } from '../src/guides';
import { DEMO_BARANGAY_DOCS } from '../src/seed/barangay';

test('staff move a request forward one step at a time', () => {
  assert.deepEqual(canTransition('SUBMITTED', 'UNDER_REVIEW', 'STAFF'), { ok: true });
  assert.equal(canTransition('SUBMITTED', 'READY_FOR_PICKUP', 'STAFF').ok, false);
  assert.equal(nextStaffStatus('APPROVED'), 'READY_FOR_PICKUP');
  assert.equal(nextStaffStatus('RELEASED'), null);
});

test('release requires an ID check', () => {
  assert.equal(canTransition('READY_FOR_PICKUP', 'RELEASED', 'STAFF').ok, false);
  assert.deepEqual(canTransition('READY_FOR_PICKUP', 'RELEASED', 'STAFF', { idChecked: true }), {
    ok: true,
  });
});

test('rejection requires a reason', () => {
  assert.equal(canTransition('UNDER_REVIEW', 'REJECTED', 'BRGY_ADMIN', { reason: '  ' }).ok, false);
  assert.equal(
    canTransition('UNDER_REVIEW', 'REJECTED', 'BRGY_ADMIN', { reason: 'Blurry ID' }).ok,
    true,
  );
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
    assert.ok(guideSchema.safeParse(g).success, `${g.slug} matches the guide schema`);
  }
  assert.equal(new Set(GUIDES.map((g) => g.slug)).size, 8, 'slugs are unique');
  assert.ok(DEMO_BARANGAY_DOCS.some((d) => d.code === 'FTJ' && d.fee === 0));
});

// Anti-fixer rule (plan §3.1 H.2): guides link only to official sites or channels the agency itself names.
const OFFICIAL_HOSTS = [/\.gov\.ph$/, /^psahelpline\.ph$/, /^pnpclearance\.ph$/];

test('every guide link goes to an official site', () => {
  for (const g of GUIDES) {
    for (const step of g.steps) {
      if (!step.action) continue;
      const host = new URL(step.action.url).hostname;
      assert.ok(
        OFFICIAL_HOSTS.some((re) => re.test(host)),
        `${g.slug}: ${host} is not an official host`,
      );
    }
  }
});

test('every guide has an online step people can do from home', () => {
  for (const g of GUIDES.filter((x) => x.slug !== 'barangay-clearance')) {
    assert.ok(mainAction(g), `${g.slug} has an official link on a step`);
  }
  assert.equal(
    mainAction(GUIDES.find((g) => g.slug === 'passport')!)?.url,
    'https://www.passport.gov.ph/appointment',
  );
});

test('starting fee adds add-ons and says "from" when options differ', () => {
  const fee = (slug: string) => startingFee(GUIDES.find((g) => g.slug === slug)!.fees);
  assert.deepEqual(fee('nbi-clearance'), { kind: 'exact', amount: 15500 });
  assert.deepEqual(fee('psa-birth-certificate'), { kind: 'from', amount: 15500 });
  assert.deepEqual(fee('passport'), { kind: 'from', amount: 100000 });
  assert.deepEqual(fee('police-clearance'), { kind: 'from', amount: 15000 });
  assert.deepEqual(fee('national-id'), { kind: 'free' });
  assert.deepEqual(fee('barangay-clearance'), { kind: 'varies' });
});

test('every request status has a status color', () => {
  assert.equal(requestStatusTone('UNDER_REVIEW'), 'inProgress');
  assert.equal(requestStatusTone('READY_FOR_PICKUP'), 'ready');
  assert.equal(requestStatusTone('RELEASED'), 'done');
  assert.equal(requestStatusTone('REJECTED'), 'problem');
  for (const s of REQUEST_STATUSES) assert.ok(requestStatusTone(s));
});

test('timeline marks done, current and upcoming steps', () => {
  const states = timelineSteps('APPROVED').map((s) => s.state);
  assert.deepEqual(states, ['done', 'done', 'current', 'upcoming', 'upcoming']);
  assert.ok(timelineSteps('RELEASED').every((s) => s.state === 'done'));
});

test('timeline ends with the stop for a rejected request', () => {
  const steps = timelineSteps('REJECTED', new Set(['SUBMITTED', 'UNDER_REVIEW', 'REJECTED']));
  assert.deepEqual(
    steps.map((s) => `${s.status}:${s.state}`),
    ['SUBMITTED:done', 'UNDER_REVIEW:done', 'REJECTED:stopped'],
  );
});
