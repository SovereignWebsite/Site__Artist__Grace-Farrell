// Writes Grace Farrell's home page and the five design pages from one set of content.
// node tools/build-pages.mjs   (run from the repository root; writes site/index.html, site/designs/*.html)
// The home page uses site/theme.css, a copy of the chosen design's CSS (HOME below). Every fact here comes from
// Grace's Spotlight profile or from Dinis Cruz; see docs/sources.md. Never add one that is not there.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

const HOME = 5; // the design the home page uses; site/theme.css is a copy of site/designs/d<HOME>.css
const ORIGIN = 'https://grace-farrell.artist.sovereignweb.site';
const NAME = 'Grace Farrell';
const DESC = 'Grace Farrell, actor-singer and soprano. National Theatre, Les Misérables, BBC Champion, Diablo IV, and the UK tour of Pride and Prejudice* (*sort of). Represented by Collective Agents.';
const SPOTLIGHT = 'https://app.spotlight.com/1013-7867-4709';
const INSTAGRAM = 'https://www.instagram.com/gracexfarrellx/';
const REEL = 'https://mediaviewer.spotlight.com/artist/showreels?artistRef=F252504&startClipId=a2462337-cb73-4c8f-b479-9407d0395bb4';
const IG_POST = 'https://www.instagram.com/p/CINmLazHR4e/';
const IG_EMBED = 'https://www.instagram.com/p/CINmLazHR4e/embed/';

export const DESIGNS = [
  { n: 1, name: 'Footlights', blurb: 'A dark stage, one warm light' },
  { n: 2, name: 'Fringe flyer', blurb: 'An Edinburgh poster' },
  { n: 3, name: 'Libretto', blurb: 'An opera libretto' },
  { n: 4, name: 'Tour diary', blurb: 'A road map and ticket stubs' },
  { n: 5, name: 'Editorial', blurb: 'A magazine profile' },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dot = ' <span aria-hidden="true">·</span> ';

const CREDITS = [
  ['Cover; debut as Mary Bennet', 'Pride and Prejudice* (*sort of)', 'UK tour, 2026. Directed by Isobel McArthur. Produced by David Pugh.', 'Stage'],
  ['Klytaimestra', 'Flowers for Kassandra', 'Crazy Alter Ego, 2026. Directed by Hariet Isidor.', 'Stage'],
  ['Sue Grimshaw (lead)', 'Falling in Love with Mr Dellamort', 'MTTM Theatrics, Edinburgh Fringe, 2025. International premiere. Directed by Abigail Zealey-Bess.', 'Stage'],
  ['Various (voice)', 'Diablo IV', 'Blizzard, 2025. Directed by Adam Chapman.', 'Studio'],
  ['Susanna Walcott', 'The Crucible', 'National Theatre, Gielgud Theatre, 2023. Directed by Lindsey Turner.', 'Stage'],
  ['Amber', 'Champion', 'New Pictures and Balloon for BBC, television, 2022. Directed by John Ogunmuyiwa.', 'Screen'],
  ['Melissa', 'Left Behind', 'Pretty Hate Productions, short film, 2021. Directed by Matthew Ford.', 'Screen'],
  ['Megara the Jealous', 'Orfeus: A House Music Opera', 'Young Vic Theatre, 2020. Directed by Charles Randolph-Wright.', 'Stage'],
  ['Eliza Doolittle', 'My Fair Lady', 'National Theatre Studio, workshop, 2019. Directed by Joel Fram.', 'Stage'],
  ['Ensemble; 1st Fantine; 2nd Cosette', 'Les Misérables', 'Cameron Mackintosh, 2018. Directed by Sam Hiller.', 'Stage'],
];

const SKILLS = [
  ['Singing', ['Soprano', 'Vocal range D3 to F6', 'Classical', 'Opera', 'Folk', 'Pop', 'Cabaret', 'Choral', 'Harmony', 'Sight-reading', 'Sight-singing']],
  ['Instruments', ['Violin', 'Guitar', 'Piano', 'Keyboards']],
  ['Dance', ['Ballet', 'Ballroom', 'Contemporary', 'Jazz']],
  ['Accents', ['RP', 'Heightened RP', 'Birmingham', 'Black Country', 'Cockney', 'Liverpool', 'Yorkshire', 'Central Scottish', 'Irish: Southern', 'American: Standard', 'American: Southern States', 'Australian']],
  ['Languages', ['English', 'French', 'Italian']],
  ['Performance', ['Actor-singer', 'Musical theatre', 'Actor-musician', 'Voice over']],
  ['Sports', ['Tennis', 'Climbing', 'Football', 'Field hockey', 'Kick boxing', 'Marathon running', 'Scuba diving', 'Shooting', 'Skiing', 'Swimming']],
  ['Other', ['Singing teacher and coach', 'Military training', 'Painting', 'Photography', 'Experienced barista', 'Car driving licence']],
];

const GALLERY = [
  ['reel-white-wall', 'Grace speaking to camera against a white wall', 1400, 788, 'Showreel still: to camera'],
  ['reel-kitchen', 'Grace in a kitchen, looking up, startled', 1400, 753, 'Showreel still: in the kitchen scene'],
];

// The tour map: Britain and Ireland drawn from Natural Earth (public domain), venues placed by latitude and longitude.
const map = JSON.parse(readFileSync('tools/data/map-path.json', 'utf8'));
const tour = JSON.parse(readFileSync('tools/data/tour.json', 'utf8'));
const xy = (lon, lat) => [((lon - map.lon0) * map.k * map.s), ((map.lat1 - lat) * map.s)];
function tourMap() {
  const pts = tour.venues.map((v) => xy(v.lon, v.lat));
  const route = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  const dots = tour.venues.map((v, i) => { const [x, y] = pts[i]; return `<g class="stop" data-start="${v.start}" data-end="${v.end}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8"/><text aria-hidden="true" x="${x.toFixed(1)}" y="${(y + 3.3).toFixed(1)}">${i + 1}</text><title>${i + 1}. ${esc(v.town)}, ${esc(v.venue)}: ${esc(v.when)}</title></g>`; }).join('');
  return `<svg class="map" viewBox="0 0 ${map.w} ${map.h}" role="img" aria-labelledby="map-t"><title id="map-t">Map of Britain and Ireland with the ${tour.venues.length} venues of the tour, numbered in order; the list beside it gives each one.</title><path class="land" d="${map.d}"/><path class="route" d="${route}"/>${dots}</svg>`;
}
const todayISO = new Date().toISOString().slice(0, 10);
const current = () => tour.venues.find((v) => v.start <= todayISO && todayISO <= v.end) || tour.venues.find((v) => v.start > todayISO);
const nowVenue = () => { const v = current(); return v ? `<p class="now-venue" data-now-venue><span class="nv-label">${v.start <= todayISO ? 'This week' : 'Next stop'}</span> <strong>${esc(v.town)}</strong>, ${esc(v.venue)} <span class="when">${esc(v.when)}</span></p>` : ''; };
const tourList = () => `<ol class="stops">${tour.venues.map((v) => `<li data-start="${v.start}" data-end="${v.end}"><strong><a href="/tour/${v.town.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/">${esc(v.town)}</a></strong>, ${esc(v.venue)} <span class="when">${esc(v.when)}</span></li>`).join('')}</ol>`;

const chooser = (cur, rel) => `<details class="chooser">
    <summary>Choose a design</summary>
    <div class="chooser-panel">
      <ul class="cards">${DESIGNS.map((d) => `<li><a href="${rel}designs/${d.n}.html"${d.n === cur ? ' aria-current="page"' : ''}><img src="${rel}images/shots/d${d.n}-640.webp" alt="" width="640" height="400" loading="lazy" decoding="async"><strong>${d.n}. ${d.name}</strong><span>${d.blurb}</span></a></li>`).join('')}</ul>
      <p class="all"><a href="${rel}designs/">All five, side by side</a></p>
    </div>
  </details>`;

const family = `<details class="family-credit">
  <summary><span aria-hidden="true">⋮</span><span class="vh">Sovereign Website</span></summary>
  <ul>
    <li><a href="/start/">Start here</a></li>
    <li><a href="/agents/">Use with your AI</a></li>
    <li class="family-gap"><a href="/admin/">How this site was made</a></li>
    <li><a href="https://sovereignwebsite.ai/">Sovereign Website</a></li>
    <li><a href="https://sovereignwebsite.org/">Principles</a></li>
    <li><a href="https://sovereignwebsite.site/">Hosted</a></li>
    <li><a href="https://hub.sovereignweb.site/">Hub</a></li>
    <li><a href="https://agents.sovereignweb.site/">Agents</a></li>
    <li><a href="https://vault.sovereignwebsite.site/">Vault</a></li>
    <li><a href="https://agenticcells.ai/">AgentiCCells</a></li>
    <li><a href="https://riskmandate.ai/">RiskMandate</a></li>
    <li><a href="https://newsroom.sgit.ai/">Newsroom</a></li>
  </ul>
</details>`;

function head({ title, url, css, rel }) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self' https://pki.sgit.ai; connect-src 'self' https://dev.send.sgraph.ai; frame-src https://mediaviewer.spotlight.com https://www.instagram.com; object-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(DESC)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${NAME}">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/assets/share/card-1200x630.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Grace Farrell, actor-singer and soprano, beside her headshot (photo Jennie Scott)">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(DESC)}">
<meta name="twitter:image" content="${ORIGIN}/assets/share/card-1200x630.jpg">
<meta name="twitter:image:alt" content="Grace Farrell, actor-singer and soprano, beside her headshot (photo Jennie Scott)">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${rel}base.css">
<link rel="stylesheet" href="${css}">
<script src="${rel}site.js" defer></script>
<link rel="stylesheet" href="/send/sws-inbox.css">
<link rel="stylesheet" href="/send/sws-site.css">
<script type="module" src="/send/qrimage.mjs"></script>
<script src="/send/sws-inbox.js" data-base="/send/" defer></script>
</head>`;
}

const bar = (cur, rel, home) => `<header class="bar">
  <a class="brand" href="${rel || './'}">${NAME}</a>
  <nav aria-label="Sections">${[['about', 'About'], ['credits', 'Credits'], ['reels', 'Reels'], ['tour', 'Tour'], ['skills', 'Skills'], ['contact', 'Contact']].map(([id, t]) => `<a href="${home}#${id}">${t}</a>`).join('')}</nav>
  <div class="bar-right">${chooser(cur, rel)}
  ${family}</div>
</header>`;
const footer = (rel) => `<footer>
  <p class="foot-links"><a href="${rel}start/">Start here</a>${dot}<a href="${rel}agents/">Use this site with your AI</a>${dot}<a href="${rel}llms.txt">llms.txt</a>${dot}<a href="${rel}admin/">How this site was made</a>${dot}<a href="${rel}designs/">All five designs</a>${dot}<a href="/send/">Messages</a>${dot}<a href="${rel}policy/">How the agents are governed</a></p>
  <p>A sovereign website: Grace's own files, history and address. No cookies, no tracking, no third-party scripts. The videos come from Spotlight and Instagram only when you press play. Text licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; photographs remain their photographers'. Source: <a href="https://github.com/SovereignWebsite/Site__Artist__Grace-Farrell">SovereignWebsite/Site__Artist__Grace-Farrell</a>.</p>
</footer>`;

// Each design arranges the same blocks in its own way: its own opening, its own way of showing the credits,
// its own order and its own section names. The words, photographs and facts are the same in all five.
const LABELS = {
  1: { about: 'The biography', credits: 'The programme', reels: 'On screen', tour: 'On the road', skills: 'Notes', contact: 'Representation' },
  2: { about: 'The back of the flyer', credits: 'Front of the flyer', reels: 'On screen', tour: 'Touring now', skills: 'Small print', contact: 'Tear off and keep' },
  3: { about: 'Front matter', credits: 'Performances', reels: 'Interlude', tour: 'The journey', skills: 'Back matter', contact: 'Enquiries' },
  4: { about: 'About', credits: 'Ticket stubs', reels: 'Footage', tour: 'Where the tour goes', skills: 'Packed for the road', contact: 'Agent' },
  5: { about: 'Profile', credits: 'The work', reels: 'In motion', tour: 'On tour', skills: 'Range', contact: 'Representation' },
};

function page(cur, rel) {
  const L = LABELS[cur];
  const img = (n, w) => `${rel}images/${n}-${w}.webp`;
  const headshot = (sizes, extra = '') => `<img src="${img('headshot', 960)}" srcset="${img('headshot', 640)} 640w, ${img('headshot', 960)} 960w" sizes="${sizes}" alt="Grace Farrell, head and shoulders, in a black top against a dark backdrop" width="960" height="1440"${extra}>`;
  const credit = '<figcaption class="photo-credit">Photo © Jennie Scott</figcaption>';
  const nowOn = `<a class="to-tour" href="#tour">On tour${dot}<em>Pride and Prejudice* (*sort&nbsp;of)</em></a>`;
  const headline = `Grace is a cover in the 2026 to 2027 UK and Ireland tour of <em>Pride and Prejudice* (*sort&nbsp;of)</em>, and made her debut as Mary Bennet on it. In 2025 she starred as Sue Grimshaw in the international premiere of <em>Falling in Love with Mr Dellamort</em> at the Edinburgh Fringe.`;
  const facts = `<p class="strip-facts">Range D3 to F6${dot}violin, guitar, piano${dot}English, French, Italian</p>`;
  const cta = `<p class="cta"><a class="btn primary" href="#contact">Contact her agent</a> <a class="btn ghost" href="#reels">Showreel</a> <span class="links"><a href="${SPOTLIGHT}">Spotlight profile</a>${dot}<a href="${INSTAGRAM}">Instagram</a></span></p>\n    <p class="agent-line">Agent: Amy McGivern, Collective Agents${dot}<a href="tel:+442046354212" aria-label="Call her agent">Call</a>${dot}<a href="mailto:info@collectiveagents.co.uk" aria-label="Email her agent">Email</a></p>`;
  const plain = (t) => t.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().toLowerCase();
  const sec = (id, cls, title, inner) => `<section id="${id}" class="${cls}" aria-labelledby="${id}-h">\n  ${plain(L[id]) === plain(title) ? '' : `<p class="kicker">${L[id]}</p>`}\n  <h2 id="${id}-h">${title}</h2>\n${inner}\n</section>`;

  // the opening, five ways
  const covers = {
    1: `<section class="cover cover-stage" id="top" aria-labelledby="name">
  <div class="proscenium">
    <div class="stage-centre">
      <p class="kicker">On tour now</p>
      <p class="role-line">Debut as Mary Bennet in <em>Pride and Prejudice* (*sort&nbsp;of)</em></p>
      <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
      <p class="sub">Actor-singer and soprano</p>
      ${facts}${cta}
    </div>
    <figure class="cover-photo programme-photo">${headshot('(max-width: 50rem) 40vw, 12rem', ' fetchpriority="high"')}${credit}</figure>
  </div>
  <p class="lead">${headline}</p>
</section>`,
    2: `<section class="cover cover-poster" id="top" aria-labelledby="name">
  <div class="a5">
    <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
    <p class="kicker sticker">${nowOn}</p>
    <p class="sub">Actor-singer <span aria-hidden="true">/</span> soprano</p>
    <figure class="cover-photo">${headshot('(max-width: 50rem) 70vw, 20rem', ' fetchpriority="high"')}${credit}</figure>
    <p class="lead strip">A cover in the UK and Ireland tour of <em>Pride and Prejudice* (*sort&nbsp;of)</em>, with her debut as Mary Bennet.</p>
    ${facts}${cta}
  </div>
</section>`,
    3: `<section class="cover cover-title" id="top" aria-labelledby="name">
  <p class="kicker">${nowOn}</p>
  <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
  <p class="sub">Actor-singer and soprano</p>
    ${facts}${cta}
  <figure class="cover-photo oval">${headshot('(max-width: 50rem) 60vw, 18rem', ' fetchpriority="high"')}${credit}</figure>
  <p class="lead">${headline}</p>
</section>`,
    4: `<section class="cover cover-passport" id="top" aria-labelledby="name">
  <div class="ticket-now">${nowVenue()}<p class="tk-show"><em>Pride and Prejudice* (*sort&nbsp;of)</em>, UK and Ireland tour</p><p class="tk-small">The production's venue this week. <a href="https://prideandprejudicesortof.com/tour-dates/">Tickets on the tour's page</a></p></div>
  <div class="passport">
    <figure class="cover-photo">${headshot('(max-width: 50rem) 90vw, 14rem', ' fetchpriority="high"')}${credit}</figure>
    <div class="cover-text">
      <p class="kicker">${nowOn}</p>
      <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
      ${facts}${cta}
      <dl class="id-lines"><div><dt>Occupation</dt><dd>Actor-singer, soprano</dd></div><div><dt>Based</dt><dd>Greater London and the West Midlands</dd></div><div><dt>Languages</dt><dd>English, French, Italian</dd></div></dl>
    </div>
  </div>
  <div class="cover-aside"><details class="map-box" open><summary>Show the map</summary>${tourMap()}</details><p class="lead">${headline}</p></div>
</section>`,
    5: `<section class="cover cover-mag" id="top" aria-labelledby="name">
  <div class="mag-cover">
    <figure class="cover-photo">${headshot('100vw', ' fetchpriority="high"')}${credit}</figure>
    <div class="masthead">
      <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
      <p class="sub">Actor-singer and soprano</p>
    </div>
    <ul class="cover-lines" aria-label="In this profile"><li><em>The Crucible</em> at the Gielgud</li><li>Voice of <em>Diablo IV</em></li><li>Debut as Mary Bennet</li>${(() => { const v = current(); return v ? `<li class="cl-now" data-now-venue><a href="#tour"><span class="nv-label">${v.start <= todayISO ? 'This week' : 'Next stop'}</span> <strong>${esc(v.town)}</strong></a></li>` : ''; })()}<li class="cl-tour">${nowOn}</li></ul>
  </div>
  <div class="mag-bar">${facts}${cta}</div>
  <div class="standfirst"><p class="lead">${headline}</p></div>
</section>`,
  };

  const aboutText = `<div class="prose">
  <p>Grace Farrell is an actor-singer and soprano, based in Greater London and the West Midlands. Her stage work runs from <em>Les Misérables</em> for Cameron Mackintosh and the Young Vic's <em>Orfeus: A House Music Opera</em> to Susanna Walcott in the National Theatre's <em>The Crucible</em> at the Gielgud Theatre, and Eliza Doolittle in a National Theatre Studio workshop of <em>My Fair Lady</em>.</p>
  <p>On screen she played Amber in the BBC's <em>Champion</em>, and her voice is in Blizzard's <em>Diablo IV</em>. In 2025 she led the international premiere of <em>Falling in Love with Mr Dellamort</em> at the Edinburgh Fringe. In 2026 she played Klytaimestra in <em>Flowers for Kassandra</em>, and joined the UK tour of <em>Pride and Prejudice* (*sort of)</em>, making her debut as Mary Bennet.</p>
  <p>She sings classical, opera, folk, pop and cabaret, plays violin, guitar and piano, speaks English, French and Italian, and teaches singing.</p>
</div>`;
  const pull = cur === 5 ? `<blockquote class="pull"><p>From the National Theatre to Blizzard's <em>Diablo IV</em>, and on tour as Mary Bennet.</p></blockquote>` : '';
  const about = sec('about', 'about', { 1: 'Stage, screen and studio', 2: 'Sings. Acts. Plays.', 3: 'In which our soprano is introduced', 4: 'Stage, screen and studio', 5: 'Stage, screen and studio' }[cur], pull + aboutText);

  // the credits, five ways
  const c = CREDITS.map(([role, prod, by, medium]) => ({ role: esc(role), prod: esc(prod), by: esc(by), medium, year: (by.match(/20\d\d/) || [''])[0] }));
  const row1 = (x) => `<li><span class="role">${x.role}</span><span class="dots" aria-hidden="true"></span><span class="prod"><em>${x.prod}</em></span><span class="by">${x.by}</span></li>`;
  const creditsInner = {
    1: `<div class="acts">${[['Act one', 'Stage'], ['Act two', 'Screen'], ['Act three', 'Studio']].map(([act, m]) => `<div class="act"><h3><span>${act}</span> ${m}</h3><ol class="cast cast-dots">${c.filter((x) => x.medium === m).map(row1).join('')}</ol></div>`).join('')}</div>`,
    2: `<div class="flyer-show"><p class="fs-top">Edinburgh Fringe 2025<span aria-hidden="true"> · </span>International premiere</p><p class="fs-title"><em>Falling in Love with Mr Dellamort</em></p><p class="fs-cast">Grace Farrell as Sue Grimshaw (lead). Directed by Abigail Zealey-Bess. MTTM Theatrics.</p></div><ol class="cast cast-flyers">${c.map((x) => `<li><span class="year">${x.year}</span><span class="prod"><em>${x.prod}</em></span><span class="role">${x.role}</span><span class="by">${x.by}</span></li>`).join('')}</ol>`,
    3: `<ol class="cast cast-personae">${c.map((x) => `<li><span class="year">${x.year}</span><span class="role">${x.role}</span><span class="prod">in <em>${x.prod}</em></span><span class="by">${x.by}</span></li>`).join('')}</ol>`,
    4: `<ol class="cast cast-stubs">${c.map((x, i) => `<li><span class="stub-no" aria-hidden="true">No. ${String(i + 1).padStart(3, '0')}</span><span class="prod"><em>${x.prod}</em></span><span class="role">${x.role}</span><span class="by">${x.by}</span><span class="year">${x.year}</span></li>`).join('')}</ol>`,
    5: `<ol class="cast cast-index">${c.map((x) => `<li><span class="year">${x.year}</span><span class="prod"><em>${x.prod}</em></span><span class="role">${x.role}</span><span class="by">${x.by}</span></li>`).join('')}</ol>`,
  }[cur];
  const credits = sec('credits', 'credits', { 1: 'Credits', 2: 'Shows', 3: 'Dramatis personae', 4: 'Credits', 5: 'Selected credits' }[cur], creditsInner);

  const reelsInner = `  <p class="note">Nothing is sent to Spotlight or Instagram until you press play. Then your browser loads their player, which sees your IP address and may set its own cookies.</p>
  <div class="reels">
    <figure class="reel">
      <div class="frame" data-src="${esc(REEL)}" data-title="Grace Farrell: acting showreel">
        <a class="play" href="${esc(REEL)}">
          <img src="${img('reel-cream-jacket', 1400)}" srcset="${img('reel-cream-jacket', 640)} 640w, ${img('reel-cream-jacket', 1400)} 1400w" sizes="(max-width: 50rem) 100vw, 50vw" alt="" width="1400" height="741" loading="lazy" decoding="async">
          <span class="reel-bar"><span class="reel-title">Acting showreel</span><span class="icon" aria-hidden="true"></span><span>Play on Spotlight</span><span class="dur">4 min 58 s</span></span>
        </a>
      </div>
      <figcaption class="meta">The poster is a still from the showreel, in the cream jacket scene.</figcaption>
    </figure>
    <figure class="reel">
      <div class="frame ig" data-src="${esc(IG_EMBED)}" data-title="Grace Farrell singing, on Instagram">
        <a class="play" href="${esc(IG_POST)}">
          <img src="${img('instagram-microphone', 1296)}" srcset="${img('instagram-microphone', 640)} 640w, ${img('instagram-microphone', 1296)} 1296w" sizes="(max-width: 50rem) 100vw, 50vw" alt="" width="1296" height="729" loading="lazy" decoding="async">
          <span class="reel-bar"><span class="reel-title">At the microphone</span><span class="icon" aria-hidden="true"></span><span>Play on Instagram</span></span>
        </a>
      </div>
      <figcaption class="meta">Still from the video, Instagram @gracexfarrellx. <a href="${IG_POST}">Open on Instagram</a></figcaption>
    </figure>
  </div>
  <div class="gallery">${GALLERY.map(([n, alt, w, h, cap]) => `<figure><a href="${img(n, 1400)}"><img src="${img(n, 640)}" srcset="${img(n, 640)} 640w, ${img(n, 1400)} 1400w" sizes="(max-width: 50rem) 100vw, 33vw" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async"></a><figcaption>${cap}</figcaption></figure>`).join('')}</div>`;
  const reels = sec('reels', 'reels-sec', { 1: 'Showreel and video', 2: 'Watch her', 3: 'Showreel and song', 4: 'Showreel and video', 5: 'Showreel and video' }[cur], reelsInner);

  const tourInner = `  <p class="tour-intro">Isobel McArthur's Olivier Award-winning comedy tours the UK and Ireland from September 2026 to May 2027. These are the production's ${tour.venues.length} venues; dates for 2027 are from <a href="https://prideandprejudicesortof.com/tour-dates/">the tour's own page</a>, where tickets are sold.</p>
  <div class="tour-grid${cur === 4 ? ' list-only' : ''}">${cur === 4 ? '' : `<details class="map-box" open><summary>Show the map</summary>${tourMap()}</details>`}${tourList()}</div>
  <p class="tv-link"><a href="${rel}tour/">Every stop, with photos and what is near each venue</a>${dot}<a href="${rel}tour/views/">the tour in six views</a></p>
  <p class="note map-note">Map: Natural Earth (public domain). Venues already played are faded on the map and marked "played" in the list.</p>`;
  const tourSec = sec('tour', 'tour', `<em>Pride and Prejudice* (*sort of)</em>${cur === 4 ? ', town by town' : ' on tour'}`, tourInner);

  const voice = cur === 3 ? `  <p class="voice-line">Voice: soprano, D3 to F6. Instruments: violin, guitar, piano, keyboards.</p>\n` : '';
  const skills = sec('skills', 'skills', { 1: 'Skills', 2: 'Can do', 3: 'Instrumentation', 4: 'Skills', 5: 'Skills' }[cur], `${voice}  <div class="note-cols">${SKILLS.map(([h, xs]) => `<div><h3>${h}</h3><p>${xs.map(esc).join(dot)}</p></div>`).join('')}</div>
  <dl class="facts"><div><dt>Playing age</dt><dd>20 to 30</dd></div><div><dt>Nationalities</dt><dd>British, Italian</dd></div><div><dt>Location</dt><dd>Greater London and the West Midlands</dd></div></dl>`);

  const contact = sec('contact', 'contact', 'Collective Agents', `  <p>For casting and all enquiries, please contact Grace's agent, Amy McGivern.</p>
  <address>
    <strong>Amy McGivern, Collective Agents</strong><br>
    12 Red Lion Square, Holborn<br>
    London WC1R 4QH<br>
    <a href="tel:+442046354212">020 4635 4212</a><br>
    <a href="mailto:info@collectiveagents.co.uk">info@collectiveagents.co.uk</a>
  </address>
  <p><a href="${SPOTLIGHT}">Spotlight profile</a>${dot}<a href="${INSTAGRAM}">Instagram @gracexfarrellx</a></p>${cur === 2 ? `
  <ul class="tabs" aria-label="Tear-off contacts"><li><a href="tel:+442046354212">Agent 020 4635 4212</a></li><li><a href="mailto:info@collectiveagents.co.uk">info@collectiveagents.co.uk</a></li><li><a href="${SPOTLIGHT}">Spotlight</a></li><li><a href="${INSTAGRAM}">Instagram</a></li></ul>` : ''}`);

  const order = {
    1: [about, credits, reels, tourSec, skills, contact],
    2: [credits, reels, tourSec, about, skills, contact],
    3: [about, credits, skills, reels, tourSec, contact],
    4: [tourSec, credits, reels, about, skills, contact],
    5: [about, reels, credits, skills, tourSec, contact],
  }[cur];

  return `<body class="design-${cur}">
<a class="skip" href="#main">Skip to content</a>
${bar(cur, rel, '')}
<main id="main" tabindex="-1">
${covers[cur]}
${order.join('\n')}
</main>
${footer(rel)}
</body>
</html>
`;
}

mkdirSync('site/designs', { recursive: true });
writeFileSync('site/index.html', head({ title: NAME, url: `${ORIGIN}/`, css: 'theme.css', rel: '' }) + '\n' + page(HOME, ''));
for (const d of DESIGNS) writeFileSync(`site/designs/${d.n}.html`, head({ title: `${d.name} design, ${NAME}`, url: `${ORIGIN}/designs/${d.n}.html`, css: `d${d.n}.css`, rel: '../' }) + '\n' + page(d.n, '../'));
copyFileSync(`site/designs/d${HOME}.css`, 'site/theme.css');

// The owner pages (start, agents, admin): their words stay in the page between <!-- content --> markers, so the
// owner can edit them directly; this wraps them in the site's bar, styles and footer.
for (const name of ['start', 'agents', 'admin', 'policy']) {
  const f = `site/${name}/index.html`; const h = readFileSync(f, 'utf8');
  const pick = (re) => (h.match(re) || [])[1];
  let body = pick(/<!-- content -->\n([\s\S]*?)<!-- \/content -->/);
  if (!body) body = pick(/<main id="main"[^>]*>\n?([\s\S]*?)<\/main>/).replace(/<footer>[\s\S]*?<\/footer>\s*$/, '').replace(/<div class="mark">([^<]*)<\/div>/, '<p class="kicker">$1</p>');
  const title = pick(/<title>([^<]*)<\/title>/), desc = pick(/<meta name="description" content="([^"]*)">/);
  const top = head({ title: title.replace(/&amp;/g, '&'), url: `${ORIGIN}/${name}/`, css: '../theme.css', rel: '../' }).replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*(">)/g, `$1${desc}$2`);
  writeFileSync(f, `${top}\n<body class="doc-page">\n<a class="skip" href="#main">Skip to content</a>\n${bar(HOME, '../', '../')}\n<main id="main" class="doc" tabindex="-1">\n<!-- content -->\n${body.trim()}\n<!-- /content -->\n</main>\n${footer('../')}\n</body>\n</html>\n`);
}

// The link page: a chat assistant writes /send/#m=<message>; Grace checks it and presses Send (site/send/send.js).
writeFileSync('site/send/index.html', head({ title: `Message Grace's site agent`, url: `${ORIGIN}/send/`, css: '../theme.css', rel: '../' })
  .replace("frame-src https://mediaviewer.spotlight.com https://www.instagram.com;", "frame-src 'none';")
  .replace('<meta name="referrer"', '<meta name="robots" content="noindex">\n<meta name="referrer"')
  .replace(/<script src="[^"]*site\.js" defer><\/script>/, '<script src="open-pane.js" defer></script>') + `
<body class="doc-page">
<a class="skip" href="#main">Skip to content</a>
${bar(HOME, '../', '../')}
<main id="main" class="doc send" tabindex="-1">
<p class="kicker">Messages</p>
<h1>Message Grace's site agent</h1>
<p>Your messages open in the <strong>Messages</strong> pane, on the right of every page of this site (full screen on a phone). Press <strong>Messages</strong> at the bottom right to open it again.</p>
<h2>The first time, on each device</h2>
<p>Drop the QR code image you were sent into the pane, paste it, or paste its link. Your device then makes its own key and keeps it, so the site's agent knows messages from it are yours. Without the QR code the pane does not accept messages.</p>
<h2>Then</h2>
<p>Write a request in the pane, on any page: it notes which page you were on. It is encrypted and signed on your device before it leaves. The agent reads its inbox every hour from 10:00 to 22:00 UK time and answers in the pane. Think of it as a slow inbox for lots of little requests.</p>
</main>
${footer('../')}
</body>
</html>
`);

// The tour in several views, from the same data as the map (tools/data/tour.json). Dinis, 23 Nov 2026: "create
// multiple representations of this, in a separate page".
{
  const COUNTRY = { Mold: 'Wales', Cardiff: 'Wales', Edinburgh: 'Scotland', Glasgow: 'Scotland', Belfast: 'Northern Ireland', Dublin: 'Ireland' }
  const country = (v) => COUNTRY[v.town] || 'England'
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const V = tour.venues.map((v, i) => ({ ...v, n: i + 1, country: country(v) }))
  const km = (a, b) => { const R = 6371, r = (x) => x * Math.PI / 180, dLa = r(b.lat - a.lat), dLo = r(b.lon - a.lon); const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)) }
  const legs = V.slice(1).map((v, i) => ({ from: V[i], to: v, km: km(V[i], v) }))
  const total = legs.reduce((n, l) => n + l.km, 0), longest = Math.max(...legs.map((l) => l.km))
  const mi = (k) => Math.round(k * 0.621371)
  const attrs = (v) => `data-start="${v.start}" data-end="${v.end}"`
  const name = (v) => `<strong>${esc(v.town)}</strong>, ${esc(v.venue)}`

  const timeline = `<ol class="tv-timeline">${V.map((v) => `<li ${attrs(v)}><span class="tv-n" aria-hidden="true">${v.n}</span><span class="tv-when">${esc(v.when)}</span> ${name(v)}</li>`).join('')}</ol>`
  const groups = ['England', 'Wales', 'Scotland', 'Northern Ireland', 'Ireland'].map((c) => { const xs = V.filter((v) => v.country === c); return `<section class="tv-group"><h3>${c} <span class="tv-count">${xs.length}</span></h3><ul>${xs.map((v) => `<li ${attrs(v)}>${name(v)} <span class="tv-when">${esc(v.when)}</span></li>`).join('')}</ul></section>` }).join('')
  const months = []; for (let y = 2026, m = 8; y < 2027 || m <= 4; m++) { if (m > 11) { m = 0; y++ } months.push([y, m]); if (y === 2027 && m === 4) break }
  const calendar = `<div class="tv-cal">${months.map(([y, m]) => { const key = `${y}-${String(m + 1).padStart(2, '0')}`, xs = V.filter((v) => v.start.slice(0, 7) === key || v.end.slice(0, 7) === key); return `<section class="tv-month${xs.length ? '' : ' tv-empty'}"><h3>${MONTHS[m]} ${y}</h3>${xs.length ? `<ul>${xs.map((v) => `<li ${attrs(v)}>${esc(v.town)}</li>`).join('')}</ul>` : '<p>No dates</p>'}</section>` }).join('')}</div>`
  const route = `<p>About <strong>${Math.round(total).toLocaleString('en-GB')} km</strong> (${mi(total).toLocaleString('en-GB')} miles) from Chelmsford to Horsham, venue to venue in a straight line. The real roads and the ferries to Belfast and Dublin are longer.</p><ol class="tv-legs">${legs.map((l) => `<li><span class="tv-leg">${esc(l.from.town)} to ${esc(l.to.town)}</span><span class="tv-bar" data-w="${(l.km / longest * 100).toFixed(1)}" aria-hidden="true"></span><span class="tv-km">${Math.round(l.km)} km</span></li>`).join('')}</ol>`
  const status = `<div class="tv-status"><section><h3>Played</h3><ul id="tv-played"></ul></section><section><h3>Still to come</h3><ul id="tv-coming">${V.map((v) => `<li ${attrs(v)}>${name(v)} <span class="tv-when">${esc(v.when)}</span></li>`).join('')}</ul></section></div>`
  const table = `<div class="tv-tablewrap" tabindex="0" role="region" aria-label="All venues, a table you can scroll"><table class="tv-table"><caption>All ${V.length} venues</caption><thead><tr><th scope="col">No.</th><th scope="col">Town</th><th scope="col">Venue</th><th scope="col">Country</th><th scope="col">Dates</th></tr></thead><tbody>${V.map((v) => `<tr ${attrs(v)}><td>${v.n}</td><th scope="row">${esc(v.town)}</th><td>${esc(v.venue)}</td><td>${v.country}</td><td>${esc(v.when)}</td></tr>`).join('')}</tbody></table></div>`

  const sec = (id, title, intro, body) => `<section class="tv" id="${id}" aria-labelledby="${id}-h"><h2 id="${id}-h">${title}</h2>${intro ? `<p class="note">${intro}</p>` : ''}${body}</section>`
  mkdirSync('site/tour/views', { recursive: true })
  writeFileSync('site/tour/views/index.html', head({ title: `The tour in six views: ${NAME}`, url: `${ORIGIN}/tour/views/`, css: '../../theme.css', rel: '../../' }).replace('<script src="../../site.js" defer></script>', '<script src="../../site.js" defer></script>\n<script src="views.js" defer></script>') + `
<body class="doc-page">
<a class="skip" href="#main">Skip to content</a>
${bar(HOME, '../../', '../../')}
<main id="main" class="doc views" tabindex="-1">
<p class="kicker">On the road</p>
<h1>The tour in six views</h1>
<p>The UK and Ireland tour of <em>Pride and Prejudice* (*sort&nbsp;of)</em>, from September 2026 to May 2027, shown six ways. Every view reads the same list of ${V.length} venues as <a href="../../#tour">the map on the home page</a>. These are the production's venues and dates; Grace is a cover in the company. Tickets are on <a href="https://prideandprejudicesortof.com/tour-dates/">the tour's own page</a>.</p>
<nav class="tv-nav" aria-label="Views"><a href="#timeline">Timeline</a><a href="#countries">By country</a><a href="#calendar">Calendar</a><a href="#route">Route</a><a href="#played">Played and to come</a><a href="#table">Table</a></nav>
${sec('timeline', 'Timeline', 'In order, from the first night to the last.', timeline)}
${sec('countries', 'By country', 'Where the tour plays, nation by nation.', groups)}
${sec('calendar', 'Calendar', 'Month by month; December 2026 and early January 2027 have no dates.', calendar)}
${sec('route', 'Route', 'Each leg of the journey, longest bar for the longest leg.', route)}
${sec('played', 'Played and to come', 'By your own date.', status)}
${sec('table', 'Table', '', table)}
<p class="note">Autumn 2026 venues show the month only, as the tour's own page no longer lists those dates. Map and venues: <a href="../../#tour">the tour on the home page</a>.</p>
</main>
${footer('../../')}
</body>
</html>
`)
}

// A page for each venue, and /tour/ listing them (Dinis, 23 Nov 2026, in the Messages pane: "adding pics from the
// venue and even a nice guide ... on what is near to the venue", "travel instructions from one venue to the other").
// Photos and places come from tools/data/venues-extra.json (tools/fetch_venue_data.py), each with its source.
{
  let extra = {}; try { extra = JSON.parse(readFileSync('tools/data/venues-extra.json', 'utf8')) } catch { }
  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const V = tour.venues.map((v, i) => ({ ...v, n: i + 1, slug: slug(v.town), x: extra[slug(v.town)] || {} }))
  const km = (a, b) => { const R = 6371, r = (x) => x * Math.PI / 180, dLa = r(b.lat - a.lat), dLo = r(b.lon - a.lon); const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)) }
  const IRISH = new Set(['Belfast', 'Dublin'])
  const credit = (ph) => `Photo: ${esc(ph.author)}, <a href="${esc(ph.page)}">Wikimedia Commons</a>, <a href="${esc(ph.licence_url || ph.page)}">${esc(ph.licence)}</a>`
  const pic = (v, sizes, lazy) => { const ph = v.x.photo; if (!ph) return ''; const [w, h] = ph.size || [1400, 933]; const H = Math.round(Math.min(1400, w) * h / w); return `<img src="../../images/venues/${v.slug}-1400.webp" srcset="../../images/venues/${v.slug}-640.webp 640w, ../../images/venues/${v.slug}-1400.webp 1400w" sizes="${sizes}" alt="${esc(v.venue)}, ${esc(v.town)}, from outside" width="${Math.min(1400, w)}" height="${H}"${lazy ? ' loading="lazy"' : ''} decoding="async">` }
  const travel = (a, b) => {
    const d = Math.round(km(a, b)), maps = `https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lon}&destination=${b.lat},${b.lon}&travelmode=transit`
    const sea = IRISH.has(a.town) !== IRISH.has(b.town)
    return `<p>${esc(b.town)} is about <strong>${d} km</strong> (${Math.round(d * 0.621371)} miles) from ${esc(a.town)} in a straight line${sea ? ', across the Irish Sea' : ''}.</p>
<ul class="vt-links"><li><a href="${maps}">Public transport directions</a> (Google Maps)</li><li><a href="https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lon}&destination=${b.lat},${b.lon}&travelmode=driving">Driving directions</a> (Google Maps)</li>${sea ? '<li><a href="https://www.directferries.co.uk/">Ferry crossings</a> (Direct Ferries), or fly</li>' : '<li><a href="https://www.nationalrail.co.uk/">Train times</a> (National Rail)</li>'}</ul>
<p class="note">These open the other site only when you choose them; nothing is sent from this page.</p>`
  }
  mkdirSync('site/tour', { recursive: true })
  for (const [i, v] of V.entries()) {
    const prev = V[i - 1], next = V[i + 1], dir = `site/tour/${v.slug}`; mkdirSync(dir, { recursive: true })
    const near = v.x.nearby && v.x.nearby.places && v.x.nearby.places.length ? `<ul class="vn-list">${v.x.nearby.places.map((p) => `<li><span class="vn-kind">${esc(p.kind)}</span> <a href="${esc(p.osm)}">${esc(p.name)}</a> <span class="vn-m">${p.metres < 1000 ? p.metres + ' m' : (p.metres / 1000).toFixed(1) + ' km'}</span></li>`).join('')}</ul><p class="note">From <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> (ODbL), read ${esc(v.x.nearby.read)}: places within about 600 m, straight-line distance. Check opening times before you go.</p>` : '<p class="note">No nearby places were found in OpenStreetMap for this venue yet.</p>'
    const stay = `<ul class="vt-links"><li><a href="https://www.google.com/maps/search/hotels/@${v.lat},${v.lon},16z">Hotels near ${esc(v.venue)}</a> (Google Maps)</li><li><a href="https://www.openstreetmap.org/search?query=hotel%20near%20${encodeURIComponent(v.town)}#map=16/${v.lat}/${v.lon}">Hotels on OpenStreetMap</a></li></ul><p class="note">Plain searches, no affiliate links; no recommendation is made.</p>`
    writeFileSync(`${dir}/index.html`, head({ title: `${v.town}, ${v.venue}: ${NAME} on tour`, url: `${ORIGIN}/tour/${v.slug}/`, css: '../../theme.css', rel: '../../' }) + `
<body class="doc-page">
<a class="skip" href="#main">Skip to content</a>
${bar(HOME, '../../', '../../')}
<main id="main" class="doc venue" tabindex="-1">
<p class="kicker"><a href="../">The tour</a>, stop ${v.n} of ${V.length}</p>
<h1>${esc(v.town)}</h1>
<p class="vh-sub"><strong>${esc(v.venue)}</strong> <span class="tv-when" data-start="${v.start}" data-end="${v.end}">${esc(v.when)}</span></p>
${v.x.photo ? `<figure class="vh-photo">${pic(v, '(max-width: 46rem) 100vw, 46rem', false)}<figcaption>${credit(v.x.photo)}</figcaption></figure>` : ''}
<p>A stop on the UK and Ireland tour of <em>Pride and Prejudice* (*sort&nbsp;of)</em>. These are the production's dates; Grace is a cover in the company. <a href="https://prideandprejudicesortof.com/tour-dates/">Tickets on the tour's page</a>.</p>
<section class="vs" aria-labelledby="near-h"><h2 id="near-h">Near the venue</h2>${near}</section>
${next ? `<section class="vs" aria-labelledby="next-h"><h2 id="next-h">Next stop: <a href="../${next.slug}/">${esc(next.town)}</a></h2>${travel(v, next)}</section>` : '<section class="vs"><h2>The last stop</h2><p>The tour ends here.</p></section>'}
<section class="vs" aria-labelledby="stay-h"><h2 id="stay-h">Places to stay</h2>${stay}</section>
<nav class="vp" aria-label="Tour stops">${prev ? `<a href="../${prev.slug}/">← ${esc(prev.town)}</a>` : '<span></span>'}<a href="../">All stops</a>${next ? `<a href="../${next.slug}/">${esc(next.town)} →</a>` : '<span></span>'}</nav>
</main>
${footer('../../')}
</body>
</html>
`)
  }
  writeFileSync('site/tour/index.html', head({ title: `The tour, stop by stop: ${NAME}`, url: `${ORIGIN}/tour/`, css: '../theme.css', rel: '../' }) + `
<body class="doc-page">
<a class="skip" href="#main">Skip to content</a>
${bar(HOME, '../', '../')}
<main id="main" class="doc views" tabindex="-1">
<p class="kicker">On the road</p>
<h1>The tour, stop by stop</h1>
<p>All ${V.length} venues of the UK and Ireland tour of <em>Pride and Prejudice* (*sort&nbsp;of)</em>, each with a photo, what is near it, how to get to the next stop, and places to stay. Or see <a href="views/">the tour in six views</a>.</p>
<ol class="vc-grid">${V.map((v) => `<li data-start="${v.start}" data-end="${v.end}"><a href="${v.slug}/">${v.x.photo ? pic({ ...v, slug: v.slug }, '(max-width: 40rem) 100vw, 20rem', true).replace(/\.\.\/\.\.\/images/g, '../images') : '<span class="vc-nopic" aria-hidden="true"></span>'}<span class="vc-n">${v.n}</span><strong>${esc(v.town)}</strong><span class="vc-venue">${esc(v.venue)}</span><span class="tv-when">${esc(v.when)}</span></a></li>`).join('')}</ol>
<p class="note">Photos from Wikimedia Commons, each credited on its venue's page. Places near each venue from OpenStreetMap contributors.</p>
</main>
${footer('../')}
</body>
</html>
`)
}

// The side-by-side page.
writeFileSync('site/designs/index.html', head({ title: `Five designs, ${NAME}`, url: `${ORIGIN}/designs/`, css: 'gallery.css', rel: '../' }).replace(/<script[^>]*><\/script>\n/, '') + `
<body class="designs-page">
<a class="skip" href="#main">Skip to content</a>
<header class="bar"><a class="brand" href="../">${NAME}</a><div class="bar-right">${family}</div></header>
<main id="main">
<h1>Five designs</h1>
<p>The same site in five designs. Each has the same words, photographs and videos; only the look changes. The home page uses design ${HOME}, ${DESIGNS[HOME - 1].name}. Every page has a "Choose a design" control at the top.</p>
<ul class="cards big">${DESIGNS.map((d) => `<li><a href="${d.n}.html"><img src="../images/shots/d${d.n}-1280.webp" alt="" width="1280" height="800" loading="lazy" decoding="async"><strong>${d.n}. ${d.name}</strong><span>${d.blurb}${d.n === HOME ? ' (the home page now)' : ''}</span></a></li>`).join('')}</ul>
</main>
<footer><p class="foot-links"><a href="../">Home</a>${dot}<a href="../start/">Start here</a>${dot}<a href="../admin/">How this site was made</a></p></footer>
</body>
</html>
`);
console.log('wrote site/index.html, site/designs/1-5.html, site/designs/index.html; home uses design', HOME);
