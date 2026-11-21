# Where every fact on the site comes from

Never add a fact that is not here. If Grace changes or adds one, note it here with the date.

| What | Source |
|---|---|
| Name, headline, credits, skills, accents, languages, playing age, nationalities, location, representation, showreel | Grace's Spotlight profile, https://app.spotlight.com/1013-7867-4709, text given by Dinis Cruz, 20 November 2026 |
| Debut as Mary Bennet; role text "Cover, debut as Mary Bennet" | Dinis Cruz, 21 November 2026 |
| Tour venues 2026 to 2027 | https://prideandprejudicesortof.com/tour-dates/ (Richmond onwards, read 21 November 2026); The Reviews Hub cast announcement (the autumn 2026 venues); see tools/data/tour.json |
| Instagram profile and video | https://www.instagram.com/gracexfarrellx/ and https://www.instagram.com/p/CINmLazHR4e/, given by Dinis Cruz |
| Bio | Written only from the facts above (Dinis Cruz: "build a bio from her facts") |

## Photographs

| File | Credit |
|---|---|
| images/headshot-*.webp, assets/share/card-1200x630.jpg | Photo © Jennie Scott (Spotlight); use approved by Dinis Cruz, 21 November 2026 |
| images/reel-*.webp | Stills from "GRACE FARRELL - Acting Showreel" (Dinis Cruz: all three are from that showreel) |
| images/instagram-microphone-*.webp | Still from the Instagram video above, cropped to remove Instagram's mute icon |

Not used: Instagram story screenshots and the Crucible cast card (other people in them, no consent; low resolution).

## Left off on purpose

Spotlight's personal details (gender, ethnicity, appearance, height, weight): a casting directory needs them, a personal site does not. Grace decides (docs/questions-for-grace.md).

## The map

Britain and Ireland outline from Natural Earth (public domain), world-atlas 2.0.2 countries-50m, turned into one SVG path by tools/map_path.py (tools/data/map-path.json).

## The message page, /send/

site/send/index.html, send.js and inbox.json come from feedback.b (21 November 2026), added at Dinis Cruz's yes the same day. inbox.json holds an append-only lane token for the grace-chatgpt lane: it can add a message and cannot read one, like the inbox on Kate Curtis-Evans's site. Dinis approved publishing it. Messages are sealed in the browser to feedback.b's public key; they are not signed, so the agent confirms with Grace before acting.
