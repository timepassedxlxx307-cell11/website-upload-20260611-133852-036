
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('nav-lock', mobileNav.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var buttons = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-button]'));
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            buttons.forEach(function (button, buttonIndex) {
                button.classList.toggle('active', buttonIndex === current);
            });
        }

        buttons.forEach(function (button, index) {
            button.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var count = scope.querySelector('[data-filter-count]');
        var empty = scope.querySelector('[data-empty]');

        if (!input || !cards.length) {
            return;
        }

        function applyFilter() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部';
            }
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('video');
        var trigger = box.querySelector('[data-play]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var ready = false;
        var hls = null;

        function start() {
            if (!video || !stream) {
                return;
            }

            if (!ready) {
                ready = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }

            box.classList.add('is-playing');
        }

        if (trigger) {
            trigger.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', start, { once: true });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
});
