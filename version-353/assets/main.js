(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function setupPageFilter() {
        var search = document.querySelector('[data-page-search]');
        var year = document.querySelector('[data-year-filter]');
        var region = document.querySelector('[data-region-filter]');
        var clear = document.querySelector('[data-clear-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        if (!cards.length || (!search && !year && !region)) {
            return;
        }

        function apply() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-text') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var matched = true;
                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }
                if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                    matched = false;
                }
                card.style.display = matched ? '' : 'none';
            });
        }

        if (search) {
            search.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
        if (region) {
            region.addEventListener('change', apply);
        }
        if (clear) {
            clear.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (region) {
                    region.value = '';
                }
                apply();
            });
        }
        apply();
    }

    function setupGlobalSearch() {
        var input = document.querySelector('[data-global-search]');
        var button = document.querySelector('[data-global-search-button]');
        var results = document.getElementById('global-search-results');
        if (!input || !results || typeof SITE_MOVIES === 'undefined') {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial) {
            input.value = initial;
        }

        function card(movie) {
            return [
                '<a class="movie-card compact-card" href="' + movie.url + '">',
                '    <span class="poster-wrap">',
                '        <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
                '        <span class="poster-gradient"></span>',
                '        <span class="play-icon">▶</span>',
                '        <span class="genre-pill">' + movie.genre + '</span>',
                '    </span>',
                '    <span class="card-body">',
                '        <strong>' + movie.title + '</strong>',
                '        <em>' + movie.year + ' · ' + movie.region + '</em>',
                '        <span>' + movie.desc + '</span>',
                '    </span>',
                '</a>'
            ].join('');
        }

        function render() {
            var query = input.value.trim().toLowerCase();
            var pool = SITE_MOVIES;
            if (query) {
                pool = SITE_MOVIES.filter(function (movie) {
                    return movie.text.toLowerCase().indexOf(query) !== -1;
                });
            }
            var selected = pool.slice(0, 80);
            if (!selected.length) {
                results.innerHTML = '<div class="no-results">没有找到匹配影片，可以换一个片名、年份或类型。</div>';
                return;
            }
            results.innerHTML = selected.map(card).join('');
        }

        input.addEventListener('input', render);
        if (button) {
            button.addEventListener('click', render);
        }
        render();
    }

    function setupPlayer() {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var playUrl = player.getAttribute('data-play');
        var loaded = false;
        var hls = null;

        function load() {
            if (!video || !playUrl || loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(playUrl);
                hls.attachMedia(video);
            } else {
                video.src = playUrl;
            }
        }

        function play() {
            load();
            if (button) {
                button.classList.add('hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }
        player.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            play();
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupPageFilter();
        setupGlobalSearch();
        setupPlayer();
    });
})();
