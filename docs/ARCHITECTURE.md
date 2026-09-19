# Architecture Overview

## Tech Stack
- **Framework**: React + TypeScript + Vite
- **Routing**: React Router
- **State Management**: Zustand
- **Persistence**: IndexedDB via Dexie
- **Styling**: Tailwind CSS
- **Analytics**: Recharts
- **Validation**: Zod
- **Testing**: Vitest (for pure logic)

## Architectural Priorities
1. **UI Components**: Dumb, stateless components where possible.
2. **Domain Models**: Strict TypeScript types defining the business logic (`src/types`).
3. **Content Data**: Stored in JSON/TS structures rather than hard-coded into React files (`src/data`).
4. **Learning/Adaptive Logic**: Pure functions isolated from React (`src/lib/logic`).
5. **Persistence Layer**: Data repositories using Dexie (`src/lib/db.ts`).
6. **Analytics Calculations**: Separate modules for data aggregation.
7. **AI Integration**: AI logic decoupled via interfaces, allowing multiple or no provider (`src/lib/ai`).
8. **Feature Modules**: Separate directories per feature (e.g. `src/features/vocabulary`).

## Data-Driven Content
Content must not be hardcoded in UI components. The app will use schemas (zod + TS) to define content, making it easy to add hundreds of vocabulary words or grammar rules without touching React code.
