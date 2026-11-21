# Project Context

## Architecture

The starter is a browser-only React app. `index.html` loads `src/main.tsx`, which renders a startup confirmation. Product logic and data will be added when the team picks the demo scenario. Keep the first use case lightweight with an in-repo synthetic fixture and a pure input-to-result function where practical.

## Stack and dependencies

React and React DOM provide rendering, TypeScript checks types, and Vite serves and builds the app. Both machines use Node.js 24 LTS and npm. There is no application server or database in the starter.

## Folder structure and entry points

- `index.html` is the HTML entry point.
- `src/main.tsx` mounts the React root.
- `package.json` defines scripts and dependencies. `tsconfig.json` defines TypeScript settings.
- `docs/` holds roadmap, ownership handoffs, decisions, review, and the initial backlog.

## Build process

`npm run dev` serves the app locally. `npm run check` runs TypeScript and a production build. Vite writes assets to ignored `dist/`. `npm run preview` serves the build locally. Any static host compatible with the event can serve the build once a host is selected.
