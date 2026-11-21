// Writes Grace Farrell's home page and the five design pages from one set of content.
// node tools/build-pages.mjs   (run from the repository root; writes site/index.html, site/designs/*.html)
// The home page uses site/theme.css, a copy of the chosen design's CSS (HOME below). Every fact here comes from
// Grace's Spotlight profile or from Dinis Cruz; see docs/sources.md. Never add one that is not there.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

const HOME = 1; // the design the home page uses; site/theme.css is a copy of site/designs/d<HOME>.css
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
  ['Cover; debut as Mary Bennet', 'Pride and Prejudice* (*sort of)', 'UK tour, 2026. Directed by Isobel McArthur. Produced by David Pugh.'],
  ['Klytaimestra', 'Flowers for Kassandra', 'Crazy Alter Ego, 2026. Directed by Hariet Isidor.'],
  ['Sue Grimshaw (lead)', 'Falling in Love with Mr Dellamort', 'MTTM Theatrics, Edinburgh Fringe, 2025. International premiere. Directed by Abigail Zealey-Bess.'],
  ['Various (voice)', 'Diablo IV', 'Blizzard, 2025. Directed by Adam Chapman.'],
  ['Susanna Walcott', 'The Crucible', 'National Theatre, Gielgud Theatre, 2023. Directed by Lindsey Turner.'],
  ['Amber', 'Champion', 'New Pictures and Balloon for BBC, television, 2022. Directed by John Ogunmuyiwa.'],
  ['Melissa', 'Left Behind', 'Pretty Hate Productions, short film, 2021. Directed by Matthew Ford.'],
  ['Megara the Jealous', 'Orfeus: A House Music Opera', 'Young Vic Theatre, 2020. Directed by Charles Randolph-Wright.'],
  ['Eliza Doolittle', 'My Fair Lady', 'National Theatre Studio, workshop, 2019. Directed by Joel Fram.'],
  ['Ensemble; 1st Fantine; 2nd Cosette', 'Les Misérables', 'Cameron Mackintosh, 2018. Directed by Sam Hiller.'],
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
  ['reel-cream-jacket', 'Grace in a cream corduroy jacket, mid-conversation, eyes wide', 1400, 741],
  ['reel-white-wall', 'Grace speaking to camera against a white wall', 1400, 788],
  ['reel-kitchen', 'Grace in a kitchen, looking up, startled', 1400, 753],
];

// The tour map: Britain and Ireland drawn from Natural Earth (public domain), venues placed by latitude and longitude.
const map = JSON.parse(readFileSync('tools/data/map-path.json', 'utf8'));
const tour = JSON.parse(readFileSync('tools/data/tour.json', 'utf8'));
const xy = (lon, lat) => [((lon - map.lon0) * map.k * map.s), ((map.lat1 - lat) * map.s)];
function tourMap() {
  const pts = tour.venues.map((v) => xy(v.lon, v.lat));
  const route = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  const dots = tour.venues.map((v, i) => { const [x, y] = pts[i]; return `<g class="stop" data-end="${v.end}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8"/><text x="${x.toFixed(1)}" y="${(y + 3.3).toFixed(1)}">${i + 1}</text><title>${i + 1}. ${esc(v.town)}, ${esc(v.venue)}: ${esc(v.when)}</title></g>`; }).join('');
  return `<svg class="map" viewBox="0 0 ${map.w} ${map.h}" role="img" aria-labelledby="map-t"><title id="map-t">Map of Britain and Ireland with the ${tour.venues.length} venues of the tour, numbered in order; the list beside it gives each one.</title><path class="land" d="${map.d}"/><path class="route" d="${route}"/>${dots}</svg>`;
}
const tourList = () => `<ol class="stops">${tour.venues.map((v) => `<li data-end="${v.end}"><strong>${esc(v.town)}</strong>, ${esc(v.venue)} <span class="when">${esc(v.when)}</span></li>`).join('')}</ol>`;

const chooser = (cur, rel) => `<details class="chooser">
    <summary>Choose a design</summary>
    <div class="chooser-panel">
      <ul class="cards">${DESIGNS.map((d) => `<li><a href="${rel}designs/${d.n}.html"${d.n === cur ? ' aria-current="page"' : ''}><img src="${rel}images/shots/d${d.n}-640.webp" alt="" width="640" height="400" loading="lazy" decoding="async"><strong>${d.n}. ${d.name}</strong><span>${d.blurb}</span></a></li>`).join('')}</ul>
      <p class="all"><a href="${rel}designs/">All five, side by side</a></p>
    </div>
  </details>`;

const family = `<details class="family-credit">
  <summary>Sovereign Website</summary>
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
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; frame-src https://mediaviewer.spotlight.com https://www.instagram.com; base-uri 'none'; form-action 'none'">
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
</head>`;
}

const bar = (cur, rel, home) => `<header class="bar">
  <a class="brand" href="${rel || './'}">${NAME}</a>
  <nav aria-label="Sections">${[['about', 'About'], ['credits', 'Credits'], ['reels', 'Reels'], ['tour', 'Tour'], ['skills', 'Skills'], ['contact', 'Contact']].map(([id, t]) => `<a href="${home}#${id}">${t}</a>`).join('')}</nav>
  <div class="bar-right">${chooser(cur, rel)}
  ${family}</div>
</header>`;
const footer = (rel) => `<footer>
  <p class="foot-links"><a href="${rel}start/">Start here</a>${dot}<a href="${rel}agents/">Use this site with your AI</a>${dot}<a href="${rel}llms.txt">llms.txt</a>${dot}<a href="${rel}admin/">How this site was made</a>${dot}<a href="${rel}designs/">All five designs</a></p>
  <p>A sovereign website: Grace's own files, history and address. No cookies, no tracking, no third-party scripts. The videos come from Spotlight and Instagram only when you press play. Text licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; photographs remain their photographers'. Source: <a href="https://github.com/SovereignWebsite/Site__Artist__Grace-Farrell">SovereignWebsite/Site__Artist__Grace-Farrell</a>.</p>
</footer>`;

// Each design arranges the same blocks in its own way: its own opening, its own way of showing the credits,
// its own order and its own section names. The words, photographs and facts are the same in all five.
const LABELS = {
  1: { about: 'About', credits: 'Credits', reels: 'On screen', tour: 'On the road', skills: 'Skills', contact: 'Representation' },
  2: { about: 'Who', credits: 'Shows', reels: 'Watch', tour: 'Touring now', skills: 'Can do', contact: 'Book her' },
  3: { about: 'Prologue', credits: 'Dramatis personae', reels: 'Interlude', tour: 'The journey', skills: 'Notes on the voice', contact: 'Enquiries' },
  4: { about: 'About me', credits: 'Ticket stubs', reels: 'Footage', tour: 'Where the tour goes', skills: 'Packed for the road', contact: 'Agent' },
  5: { about: 'Profile', credits: 'The work', reels: 'In motion', tour: 'On tour', skills: 'Range', contact: 'Representation' },
};

function page(cur, rel) {
  const L = LABELS[cur];
  const img = (n, w) => `${rel}images/${n}-${w}.webp`;
  const headshot = (sizes, extra = '') => `<img src="${img('headshot', 960)}" srcset="${img('headshot', 640)} 640w, ${img('headshot', 960)} 960w" sizes="${sizes}" alt="Grace Farrell, head and shoulders, in a black top against a dark backdrop" width="960" height="1440"${extra}>`;
  const credit = '<figcaption class="photo-credit">Photo © Jennie Scott</figcaption>';
  const nowOn = `On tour${dot}<em>Pride and Prejudice* (*sort of)</em>`;
  const headline = `Grace finished a run at the 2025 Edinburgh Fringe starring as lead Sue Grimshaw in the international premiere of <em>Falling in Love with Mr Dellamort</em>, directed by Abigail Zealey-Bess.`;
  const cta = `<p class="cta"><a class="btn primary" href="#contact">Contact her agent</a> <span class="links"><a href="${SPOTLIGHT}">Spotlight profile</a>${dot}<a href="${INSTAGRAM}">Instagram</a></span></p>`;
  const sec = (id, cls, title, inner) => `<section id="${id}" class="${cls}" aria-labelledby="${id}-h">\n  <p class="kicker">${L[id]}</p>\n  <h2 id="${id}-h">${title}</h2>\n${inner}\n</section>`;

  // the opening, five ways
  const covers = {
    1: `<section class="cover cover-spot" id="top" aria-labelledby="name">
  <figure class="cover-photo">${headshot('(max-width: 50rem) 80vw, 26rem', ' fetchpriority="high"')}${credit}</figure>
  <div class="cover-text">
    <p class="kicker">${nowOn}</p>
    <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
    <p class="sub">Actor-singer and soprano</p>
    <p class="lead">${headline}</p>
    ${cta}
  </div>
</section>`,
    2: `<section class="cover cover-poster" id="top" aria-labelledby="name">
  <div class="poster-type">
    <p class="kicker sticker">${nowOn}</p>
    <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
    <p class="sub">Actor-singer <span aria-hidden="true">/</span> soprano</p>
  </div>
  <figure class="cover-photo">${headshot('(max-width: 50rem) 90vw, 30rem', ' fetchpriority="high"')}${credit}</figure>
  <p class="lead strip">${headline}</p>
  <div class="poster-cta">${cta}</div>
</section>`,
    3: `<section class="cover cover-title" id="top" aria-labelledby="name">
  <p class="kicker">${nowOn}</p>
  <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
  <p class="sub">Actor-singer and soprano</p>
  <figure class="cover-photo oval">${headshot('(max-width: 50rem) 60vw, 18rem', ' fetchpriority="high"')}${credit}</figure>
  <p class="lead">${headline}</p>
  ${cta}
</section>`,
    4: `<section class="cover cover-passport" id="top" aria-labelledby="name">
  <div class="passport">
    <figure class="cover-photo">${headshot('(max-width: 50rem) 40vw, 14rem', ' fetchpriority="high"')}${credit}</figure>
    <div class="cover-text">
      <p class="kicker">${nowOn}</p>
      <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
      <dl class="id-lines"><div><dt>Occupation</dt><dd>Actor-singer, soprano</dd></div><div><dt>Based</dt><dd>Greater London and the West Midlands</dd></div><div><dt>Languages</dt><dd>English, French, Italian</dd></div></dl>
    </div>
  </div>
  <div class="cover-aside"><p class="lead">${headline}</p>${cta}</div>
</section>`,
    5: `<section class="cover cover-mag" id="top" aria-labelledby="name">
  <figure class="cover-photo">${headshot('100vw', ' fetchpriority="high"')}${credit}</figure>
  <div class="masthead">
    <p class="kicker">${nowOn}</p>
    <h1 id="name"><span>Grace</span> <span>Farrell</span></h1>
    <p class="sub">Actor-singer and soprano</p>
  </div>
  <div class="standfirst"><p class="lead">${headline}</p>${cta}</div>
</section>`,
  };

  const aboutText = `<div class="prose">
  <p>Grace Farrell is an actor-singer and soprano, based in Greater London and the West Midlands. Her stage work runs from <em>Les Misérables</em> for Cameron Mackintosh and the Young Vic's <em>Orfeus: A House Music Opera</em> to Susanna Walcott in the National Theatre's <em>The Crucible</em> at the Gielgud Theatre, and Eliza Doolittle in a National Theatre Studio workshop of <em>My Fair Lady</em>.</p>
  <p>On screen she played Amber in the BBC's <em>Champion</em>, and her voice is in Blizzard's <em>Diablo IV</em>. In 2025 she led the international premiere of <em>Falling in Love with Mr Dellamort</em> at the Edinburgh Fringe. In 2026 she played Klytaimestra in <em>Flowers for Kassandra</em>, and joined the UK tour of <em>Pride and Prejudice* (*sort of)</em> as a cover, making her debut as Mary Bennet.</p>
  <p>She sings classical, opera, folk, pop and cabaret, plays violin, guitar and piano, speaks English, French and Italian, and teaches singing.</p>
</div>`;
  const pull = cur === 5 ? `<blockquote class="pull"><p>From the National Theatre to Blizzard's <em>Diablo IV</em>, and on tour as Mary Bennet.</p></blockquote>` : '';
  const about = sec('about', 'about', { 1: 'Stage, screen and studio', 2: 'Sings. Acts. Plays.', 3: 'In which our soprano is introduced', 4: 'Stage, screen and studio', 5: 'Stage, screen and studio' }[cur], pull + aboutText);

  // the credits, five ways
  const c = CREDITS.map(([role, prod, by]) => ({ role: esc(role), prod: esc(prod), by: esc(by), year: (by.match(/20\d\d/) || [''])[0] }));
  const creditsInner = {
    1: `<ol class="cast cast-dots">${c.map((x) => `<li><span class="role">${x.role}</span><span class="dots" aria-hidden="true"></span><span class="prod"><em>${x.prod}</em></span><span class="by">${x.by}</span></li>`).join('')}</ol>`,
    2: `<ol class="cast cast-flyers">${c.map((x) => `<li><span class="year">${x.year}</span><span class="prod"><em>${x.prod}</em></span><span class="role">${x.role}</span><span class="by">${x.by}</span></li>`).join('')}</ol>`,
    3: `<ol class="cast cast-personae">${c.map((x) => `<li><span class="role">${x.role}</span><span class="prod">in <em>${x.prod}</em></span><span class="by">${x.by}</span></li>`).join('')}</ol>`,
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
          <span class="reel-title">Acting showreel</span>
          <span class="reel-cta"><span class="icon" aria-hidden="true"></span><span>Play on Spotlight</span><span class="dur">4 min 58 s</span></span>
        </a>
      </div>
      <figcaption class="meta">Still from Grace's acting showreel.</figcaption>
    </figure>
    <figure class="reel">
      <div class="frame ig" data-src="${esc(IG_EMBED)}" data-title="Grace Farrell singing, on Instagram">
        <a class="play" href="${esc(IG_POST)}">
          <img src="${img('instagram-microphone', 1296)}" srcset="${img('instagram-microphone', 640)} 640w, ${img('instagram-microphone', 1296)} 1296w" sizes="(max-width: 50rem) 100vw, 50vw" alt="" width="1296" height="729" loading="lazy" decoding="async">
          <span class="reel-title">At the microphone</span>
          <span class="reel-cta"><span class="icon" aria-hidden="true"></span><span>Play on Instagram</span></span>
        </a>
      </div>
      <figcaption class="meta">Still from the video, Instagram @gracexfarrellx. <a href="${IG_POST}">Open on Instagram</a></figcaption>
    </figure>
  </div>
  <div class="gallery">${GALLERY.map(([n, alt, w, h]) => `<figure><a href="${img(n, 1400)}"><img src="${img(n, 640)}" srcset="${img(n, 640)} 640w, ${img(n, 1400)} 1400w" sizes="(max-width: 50rem) 100vw, 33vw" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async"></a><figcaption>Still from Grace's acting showreel</figcaption></figure>`).join('')}</div>`;
  const reels = sec('reels', 'reels-sec', { 1: 'Showreel and video', 2: 'Watch her', 3: 'Showreel and song', 4: 'Showreel and video', 5: 'Showreel and video' }[cur], reelsInner);

  const tourInner = `  <p class="tour-intro">Grace is a cover in the 2026 to 2027 UK and Ireland tour of Isobel McArthur's Olivier Award-winning comedy, and made her debut as Mary Bennet on it. These are the production's ${tour.venues.length} venues; dates for 2027 are from <a href="https://prideandprejudicesortof.com/tour-dates/">the tour's own page</a>, where tickets are sold.</p>
  <div class="tour-grid">${tourMap()}${tourList()}</div>
  <p class="note map-note">Map: Natural Earth (public domain). Venues already played are faded on the map and marked "played" in the list.</p>`;
  const tourSec = sec('tour', 'tour', `<em>Pride and Prejudice* (*sort of)</em>${cur === 4 ? ', town by town' : ' on tour'}`, tourInner);

  const skills = sec('skills', 'skills', { 1: 'Skills', 2: 'Can do', 3: 'The voice, and the rest', 4: 'Skills', 5: 'Skills' }[cur], `  <div class="note-cols">${SKILLS.map(([h, xs]) => `<div><h3>${h}</h3><p>${xs.map(esc).join(dot)}</p></div>`).join('')}</div>
  <dl class="facts"><div><dt>Playing age</dt><dd>20 to 30</dd></div><div><dt>Nationalities</dt><dd>British, Italian</dd></div><div><dt>Location</dt><dd>Greater London and the West Midlands</dd></div></dl>`);

  const contact = sec('contact', 'contact', 'Collective Agents', `  <p>For casting and all enquiries, please contact Grace's agent, Amy McGivern.</p>
  <address>
    <strong>Amy McGivern, Collective Agents</strong><br>
    12 Red Lion Square, Holborn<br>
    London WC1R 4QH<br>
    <a href="tel:+442046354212">020 4635 4212</a><br>
    <a href="mailto:info@collectiveagents.co.uk">info@collectiveagents.co.uk</a>
  </address>
  <p><a href="${SPOTLIGHT}">Spotlight profile</a>${dot}<a href="${INSTAGRAM}">Instagram @gracexfarrellx</a></p>`);

  const order = {
    1: [about, credits, reels, tourSec, skills, contact],
    2: [credits, reels, tourSec, about, skills, contact],
    3: [about, credits, skills, reels, tourSec, contact],
    4: [tourSec, credits, reels, about, skills, contact],
    5: [about, reels, credits, tourSec, skills, contact],
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
for (const name of ['start', 'agents', 'admin']) {
  const f = `site/${name}/index.html`; const h = readFileSync(f, 'utf8');
  const pick = (re) => (h.match(re) || [])[1];
  let body = pick(/<!-- content -->\n([\s\S]*?)<!-- \/content -->/);
  if (!body) body = pick(/<main id="main"[^>]*>\n?([\s\S]*?)<\/main>/).replace(/<footer>[\s\S]*?<\/footer>\s*$/, '').replace(/<div class="mark">([^<]*)<\/div>/, '<p class="kicker">$1</p>');
  const title = pick(/<title>([^<]*)<\/title>/), desc = pick(/<meta name="description" content="([^"]*)">/);
  const top = head({ title: title.replace(/&amp;/g, '&'), url: `${ORIGIN}/${name}/`, css: '../theme.css', rel: '../' }).replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*(">)/g, `$1${desc}$2`);
  writeFileSync(f, `${top}\n<body class="doc-page">\n<a class="skip" href="#main">Skip to content</a>\n${bar(HOME, '../', '../')}\n<main id="main" class="doc" tabindex="-1">\n<!-- content -->\n${body.trim()}\n<!-- /content -->\n</main>\n${footer('../')}\n</body>\n</html>\n`);
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
