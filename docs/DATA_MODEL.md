# Data Model

The application uses a local-first approach using IndexedDB (via Dexie).

## Core Entities

### User Profile
- `estimatedLevel`: Global CEFR level
- `skills`: Object tracking level per skill (Reading, Listening, Writing, Speaking, Grammar, Vocabulary)

### Vocabulary Item
- `id`, `word`, `lemma`, `pos`, `cefrLevel`
- `priorityScore`, `meaning`, `examples`, `collocations`
- `audioRef`, `synonyms`, `antonyms`, `tags`

### Grammar Concept
- `id`, `title`, `cefrLevel`, `category`
- `explanation`, `examples`, `commonMistakes`, `tags`

### Mastery State (User Progress)
- Attached to a concept/vocabulary ID.
- `status`: Seen / Recognised / Recalled / Used Correctly / Reliable
- `score`: Internal mastery score

### Review State (Spaced Repetition)
- `nextReviewDate`, `interval`, `easeFactor`

### Exercise Attempt
- `exerciseId`, `timestamp`, `duration`
- `firstAttemptCorrect`, `finalAttemptCorrect`
- `hintsUsed`, `errorClassification`

### Exam Attempt
- Details specific to Linguaskill simulation (score, time spent per section).

### Database Schema (Dexie)
Tables:
- `userProfile`
- `vocabularyMastery`
- `grammarMastery`
- `exerciseAttempts`
- `examAttempts`
- `studySessions`
