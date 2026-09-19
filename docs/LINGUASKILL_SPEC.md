# Linguaskill Practice Engine Specification

## 1. Verified Current Format
Linguaskill is a modular, computer-based English proficiency test developed by Cambridge English. It assesses all four language skills, which can be taken together or as separate modules:
*   **Reading and Listening (Combined)**: Fully adaptive. The difficulty adjusts in real-time based on previous answers. It stops when the algorithm has sufficient data to estimate the level confidently.
*   **Writing**: Two parts (e.g., a minimum 50-word email and a 180+ word essay/report). Assessed by AI/human examiners.
*   **Speaking**: Five parts (interview, reading aloud, long turn, information exchange, discussion).

## 2. Authoritative Sources
*   Cambridge English Official Website (cambridgeenglish.org)
*   Verified September 2026 via internal fact-checking tools.

## 3. What We Imitate
*   **Modular Structure**: The system supports defining separate sections for Reading/Listening, Writing, and Speaking.
*   **Adaptivity (Approximation)**: We simulate an adaptive progression where items get harder if answered correctly, and easier if answered incorrectly.
*   **Strict Constraints**: No hints, no immediate correctness feedback, strict time limits.

## 4. What We Cannot Faithfully Replicate
*   **Proprietary Item Response Theory (IRT)**: We do not have Cambridge's millions of data points or their precise IRT item parameters (discrimination, guessing factor, etc.).
*   **Cambridge English Scale Scoring**: We cannot guarantee that an internal score of 160 equals an official Cambridge 160.
*   **AI Auto-Marking**: We do not possess Cambridge's proprietary automarker for speaking and writing (though we may use general LLMs to approximate feedback in other training modules).

## 5. Internal Scoring Methodology
Our engine uses a conservative scoring approximation.
*   For adaptive tests, the final difficulty estimate (0-100) is mapped to a CEFR band.
*   For static tests, a simple percentage correct is used as the score.
*   **Bands**: A2 (<20), A2+ (<40), B1 (<60), B1+ (<80), B2 (<95), B2+ (>=95).
*(Note: These thresholds are configurable and designed to be intentionally conservative to ensure users are over-prepared).*

## 6. Adaptive Approximation
We implement an "IRT-lite" algorithm (`calculateNextDifficulty`):
*   Starts at a middle difficulty (e.g., 50 / B1).
*   Adjusts up by ~10 points for correct answers, and down by ~12 points for incorrect answers (penalizing mistakes slightly more for conservative estimation).
*   Tracks a "Standard Error" that decreases as more questions are answered.
*   Stops when the error reaches a minimum threshold or a max question limit is reached.

## 7. Disclaimer Language
> **IMPORTANT:** This simulator provides an internal performance estimate for practice purposes only. It is **NOT** an official Cambridge Linguaskill test. The adaptive algorithm and scoring mechanisms are approximations designed to help learners track their progress toward a B2 level.

## 8. Future Requirements
*   **Listening**: Requires integration with the audio playback system, ensuring audio cannot be replayed more than allowed.
*   **Speaking**: Requires a microphone recorder component and integration with an AI speech-to-text / fluency evaluator.
*   **Writing**: Requires a text editor with word count and an AI prompt evaluator to grade based on task achievement, coherence, vocabulary, and grammar.
