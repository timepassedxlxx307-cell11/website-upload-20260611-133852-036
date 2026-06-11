(function () {
    var navButton = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('.hero-slider');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = Number(dot.getAttribute('data-slide'));
                showSlide(next);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var currentFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function filterCards() {
        var query = normalize(searchInputs.map(function (input) {
            return input.value;
        }).join(' '));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var visible = 0;

        cards.forEach(function (card) {
            var title = card.getAttribute('data-title') || '';
            var tags = card.getAttribute('data-tags') || '';
            var year = card.getAttribute('data-year') || '';
            var category = card.getAttribute('data-category') || '';
            var haystack = normalize(title + ' ' + tags + ' ' + year + ' ' + category);
            var matchesText = !query || haystack.indexOf(query) !== -1;
            var matchesFilter = currentFilter === 'all' || category === currentFilter;
            var active = matchesText && matchesFilter;

            card.classList.toggle('is-hidden', !active);

            if (active) {
                visible += 1;
            }
        });

        Array.prototype.slice.call(document.querySelectorAll('.empty-state')).forEach(function (state) {
            state.classList.toggle('is-visible', cards.length > 0 && visible === 0);
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', filterCards);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            currentFilter = button.getAttribute('data-filter') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            filterCards();
        });
    });

    function setupPlayer(box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('.player-overlay');
        var button = box.querySelector('.watch-button');
        var stream = box.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;

        if (!video || !stream) {
            return;
        }

        function begin() {
            var useHls = false;

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    useHls = true;
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        var readyPlay = video.play();

                        if (readyPlay && typeof readyPlay.catch === 'function') {
                            readyPlay.catch(function () {
                                if (overlay) {
                                    overlay.classList.remove('is-hidden');
                                }
                            });
                        }
                    });
                } else {
                    video.src = stream;
                }

                started = true;
            }

            if (!useHls) {
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                begin();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                begin();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.stream-player')).forEach(setupPlayer);
})();
