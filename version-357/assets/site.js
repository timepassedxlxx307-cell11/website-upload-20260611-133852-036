(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var toggle = select('[data-mobile-toggle]');
  var menu = select('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  selectAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = select('input[name="q"]', form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  selectAll('[data-filter-area]').forEach(function (area) {
    var grid = select('[data-card-grid]', area);
    var cards = selectAll('[data-card]', area);
    var searchInput = select('[data-list-search]', area);
    var yearFilter = select('[data-year-filter]', area);
    var genreFilter = select('[data-genre-filter]', area);
    var sortFilter = select('[data-sort-filter]', area);
    var resetButton = select('[data-filter-reset]', area);
    var empty = select('[data-empty-state]', area);

    function apply() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = yearFilter ? yearFilter.value : '';
      var genre = normalize(genreFilter ? genreFilter.value : '');
      var sort = sortFilter ? sortFilter.value : 'newest';
      var visible = [];

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !year || String(card.dataset.year) === String(year);
        var okGenre = !genre || normalize(card.dataset.genre).indexOf(genre) !== -1 || normalize(card.dataset.tags).indexOf(genre) !== -1;
        var show = okKeyword && okYear && okGenre;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible.push(card);
        }
      });

      visible.sort(function (a, b) {
        if (sort === 'oldest') {
          return Number(a.dataset.year) - Number(b.dataset.year) || Number(a.dataset.index) - Number(b.dataset.index);
        }
        if (sort === 'title') {
          return String(a.dataset.title).localeCompare(String(b.dataset.title), 'zh-Hans-CN');
        }
        return Number(b.dataset.year) - Number(a.dataset.year) || Number(a.dataset.index) - Number(b.dataset.index);
      });

      visible.forEach(function (card) {
        grid.appendChild(card);
      });

      if (empty) {
        empty.classList.toggle('show', visible.length === 0);
      }
    }

    [searchInput, yearFilter, genreFilter, sortFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        if (genreFilter) {
          genreFilter.value = '';
        }
        if (sortFilter) {
          sortFilter.value = 'newest';
        }
        apply();
      });
    }

    apply();
  });

  selectAll('[data-player]').forEach(function (player) {
    var video = select('video', player);
    var overlay = select('.player-overlay', player);
    var stream = player.dataset.stream;
    var started = false;
    var hlsInstance = null;

    function prepare() {
      if (!video || !stream || started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = stream;
      }
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        video.play().catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var searchPage = select('[data-search-page]');

  if (searchPage && window.MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var title = select('[data-search-title]', searchPage);
    var subtitle = select('[data-search-subtitle]', searchPage);
    var results = select('[data-search-results]', searchPage);
    var empty = select('[data-search-empty]', searchPage);
    var wideInput = select('.wide-search input[name="q"]');

    if (wideInput) {
      wideInput.value = query;
    }

    function buildCard(movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';

      var link = document.createElement('a');
      link.className = 'poster-wrap';
      link.href = movie.url;

      var image = document.createElement('img');
      image.src = './' + movie.cover;
      image.alt = movie.title;
      image.loading = 'lazy';
      link.appendChild(image);

      var type = document.createElement('span');
      type.className = 'card-type';
      type.textContent = movie.type;
      link.appendChild(type);

      var year = document.createElement('span');
      year.className = 'card-year';
      year.textContent = movie.year;
      link.appendChild(year);

      var body = document.createElement('div');
      body.className = 'movie-card-body';

      var h2 = document.createElement('h2');
      var titleLink = document.createElement('a');
      titleLink.href = movie.url;
      titleLink.textContent = movie.title;
      h2.appendChild(titleLink);
      body.appendChild(h2);

      var p = document.createElement('p');
      p.textContent = movie.oneLine;
      body.appendChild(p);

      var meta = document.createElement('div');
      meta.className = 'card-meta';
      var region = document.createElement('span');
      region.textContent = movie.region;
      var genre = document.createElement('span');
      genre.textContent = movie.genre;
      meta.appendChild(region);
      meta.appendChild(genre);
      body.appendChild(meta);

      var tags = document.createElement('div');
      tags.className = 'card-tags';
      movie.tags.slice(0, 3).forEach(function (tag) {
        var item = document.createElement('span');
        item.textContent = tag;
        tags.appendChild(item);
      });
      body.appendChild(tags);

      article.appendChild(link);
      article.appendChild(body);
      return article;
    }

    if (query.trim()) {
      var q = normalize(query);
      var matched = window.MOVIES.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.oneLine,
          movie.summary,
          movie.tags.join(' ')
        ].join(' ')).indexOf(q) !== -1;
      });

      if (title) {
        title.textContent = '搜索结果';
      }
      if (subtitle) {
        subtitle.textContent = '关键词：' + query;
      }
      if (results) {
        results.innerHTML = '';
        matched.slice(0, 240).forEach(function (movie) {
          results.appendChild(buildCard(movie));
        });
      }
      if (empty) {
        empty.classList.toggle('show', matched.length === 0);
      }
    } else if (empty) {
      empty.classList.remove('show');
    }
  }
})();
