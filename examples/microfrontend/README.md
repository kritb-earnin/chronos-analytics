# Chronos Microfrontend Demo

This demo shows a **microfrontend** setup: the **shell** app owns Chronos sink registration (EventBus, ConsoleSink, LocalStorageSink), and the **remote** microfrontend only uses `useChronos()` to emit events and renders **ChronosDevTools**. Both run on the same page via Vite Module Federation, so they share the same EventBus singleton and `localStorage`; events emitted in the remote flow to the shell’s sinks, and DevTools in the remote display the full event log.

## Layout

- **`shell/`** — Host app (port 5175). Registers sinks in `main.tsx` and mounts the remote app in the page.
- **`remote/`** — Remote app (port 5176). Exposes an App that uses `useChronos` + ChronosDevTools and a few buttons to emit events. No sink registration.

## How to run

1. **Install dependencies** from the repo root:
   ```bash
   pnpm install
   ```

2. **Build the library** (so workspace packages can resolve `chronos-analytics`):
   ```bash
   pnpm build
   ```

3. **Start the remote** (must be running so the shell can load it):
   ```bash
   pnpm dev:mf-remote
   ```
   Or from this directory: `cd remote && pnpm dev`.

4. **In another terminal, start the shell**:
   ```bash
   pnpm dev:mf-shell
   ```
   Or: `cd shell && pnpm dev`.

5. Open **http://localhost:5175**. The shell loads the remote; click the buttons in the remote to emit events. Open Chronos DevTools (in the remote UI) to see the event log. Events are persisted by the shell’s LocalStorageSink and read by DevTools from the same `chronos-events` key.

## If the remote fails to load in dev

Some setups require the remote to be **built** before the host can load it. In that case:

1. Build the remote: `cd examples/microfrontend/remote && pnpm build`.
2. Serve the remote’s `dist` on port 5176 (e.g. `pnpm preview` in the remote, or any static server).
3. Run the shell: `pnpm dev:mf-shell` and open http://localhost:5175.

## Build for production

From the repo root:

```bash
pnpm build:microfrontend
```

Then serve `shell/dist` (and ensure the remote’s built assets are served from the URL configured in the shell’s `vite.config.ts` remotes).
