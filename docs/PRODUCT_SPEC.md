# V2 Lingua Skill - Product Specification

## Core Product Philosophy
Build a serious, interactive English-learning application designed to move a learner from approximately A2 to B2.
This is not merely an exam preparation app, but a general-purpose English trainer with a dedicated Linguaskill preparation/simulation system.
The system will dynamically adjust to the user's progress without a rigid daily curriculum, prioritizing weaknesses, strengths, and useful activities.

- **Adaptive**: Adjusts based on user performance.
- **Strict Assessment**: First error is recorded; conservative scoring. Mastery distinguishes between seen, recognized, recalled, used correctly, and used reliably under pressure.
- **Data-Driven**: Content is decoupled from the UI.
- **Modular**: UI, domain models, learning logic, persistence, and analytics are decoupled.
- **Offline/Local-first**: Uses IndexedDB (Dexie) for local progress storage.
- **Serious & Modern**: Highly interactive, visually clear, and without excessive gamification.

## Error Classification
The app classifies errors automatically based on signals like:
- selected vs correct answer
- response time
- attempt number
- hints requested
- exercise type, difficulty, CEFR level, concept tags

## Two Learning Modes
1. **Training Mode**: Hints/explanations on request, retry limits, learning from errors.
2. **Exam Mode (Linguaskill)**: No hints, no explanations, no immediate feedback. Contains timer and separate attempt storage.

## Main Areas
- Home / Study Hub
- Adaptive Training
- Daily Quick Diagnostic
- Vocabulary & Grammar Library
- Flashcards / Spaced Repetition (SRS)
- Reading, Listening, Speaking, Writing Trainers
- Linguaskill Simulator
- Analytics Dashboard
- AI Tutor / Assistance (Optional via API)
