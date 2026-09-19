import { describe, it, expect } from 'vitest';
import { selectSessionItems, calculateItemUrgency, interleaveSession } from '../adaptive';
import type { VocabularyWithProgress, TrainingSessionConfig } from '../../../types';

describe('Adaptive Item Selection Engine', () => {
  const now = new Date('2026-09-18T12:00:00Z');

  const createMockItem = (
    id: string,
    opts: {
      status?: 'unseen' | 'seen' | 'recalled' | 'reliable';
      score?: number;
      priorityScore?: number;
      isOverdue?: boolean;
      lapses?: number;
    } = {}
  ): VocabularyWithProgress => {
    const isOverdue = opts.isOverdue ?? false;
    const nextReviewDate = isOverdue
      ? new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      : new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 1 day in future

    return {
      item: {
        id,
        word: `word_${id}`,
        lemma: `word_${id}`,
        pos: 'verb',
        cefrLevel: 'B1',
        priorityScore: opts.priorityScore ?? 70,
        meaning: `Meaning of ${id}`,
        examples: [`Example sentence for word_${id}.`],
        collocations: [`word_${id} a goal`],
        synonyms: [],
        antonyms: [],
        tags: ['general'],
      },
      mastery: {
        id,
        status: opts.status ?? 'seen',
        score: opts.score ?? 50,
        firstSeenAt: now.toISOString(),
      },
      review: {
        id,
        nextReviewDate,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        lapses: opts.lapses ?? 0,
        consecutiveCorrect: 1,
      },
    };
  };

  it('calculates higher urgency for overdue and lapsed items', () => {
    const normal = createMockItem('1', { isOverdue: false, lapses: 0 });
    const overdue = createMockItem('2', { isOverdue: true, lapses: 0 });
    const lapsed = createMockItem('3', { isOverdue: true, lapses: 2 });

    const scoreNormal = calculateItemUrgency(normal, now);
    const scoreOverdue = calculateItemUrgency(overdue, now);
    const scoreLapsed = calculateItemUrgency(lapsed, now);

    expect(scoreOverdue).toBeGreaterThan(scoreNormal);
    expect(scoreLapsed).toBeGreaterThan(scoreOverdue);
  });

  it('selects correct number of items for Quick (10) session', () => {
    const pool: VocabularyWithProgress[] = [];
    for (let i = 1; i <= 30; i++) {
      pool.push(
        createMockItem(`${i}`, {
          status: i <= 5 ? 'unseen' : 'seen',
          isOverdue: i > 5 && i <= 15,
          lapses: i > 15 && i <= 20 ? 1 : 0,
        })
      );
    }

    const config: TrainingSessionConfig = {
      itemCount: 10,
      mode: 'smart_mix',
    };

    const selected = selectSessionItems(pool, config, now);
    expect(selected.length).toBe(10);
    // Make sure no duplicate items exist
    const ids = new Set(selected.map((s) => s.item.id));
    expect(ids.size).toBe(10);
  });

  it('interleaving alternates review items with new items', () => {
    const items: VocabularyWithProgress[] = [
      createMockItem('new_1', { status: 'unseen' }),
      createMockItem('new_2', { status: 'unseen' }),
      createMockItem('rev_1', { status: 'seen' }),
      createMockItem('rev_2', { status: 'seen' }),
      createMockItem('rev_3', { status: 'seen' }),
    ];

    const interleaved = interleaveSession(items);
    expect(interleaved.length).toBe(5);
    // Ensure the first item is not preceded by 2 new items in a row
    expect(interleaved[0].mastery.status).toBe('seen');
  });
});
