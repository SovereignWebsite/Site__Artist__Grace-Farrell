# Handover: Grace Farrell's site

For Grace. Written by grace.b, the agent that built the site, on 21 November 2026.

## What you have

- **The site:** https://grace-farrell.artist.sovereignweb.site/
- **The repository:** https://github.com/SovereignWebsite/Site__Artist__Grace-Farrell. Everything that makes the site is in it: the pages, the photographs, the styles and the history of every change.
- **Five designs** of the same site: https://grace-farrell.artist.sovereignweb.site/designs/. The home page uses design 5, Editorial. You choose which one you want; it is one line to change.
- **No cookies, no tracking, no third-party scripts.** Spotlight's and Instagram's players load only when a visitor presses play.

## Where everything comes from

Every fact is from your Spotlight profile, or from Dinis Cruz. Nothing was invented. The list is in `docs/sources.md`: each credit, each photograph and who took it, and the tour venues.

Left off on purpose: Spotlight's personal details (gender, ethnicity, appearance, height, weight). Add any you want.

## How the site is built

| Part | File |
|---|---|
| All the words, credits, skills and links | `tools/build-pages.mjs` (the CREDITS and SKILLS lists, and the text in `page()`) |
| Which design is the home page | `tools/build-pages.mjs`, the line `const HOME = 5;` |
| Shared layout | `site/base.css` |
| Each design's look | `site/designs/d1.css` to `d5.css` |
| The tour list and map | `tools/data/tour.json` |
| Photographs | `site/images/` |
| Start, Use with your AI, How this site was made | `site/start/`, `site/agents/`, `site/admin/` (edit the words between the `<!-- content -->` markers) |

After changing `tools/build-pages.mjs`, run `node tools/build-pages.mjs` to remake the pages, then commit. Your own Claude can do all of this for you: see `docs/prompt-for-your-claude.md`.

Every push to the `dev` branch runs the checks (links, link previews, accessibility, a scan for leaked secrets) and publishes the site in a minute or two. `main` is locked.

## No GitHub needed

You do not need GitHub to have changes made. Use ChatGPT or Claude with `docs/prompt-for-chatgpt.md`: it asks you the open questions and writes up what you want as one message, which you send to Dinis (and, soon, to the site's agent from the site itself). GitHub is only needed if you want to edit the files yourself or have your own AI do it.

## Taking it over (optional: to edit it yourself)

1. Make a GitHub account at https://github.com/signup if you do not have one, and send your GitHub username to Dinis.
2. Dinis invites you to the SovereignWebsite organisation with write access to your repository.
3. Accept at https://github.com/orgs/SovereignWebsite/invitation (signed in to GitHub).
4. In Claude, open the GitHub connection settings and press **Check again** next to SovereignWebsite.
5. Give your Claude the prompt in `docs/prompt-for-your-claude.md`. Its first step is to make its own key and publish the public half in `site/keys/`, as the site's agent did (`site/keys/b.site.grace-farrell.json`): access to the repository is what authorises it.

From then on, you instruct the site's agents; until then, Dinis does.

## Talking to the site's agent

- **Messages, on every page:** press **Messages** at the bottom right. The first time on a device, drop or paste the QR code image Dinis sends you (or paste its link); your device then makes its own key, so the agent knows messages from it are yours. Write requests there, on any page: it notes the page. Answers come on the agent's hourly rounds, 10:00 to 22:00 UK time, like a slow inbox. ChatGPT can write a request and give you a link that opens the pane with it filled in (`docs/prompt-for-chatgpt.md`). Or tell Dinis.

## Open questions

See `docs/questions-for-grace.md`. Nothing changes until you answer.
