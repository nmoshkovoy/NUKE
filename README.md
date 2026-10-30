# Lemma — Math study studio

A responsive math study app built with Vite, vanilla JavaScript, and KaTeX. Requires Node.js 20.19+ or 22.12+ (validated on Node 24).

## Run and preview

```bash
cd /workspace/NUKE
npm ci
npm run dev -- --port 5173
```

On your own computer, open `http://localhost:5173`. In a cloud editor that supports forwarded ports, forward port 5173 and open the editor-provided preview. The server binds to all interfaces. If a command sandbox blocks listening, run the server with the environment's supported permission mechanism.

Production build and local production preview:

```bash
npm run build
npm run preview -- --port 4173
```

Open port 4173 using the same method. Deploy `dist/` to any static hosting service. No backend or credentials are required for the demo. Math fonts ship in the bundle; optional Google UI fonts fall back to installed sans-serif fonts if unavailable.

## Try the interface

1. Choose Calculus III or Linear Algebra and load the sample notes, or paste your own notes.
2. Click **Create study lesson** to load the subject's curated demonstration lesson. This demo does **not** interpret pasted notes; a visible message explains that limitation.
3. Explore Overview, Study guide, Worked example, and Practice. Practice answers remain collapsed until you open their step-by-step solutions.
4. Save a lesson and open Saved lessons to reopen or delete it. The notes and subject persist in browser localStorage across reloads, on the same origin and browser. Clearing browser data removes them; private browsing may not retain them. There is no account or cross-device sync.

Sample coverage: partial derivatives, gradients, directional derivatives; eigenvalues, eigenvectors, and characteristic equations. These are representative topics, not complete courses.

## Connect real AI generation

The demo uses structured lesson objects in `src/content.js`. The `#generate` handler in `src/main.js` currently selects those objects.

To connect a model:

1. Add a backend or serverless `POST /api/lessons` endpoint accepting `{ subject, notes }`. Keep the AI provider API key in the server environment, never in client JavaScript or a `VITE_` variable. Configure the provider and model on the server.
2. Validate the subject enum, trim notes, enforce length limits and rate limits, and treat pasted notes as untrusted reference material. Ask for a plain-language summary, concepts, formulas, worked example steps, and practice questions with separate solution steps. Request schema-constrained JSON matching the lesson structure in `content.js`; require LaTeX strings without surrounding dollar delimiters.
3. Validate the returned JSON and math expressions on the server. Math models can make mistakes: check sample outputs against trusted solutions, and flag uncertainty or inadequate source notes rather than inventing claims.
4. Replace the demo click handler with `fetch('/api/lessons', ...)`. Add loading and cancellation, timeout/retry handling, and readable errors that retain the user's notes. Refactor the renderer to accept the returned lesson object instead of indexing `lessons[current]`.
5. Store the complete generated lesson, its source notes, and its schema version when saving. The current local demo saves the subject and notes and reconstructs the static sample. For account-based sync, add authentication, per-user database access, and save/delete endpoints.
6. Render returned prose as text, never raw model HTML. Keep KaTeX trust disabled (the default), validate input size, and define data retention and privacy behavior before sending real class notes to an external provider.

## Validation

`npm run build` passes. Chromium checks verified both subjects, math rendering, section navigation, hidden/revealed solutions, note retention, saving/reopening/deleting, persistence after reload, empty-input validation, and mobile page overflow. No browser runtime errors occurred. Browser checks were run with an external temporary Playwright harness; this repository does not ship an automated test runner.
