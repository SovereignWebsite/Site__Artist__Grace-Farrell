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

// The tour: fade the venues whose last night has passed, by the visitor's own clock.
(function () {
  var today = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('[data-end]').forEach(function (el) {
    if (el.getAttribute('data-end') < today) el.classList.add('past');
  });
})();
