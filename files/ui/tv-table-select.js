/**
 * Table Visualization — minimal table selector.
 * Three model buttons, dark/light environment, watermark, no right-click pan.
 */
(function (global) {
    'use strict';

    var ROOT_ID = 'tv-table-ui';
    var STYLE_ID = 'tv-table-ui-style';
    var FONT_ID = 'tv-ui-fonts';
    var MODELS = [
        { id: '207', label: 'Round Table', hint: 'Circular' },
        { id: '303', label: 'Square Table', hint: 'Square' },
        { id: '400', label: 'Rectangle Table', hint: 'Rectangular' }
    ];

    var ENV = {
        dark: {
            clear: [0, 0, 0, 1],
            ambient: [0.18, 0.18, 0.2],
            exposure: 1.25,
            skyboxIntensity: 0,
            lightIntensity: 0.8
        },
        light: {
            clear: [0.78, 0.79, 0.81, 1],
            ambient: [0.95, 0.95, 0.96],
            exposure: 2.4,
            skyboxIntensity: 2.2,
            lightIntensity: 1.15
        }
    };

    var loadToken = 0;
    var activeId = '207';
    var activeEnv = 'dark';
    var baseline = null;

    function ensureFonts() {
        if (document.getElementById(FONT_ID)) return;
        var pre1 = document.createElement('link');
        pre1.rel = 'preconnect';
        pre1.href = 'https://fonts.googleapis.com';
        var pre2 = document.createElement('link');
        pre2.rel = 'preconnect';
        pre2.href = 'https://fonts.gstatic.com';
        pre2.crossOrigin = 'anonymous';
        var link = document.createElement('link');
        link.id = FONT_ID;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@450;600;700&display=swap';
        document.head.appendChild(pre1);
        document.head.appendChild(pre2);
        document.head.appendChild(link);
    }

    function css() {
        return [
            '#tv-table-ui{position:fixed;inset:0;z-index:40;pointer-events:none;font-family:"Outfit",ui-sans-serif,system-ui,sans-serif;color:#f3efe8;-webkit-font-smoothing:antialiased;}',
            '#tv-table-ui *{box-sizing:border-box;}',
            '#tv-table-ui .tv-top,#tv-table-ui .tv-dock,#tv-table-ui .tv-loader{pointer-events:auto;}',
            '#tv-table-ui .tv-top{position:absolute;top:18px;left:50%;transform:translateX(-50%);display:flex;gap:8px;padding:8px;border-radius:18px;background:rgba(12,16,22,.72);border:1px solid rgba(255,255,255,.14);box-shadow:0 14px 36px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.1);}',
            '#tv-table-ui .tv-dock{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;gap:10px;padding:10px;border-radius:22px;background:rgba(12,16,22,.72);border:1px solid rgba(255,255,255,.14);box-shadow:0 18px 48px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.1);}',
            '@supports ((-webkit-backdrop-filter:blur(16px)) or (backdrop-filter:blur(16px))){',
            '#tv-table-ui .tv-top,#tv-table-ui .tv-dock{background:rgba(12,16,22,.55);-webkit-backdrop-filter:blur(16px) saturate(150%);backdrop-filter:blur(16px) saturate(150%);}',
            '}',
            '#tv-table-ui .tv-env,#tv-table-ui .tv-btn{appearance:none;border:0;cursor:pointer;border-radius:14px;background:rgba(255,255,255,.04);color:#f3efe8;border:1px solid transparent;transition:background .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease;}',
            '#tv-table-ui .tv-env{min-width:96px;padding:10px 14px;font-size:12px;font-weight:700;letter-spacing:.02em;}',
            '#tv-table-ui .tv-btn{min-width:124px;padding:12px 16px;text-align:left;}',
            '#tv-table-ui .tv-env:hover,#tv-table-ui .tv-btn:hover{background:rgba(255,255,255,.08);transform:translateY(-1px);}',
            '#tv-table-ui .tv-env:active,#tv-table-ui .tv-btn:active{transform:scale(.98);}',
            '#tv-table-ui .tv-env:focus-visible,#tv-table-ui .tv-btn:focus-visible{outline:2px solid rgba(226,179,106,.7);outline-offset:2px;}',
            '#tv-table-ui .tv-env.is-active,#tv-table-ui .tv-btn.is-active{background:linear-gradient(180deg,rgba(226,179,106,.28),rgba(226,179,106,.1));border-color:rgba(226,179,106,.55);box-shadow:inset 0 0 0 1px rgba(226,179,106,.2);}',
            '#tv-table-ui .tv-btn.is-busy{opacity:.72;cursor:wait;}',
            '#tv-table-ui .tv-btn strong{display:block;font-size:13px;font-weight:700;letter-spacing:.01em;}',
            '#tv-table-ui .tv-btn span{display:block;margin-top:3px;font-size:11px;font-weight:450;color:rgba(243,239,232,.55);}',
            '#tv-table-ui .tv-mark{position:absolute;right:18px;bottom:22px;pointer-events:none;text-align:right;user-select:none;}',
            '#tv-table-ui .tv-mark .tv-mark-title{font-size:12px;font-weight:700;letter-spacing:.04em;color:rgba(243,239,232,.42);}',
            '#tv-table-ui .tv-mark .tv-mark-name{margin-top:3px;font-size:13px;font-weight:700;color:rgba(226,179,106,.72);}',
            '#tv-table-ui .tv-loader{position:absolute;inset:0;display:none;place-items:center;background:rgba(8,11,16,.35);}',
            '#tv-table-ui .tv-loader.is-on{display:grid;}',
            '#tv-table-ui .tv-spinner{width:54px;height:54px;border-radius:50%;border:3px solid rgba(255,255,255,.12);border-top-color:#e2b36a;animation:tvSpin .75s linear infinite;box-shadow:0 0 24px rgba(226,179,106,.2);}',
            '@keyframes tvSpin{to{transform:rotate(360deg);}}',
            '@media (max-width:640px){',
            '#tv-table-ui .tv-top{left:12px;right:12px;transform:none;justify-content:center;}',
            '#tv-table-ui .tv-dock{left:12px;right:12px;bottom:12px;transform:none;justify-content:stretch;}',
            '#tv-table-ui .tv-btn{min-width:0;flex:1;padding:11px 12px;}',
            '#tv-table-ui .tv-mark{right:12px;bottom:92px;}',
            '}',
            '@media (prefers-reduced-motion:reduce){#tv-table-ui .tv-spinner{animation:none;}}'
        ].join('');
    }

    function injectStyle() {
        var el = document.getElementById(STYLE_ID);
        if (!el) {
            el = document.createElement('style');
            el.id = STYLE_ID;
            document.head.appendChild(el);
        }
        el.textContent = css();
    }

    function getApp() {
        if (typeof pc === 'undefined') return null;
        if (pc.app) return pc.app;
        if (pc.Application && pc.Application.getApplication) return pc.Application.getApplication();
        return null;
    }

    function visit(entity, fn) {
        if (!entity) return;
        fn(entity);
        var kids = entity.children || [];
        for (var i = 0; i < kids.length; i++) visit(kids[i], fn);
    }

    function hideLegacyUi(app) {
        if (!app || !app.root) return;
        visit(app.root, function (entity) {
            if (entity.name === '2D Screen') entity.enabled = false;
            if (entity.element && entity.element.type === pc.ELEMENTTYPE_SCREEN) entity.enabled = false;
        });
    }

    function stripOverlays() {
        ['kc-glass-ui', 'kc-glass-ui-style'].forEach(function (id) {
            var node = document.getElementById(id);
            if (node && node.parentNode) node.parentNode.removeChild(node);
        });
    }

    function disableLegacyOverlaySystems() {
        if (typeof GlassUI !== 'undefined') GlassUI.boot = function () { return null; };
        if (typeof Hotspots !== 'undefined') Hotspots.boot = function () { return null; };
        if (typeof KitchenBootstrap !== 'undefined' && KitchenBootstrap.run) {
            KitchenBootstrap.run = function (app, opts) {
                if (!app) return;
                app._kcBootstrapDone = true;
                if (!opts || opts.hideLegacyScreens !== false) hideLegacyUi(app);
            };
        }
        if (typeof global.kitchenUiEnsureLaunch === 'function') {
            global.kitchenUiEnsureLaunch = function (app) {
                if (app) {
                    app.__kcKitchenUiDone = true;
                    hideLegacyUi(app);
                }
                return true;
            };
        }
    }

    function disableRightClickPan() {
        // Root cause: MouseInput pans orbitCamera.pivotPoint on right-click,
        // which looks like the model is translating. Keep left-orbit + wheel zoom.
        if (typeof MouseInput === 'undefined') return;
        MouseInput.prototype.onMouseDown = function (event) {
            switch (event.button) {
                case pc.MOUSEBUTTON_LEFT:
                    this.lookButtonDown = true;
                    break;
                case pc.MOUSEBUTTON_MIDDLE:
                    this.panButtonDown = true;
                    break;
                case pc.MOUSEBUTTON_RIGHT:
                    // Ignore — do not pan / move pivot.
                    this.panButtonDown = false;
                    break;
            }
        };
        MouseInput.prototype.onMouseUp = function (event) {
            switch (event.button) {
                case pc.MOUSEBUTTON_LEFT:
                    this.lookButtonDown = false;
                    break;
                case pc.MOUSEBUTTON_MIDDLE:
                    this.panButtonDown = false;
                    break;
                case pc.MOUSEBUTTON_RIGHT:
                    this.panButtonDown = false;
                    break;
            }
        };
        if (typeof document !== 'undefined') {
            document.addEventListener('contextmenu', function (e) {
                e.preventDefault();
            }, { passive: false });
        }
    }

    function findChangeTexture(app) {
        var found = null;
        visit(app.root, function (entity) {
            if (!found && entity.script && entity.script.changeTexture) {
                found = entity.script.changeTexture;
            }
        });
        return found;
    }

    function findCamera(app) {
        var found = null;
        visit(app.root, function (entity) {
            if (!found && entity.camera) found = entity;
        });
        return found;
    }

    function findDirectionalLight(app) {
        var found = null;
        visit(app.root, function (entity) {
            if (!found && entity.light && entity.light.type === 'directional') found = entity;
        });
        return found;
    }

    function modelEntityFor(app, id) {
        var ct = findChangeTexture(app);
        if (!ct) return null;
        if (id === '207') return ct.Model_207 || null;
        if (id === '303') return ct.Model_303 || null;
        if (id === '400') return ct.Model_400 || null;
        return null;
    }

    function captureBaseline(app) {
        if (baseline) return;
        var cam = findCamera(app);
        var light = findDirectionalLight(app);
        baseline = {
            exposure: app.scene.exposure,
            skyboxIntensity: app.scene.skyboxIntensity,
            ambient: app.scene.ambientLight ? app.scene.ambientLight.clone() : new pc.Color(1, 1, 1),
            clear: cam && cam.camera ? cam.camera.clearColor.clone() : new pc.Color(0.12, 0.12, 0.12),
            lightIntensity: light && light.light ? light.light.intensity : 1
        };
    }

    function setEnvironment(app, mode) {
        if (!app || !ENV[mode]) return;
        captureBaseline(app);
        activeEnv = mode;
        var preset = ENV[mode];
        var cam = findCamera(app);
        var light = findDirectionalLight(app);

        if (cam && cam.camera) {
            cam.camera.clearColor = new pc.Color(preset.clear[0], preset.clear[1], preset.clear[2], preset.clear[3]);
        }
        if (app.scene.ambientLight) {
            app.scene.ambientLight.set(preset.ambient[0], preset.ambient[1], preset.ambient[2]);
        }
        app.scene.exposure = preset.exposure;
        app.scene.skyboxIntensity = preset.skyboxIntensity;
        if (light && light.light) light.light.intensity = preset.lightIntensity;

        var root = document.getElementById(ROOT_ID);
        if (root) {
            root.querySelectorAll('.tv-env').forEach(function (btn) {
                btn.classList.toggle('is-active', btn.getAttribute('data-env') === mode);
            });
        }
    }

    function syncButtons() {
        var root = document.getElementById(ROOT_ID);
        if (!root) return;
        var busy = root.classList.contains('is-loading');
        root.querySelectorAll('.tv-btn').forEach(function (btn) {
            var id = btn.getAttribute('data-model');
            btn.classList.toggle('is-active', id === activeId);
            btn.classList.toggle('is-busy', busy);
            btn.disabled = busy;
        });
        root.querySelectorAll('.tv-env').forEach(function (btn) {
            btn.classList.toggle('is-active', btn.getAttribute('data-env') === activeEnv);
        });
    }

    function setLoading(on) {
        var root = document.getElementById(ROOT_ID);
        if (!root) return;
        root.classList.toggle('is-loading', !!on);
        var loader = root.querySelector('.tv-loader');
        if (loader) loader.classList.toggle('is-on', !!on);
        syncButtons();
    }

    function waitForModel(app, id, token) {
        var started = Date.now();
        var minMs = 320;
        var maxMs = 8000;

        return new Promise(function (resolve, reject) {
            var frames = 0;
            var tick = function () {
                if (token !== loadToken) {
                    resolve({ stale: true });
                    return;
                }

                var entity = modelEntityFor(app, id);
                if (!entity) {
                    if (Date.now() - started > maxMs) {
                        reject(new Error('Model ' + id + ' not found'));
                        return;
                    }
                    requestAnimationFrame(tick);
                    return;
                }

                if (entity.enabled) {
                    frames += 1;
                    if (frames >= 2 && Date.now() - started >= minMs) {
                        resolve({ stale: false, entity: entity });
                        return;
                    }
                } else if (Date.now() - started > maxMs) {
                    reject(new Error('Model ' + id + ' failed to enable'));
                    return;
                }

                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }

    function selectModel(app, id, force) {
        if (!app || (id !== '207' && id !== '303' && id !== '400')) return;
        var root = document.getElementById(ROOT_ID);
        if (!force && id === activeId && root && !root.classList.contains('is-loading')) {
            return;
        }

        var token = ++loadToken;
        activeId = id;
        setLoading(true);

        try {
            app.fire('ui:ButtonPressed', id);
        } catch (err) {
            if (token === loadToken) {
                setLoading(false);
                console.error('[Table Visualization] Model switch failed', err);
            }
            return;
        }

        waitForModel(app, id, token)
            .then(function (result) {
                if (token !== loadToken || (result && result.stale)) return;
                setLoading(false);
            })
            .catch(function (err) {
                if (token !== loadToken) return;
                setLoading(false);
                console.error('[Table Visualization]', err && err.message ? err.message : err);
            });
    }

    function mountUi(app) {
        stripOverlays();
        ensureFonts();
        injectStyle();

        var existing = document.getElementById(ROOT_ID);
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

        var root = document.createElement('div');
        root.id = ROOT_ID;
        root.setAttribute('role', 'application');
        root.setAttribute('aria-label', 'Table Visualization');

        var buttons = MODELS.map(function (m) {
            return (
                '<button type="button" class="tv-btn" data-model="' + m.id + '" aria-label="' + m.label + '">' +
                '<strong>' + m.label + '</strong><span>' + m.hint + '</span></button>'
            );
        }).join('');

        root.innerHTML =
            '<div class="tv-top" role="group" aria-label="Environment">' +
            '<button type="button" class="tv-env" data-env="dark" aria-label="Dark environment">Dark</button>' +
            '<button type="button" class="tv-env" data-env="light" aria-label="Light environment">Light</button>' +
            '</div>' +
            '<div class="tv-loader" aria-live="polite" aria-busy="true"><div class="tv-spinner" aria-hidden="true"></div></div>' +
            '<div class="tv-dock" role="navigation" aria-label="Table models">' + buttons + '</div>' +
            '<div class="tv-mark" aria-hidden="true">' +
            '<div class="tv-mark-title">3d Model Configurator</div>' +
            '<div class="tv-mark-name">Nasir Jamil</div>' +
            '</div>';

        root.addEventListener('click', function (e) {
            var envBtn = e.target.closest('[data-env]');
            if (envBtn) {
                e.stopPropagation();
                setEnvironment(app, envBtn.getAttribute('data-env'));
                return;
            }
            var btn = e.target.closest('[data-model]');
            if (!btn || root.classList.contains('is-loading')) return;
            e.stopPropagation();
            selectModel(app, btn.getAttribute('data-model'));
        });

        root.addEventListener('pointerdown', function (e) {
            if (e.target.closest('.tv-dock') || e.target.closest('.tv-top') || e.target.closest('.tv-loader')) {
                e.stopPropagation();
                if (typeof window !== 'undefined') {
                    window.orbitRotated = true;
                    window.timeInterval = 0;
                }
            }
        }, true);

        document.body.appendChild(root);
        syncButtons();
    }

    function launch(app) {
        if (!app || !app.root) return false;

        disableLegacyOverlaySystems();
        disableRightClickPan();
        hideLegacyUi(app);
        stripOverlays();
        mountUi(app);
        setEnvironment(app, 'dark');

        app._kcBootstrapDone = true;
        app.__kcKitchenUiDone = true;

        activeId = null;
        selectModel(app, '207', true);

        console.log('[Table Visualization] UI ready');
        return true;
    }

    function waitAndLaunch() {
        var tries = 0;
        var tick = function () {
            disableLegacyOverlaySystems();
            stripOverlays();
            var app = getApp();
            if (app && app.root && app.graphicsDevice && app.root.children.length > 0) {
                if (launch(app)) return;
            }
            tries += 1;
            if (tries < 200) setTimeout(tick, 50);
            else console.warn('[Table Visualization] UI launch timed out');
        };
        tick();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitAndLaunch);
    } else {
        waitAndLaunch();
    }

    global.tvTableSelect = { launch: launch, setEnvironment: setEnvironment };
})(typeof window !== 'undefined' ? window : this);
