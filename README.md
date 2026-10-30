# NUKE — free local math study studio

A blue-themed study app for Calculus III and Linear Algebra. Paste text, upload photos of class notes, or paste a screenshot to generate a plain-language summary, formula guide, worked example, and practice questions with hidden solutions. KaTeX renders math clearly; lessons can be saved locally.

**Default AI: Ollama running on your Mac. No API key, subscription, or per-use payment.** It requires a one-time model download of about 3.3 GB, free disk space, and enough memory (8 GB minimum recommended; 16 GB is more comfortable). Generation uses your computer and can take several minutes. Local models can make math and handwriting mistakes.

## Step by step on your Mac

1. Stop the old app: click its Terminal window and press **Control-C**.
2. In Finder → Downloads, rename your old `NUKE-main` folder to `NUKE-old` so you keep a backup.
3. Download the updated app from https://github.com/nmoshkovoy/NUKE using **Code → Download ZIP**, then double-click the ZIP. The new folder should be `NUKE-main`.
4. Download **Ollama for macOS** from https://ollama.com/download/mac. Install it and open the Ollama app. It runs in the background. Check Ollama's current macOS requirements if it does not open.
5. Open Terminal and run this command. Wait for the download to finish:

   ```bash
   ollama pull gemma3:4b
   ```

   If `ollama` is not found, quit and reopen Terminal after installing and opening Ollama, and accept its command-line setup prompt if shown.

6. In Terminal, run each command one at a time:

   ```bash
   cd ~/Downloads/NUKE-main
   npm ci
   npm run dev
   ```

   Node.js 22.12+ is required. If you already ran the first version, Node is installed; otherwise install Node.js LTS from https://nodejs.org.

7. Open **http://localhost:5173** in Safari or Chrome. Keep Terminal and Ollama running. The status should read **Free local AI ready**. Refresh after downloading the model if needed.
8. Choose Calculus III or Linear Algebra. Paste notes, click **Add photos of your notes**, or paste a screenshot into the notes box. Text is optional when images are attached.
9. Click **Create study lesson**. Allow a few minutes on the first run while the model loads. Review **What NUKE read from your notes** for handwriting errors, then explore the lesson sections.
10. Click **Save lesson** to retain the generated lesson in this browser. Find it under **Saved lessons**.

No `.env` file is needed for the default free setup. If you previously created one with `AI_PROVIDER=openai`, change that line to `AI_PROVIDER=ollama` and restart the app.

## Images, privacy, and saving

- Upload up to 4 PNG, JPEG, or WebP images, each at most 4 MB. Start with one clear page for faster, more reliable generation.
- PDFs and iPhone HEIC images are not supported. Export the page/photo as JPEG or PNG first.
- Crop to one topic, keep formulas fully visible, and use sharp, well-lit photos. Handwriting recognition and generated solutions are imperfect; verify important equations.
- With default Ollama mode, generation requests go only to the local Ollama server on your Mac. The model download requires Internet; inference does not require an external AI service. Optional Google interface fonts may load externally; these do not receive your notes.
- Uploaded photos are held in browser memory for generation, not saved to disk by this app or included in saved lessons. Saved lessons include the generated content, extracted transcription, subject, and pasted text.
- Saved lessons use browser localStorage, specific to that browser and address. There is no account or cross-device sync. Clearing browser data removes them.
- **Load sample** works without Ollama. Generated lessons are labeled separately. Failures keep your input and do not silently load samples.
- Earlier Lemma saved lessons remain readable through the original storage key.

## Troubleshooting

- **Ollama is not running:** open the Ollama app, then refresh NUKE.
- **Download the local model:** run `ollama pull gemma3:4b`, wait for completion, then refresh.
- **Slow or timed out:** start with one photo or fewer notes, close memory-heavy apps, and retry. The first request loads the model; CPU-only machines can be slow. The request limit is five minutes.
- **Incomplete/invalid lesson:** try clearer notes or generate again. Small local models sometimes fail to produce the required structure.
- **Port already in use:** stop the older NUKE server with Control-C. To use another port, copy `.env.example` to `.env`, change `PORT`, then restart.
- **Wrong transcription or math:** retake the photo or type the ambiguous equation. Local AI cannot guarantee correct math.
- **Backend unavailable:** run `npm run dev`; the static preview cannot generate lessons.

## Development

```bash
npm ci
npm test
npm run build
npm run dev
```

`npm run dev` starts a Node HTTP backend with Vite middleware on `127.0.0.1:5173`. The default provider is Ollama at `127.0.0.1:11434`, with the vision model `gemma3:4b`. Optional `.env` settings: `AI_PROVIDER=ollama`, `OLLAMA_MODEL=gemma3:4b`, `PORT=5173`. A different model must support images and structured JSON output.

`npm run build` builds the frontend into `dist/`. `npm run preview -- --port 4173` previews only static frontend assets; generation requires the backend. The server is for personal local use. Public hosting would require authentication, robust rate limiting, a backend deployment, and a way to run a model on that server; it would no longer use each visitor's Mac automatically.

Code: `src/main.js` handles the UI, uploads, and local saving; `src/content.js` provides samples; `server/index.js` handles HTTP/input limits; `server/lesson.js` handles local inference, structured schema validation, and the optional cloud adapter. Model prose is HTML-escaped and math uses KaTeX's default untrusted mode.

## Optional paid provider

Only if you choose to use OpenAI instead of free local inference: copy `.env.example` to `.env`, set `AI_PROVIDER=openai`, and add `OPENAI_API_KEY=your-key` privately in that file. Default cloud model is `gpt-4.1-mini`; override with `OPENAI_MODEL`. API usage is billed separately from ChatGPT. Never put keys in frontend code or chat. `.env` is ignored by Git. In this mode, notes and images are sent to OpenAI on generation, and the interface displays that disclosure. Requests use `store: false`; provider retention policies still apply.

## Validation status

Six backend tests cover input limits, response shape validation, image/text request construction for both adapters, and setup/provider/refusal/malformed-output errors using simulated providers. Production build passes. Chromium checks cover image-only upload, setup errors with retained input, simulated generated lessons, HTML escaping, formula rendering, hidden solutions, full lesson save/reload/open, and mobile layout. Live Ollama generation has not been run in this cloud workspace; the Ollama runtime and model must be installed on your Mac. No paid API key is needed for the default workflow.
