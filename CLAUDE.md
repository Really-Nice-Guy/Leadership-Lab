# Leadership Lab

A leadership curriculum web app built with React, TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build tool**: Vite (via rolldown-vite)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Routing**: React Router DOM v7
- **Icons**: Phosphor React
- **Linting**: ESLint 9 (flat config) with TypeScript and React plugins

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check (`tsc -b`) then build for production |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Preview production build locally |

## Project Structure

```
src/
  App.tsx              # Root component with route definitions
  main.tsx             # Entry point (React 19 createRoot)
  index.css            # Global styles
  components/          # Shared UI components (Header, Footer)
  pages/               # Route-level page components
    Home.tsx
    Curriculum.tsx
    ArticlesLibrary.tsx
    ArticleDetail.tsx
  types/index.ts       # Shared TypeScript interfaces (Article, Session, Mapping, FourCCategory)
  utils/dataLoader.ts  # Data fetching helpers (loads JSON from /public/data/)
public/data/           # Static JSON data files (sessions.json, mapping.json)
```

## Architecture & Patterns

- **Routing**: BrowserRouter with flat route definitions in `App.tsx`
- **Data loading**: Static JSON files served from `public/data/`, fetched at runtime via `utils/dataLoader.ts`
- **Domain model**: Four leadership categories ("4Cs") — Communication, Customer, Cognizance, Charisma — each with a dedicated Tailwind color
- **Type definitions**: Centralized in `src/types/index.ts`; always import types from there
- **Layout**: Flex column layout with shared Header/Footer wrapping route content

## Code Style

- Functional components only (no class components)
- TypeScript strict mode; define interfaces in `src/types/index.ts`
- Use Tailwind utility classes for styling; custom theme colors are defined in `tailwind.config.js`
- Use named exports for utilities, default exports for components/pages
- ESM modules (`"type": "module"` in package.json)
- Custom Tailwind colors: `communication` (#3B82F6), `customer` (#10B981), `cognizance` (#8B5CF6), `charisma` (#F59E0B)
- Font: Inter (sans-serif)
