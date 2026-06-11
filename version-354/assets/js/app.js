(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMobileMenu() {
        const button = document.querySelector("[data-mobile-menu-button]");
        const menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
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
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        restart();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupFilters() {
        const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            const scopeSelector = panel.getAttribute("data-filter-panel");
            const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            const cards = Array.from(scope.querySelectorAll(".movie-card, .rank-item"));
            const input = panel.querySelector("[data-search-input]");
            const region = panel.querySelector("[data-region-filter]");
            const year = panel.querySelector("[data-year-filter]");
            const category = panel.querySelector("[data-category-filter]");
            const reset = panel.querySelector("[data-filter-reset]");
            const empty = document.querySelector(panel.getAttribute("data-empty-target") || "");

            const params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
            }

            function apply() {
                const query = normalize(input ? input.value : "");
                const regionValue = normalize(region ? region.value : "");
                const yearValue = normalize(year ? year.value : "");
                const categoryValue = normalize(category ? category.value : "");
                let visible = 0;

                cards.forEach(function (card) {
                    const haystack = normalize(card.getAttribute("data-search"));
                    const cardRegion = normalize(card.getAttribute("data-region"));
                    const cardYear = normalize(card.getAttribute("data-year"));
                    const cardCategory = normalize(card.getAttribute("data-category"));
                    const ok = (!query || haystack.indexOf(query) !== -1) &&
                        (!regionValue || cardRegion === regionValue) &&
                        (!yearValue || cardYear === yearValue) &&
                        (!categoryValue || cardCategory === categoryValue);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, year, category].forEach(function (item) {
                if (!item) {
                    return;
                }
                item.addEventListener("input", apply);
                item.addEventListener("change", apply);
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (category) {
                        category.value = "";
                    }
                    apply();
                });
            }
            apply();
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
