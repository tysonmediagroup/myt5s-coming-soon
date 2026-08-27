document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const stageDomain = document.getElementById('stage-domain');
    const stageComingSoon = document.getElementById('stage-coming-soon');
    const statusFooter = document.getElementById('status-footer');
    const audio = document.getElementById('soundtrack');
    const btnReplay = document.getElementById('btn-replay');
    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    const audioLabel = document.getElementById('audio-label');
    const audioToggleText = document.getElementById('audio-toggle-text');
    const iconSound = document.getElementById('icon-sound');

    let sequenceTimer = null;
    let sequenceStarted = false;

    // Reset and trigger trace animations on all characters in an element
    function restartStageAnimation(stageElement) {
        if (!stageElement) return;
        const chars = stageElement.querySelectorAll('.trace-char');
        chars.forEach(ch => {
            ch.style.animation = 'none';
            void ch.offsetWidth; // Force reflow
            ch.style.animation = '';
        });

        const svg = stageElement.querySelector('.domain-svg');
        if (svg) {
            svg.style.animation = 'none';
            void svg.offsetWidth;
            svg.style.animation = '';
        }
    }

    // Play Tide Pool soundtrack
    function playSoundtrack() {
        if (!audio) return;
        audio.volume = 0.85;
        audio.play().then(() => {
            updateAudioUI(true);
        }).catch(err => {
            console.warn('Audio playback waiting:', err);
            updateAudioUI(false);
        });
    }

    function updateAudioUI(isPlaying) {
        if (isPlaying) {
            audioLabel.textContent = 'Playing: Tide Pool.mp3';
            audioToggleText.textContent = 'Mute';
            iconSound.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            `;
        } else {
            audioLabel.textContent = 'Soundtrack: Tide Pool.mp3 (Paused)';
            audioToggleText.textContent = 'Play';
            iconSound.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            `;
        }
    }

    // Main domain & coming soon sequence
    function runSequence() {
        if (sequenceTimer) clearTimeout(sequenceTimer);

        // Reset stages
        stageComingSoon.classList.remove('active', 'fading-out');
        stageDomain.classList.remove('fading-out');
        statusFooter.classList.remove('visible');

        // Step 1: Trace out myt5s.app
        stageDomain.classList.add('active');
        restartStageAnimation(stageDomain);

        // Step 2: After myt5s.app finishes trace (~2.8s), fade out and transition to Coming Soon...
        sequenceTimer = setTimeout(() => {
            stageDomain.classList.add('fading-out');

            setTimeout(() => {
                stageDomain.classList.remove('active');

                // Step 3: Trace out Coming Soon... and play Tide Pool.mp3
                stageComingSoon.classList.add('active');
                restartStageAnimation(stageComingSoon);

                // Play audio
                playSoundtrack();

                // Show status footer & controls
                setTimeout(() => {
                    statusFooter.classList.add('visible');
                }, 1000);
            }, 600); // Crossfade overlap
        }, 2800);
    }

    // Handle initial click anywhere
    function handleInitialStart() {
        if (sequenceStarted) return;
        sequenceStarted = true;

        // Unlock audio
        if (audio) {
            audio.load();
        }

        // Fade in background image ("have everything come along")
        document.body.classList.add('scene-unlocked');

        // Fade out initial black screen & traced Click Anywhere
        if (startScreen) {
            startScreen.classList.add('hidden');
        }

        // Begin sequence after smooth transition
        setTimeout(() => {
            runSequence();
        }, 400);
    }

    // Font loading initialization
    const fontReady = (document.fonts && document.fonts.load)
        ? Promise.all([
            document.fonts.load('italic 80px "Cormorant Garamond"'),
            document.fonts.ready
          ])
        : Promise.resolve();

    fontReady.then(() => {
        // Trace out "Click Anywhere" on the initial black screen
        if (startScreen) {
            restartStageAnimation(startScreen);
        }
    }).catch(() => {
        if (startScreen) {
            restartStageAnimation(startScreen);
        }
    });

    // Listen for initial user gesture
    if (startScreen) {
        startScreen.addEventListener('click', handleInitialStart);
    }
    document.addEventListener('keydown', handleInitialStart, { once: true });

    // Replay button
    btnReplay.addEventListener('click', (e) => {
        e.stopPropagation();
        runSequence();
    });

    // Audio toggle button
    btnAudioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!audio) return;
        if (audio.paused) {
            playSoundtrack();
        } else {
            audio.pause();
            updateAudioUI(false);
        }
    });
});
