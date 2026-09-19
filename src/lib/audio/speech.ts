export interface AudioPlayback {
  play(script: string, rate?: number): void;
  stop(): void;
  isAvailable(): boolean;
}

export const browserSpeechPlayback: AudioPlayback = {
  play(script, rate = 0.9) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = 'en-GB';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  },
  stop() {
    window.speechSynthesis.cancel();
  },
  isAvailable() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  },
};
