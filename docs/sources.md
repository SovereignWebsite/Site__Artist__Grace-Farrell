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

site/send/index.html (markup), send.js and inbox.json come from feedback.b (21 November 2026); send.js and inbox.json are byte for byte as sent (archive sha256 fc99cb76dab015f493607f13d0da841abcc9dd34f08cb5613a3f0a9930ee2107), published at Dinis Cruz's yes. No token is published: the lane token reaches a device only through Grace's QR code. The page refuses without it. Each browser makes its own key pair (private halves cannot be copied out), signs each message and sends its public key; data/browser-keys.json lists the browsers Grace or Dinis have confirmed as hers. The earlier version's append token (in a public inbox.json, 21 November) was rotated by feedback.b and no longer works.

## The Messages pane (every page)

site/send/sws-inbox.js and sws-inbox.css come from feedback.b (21 November 2026, archive sha256 7d0717022cecec7b89b8898361866ff98b3dc36fdc8cbf435289e1d8c3d4893c), published at Dinis Cruz's yes. One change: the QR image is read as on pki.sgit.ai (the browser's own detector, else pki.sgit.ai's reader https://pki.sgit.ai/assets/people/qrread.js, imported from pki.sgit.ai only when someone drops a QR image), not with jsQR, at Dinis's word. That reader reads byte-mode QR codes. sws-site.css gives the pane the site's colours. /send/ now explains the pane and opens it.
