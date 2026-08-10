/* Project Fundamentals — homepage behaviour */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Mobile nav ---------------------------------------------------- */

  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close after choosing a link, and on Escape.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
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
})();
