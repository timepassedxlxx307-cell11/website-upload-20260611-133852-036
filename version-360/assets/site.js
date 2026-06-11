(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var listing = document.querySelector("[data-listing]");
        var filters = document.querySelector("[data-filters]");
        if (!listing || !filters) {
            return;
        }
        var cards = Array.prototype.slice.call(listing.querySelectorAll(".movie-card"));
        var keyword = filters.querySelector("[data-filter-keyword]");
        var type = filters.querySelector("[data-filter-type]");
        var region = filters.querySelector("[data-filter-region]");
        var year = filters.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-empty-result]");

        function fillSelect(select, attr) {
            if (!select) {
                return;
            }
            var values = [];
            var seen = Object.create(null);
            cards.forEach(function (card) {
                var value = card.getAttribute(attr) || "";
                if (value && !seen[value]) {
                    seen[value] = true;
                    values.push(value);
                }
            });
            values.sort(function (a, b) {
                var na = Number(a);
                var nb = Number(b);
                if (!Number.isNaN(na) && !Number.isNaN(nb)) {
                    return nb - na;
                }
                return a.localeCompare(b, "zh-Hans-CN");
            });
            values.forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function apply() {
            var q = normalize(keyword && keyword.value);
            var typeValue = type ? type.value : "";
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-tags"));
                var match = true;
                if (q && text.indexOf(q) === -1) {
                    match = false;
                }
                if (typeValue && card.getAttribute("data-type") !== typeValue) {
                    match = false;
                }
                if (regionValue && card.getAttribute("data-region") !== regionValue) {
                    match = false;
                }
                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    match = false;
                }
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        fillSelect(type, "data-type");
        fillSelect(region, "data-region");
        fillSelect(year, "data-year");

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && keyword) {
            keyword.value = q;
        }

        [keyword, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
