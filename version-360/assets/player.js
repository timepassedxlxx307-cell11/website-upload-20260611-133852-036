(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initPlayer(frame) {
        var video = frame.querySelector("video");
        var cover = frame.querySelector(".player-cover");
        if (!video || !cover) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var loaded = false;
        var hls = null;

        function playVideo() {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        function loadStream() {
            if (loaded) {
                playVideo();
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.load();
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(stream);
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                return;
            }

            video.src = stream;
            video.load();
            playVideo();
        }

        function start() {
            frame.classList.add("is-playing");
            loadStream();
        }

        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            frame.classList.add("is-playing");
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll(".player-frame")).forEach(initPlayer);
    });
})();
