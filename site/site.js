// Click to load: nothing is fetched from Spotlight or Instagram until the visitor presses play.
// Without JavaScript the link opens the video on Spotlight or Instagram instead.
document.querySelectorAll('.frame[data-src]').forEach(function (frame) {
  var link = frame.querySelector('.play');
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var f = document.createElement('iframe');
    f.src = frame.getAttribute('data-src');
    f.title = frame.getAttribute('data-title') || 'Video';
    f.allow = 'autoplay; fullscreen; picture-in-picture';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.classList.add('playing');
    frame.replaceChildren(f);
    f.focus();
  });
});

// The tour: by the visitor's own date, fade the venues whose last night has passed and mark the one playing this
// week. These are the production's dates, not Grace's: she is a cover, so nothing here says she is on.
(function () {
  var d = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var today = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  var now = null;
  document.querySelectorAll('[data-end]').forEach(function (el) {
    if (el.getAttribute('data-end') < today) {
      el.classList.add('past');
      if (el.tagName === 'LI') { var p = document.createElement('span'); p.className = 'played'; p.textContent = ' (played)'; el.querySelector('strong').after(p) }
    }
    else if (el.getAttribute('data-start') <= today) {
      el.classList.add('now');
      if (el.tagName === 'LI') {
        now = el;
        var tag = document.createElement('span'); tag.className = 'now-tag'; tag.textContent = ' (this week)';
        el.querySelector('strong').after(tag);
        var t = document.createElement('a'); t.className = 'tickets'; t.href = 'https://prideandprejudicesortof.com/tour-dates/'; t.textContent = 'Tickets: on the tour\u2019s page \u2197';
        el.appendChild(t);
      }
    }
  });
  if (now) document.querySelectorAll('[data-now-venue]').forEach(function (p) {
    p.querySelector('.nv-label').textContent = 'This week';
    p.querySelector('strong').textContent = now.querySelector('strong').textContent;
  });
  // Below 600 px the list is enough: the map waits behind "Show the map".
  if (window.matchMedia && window.matchMedia('(max-width: 600px)').matches) document.querySelectorAll('details.map-box').forEach(function (m) { m.open = false; });
})();
