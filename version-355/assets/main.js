document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.querySelector('[data-mobile-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function (event) {
        event.preventDefault();
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function (event) {
        event.preventDefault();
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function (event) {
        event.preventDefault();
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    show(0);
    restart();
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterList = document.querySelector('[data-filter-list]');
  const filterEmpty = document.querySelector('[data-filter-empty]');

  if (filterInput && filterList) {
    const items = Array.from(filterList.querySelectorAll('.movie-card-item'));
    filterInput.addEventListener('input', function () {
      const keyword = filterInput.value.trim().toLowerCase();
      let visible = 0;
      items.forEach(function (item) {
        const haystack = ((item.dataset.title || '') + ' ' + (item.dataset.meta || '')).toLowerCase();
        const matched = !keyword || haystack.includes(keyword);
        item.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (filterEmpty) {
        filterEmpty.classList.toggle('is-open', visible === 0);
      }
    });
  }

  const searchForm = document.querySelector('[data-global-search-form]');
  const searchInput = document.querySelector('[data-global-search-input]');
  const searchResults = document.querySelector('[data-search-results]');

  function cardTemplate(movie) {
    return '<a href="./' + movie.file + '" class="group block movie-card movie-card-item">' +
      '<div class="relative overflow-hidden rounded-lg aspect-video mb-3 movie-thumb">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy">' +
      '<div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300"></div>' +
      '<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><span class="play-symbol">▶</span></div></div>' +
      '<span class="movie-badge">' + escapeHtml(movie.duration) + '</span>' +
      '</div>' +
      '<h3 class="font-semibold text-white mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">' + escapeHtml(movie.title) + '</h3>' +
      '<div class="flex items-center gap-3 text-xs text-gray-400 movie-meta"><span>★ ' + movie.rating + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<p class="search-one-line">' + escapeHtml(movie.oneLine) + '</p>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderSearch(keyword) {
    if (!searchResults || !window.SEARCH_MOVIES) {
      return;
    }
    const key = keyword.trim().toLowerCase();
    const source = window.SEARCH_MOVIES;
    const matched = key ? source.filter(function (movie) {
      return movie.searchText.toLowerCase().includes(key);
    }).slice(0, 120) : source.slice(0, 24);
    searchResults.innerHTML = matched.length ? matched.map(cardTemplate).join('') : '<div class="glass-effect rounded-xl p-6 search-empty">没有找到匹配的影片。</div>';
  }

  if (searchForm && searchInput && searchResults) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    if (q) {
      searchInput.value = q;
      renderSearch(q);
    }
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch(searchInput.value);
    });
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }
});
