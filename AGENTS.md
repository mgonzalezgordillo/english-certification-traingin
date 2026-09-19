# Instructions for Future Coding Agents

Welcome to the V2 Lingua Skill repository.

**CRITICAL RULES FOR ALL AGENTS:**

1. **Architecture & Separation of Concerns**:
   - Keep UI components, domain models, content data, learning logic, persistence, and AI integration STRICTLY separate.
   - Do NOT embed learning/adaptive logic directly inside React components. Pure TS functions go in `src/lib/`.
   - Content must be data-driven. Do NOT hardcode vocabulary, questions, or grammar rules in `.tsx` files.

2. **Types & Validation**:
   - Keep TypeScript strict. Define all domain models in `src/types/`.
   - Use `zod` for parsing and validating data boundaries where applicable.

3. **Persistence (Local-First)**:
   - The application relies on IndexedDB (Dexie) in `src/lib/db.ts`. Do not introduce new database libraries without overwhelming justification.
   - Use `localStorage` ONLY for lightweight UI preferences (e.g., theme), not for learning data.

4. **AI Constraints**:
   - The app MUST degrade gracefully if no AI API key is provided.
   - Do NOT hardcode AI providers like Gemini directly into components. Always use the `AIProvider` abstraction in `src/lib/ai/`.
   - NEVER hardcode API keys in the source. Use environment variables.

5. **Strict Assessment**:
   - The system records the FIRST error. A user doesn't achieve mastery just by getting it right on the third try.
   - Hints and explanations must NOT appear automatically; they must be explicitly requested.

6. **UI & Styling**:
   - Use Tailwind CSS.
   - Design is serious, modern, and data-oriented. Avoid childish gamification and giant rounded cards.
   - UI copy should primarily be in Spanish, but code (variables, files, types) must be entirely in English.
