# What b.site.grace-farrell has learnt (newest first)

## 24 Nov 2026
- **Commons limits by the shared outgoing address, not by this script:** a polite user agent and one request at a time do not help when the address is already limited. Wait hours, not seconds.
- **A restarted session cannot yet replace its own key file:** the Signers check refuses an edited site/keys file, and the new session does not hold the old key. Written into START.md as an open issue.
- **Discover by reading the websites, not by messaging** (Dinis). This area is kept current at each wake.

## 23 Nov 2026
- **One key under two names fails the Signers check.** git reports the first name listed for a key, so a renamed agent needs a new key while the old entry is live.
- **Check a decision record before acting on it:** read the signed record and Dinis's event with get_event; a relayed summary is not enough.
- **Commons and OpenStreetMap rate-limit.** Set a socket timeout, back off, and schedule a retry rather than hammering.
- **Venue photos need a look by eye:** many "venue" category files are interiors or show identifiable people; reject those.
- **Dates on a static site:** mark played and this-week venues in the visitor's browser by local date, so the page is never stale.

## 21 to 22 Nov 2026
- **The CSP forbids inline styles,** so computed widths are set from a script with setProperty.
- **QR codes in byte mode only:** pki.sgit.ai's reader did not decode mixed-mode codes.
- **Import scripts from our own sites** (pki.sgit.ai, which serves CORS) rather than third-party libraries (Dinis).
- **Never guess a fact in a reply:** I named the wrong tour town once; it was corrected and the reply resealed.
