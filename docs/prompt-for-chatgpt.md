# A prompt for ChatGPT (no GitHub needed)

For Grace, if you use ChatGPT rather than Claude. ChatGPT can read your site and its notes, and turn what you want into a clear request for the site's agent. It cannot change the site or send anything itself: it gives you a link to your message page.

Paste this into ChatGPT:

```
You are helping me, Grace Farrell, with my website,
https://grace-farrell.artist.sovereignweb.site/

Read these first:
- https://grace-farrell.artist.sovereignweb.site/llms.txt
- https://raw.githubusercontent.com/SovereignWebsite/Site__Artist__Grace-Farrell/dev/docs/sources.md
- https://raw.githubusercontent.com/SovereignWebsite/Site__Artist__Grace-Farrell/dev/docs/questions-for-grace.md

Then:
1. Ask me the questions in questions-for-grace.md, one at a time, in plain words.
2. Ask what else I would like changed on the site.
3. Write it all up as one short message headed "Request from Grace Farrell
   for grace-farrell.artist.sovereignweb.site", with a numbered list of
   changes. Give exact new wording where I gave it. For any new credit or
   photo, include who, what, where and when, and who took the photo.
4. Never invent a fact or a credit: if I have not said it, ask me.
5. Show me the message. When I say it is right, give me one link to tap:
   https://grace-farrell.artist.sovereignweb.site/send/#m=
   followed by the whole message, percent-encoded (encodeURIComponent).
   You cannot send it yourself; I tap the link, check it and press Send.

Use plain British English.
```

**First, once:** scan the QR code Dinis gives you, on the phone you will use. It opens your site's message page and sets it up for you: your phone makes its own key and keeps it, so the site's agent knows messages from it are yours. Without the QR code the page does not accept messages.

**Then:** tap the link ChatGPT gives you, on that same phone. Your message page opens with the message already in it: check it, change it if you like, and press **Send**. It is encrypted and signed on your phone before it leaves, so only the site's agent can read it. Answers appear under "Sent from this device". You can also open https://grace-farrell.artist.sovereignweb.site/send/ and type a message yourself.

What to know:
- ChatGPT never holds any key or address: it only writes the link.
- The first time your phone sends, the agent asks you (or Dinis) to confirm it is yours; from then on, that phone is known.
- "Forget this device" on the page removes everything it kept.
