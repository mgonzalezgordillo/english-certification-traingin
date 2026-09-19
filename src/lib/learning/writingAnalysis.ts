import type { WritingRubricResult } from '../../types';

const CONNECTORS = ['however', 'although', 'because', 'therefore', 'moreover', 'firstly', 'finally', 'while', 'whereas', 'in addition', 'on the other hand'];

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function analyzeWriting(text: string, minWords: number, maxWords: number): WritingRubricResult {
  const words = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  const uniqueWords = new Set(words);
  const connectorCount = CONNECTORS.reduce((total, connector) => {
    const matches = text.toLowerCase().match(new RegExp(`\\b${connector.replace(' ', '\\s+')}\\b`, 'g'));
    return total + (matches?.length ?? 0);
  }, 0);
  const paragraphs = text.trim().split(/\n\s*\n/).filter(Boolean);

  return {
    taskCompletion: words.length >= Math.max(30, Math.floor(minWords * 0.7)),
    approximateLength: words.length >= minWords && words.length <= maxWords,
    paragraphing: words.length < 80 ? paragraphs.length >= 1 : paragraphs.length >= 2,
    connectorCount,
    lexicalVariety: words.length ? Math.round((uniqueWords.size / words.length) * 100) : 0,
  };
}
