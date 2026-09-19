import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase } from '../../db';

describe('database initialization', () => {
  beforeEach(async () => {
    await Promise.all([
      db.userProfile.clear(),
      db.vocabularyMastery.clear(),
      db.reviewStates.clear(),
      db.grammarMastery.clear(),
    ]);
  });

  it('is idempotent when two tabs initialize concurrently', async () => {
    await expect(Promise.all([initializeDatabase(), initializeDatabase()])).resolves.toBeDefined();
    expect(await db.userProfile.count()).toBe(1);
    expect(await db.vocabularyMastery.count()).toBe(120);
    expect(await db.reviewStates.count()).toBe(120);
    expect(await db.grammarMastery.count()).toBeGreaterThan(0);
  });
});
