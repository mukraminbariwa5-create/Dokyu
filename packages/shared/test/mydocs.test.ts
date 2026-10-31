import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanMyDocs, mergeMyDocs, sameMyDocs, type MyDoc, type MyDocsData } from '../src/index';

const NOW = Date.parse('2026-11-01T00:00:00Z');
const doc = (id: string, updatedAt: string, extra: Partial<MyDoc> = {}): MyDoc => ({
  id,
  personId: 'me',
  guide: 'nbi-clearance',
  status: 'need',
  updatedAt,
  ...extra,
});
const data = (x: Partial<MyDocsData>): MyDocsData => ({ people: [], docs: [], deleted: [], ...x });

test('merge: documents from both copies are kept', () => {
  const m = mergeMyDocs(
    data({ docs: [doc('a', '2026-10-01T00:00:00Z')] }),
    data({ docs: [doc('b', '2026-10-02T00:00:00Z')] }),
    NOW,
  );
  assert.deepEqual(m.docs.map((d) => d.id).sort(), ['a', 'b']);
});

test('merge: the newer edit of the same document wins, either way round', () => {
  const old = doc('a', '2026-10-01T00:00:00Z', { status: 'need' });
  const fresh = doc('a', '2026-10-05T00:00:00Z', { status: 'applied' });
  assert.equal(
    mergeMyDocs(data({ docs: [old] }), data({ docs: [fresh] }), NOW).docs[0]!.status,
    'applied',
  );
  assert.equal(
    mergeMyDocs(data({ docs: [fresh] }), data({ docs: [old] }), NOW).docs[0]!.status,
    'applied',
  );
});

test('merge: a deletion beats an older copy but not a newer edit', () => {
  const deleted = [{ kind: 'doc' as const, id: 'a', at: '2026-10-03T00:00:00Z' }];
  const older = mergeMyDocs(
    data({ deleted }),
    data({ docs: [doc('a', '2026-10-01T00:00:00Z')] }),
    NOW,
  );
  assert.equal(older.docs.length, 0);
  assert.equal(older.deleted.length, 1, 'the deletion note travels on');
  const newer = mergeMyDocs(
    data({ deleted }),
    data({ docs: [doc('a', '2026-10-04T00:00:00Z')] }),
    NOW,
  );
  assert.equal(newer.docs.length, 1);
});

test('merge: documents of a removed family member move to "me"', () => {
  const m = mergeMyDocs(
    data({ deleted: [{ kind: 'person', id: 'kid', at: '2026-10-03T00:00:00Z' }] }),
    data({
      people: [{ id: 'kid', name: 'Ana', relation: 'child', updatedAt: '2026-10-01T00:00:00Z' }],
      docs: [doc('a', '2026-10-01T00:00:00Z', { personId: 'kid' })],
    }),
    NOW,
  );
  assert.equal(m.people.length, 0);
  assert.equal(m.docs[0]!.personId, 'me');
});

test('merge: old deletion notes are dropped after 180 days', () => {
  const m = mergeMyDocs(
    data({ deleted: [{ kind: 'doc', id: 'x', at: '2026-01-01T00:00:00Z' }] }),
    data({}),
    NOW,
  );
  assert.equal(m.deleted.length, 0);
});

test('merge: the local copy keeps its phone-only fields when it wins', () => {
  const local = { ...doc('a', '2026-10-05T00:00:00Z'), reminderIds: ['r1'] };
  const m = mergeMyDocs(
    { people: [], docs: [local] },
    data({ docs: [doc('a', '2026-10-01T00:00:00Z')] }),
    NOW,
  );
  assert.deepEqual(m.docs[0]!.reminderIds, ['r1']);
});

test('clean: drops phone-only fields and skips items that do not fit', () => {
  const c = cleanMyDocs({
    people: [{ id: 'p', name: '', relation: 'child' }],
    docs: [{ ...doc('a', '2026-10-01T00:00:00Z'), reminderIds: ['r1'] }, { id: 'bad' }],
  });
  assert.equal(c.people.length, 0, 'a nameless person is skipped');
  assert.equal(c.docs.length, 1);
  assert.equal('reminderIds' in c.docs[0]!, false);
});

test('same: ignores order', () => {
  const a = data({ docs: [doc('a', '2026-10-01T00:00:00Z'), doc('b', '2026-10-02T00:00:00Z')] });
  const b = data({ docs: [...a.docs].reverse() });
  assert.ok(sameMyDocs(a, b));
  assert.ok(!sameMyDocs(a, data({ docs: [a.docs[0]!] })));
});
