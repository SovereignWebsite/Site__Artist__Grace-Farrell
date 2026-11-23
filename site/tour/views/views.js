// The tour views: set each route bar's length (the page's CSP allows no style attributes), and sort the venues into
// "Played" and "Still to come" by the visitor's own date (site.js has already marked past ones with .past).
(function () {
  document.querySelectorAll('.tv-bar[data-w]').forEach(function (b) { b.style.setProperty('--w', b.getAttribute('data-w') + '%'); });
  var played = document.getElementById('tv-played'), coming = document.getElementById('tv-coming');
  if (played && coming) {
    [].slice.call(coming.children).forEach(function (li) { if (li.classList.contains('past')) played.appendChild(li); });
    if (!played.children.length) { var e = document.createElement('li'); e.className = 'tv-none'; e.textContent = 'None yet.'; played.appendChild(e); }
    if (!coming.children.length) { var f = document.createElement('li'); f.className = 'tv-none'; f.textContent = 'The tour has ended.'; coming.appendChild(f); }
  }
})();
