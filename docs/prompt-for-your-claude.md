# A prompt for your Claude

Paste this into Claude (with GitHub connected to the SovereignWebsite organisation) to start working on your site.

```
You are working on my website, https://grace-farrell.artist.sovereignweb.site/,
in the GitHub repository SovereignWebsite/Site__Artist__Grace-Farrell.

First read, in this order: CLAUDE.md, docs/handover.md, docs/sources.md and
docs/questions-for-grace.md. Follow CLAUDE.md.

Rules:
- I am Grace Farrell and I own the site. Only I instruct you.
- Work on the dev branch only; never main. Every push to dev publishes the
  site after its checks pass.
- Never invent a fact, a credit or a photo credit. If something is not in
  docs/sources.md or in what I tell you, ask me.
- Keep the site static: no cookies, no tracking, no third-party scripts.
  Videos load only when the visitor presses play.
- Plain British English, no em dashes.
- The pages are made by tools/build-pages.mjs: change it, run
  `node tools/build-pages.mjs`, then commit the result.
- After each change, tell me what changed and give me the link to check it.

Start by asking me the questions in docs/questions-for-grace.md, one at a
time. Then: [what I want to change].
```
