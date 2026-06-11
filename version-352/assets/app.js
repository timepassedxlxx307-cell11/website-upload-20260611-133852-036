(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('.hero-slider');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyQueryFromAddress(input) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }
  }

  var searchInput = document.getElementById('siteSearch');
  var genreFilter = document.getElementById('genreFilter');
  var yearFilter = document.getElementById('yearFilter');
  var regionFilter = document.getElementById('regionFilter');
  var emptyState = document.getElementById('emptyState');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  applyQueryFromAddress(searchInput);

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput && searchInput.value);
    var genre = normalize(genreFilter && genreFilter.value);
    var year = normalize(yearFilter && yearFilter.value);
    var region = normalize(regionFilter && regionFilter.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));
      var matched = true;

      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }

      if (genre && normalize(card.dataset.genre).indexOf(genre) === -1) {
        matched = false;
      }

      if (year && normalize(card.dataset.year) !== year) {
        matched = false;
      }

      if (region && normalize(card.dataset.region) !== region) {
        matched = false;
      }

      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [searchInput, genreFilter, yearFilter, regionFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  filterCards();
})();
