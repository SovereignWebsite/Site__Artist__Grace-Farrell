// On /send/ the Messages pane opens by itself (the pane script itself handles links with #k= or #m=).
(function () {
  var tries = 0;
  (function open() {
    var t = document.querySelector('.sws-toggle');
    if (t) { if (!document.documentElement.classList.contains('sws-open')) t.click(); return; }
    if (++tries < 40) setTimeout(open, 50);
  })();
})();
