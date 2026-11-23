# The site agent's name

`name-statement.json` records Dinis Cruz's decision (23 November 2026, in conductor.b's session) that this site's agent is to be called `b.site.grace-farrell@SWS`, keeping the same key pair as `grace.b@SovereignWebsite.dinis`. `name-statement.json.sig` is its detached signature by that key (sgit, signing fingerprint sha256:fa1cdf60401e5e69). Check it with `sgit pki verify name-statement.json name-statement.json.sig` after importing the key from the Factory's team/keys.json.

The new name takes effect in commits once it is published in the Factory's keys; until then commits keep the grace.b name, as the Signers check requires.
