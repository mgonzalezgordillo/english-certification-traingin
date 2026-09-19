import type {
  VocabularyWithProgress,
  TrainingSessionConfig,
} from '../../types';

export interface SelectionWeights {
  overdueWeight: number;
  lapseWeight: number;
  lowMasteryWeight: number;
  priorityScoreWeight: number;
}

export const DEFAULT_WEIGHTS: SelectionWeights = {
  overdueWeight: 40,
  lapseWeight: 25,
  lowMasteryWeight: 20,
  priorityScoreWeight: 15,
};

/**
 * Calculates an urgency/priority score for an item to rank it in review queues.
 */
export function calculateItemUrgency(
  item: VocabularyWithProgress,
  now: Date = new Date(),
  weights: SelectionWeights = DEFAULT_WEIGHTS
): number {
  let urgency = 0;

  const nextReviewTime = item.review.nextReviewDate
    ? new Date(item.review.nextReviewDate).getTime()
    : 0;
  const isOverdue = nextReviewTime > 0 && nextReviewTime <= now.getTime();

  if (isOverdue) {
    // The more hours overdue, the higher the urgency (capped at 48h)
    const hoursOverdue = Math.min(48, (now.getTime() - nextReviewTime) / (1000 * 60 * 60));
    urgency += weights.overdueWeight + (hoursOverdue / 48) * 15;
  }

  // Lapses penalty / urgency
  if (item.review.lapses > 0) {
    urgency += Math.min(30, item.review.lapses * 10) * (weights.lapseWeight / 25);
  }

  // Low mastery urgency (if already seen)
  if (item.mastery.status !== 'unseen') {
    const deficit = Math.max(0, 80 - item.mastery.score);
    urgency += (deficit / 80) * weights.lowMasteryWeight;
  } else {
    // Unseen items: rank by communicative priority
    urgency += (item.item.priorityScore / 100) * weights.priorityScoreWeight;
  }

  return urgency;
}

/**
 * Adaptively selects and interleaves vocabulary items for a study session.
 * Ensures a balanced mix of overdue reviews, weak items needing repair, and high-value new vocabulary.
 */
export function selectSessionItems(
  allVocab: VocabularyWithProgress[],
  config: TrainingSessionConfig,
  now: Date = new Date()
): VocabularyWithProgress[] {
  let pool = [...allVocab];

  // 1. Filter by CEFR level if requested
  if (config.targetCefr) {
    pool = pool.filter((v) => v.item.cefrLevel === config.targetCefr);
  }

  const nowTime = now.getTime();
  const isDue = (v: VocabularyWithProgress) => {
    if (!v.review.nextReviewDate) return false;
    return new Date(v.review.nextReviewDate).getTime() <= nowTime;
  };
  const isWeak = (v: VocabularyWithProgress) => {
    return v.mastery.status !== 'unseen' && (v.review.lapses > 0 || v.mastery.score < 45);
  };
  const isNew = (v: VocabularyWithProgress) => v.mastery.status === 'unseen';

  if (config.mode === 'due_only') {
    const dueItems = pool
      .filter(isDue)
      .sort((a, b) => calculateItemUrgency(b, now) - calculateItemUrgency(a, now));
    return dueItems.slice(0, config.itemCount);
  }

  if (config.mode === 'weak_only') {
    const weakItems = pool
      .filter(isWeak)
      .sort((a, b) => calculateItemUrgency(b, now) - calculateItemUrgency(a, now));
    return weakItems.slice(0, config.itemCount);
  }

  if (config.mode === 'new_only') {
    const newItems = pool
      .filter(isNew)
      .sort((a, b) => b.item.priorityScore - a.item.priorityScore);
    return newItems.slice(0, config.itemCount);
  }

  // SMART MIX (default):
  // Target proportions: 50% Due / Overdue, 25% Weak / Repair, 25% New high-priority
  const targetTotal = config.itemCount;
  const targetDueCount = Math.ceil(targetTotal * 0.5);
  const targetWeakCount = Math.floor(targetTotal * 0.25);
  const targetNewCount = Math.max(1, targetTotal - targetDueCount - targetWeakCount);

  const dueItems = pool
    .filter(isDue)
    .sort((a, b) => calculateItemUrgency(b, now) - calculateItemUrgency(a, now));

  const weakItems = pool
    .filter((v) => isWeak(v) && !isDue(v))
    .sort((a, b) => calculateItemUrgency(b, now) - calculateItemUrgency(a, now));

  const newItems = pool
    .filter(isNew)
    .sort((a, b) => b.item.priorityScore - a.item.priorityScore);

  const selectedIds = new Set<string>();
  const selected: VocabularyWithProgress[] = [];

  const addItems = (source: VocabularyWithProgress[], maxCount: number) => {
    for (const item of source) {
      if (selected.length >= targetTotal) break;
      if (!selectedIds.has(item.item.id)) {
        selectedIds.add(item.item.id);
        selected.push(item);
        if (selected.filter((x) => source.includes(x)).length >= maxCount) break;
      }
    }
  };

  // Select according to target proportions
  addItems(dueItems, targetDueCount);
  addItems(weakItems, targetWeakCount);
  addItems(newItems, targetNewCount);

  // If we still need more items to reach targetTotal, backfill from remaining pool
  if (selected.length < targetTotal) {
    const remaining = pool
      .filter((v) => !selectedIds.has(v.item.id))
      .sort((a, b) => calculateItemUrgency(b, now) - calculateItemUrgency(a, now));
    for (const item of remaining) {
      if (selected.length >= targetTotal) break;
      selectedIds.add(item.item.id);
      selected.push(item);
    }
  }

  // Interleave the items so new and review items alternate nicely
  return interleaveSession(selected);
}

/**
 * Interleaves items to avoid clumping all new or all difficult items together.
 */
export function interleaveSession(items: VocabularyWithProgress[]): VocabularyWithProgress[] {
  if (items.length <= 2) return items;

  const newItems = items.filter((i) => i.mastery.status === 'unseen');
  const reviewItems = items.filter((i) => i.mastery.status !== 'unseen');

  const interleaved: VocabularyWithProgress[] = [];
  let nIdx = 0;
  let rIdx = 0;

  while (nIdx < newItems.length || rIdx < reviewItems.length) {
    // 2 review items, 1 new item rhythm
    if (rIdx < reviewItems.length) {
      interleaved.push(reviewItems[rIdx++]);
    }
    if (rIdx < reviewItems.length && (nIdx >= newItems.length || rIdx % 2 === 0)) {
      interleaved.push(reviewItems[rIdx++]);
    }
    if (nIdx < newItems.length) {
      interleaved.push(newItems[nIdx++]);
    }
  }

  return interleaved;
}
