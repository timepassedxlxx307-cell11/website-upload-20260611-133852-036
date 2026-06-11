(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var menu = document.querySelector(".mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            menu.hidden = expanded;
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        var hero = document.querySelector(".hero");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var typeSelect = panel.querySelector("[data-type-filter]");
            var yearSelect = panel.querySelector("[data-year-filter]");
            var targetSelector = panel.getAttribute("data-target") || ".movie-card";
            var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
            var empty = document.querySelector(panel.getAttribute("data-empty") || "");
            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }
            function apply() {
                var query = valueOf(input);
                var type = valueOf(typeSelect);
                var year = valueOf(yearSelect);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchType = !type || String(card.getAttribute("data-type") || "").toLowerCase().indexOf(type) !== -1;
                    var matchYear = !year || String(card.getAttribute("data-year") || "").toLowerCase() === year;
                    var show = matchQuery && matchType && matchYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }
            [input, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
            }
            apply();
        });
    }

    function setupHomeSearch() {
        var form = document.querySelector("[data-home-search]");
        if (!form) {
            return;
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var query = input ? input.value.trim() : "";
            var target = "search.html";
            if (query) {
                target += "?q=" + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    window.initPlayer = function (source) {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector(".player-overlay");
        var startButton = document.querySelector(".player-start");
        if (!video || !source) {
            return;
        }
        var ready = false;
        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (startButton) {
            startButton.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });
    };

    onReady(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupHomeSearch();
    });
})();
