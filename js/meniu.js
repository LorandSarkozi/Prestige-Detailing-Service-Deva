/* Meniul de pe telefon, pentru paginile de servicii */
(function () {
  'use strict';
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  function seteaza(deschis) {
    hamburger.classList.toggle('open', deschis);
    mobileMenu.classList.toggle('open', deschis);
    hamburger.setAttribute('aria-expanded', deschis ? 'true' : 'false');
    document.body.style.overflow = deschis ? 'hidden' : '';
  }
  hamburger.addEventListener('click', function () { seteaza(!mobileMenu.classList.contains('open')); });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { seteaza(false); });
  });
})();
