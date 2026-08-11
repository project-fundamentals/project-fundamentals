/* Project Fundamentals — homepage behaviour */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Navigation: mobile toggle + mega menu ------------------------- */

  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.nav__trigger'));
  var desktop = window.matchMedia('(min-width: 900px)');

  function closePanels(except) {
    triggers.forEach(function (t) {
      if (t === except) return;
      t.setAttribute('aria-expanded', 'false');
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
    });
  }

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    closePanels(null);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (!open) closePanels(null);
    });
  }

  triggers.forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closePanels(trigger);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  });

  /* Close when focus or a click leaves the header. */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav')) closeMenu();
  });

  document.addEventListener('focusin', function (e) {
    if (desktop.matches && !e.target.closest('.nav')) closePanels(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openTrigger = triggers.filter(function (t) {
      return t.getAttribute('aria-expanded') === 'true';
    })[0];
    if (openTrigger) {
      closePanels(null);
      openTrigger.focus();
    } else if (menu && menu.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* Choosing a destination closes everything. */
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
  }

  /* ---- Smooth scroll for the hero CTA -------------------------------- */

  document.querySelectorAll('a[data-scroll]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });

      // Keep keyboard focus with the scroll position.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ---- Minimum-payment trap calculator (banking.html) ----------------- */

  var balanceInput = document.getElementById('balanceInput');
  var minPctInput = document.getElementById('minPctInput');

  if (balanceInput && minPctInput) {
    var balanceOutput = document.getElementById('balanceOutput');
    var minPctOutput = document.getElementById('minPctOutput');
    var monthsOut = document.getElementById('monthsOut');
    var interestOut = document.getElementById('interestOut');

    var ANNUAL_RATE = 0.20; // illustrative only
    var MONTHLY_RATE = ANNUAL_RATE / 12;
    var MIN_PAYMENT_FLOOR = 25; // typical card minimum-payment floor
    var MONTH_CAP = 600; // 50 years — treated as "never really clears"

    function simulateMinimumPayments(startBalance, pct) {
      var balance = startBalance;
      var months = 0;
      var totalInterest = 0;

      while (balance > 0 && months < MONTH_CAP) {
        var interest = balance * MONTHLY_RATE;
        totalInterest += interest;
        balance += interest;

        var payment = Math.min(Math.max(balance * pct, MIN_PAYMENT_FLOOR), balance);
        balance -= payment;
        months++;
      }

      return { months: months, totalInterest: totalInterest, cleared: balance <= 0 };
    }

    function formatCurrency(n) {
      return '$' + Math.round(n).toLocaleString('en-SG');
    }

    function update() {
      var balance = Number(balanceInput.value);
      var pct = Number(minPctInput.value) / 100;

      balanceOutput.textContent = formatCurrency(balance);
      minPctOutput.textContent = Number(minPctInput.value) + '%';

      var result = simulateMinimumPayments(balance, pct);

      monthsOut.textContent = result.cleared
        ? result.months + (result.months === 1 ? ' month' : ' months')
        : 'Never';

      interestOut.textContent = result.cleared
        ? formatCurrency(result.totalInterest)
        : 'Grows forever';

      var neverNote = document.getElementById('neverNote');
      if (neverNote) neverNote.hidden = result.cleared;
    }

    balanceInput.addEventListener('input', update);
    minPctInput.addEventListener('input', update);
    update();
  }

  /* ---- Risk dial (investing.html) --------------------------------------- */

  var riskDial = document.getElementById('riskDial');

  if (riskDial) {
    var tierOut = document.getElementById('dialTier');
    var returnOut = document.getElementById('dialReturn');
    var lossOut = document.getElementById('dialLoss');
    var examplesOut = document.getElementById('dialExamples');
    var dialWrap = riskDial.closest('.dial');

    var TIERS = [
      {
        tier: 'Low risk',
        ret: 'Low but stable',
        loss: 'Very low — capital protected',
        examples: 'SSBs, fixed deposits, T-bills',
        color: 'var(--pillar-investing)'
      },
      {
        tier: 'Medium risk',
        ret: 'Moderate, over the long term',
        loss: 'Real — prices fluctuate daily',
        examples: 'Blue-chip stocks, ETFs, S&P 500 index funds',
        color: '#B07A1E'
      },
      {
        tier: 'High risk',
        ret: 'Potentially large, often nothing',
        loss: 'Very high — can lose 100%',
        examples: 'Cryptocurrency, meme coins, loot boxes',
        color: '#B3372F'
      }
    ];

    function updateDial() {
      var t = TIERS[Number(riskDial.value)] || TIERS[0];
      tierOut.textContent = t.tier;
      returnOut.textContent = t.ret;
      lossOut.textContent = t.loss;
      examplesOut.textContent = t.examples;
      if (dialWrap) dialWrap.style.setProperty('--dial-color', t.color);
    }

    riskDial.addEventListener('input', updateDial);
    updateDial();
  }

  /* ---- Header background on scroll ------------------------------------ */

  var siteHeader = document.getElementById('siteHeader');

  if (siteHeader) {
    var onScroll = function () {
      siteHeader.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Silk reveal on scroll ------------------------------------------ */

  var revealTargets = document.querySelectorAll('.silk-reveal');

  if (revealTargets.length) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealTargets.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      revealTargets.forEach(function (el) { observer.observe(el); });
    }
  }
})();
