/* script.js */
(function () {
  'use strict';

  /* Enable motion only when JS is running */
  document.documentElement.classList.add('js-motion');

  /* ============================================================
     MOBILE NAVIGATION — FINAL
     ------------------------------------------------------------
     Uses `pointerdown` (fires immediately on touch — no 300ms
     tap delay) with a `click` fallback for mouse users. A
     single debounce guard prevents double-firing on devices
     that emit both pointerdown and click for one tap.
     Also includes console logging so you can verify the click
     is registering — open DevTools → Console on your phone.
     ============================================================ */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primary-nav');

  if (navToggle && nav) {
    var lastToggleTime = 0;

    function isOpen() {
      return nav.classList.contains('open');
    }

    function setNav(open) {
      nav.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function handleToggle(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      // Debounce — pointerdown + click can both fire on one tap
      var now = Date.now();
      if (now - lastToggleTime < 350) return;
      lastToggleTime = now;

      var next = !isOpen();
      setNav(next);
      console.log('[Iyato Nav] toggled →', next ? 'OPEN' : 'CLOSED');
    }

    /* Primary handler: pointerdown (fires first, no delay on touch) */
    if (window.PointerEvent) {
      navToggle.addEventListener('pointerdown', handleToggle);
    } else {
      /* Fallback for very old browsers */
      navToggle.addEventListener('touchstart', handleToggle, { passive: false });
      navToggle.addEventListener('click', handleToggle);
    }

    /* Close when a nav link is tapped */
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setNav(false);
      });
    });

    /* Close on outside tap (bubbling phase, safe because toggle
       uses stopPropagation above) */
    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (nav.contains(e.target)) return;
      if (navToggle.contains(e.target)) return;
      setNav(false);
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) setNav(false);
    });

    /* Auto-close when viewport grows past mobile breakpoint */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 820 && isOpen()) setNav(false);
      }, 120);
    });

    console.log('[Iyato Nav] ready. Tap the hamburger to toggle.');
  } else {
    console.error('[Iyato Nav] Could not find #navToggle or #primary-nav in the DOM.');
  }

  /* ============================================================
     HEADER SCROLL STATE
     ============================================================ */
  var header = document.getElementById('header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 16);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     SHORT-TERM RENTAL TABS
     ============================================================ */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.tab-panel'));

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.id === tab.dataset.target);
      });
    });
  });

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');

  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el) { observer.observe(el); });

      setTimeout(function () {
        revealEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            el.classList.add('in');
          }
        });
      }, 1000);

      setTimeout(revealAll, 3000);
    } else {
      revealAll();
    }
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  var form = document.getElementById('contact-form');
  var successBox = document.getElementById('formSuccess');
  var errorBox = document.getElementById('formError');

  if (form && !errorBox) {
    errorBox = document.createElement('div');
    errorBox.id = 'formError';
    errorBox.className = 'form-error';
    errorBox.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" ' +
      'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" ' +
      'stroke-linejoin="round"><circle cx="12" cy="12" r="9"/>' +
      '<path d="M12 8v4M12 16h.01"/></svg>' +
      '<span>Sorry — something went wrong. Please email us directly at ' +
      '<a href="mailto:info@iyato.co.za">info@iyato.co.za</a>.</span>';
    var formCard = form.closest('.form-card');
    if (formCard) formCard.insertBefore(errorBox, form);
  }

  function showSuccess() {
    if (successBox) {
      successBox.classList.add('show');
      setTimeout(function () { successBox.classList.remove('show'); }, 7000);
    }
  }
  function showError() {
    if (errorBox) {
      errorBox.classList.add('show');
      setTimeout(function () { errorBox.classList.remove('show'); }, 9000);
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('#name');
      var email = form.querySelector('#email');
      var valid = true;

      [name, email].forEach(function (field) {
        if (!field) return;
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#E01F26';
          valid = false;
        }
      });

      if (email && email.value.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.style.borderColor = '#E01F26';
        valid = false;
      }

      if (!valid) return;

      var action = form.getAttribute('action') || '';
      var isPlaceholder = !action || action.indexOf('YOUR_FORM_ID') !== -1;

      var btn = form.querySelector('button[type="submit"]');
      var originalHTML = btn ? btn.innerHTML : '';

      function setLoading(on) {
        if (!btn) return;
        if (on) { btn.disabled = true; btn.textContent = 'Sending…'; }
        else { btn.disabled = false; btn.innerHTML = originalHTML; }
      }

      if (isPlaceholder) {
        console.warn(
          '[Iyato Contact Form] DEMO MODE — no real endpoint configured.\n' +
          'Set a real form action (e.g. https://formspree.io/f/xxxxxxx) ' +
          'in index.html to send submissions for real.'
        );
        setLoading(true);
        setTimeout(function () {
          setLoading(false);
          showSuccess();
          form.reset();
        }, 700);
        return;
      }

      setLoading(true);

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Server responded ' + res.status);
          return res;
        })
        .then(function () {
          showSuccess();
          form.reset();
        })
        .catch(function (err) {
          console.error('[Iyato Contact Form]', err);
          showError();
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }

  /* ============================================================
     FOOTER YEAR
     ============================================================ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();