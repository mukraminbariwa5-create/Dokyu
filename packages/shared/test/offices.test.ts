import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GOAL_PLANS,
  GOALS,
  GUIDES,
  HOLIDAYS,
  OFFICES,
  closingHoliday,
  directionsUrl,
  hoursText,
  manilaTime,
  nextOpening,
  officeStatus,
  planTotal,
  telUrl,
  understand,
  upcomingHolidays,
} from '../src/index';

const psa = OFFICES.find((o) => o.slug === 'psa-crs-east-avenue')!;
const dfa = OFFICES.find((o) => o.slug === 'dfa-aseana')!;
// Manila time = UTC+8
const at = (iso: string) => new Date(iso);

test('every office is complete and points at real guides', () => {
  const slugs = new Set(GUIDES.map((g) => g.slug));
  const seen = new Set<string>();
  for (const o of OFFICES) {
    assert.ok(!seen.has(o.slug), `duplicate ${o.slug}`);
    seen.add(o.slug);
    assert.ok(o.guides.length > 0 && o.guides.every((g) => slugs.has(g)), o.slug);
    assert.ok(o.source.startsWith('https://'), o.slug);
    assert.ok(Math.abs(o.lat) <= 90 && Math.abs(o.lng) <= 180);
    assert.ok(o.hours.length > 0);
  }
});

test('holidays are unique, sorted per year and cover 2026–2027', () => {
  const dates = HOLIDAYS.map((h) => h.date);
  assert.equal(new Set(dates).size, dates.length);
  assert.ok(dates.some((d) => d.startsWith('2026')) && dates.some((d) => d.startsWith('2027')));
  assert.equal(closingHoliday('2026-12-25', HOLIDAYS)?.name.en, 'Christmas Day');
  assert.equal(closingHoliday('2026-02-25', HOLIDAYS), undefined, 'special working day is open');
});

test('Manila time works from any time zone', () => {
  const t = manilaTime(at('2026-10-30T16:30:00Z')); // 00:30 next day in Manila
  assert.equal(t.iso, '2026-10-31');
  assert.equal(t.dow, 6);
  assert.equal(t.minutes, 30);
});

test('office status: open, closing soon, after hours, weekend, holiday, local holiday', () => {
  assert.deepEqual(officeStatus(psa, at('2026-10-30T02:00:00Z'), HOLIDAYS), {
    state: 'open',
    closesAt: '17:00',
    closingSoon: false,
  }); // Fri 10:00
  const soon = officeStatus(psa, at('2026-10-30T08:30:00Z'), HOLIDAYS); // Fri 16:30
  assert.equal(soon.state === 'open' && soon.closingSoon, true);
  assert.deepEqual(officeStatus(psa, at('2026-10-30T10:00:00Z'), HOLIDAYS), {
    state: 'closed',
    reason: 'hours',
  }); // Fri 18:00
  assert.equal(officeStatus(psa, at('2026-10-31T02:00:00Z'), HOLIDAYS).state, 'closed'); // Saturday
  const xmas = officeStatus(psa, at('2026-12-25T02:00:00Z'), HOLIDAYS);
  assert.equal(xmas.state === 'closed' && xmas.reason, 'holiday');
  const paranaque = officeStatus(dfa, at('2027-02-12T02:00:00Z'), HOLIDAYS); // Fri, open
  assert.equal(paranaque.state, 'open');
  const local = officeStatus(dfa, at('2026-02-13T02:00:00Z'), HOLIDAYS); // Fri 13 Feb 2026
  assert.equal(local.state === 'closed' && local.reason, 'local');
});

test('next opening skips the weekend and holidays', () => {
  // Fri 30 Oct 2026 18:00 → Sat, Sun closed, Mon 2 Nov All Souls' Day → Tue 3 Nov
  const next = nextOpening(psa, at('2026-10-30T10:00:00Z'), HOLIDAYS);
  assert.equal(next?.date.iso, '2026-11-03');
  assert.equal(next?.open, '07:00');
  const morning = nextOpening(psa, at('2026-10-29T22:00:00Z'), HOLIDAYS); // Fri 06:00
  assert.equal(morning?.daysAhead, 0);
});

test('hours text, phone and directions links', () => {
  assert.deepEqual(hoursText(psa, 'en'), ['Mon–Fri · 7:00 AM–5:00 PM']);
  assert.deepEqual(hoursText(psa, 'tl'), ['Lun–Biy · 7:00 AM–5:00 PM']);
  assert.equal(telUrl('(02) 8461-0500 loc. 201'), 'tel:0284610500');
  assert.ok(directionsUrl(psa).startsWith('https://www.google.com/maps/search/?api=1&query=PSA'));
  assert.ok(upcomingHolidays(HOLIDAYS, at('2026-10-30T02:00:00Z'))[0]!.date >= '2026-10-30');
});

test('every goal has a plan made of real guides, with a total', () => {
  for (const goal of GOALS) {
    const plan = GOAL_PLANS[goal.slug];
    assert.ok(plan.length > 0, goal.slug);
    const guides = plan.map((s) => GUIDES.find((g) => g.slug === s.guide)!);
    assert.ok(guides.every(Boolean), goal.slug);
    const total = planTotal(guides);
    assert.ok(total.amount >= 0);
  }
});

test('Ask Doki understands English, Tagalog and Taglish', () => {
  assert.deepEqual(understand('Magkano ang NBI clearance?'), {
    kind: 'guide',
    guides: ['nbi-clearance'],
    topic: 'fees',
  });
  assert.deepEqual(understand('ano ang dadalhin sa passport? kailangan ko'), {
    kind: 'guide',
    guides: ['passport'],
    topic: 'requirements',
  });
  const where = understand('Where do I get my birth certificate?');
  assert.equal(where.kind === 'guide' && where.topic, 'where');
  assert.deepEqual(understand('unang trabaho ko'), { kind: 'goal', goal: 'first-job' });
  assert.equal(understand('bukas ba ang opisina bukas, holiday ba?').kind, 'holiday');
  assert.equal(understand('hello Doki').kind, 'greeting');
  assert.equal(understand('salamat!').kind, 'thanks');
  assert.equal(understand('what is the meaning of life').kind, 'unknown');
  // "tin" must be a whole word
  assert.equal(understand('getting started').kind, 'unknown');
});
