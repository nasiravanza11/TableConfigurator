pc.script.createLoadingScreen((app) => {
    const STYLE_ID = 'tv-loading-style';

    const createCss = () => {
        if (document.getElementById(STYLE_ID)) return;

        const css = `
            body {
                background:
                    radial-gradient(900px 480px at 50% 18%, rgba(226, 179, 106, 0.14), transparent 55%),
                    #0e1219;
            }

            #application-splash-wrapper {
                position: absolute;
                inset: 0;
                display: grid;
                place-items: center;
                background:
                    radial-gradient(900px 480px at 50% 18%, rgba(226, 179, 106, 0.14), transparent 55%),
                    #0e1219;
                z-index: 100;
                font-family: "Outfit", ui-sans-serif, system-ui, sans-serif;
                color: #f4efe6;
            }

            #application-splash {
                width: min(340px, calc(100vw - 48px));
                padding: 28px 24px 22px;
                border-radius: 24px;
                background: rgba(16, 20, 28, 0.55);
                border: 1px solid rgba(255, 255, 255, 0.16);
                box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12);
                text-align: center;
            }

            @supports ((-webkit-backdrop-filter: blur(18px)) or (backdrop-filter: blur(18px))) {
                #application-splash {
                    background: rgba(16, 20, 28, 0.42);
                    -webkit-backdrop-filter: blur(18px) saturate(160%);
                    backdrop-filter: blur(18px) saturate(160%);
                }
            }

            #application-splash .tv-mark {
                width: 52px;
                height: 52px;
                margin: 0 auto 16px;
                border-radius: 16px;
                display: grid;
                place-items: center;
                background: linear-gradient(145deg, #e2b36a, #c98b4a);
                color: #1b140c;
                font-family: "Fraunces", Georgia, serif;
                font-weight: 700;
                font-size: 22px;
                box-shadow: 0 12px 28px rgba(201, 139, 74, 0.35);
            }

            #application-splash .tv-title {
                font-family: "Fraunces", Georgia, serif;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: -0.02em;
                margin: 0;
            }

            #application-splash .tv-sub {
                margin: 8px 0 0;
                font-size: 13px;
                color: rgba(244, 239, 230, 0.62);
                font-weight: 500;
            }

            #progress-bar-container {
                margin: 22px auto 0;
                height: 4px;
                width: 100%;
                border-radius: 999px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.08);
            }

            #progress-bar {
                width: 0%;
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(90deg, #e2b36a, #f0d2a0);
                box-shadow: 0 0 16px rgba(226, 179, 106, 0.45);
                transition: width 160ms ease;
            }

            #application-splash .tv-hint {
                margin: 12px 0 0;
                font-size: 11px;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: rgba(244, 239, 230, 0.42);
                font-weight: 650;
            }

            @media (max-width: 480px) {
                #application-splash {
                    padding: 22px 18px 18px;
                    border-radius: 20px;
                }

                #application-splash .tv-title {
                    font-size: 19px;
                }
            }
        `;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);
    };

    const showSplash = () => {
        const wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);

        const splash = document.createElement('div');
        splash.id = 'application-splash';
        splash.innerHTML = `
            <div class="tv-mark" aria-hidden="true">T</div>
            <h1 class="tv-title">Table Visualization</h1>
            <p class="tv-sub">Preparing materials, layouts, and lighting</p>
            <div id="progress-bar-container"><div id="progress-bar"></div></div>
            <p class="tv-hint">Loading scene</p>
        `;
        wrapper.appendChild(splash);
    };

    const setProgress = (value) => {
        const bar = document.getElementById('progress-bar');
        if (!bar) return;
        value = Math.min(1, Math.max(0, value));
        bar.style.width = `${value * 100}%`;
    };

    const hideSplash = () => {
        const wrapper = document.getElementById('application-splash-wrapper');
        if (wrapper) wrapper.remove();
    };

    createCss();
    showSplash();

    app.on('preload:end', () => {
        app.off('preload:progress');
    });
    app.on('preload:progress', setProgress);
    app.on('start', hideSplash);
});
