/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import KTComponent from '../component';
import KTData from '../../helpers/data';
var DEFAULT_CONFIG = {
    position: 'top-end',
    duration: 4000,
    className: '',
    maxToasts: 5,
    offset: 15,
    gap: 10,
};
var DEFAULT_TOAST_OPTIONS = {
    appearance: 'solid',
    progress: false,
    size: 'md',
    action: false,
    cancel: false,
    dismiss: true,
};
var KTToast = /** @class */ (function (_super) {
    __extends(KTToast, _super);
    /**
     * Creates a new KTToast instance for a specific element (not commonly used; most use static API).
     * @param element The target HTML element.
     * @param config Optional toast config for this instance.
     */
    function KTToast(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'toast';
        _this._defaultConfig = DEFAULT_CONFIG;
        _this._config = DEFAULT_CONFIG;
        _this._defaultToastOptions = DEFAULT_TOAST_OPTIONS;
        if (KTData.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        KTData.set(element, _this._name, _this);
        return _this;
    }
    /**
     * Generates the HTML content for a toast based on the provided options.
     * @param options Toast options (message, icon, actions, etc).
     * @returns The toast's HTML markup as a string.
     */
    KTToast.getContent = function (options) {
        var classNames = __assign(__assign({}, (this.globalConfig.classNames || {})), ((options === null || options === void 0 ? void 0 : options.classNames) || {}));
        if (options === null || options === void 0 ? void 0 : options.content) {
            if (typeof options.content === 'string') {
                return options.content;
            }
            else if (typeof options.content === 'function') {
                var node = options.content();
                if (node instanceof HTMLElement) {
                    return node.outerHTML;
                }
            }
            else if (options.content instanceof HTMLElement) {
                return options.content.outerHTML;
            }
        }
        var template = '';
        if (options === null || options === void 0 ? void 0 : options.icon) {
            template +=
                '<div class="kt-alert-icon ' +
                    (classNames.icon || '') +
                    '">' +
                    options.icon +
                    '</div>';
        }
        if (options === null || options === void 0 ? void 0 : options.message) {
            template +=
                '<div class="kt-alert-title ' +
                    (classNames.message || '') +
                    '">' +
                    options.message +
                    '</div>';
        }
        if ((options === null || options === void 0 ? void 0 : options.action) !== false ||
            (options === null || options === void 0 ? void 0 : options.dismiss) !== false ||
            (options === null || options === void 0 ? void 0 : options.cancel) !== false) {
            template +=
                '<div class="kt-alert-toolbar ' + (classNames.toolbar || '') + '">';
            template +=
                '<div class="kt-alert-actions ' + (classNames.actions || '') + '">';
            if ((options === null || options === void 0 ? void 0 : options.action) && typeof options.action === 'object') {
                template +=
                    '<button data-kt-toast-action="true" class="' +
                        (options.action.className || '') +
                        '">' +
                        options.action.label +
                        '</button>';
            }
            if ((options === null || options === void 0 ? void 0 : options.cancel) && typeof options.cancel === 'object') {
                template +=
                    '<button data-kt-toast-cancel="true" class="' +
                        (options.cancel.className || '') +
                        '">' +
                        options.cancel.label +
                        '</button>';
            }
            if ((options === null || options === void 0 ? void 0 : options.dismiss) !== false) {
                template +=
                    '<button data-kt-toast-dismiss="true" class="kt-alert-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';
            }
            template += '</div>';
            template += '</div>';
        }
        template += '</div>';
        return template;
    };
    /**
     * Update all toasts in the container with smooth animation.
     *
     * @param container The toast container element.
     * @param offset Optional offset from the edge.
     */
    KTToast.update = function (container, offset) {
        var _this = this;
        var _a;
        if (!container)
            return;
        offset =
            typeof offset === 'number' ? offset : ((_a = this.globalConfig.offset) !== null && _a !== void 0 ? _a : 15);
        requestAnimationFrame(function () {
            var _a;
            var gap = (_a = _this.globalConfig.gap) !== null && _a !== void 0 ? _a : 8;
            // Group toasts by alignment (top/bottom)
            var positionGroups = {
                top: [],
                bottom: [],
            };
            var toasts = Array.from(container.children);
            toasts.forEach(function (toast) {
                if (toast.classList.contains('kt-toast-top-end') ||
                    toast.classList.contains('kt-toast-top-center') ||
                    toast.classList.contains('kt-toast-top-start')) {
                    positionGroups.top.push(toast);
                }
                else {
                    positionGroups.bottom.push(toast);
                }
            });
            // Stack top toasts from the top down
            var currentOffset = offset;
            positionGroups.top.forEach(function (toast) {
                toast.style.top = "".concat(currentOffset, "px");
                toast.style.bottom = '';
                toast.style.transition =
                    'top 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s cubic-bezier(.4,0,.2,1)';
                currentOffset += toast.offsetHeight + gap;
                if (toast.classList.contains('kt-toast-top-start')) {
                    toast.style.insetInlineStart = "".concat(offset, "px");
                }
                if (toast.classList.contains('kt-toast-top-end')) {
                    toast.style.insetInlineEnd = "".concat(offset, "px");
                }
            });
            // Stack bottom toasts from the bottom up
            currentOffset = offset;
            for (var i = positionGroups.bottom.length - 1; i >= 0; i--) {
                var toast = positionGroups.bottom[i];
                toast.style.bottom = "".concat(currentOffset, "px");
                toast.style.top = '';
                toast.style.transition =
                    'bottom 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s cubic-bezier(.4,0,.2,1)';
                currentOffset += toast.offsetHeight + gap;
                if (toast.classList.contains('kt-toast-bottom-start')) {
                    toast.style.insetInlineStart = "".concat(offset, "px");
                }
                if (toast.classList.contains('kt-toast-bottom-end')) {
                    toast.style.insetInlineEnd = "".concat(offset, "px");
                }
            }
        });
    };
    /**
     * Set global toast configuration options.
     * @param options Partial toast config to merge with global config.
     */
    KTToast.config = function (options) {
        this.globalConfig = __assign(__assign({}, this.globalConfig), options);
    };
    /**
     * Show a toast notification.
     * @param inputOptions Toast options (message, duration, variant, etc).
     * @returns Toast instance with dismiss method, or undefined if invalid input.
     */
    KTToast.show = function (inputOptions) {
        var _a, _b, _c, _d;
        var options = __assign(__assign({}, DEFAULT_TOAST_OPTIONS), inputOptions);
        if (!options || (!options.message && !options.content)) {
            return undefined;
        }
        // Always resolve the id once and use it everywhere
        var id = "kt-toast-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 8));
        var position = options.position || this.globalConfig.position || 'top-end';
        var classNames = __assign(__assign({}, (this.globalConfig.classNames || {})), (options.classNames || {}));
        var container = this.containerMap.get(position);
        if (!container) {
            container = document.createElement('div');
            var classNames_1 = __assign(__assign({}, (this.globalConfig.classNames || {})), (options.classNames || {}));
            // Fallback to default hardcoded classes if not provided in options or globalConfig
            container.className =
                classNames_1.container || "kt-toast-container ".concat(position);
            document.body.appendChild(container);
            this.containerMap.set(position, container);
        }
        // Enforce maxToasts
        if (container.children.length >=
            (this.globalConfig.maxToasts || DEFAULT_CONFIG.maxToasts)) {
            var firstToast_1 = container.firstElementChild;
            if (firstToast_1) {
                firstToast_1.classList.add('kt-toast-closing');
                firstToast_1.addEventListener('animationend', function () {
                    firstToast_1.remove();
                });
            }
        }
        // Create toast element
        var variantMap = {
            info: 'kt-alert-info',
            success: 'kt-alert-success',
            error: 'kt-alert-error',
            warning: 'kt-alert-warning',
            primary: 'kt-alert-primary',
            secondary: 'kt-alert-secondary',
            destructive: 'kt-alert-destructive',
            mono: 'kt-alert-mono',
        };
        var appearanceMap = {
            solid: 'kt-alert-solid',
            outline: 'kt-alert-outline',
            light: 'kt-alert-light',
        };
        var sizeMap = {
            sm: 'kt-alert-sm',
            md: 'kt-alert-md',
            lg: 'kt-alert-lg',
        };
        var toast = document.createElement('div');
        toast.className = "kt-toast kt-alert ".concat(variantMap[options.variant] || '', " ").concat(appearanceMap[options.appearance] || '', " ").concat(sizeMap[options.size] || '', " ").concat(options.className || '', " ").concat(classNames.toast || '');
        // ARIA support
        toast.setAttribute('role', options.role || 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.setAttribute('aria-atomic', 'true');
        toast.setAttribute('tabindex', '0');
        // Always resolve the id once and use it everywhere
        // Always resolve id ONCE at the top, use everywhere
        // (Move this up to replace the previous const id = ... assignment)
        // Populate content via getContent
        var contentHtml = KTToast.getContent(options);
        toast.innerHTML = contentHtml;
        // Assign event handlers to buttons by data attribute
        var actionBtn = toast.querySelector('[data-kt-toast-action]');
        if (actionBtn &&
            options.action &&
            typeof options.action === 'object' &&
            options.action.onClick) {
            actionBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (typeof options.action === 'object' && options.action.onClick) {
                    options.action.onClick(id);
                    KTToast.close(id);
                }
            });
        }
        var cancelBtn = toast.querySelector('[data-kt-toast-cancel]');
        if (cancelBtn && options.cancel && typeof options.cancel === 'object') {
            cancelBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (typeof options.cancel === 'object' && options.cancel.onClick) {
                    options.cancel.onClick(id);
                    KTToast.close(id);
                }
            });
        }
        // Dismiss button handler
        var dismissBtn = toast.querySelector('[data-kt-toast-dismiss]');
        if (dismissBtn && options.dismiss !== false) {
            dismissBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                KTToast.close(id);
            });
        }
        // If modal-like, set aria-modal
        if (options.important)
            toast.setAttribute('aria-modal', 'true');
        toast.style.pointerEvents = 'auto';
        // Progress line
        var duration = options.important
            ? null
            : ((_b = (_a = options.duration) !== null && _a !== void 0 ? _a : this.globalConfig.duration) !== null && _b !== void 0 ? _b : DEFAULT_CONFIG.duration);
        if (duration && options.progress) {
            var progress = document.createElement('div');
            progress.className = 'kt-toast-progress ' + (classNames.progress || '');
            progress.style.animationDuration = duration + 'ms';
            progress.setAttribute('data-kt-toast-progress', 'true');
            toast.appendChild(progress);
        }
        // Assign direction class to the toast itself, not the container
        var directionClassMap = {
            'top-end': 'kt-toast-top-end',
            'top-center': 'kt-toast-top-center',
            'top-start': 'kt-toast-top-start',
            'bottom-end': 'kt-toast-bottom-end',
            'bottom-center': 'kt-toast-bottom-center',
            'bottom-start': 'kt-toast-bottom-start',
        };
        Object.values(directionClassMap).forEach(function (cls) {
            return toast.classList.remove(cls);
        });
        var dirClass = directionClassMap[position] || 'kt-toast-top-end';
        toast.classList.add(dirClass);
        // Enforce maxToasts: remove oldest if needed
        var maxToasts = (_d = (_c = options.maxToasts) !== null && _c !== void 0 ? _c : this.globalConfig.maxToasts) !== null && _d !== void 0 ? _d : DEFAULT_CONFIG.maxToasts;
        var currentToasts = Array.from(container.children);
        if (currentToasts.length >= maxToasts && currentToasts.length > 0) {
            var oldestToast = currentToasts[currentToasts.length - 1];
            var oldestId = oldestToast.getAttribute('data-kt-toast-id');
            if (oldestId) {
                KTToast.close(oldestId);
            }
            else {
                oldestToast.remove();
            }
        }
        // Insert toast at the top
        container.insertBefore(toast, container.firstChild);
        KTToast.update(container);
        // Play beep if requested
        if (options.beep) {
            try {
                // Use Web Audio API for a short beep
                var ctx_1 = new (window.AudioContext ||
                    window.webkitAudioContext)();
                var o_1 = ctx_1.createOscillator();
                var g = ctx_1.createGain();
                o_1.type = 'sine';
                o_1.frequency.value = 880;
                g.gain.value = 0.09;
                o_1.connect(g);
                g.connect(ctx_1.destination);
                o_1.start();
                setTimeout(function () {
                    o_1.stop();
                    ctx_1.close();
                }, 120);
            }
            catch (e) {
                /* ignore */
            }
        }
        KTToast._fireEventOnElement(toast, 'show', { id: id });
        KTToast._dispatchEventOnElement(toast, 'show', { id: id });
        var instance = { id: id, element: toast, timeoutId: 0 };
        KTToast.toasts.set(id, instance);
        // Auto-dismiss
        var timeoutId = undefined;
        var remaining = duration;
        var startTime;
        var paused = false;
        var progressEl = null;
        if (duration) {
            var startTimer_1 = function (ms) {
                startTime = Date.now();
                timeoutId = window.setTimeout(function () {
                    var _a;
                    (_a = options.onAutoClose) === null || _a === void 0 ? void 0 : _a.call(options, id);
                    KTToast.close(id);
                }, ms);
                instance.timeoutId = timeoutId;
            };
            startTimer_1(duration);
            if (options.pauseOnHover) {
                progressEl = toast.querySelector('[data-kt-toast-progress]');
                var progressPausedAt_1 = 0;
                var pause = function () {
                    if (!paused && timeoutId) {
                        paused = true;
                        window.clearTimeout(timeoutId);
                        if (startTime) {
                            remaining -= Date.now() - startTime;
                        }
                        // Pause progress bar
                        if (progressEl) {
                            var computedStyle = window.getComputedStyle(progressEl);
                            var matrix = computedStyle.transform;
                            var scaleX = 1;
                            if (matrix && matrix !== 'none') {
                                var values = matrix.match(/matrix\(([^)]+)\)/);
                                if (values && values[1]) {
                                    scaleX = parseFloat(values[1].split(',')[0]);
                                }
                            }
                            progressPausedAt_1 = scaleX;
                            progressEl.style.animation = 'none';
                            progressEl.style.transition = 'none';
                            progressEl.style.transform = "scaleX(".concat(scaleX, ")");
                        }
                    }
                };
                var resume = function () {
                    if (paused && remaining > 0) {
                        paused = false;
                        startTimer_1(remaining);
                        // Resume progress bar
                        if (progressEl) {
                            progressEl.style.transition = 'transform 0ms';
                            progressEl.style.transform = "scaleX(".concat(progressPausedAt_1, ")");
                            progressEl.offsetHeight; // force reflow
                            progressEl.style.transition = "transform ".concat(remaining, "ms linear");
                            progressEl.style.transform = 'scaleX(0)';
                        }
                    }
                };
                toast.addEventListener('mouseenter', pause);
                toast.addEventListener('mouseleave', resume);
            }
        }
        KTToast._fireEventOnElement(toast, 'shown', { id: id });
        KTToast._dispatchEventOnElement(toast, 'shown', { id: id });
        return __assign(__assign({}, instance), { dismiss: function () { return KTToast.close(id); } });
    };
    /**
     * Close and remove all active toasts.
     */
    KTToast.clearAll = function (clearContainers) {
        if (clearContainers === void 0) { clearContainers = false; }
        for (var _i = 0, _a = Array.from(this.toasts.keys()); _i < _a.length; _i++) {
            var id = _a[_i];
            console.log('clearAll:', id);
            this.close(id);
        }
        if (clearContainers) {
            // Remove all containers from the DOM.
            this.containerMap.forEach(function (container, position) {
                container.remove();
                console.log('clearAll: removed container for position', position);
            });
            // Clear containerMap to prevent stale references.
            this.containerMap.clear();
        }
    };
    /**
     * Close a toast by ID or instance.
     * @param idOrInstance Toast ID string or KTToastInstance.
     */
    KTToast.close = function (idOrInstance) {
        var inst;
        var id;
        if (!idOrInstance)
            return;
        if (typeof idOrInstance === 'string') {
            id = idOrInstance;
            inst = this.toasts.get(id);
        }
        else if (typeof idOrInstance === 'object' && idOrInstance.id) {
            id = idOrInstance.id;
            inst = idOrInstance;
        }
        if (!inst || !id)
            return;
        if (inst._closing)
            return; // Prevent double-close
        inst._closing = true;
        clearTimeout(inst.timeoutId);
        KTToast._fireEventOnElement(inst.element, 'hide', { id: id });
        KTToast._dispatchEventOnElement(inst.element, 'hide', { id: id });
        // Remove progress bar instantly if present
        var progressEl = inst.element.querySelector('[data-kt-toast-progress]');
        if (progressEl)
            progressEl.remove();
        inst.element.style.animation = 'kt-toast-out 0.25s forwards';
        setTimeout(function () {
            var _a;
            var parent = inst === null || inst === void 0 ? void 0 : inst.element.parentElement;
            inst === null || inst === void 0 ? void 0 : inst.element.remove();
            KTToast.toasts.delete(id);
            // Try to call onDismiss if available in the toast instance (if stored)
            if (typeof ((_a = inst.options) === null || _a === void 0 ? void 0 : _a.onDismiss) === 'function') {
                inst.options.onDismiss(id);
            }
            KTToast._fireEventOnElement(inst.element, 'hidden', { id: id });
            KTToast._dispatchEventOnElement(inst.element, 'hidden', { id: id });
            // update toasts asynchronously after DOM update
            setTimeout(function () {
                KTToast.update(parent);
            }, 0);
        }, 250);
    };
    /**
     * Dispatches a custom 'kt.toast.{eventType}' event on the given element.
     * @param element The toast element.
     * @param eventType The event type (e.g. 'show', 'hide').
     * @param payload Optional event detail payload.
     */
    KTToast._fireEventOnElement = function (element, eventType, payload) {
        var event = new CustomEvent("kt.toast.".concat(eventType), { detail: payload });
        element.dispatchEvent(event);
    };
    /**
     * Dispatches a custom event (not namespaced) on the given element.
     * @param element The toast element.
     * @param eventType The event type.
     * @param payload Optional event detail payload.
     */
    KTToast._dispatchEventOnElement = function (element, eventType, payload) {
        var event = new CustomEvent(eventType, { detail: payload });
        element.dispatchEvent(event);
    };
    /**
     * Initialize toast system (placeholder for future use).
     */
    KTToast.init = function () { };
    KTToast.containerMap = new Map();
    KTToast.toasts = new Map();
    KTToast.globalConfig = __assign({}, DEFAULT_CONFIG);
    return KTToast;
}(KTComponent));
export { KTToast };
//# sourceMappingURL=toast.js.map