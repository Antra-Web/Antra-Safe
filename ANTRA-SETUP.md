# Antra floating widget — setup notes

This restores the floating "Antra" website-guide agent on the main
ANTRA-WEB site. It does **not** touch Ava, Flow, `js/agent-chat.js`, or
`css/agent.css` — Antra's chat panel reuses that existing engine exactly
as-is, the same way Ava and Flow already do.

## What was added

- `css/antra-float.css` — floating launcher button + panel shell styling.
- `js/antra-float.js` — open/close/focus behaviour for the launcher only.
  (Actual message sending/receiving is handled entirely by the existing,
  untouched `js/agent-chat.js`.)
- A small markup block on each main page (see list below) containing:
  - the floating launcher button
  - a panel wrapping a `.agent-chat[data-agent-chat]` element — the same
    component type Ava/Flow use — configured with:
    - `data-agent-name="Antra"`
    - `data-webhook="https://antra-web.app.n8n.cloud/webhook/antra-chat"`
      (the n8n Chat Trigger URL you provided)
    - `data-proxy="https://antra-agents-proxy.khushikumari30082010.workers.dev/antra"`

## Why there's a `data-proxy` URL you didn't give me

`js/agent-chat.js` (unmodified) never calls the n8n webhook directly from
the browser — it always POSTs to `data-proxy`, a Cloudflare Worker that
forwards the request to n8n. This is exactly how Ava and Flow already
work:

- Ava's panel → `data-proxy="https://antra-agents-proxy.khushikumari30082010.workers.dev/ava"`
- Flow's panel → `data-proxy="https://antra-agents-proxy.khushikumari30082010.workers.dev/flow"`

So Antra's panel points at `/antra` on that **same** existing Worker, by
direct extension of the pattern already in use. I did not invent a new
service for this — but I also can't create or edit your Cloudflare Worker
from here, so **this route needs to exist on your Worker before Antra will
actually respond.**

### What you need to add to your Cloudflare Worker

If your Worker currently routes by pathname (`/ava`, `/flow`, etc. →
different n8n webhooks), add an equivalent `/antra` branch that forwards to:

```
https://antra-web.app.n8n.cloud/webhook/antra-chat
```

A minimal example of what that branch typically looks like, matching the
same contract `agent-chat.js` already uses for Ava/Flow (browser sends
`text/plain` to skip CORS preflight; Worker forwards it to n8n as
`application/json`; Worker adds the CORS header the browser needs to read
the response):

```js
// Add this branch inside your existing router, alongside /ava and /flow.
if (url.pathname === '/antra') {
  const n8nUrl = 'https://antra-web.app.n8n.cloud/webhook/antra-chat';
  const bodyText = await request.text(); // already valid JSON text from the browser

  const upstream = await fetch(n8nUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyText,
  });

  const responseText = await upstream.text();

  return new Response(responseText, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://antra-web.github.io',
    },
  });
}
```

Adjust to match whatever structure your existing Worker script already
uses for the `/ava` and `/flow` branches — this is a template, not a
guess at your actual deployed code (which I don't have access to).

### n8n side — check the same three things as Ava/Flow

In the n8n workflow behind `antra-web.app.n8n.cloud/webhook/antra-chat`,
confirm (per `AVA-FLOW-audit-report.md` in this repo, which documents the
identical checklist for Ava/Flow):

1. The workflow's **Active** toggle is ON.
2. The Chat Trigger node's **"Make Chat Publicly Available"** is ON.
3. **Allowed Origin (CORS)** includes `https://antra-web.github.io`.

If any of these is off, Antra's chat will fail silently in the browser
(a generic "failed to fetch"), exactly like the documented Ava/Flow
failure mode — it's not a code bug on either side.

## Pages Antra appears on

`index.html`, `about.html`, `services.html`, `packages.html`,
`process.html`, `case-studies.html`, `contact.html`, `faq.html`,
`portfolio.html`.

Deliberately **not** added to `ava.html`, `flow.html` (their own dedicated
agent experience) or `device-preview.html` (an internal dev tool that
iframes `index.html`, so it appears there automatically anyway).

## Positioning

Antra's launcher sits bottom-right (`z-index:900`). The WhatsApp button
(`.wa-float`) sits bottom-left (`z-index:200`) and is untouched — the two
never overlap on any screen size, checked at desktop (1440px) and mobile
(390px) widths.
