(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (!button || !panel) {
            return;
        }

        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('mobile-open', panel.classList.contains('is-open'));
        });

        panel.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                panel.classList.remove('is-open');
                document.body.classList.remove('mobile-open');
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                stop();
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-filter-grid]');

        if (!panel || !grid) {
            return;
        }

        var searchInput = panel.querySelector('[data-filter-search]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var resetButton = panel.querySelector('[data-filter-reset]');
        var countNode = panel.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        function apply() {
            var query = normalize(searchInput && searchInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (type && cardType !== type) {
                    matched = false;
                }

                if (region && cardRegion !== region) {
                    matched = false;
                }

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = '显示 ' + visible + ' 部';
            }
        }

        [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
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

                if (yearSelect) {
                    yearSelect.value = '';
                }

                if (typeSelect) {
                    typeSelect.value = '';
                }

                if (regionSelect) {
                    regionSelect.value = '';
                }

                apply();
            });
        }

        apply();
    }

    function loadSource(player, url) {
        var video = player.querySelector('[data-video-element]');
        var status = player.querySelector('[data-player-status]');

        if (!video || !url) {
            if (status) {
                status.textContent = '播放源暂不可用';
            }
            return;
        }

        if (player._hlsInstance) {
            player._hlsInstance.destroy();
            player._hlsInstance = null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            player._hlsInstance = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {
                    if (status) {
                        status.textContent = '请再次点击播放器开始播放';
                    }
                });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && status) {
                    status.textContent = '播放连接异常，可刷新后重试';
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(function () {
                if (status) {
                    status.textContent = '请再次点击播放器开始播放';
                }
            });
        } else {
            video.src = url;
            video.play().catch(function () {
                if (status) {
                    status.textContent = '浏览器需要 HLS 支持';
                }
            });
        }

        if (status) {
            status.textContent = '正在加载播放源';
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.static-player'));

        players.forEach(function (player) {
            var button = player.querySelector('[data-play-button]');
            var video = player.querySelector('[data-video-element]');
            var sourceButtons = Array.prototype.slice.call(player.querySelectorAll('[data-source-url]'));
            var defaultUrl = player.getAttribute('data-video-url') || (sourceButtons[0] && sourceButtons[0].getAttribute('data-source-url'));

            function activate(url) {
                if (button) {
                    button.classList.add('is-hidden');
                }

                loadSource(player, url || defaultUrl);
            }

            if (button) {
                button.addEventListener('click', function () {
                    activate(defaultUrl);
                });
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (!video.currentSrc) {
                        activate(defaultUrl);
                    }
                });
            }

            sourceButtons.forEach(function (sourceButton) {
                sourceButton.addEventListener('click', function () {
                    sourceButtons.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    sourceButton.classList.add('active');
                    activate(sourceButton.getAttribute('data-source-url'));
                });
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
