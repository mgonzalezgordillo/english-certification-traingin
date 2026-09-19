import { describe, expect, it } from 'vitest';
import { analyzeWriting, countWords } from '../writingAnalysis';

describe('writing analysis', () => {
  it('counts whitespace-separated words consistently', () => {
    expect(countWords('  This is\n a short text. ')).toBe(5);
    expect(countWords('')).toBe(0);
  });

  it('reports transparent structural indicators without assigning a grade', () => {
    const text = 'Although the plan is practical, it needs clearer dates.\n\nTherefore, I recommend a short pilot because it would reveal operational problems before launch.';
    const result = analyzeWriting(text, 20, 40);
    expect(result.approximateLength).toBe(true);
    expect(result.paragraphing).toBe(true);
    expect(result.connectorCount).toBeGreaterThanOrEqual(3);
    expect(result.lexicalVariety).toBeGreaterThan(0);
  });
});
