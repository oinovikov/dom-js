; (
    /**
     * @param {window} GLOBAL
     * @param {undefined} undefined
     */
    function (GLOBAL, undefined) {
        "use strict";

        /** @type {Document} */
        var DOC = GLOBAL.document;

        /** @type {HTMLDocument} */
        var $root = DOC.documentElement;

        /** @type {HTMLHeadElement} */
        var $head = DOC.head;

        /** @type {HTMLBodyElement} */
        var $body;

        /** @type {ObjectConstructor} */
        var OBJ = GLOBAL.Object;

        /** @type {Object} */
        var dom = OBJ.create(null);

        /** @type {number|undefined} */
        var isOldIE = new Function('/*@cc_on return @_jscript_version; @*\/')() !== undefined;

        /** @type {boolean} */
        var domReady = (!isOldIE && DOC.readyState !== 'loading')
            || (isOldIE && DOC.readyState === 'complete');

        /** @type {Array} */
        var initQueue = [];

        /** @type {Object} */
        var eventOptionsSupported = (function () {
            var options = {
                passive: false,
                capture: false,
                once: false,
            };

            var eventOptions = {};

            for (var option in options) {
                (function (option) {
                    OBJ.defineProperty(eventOptions, option, {
                        get: function () {
                            options[option] = true;
                        },
                    });
                })(option);
            }

            try {
                GLOBAL.addEventListener('test', null, eventOptions);
            } catch (err) { }

            return options;
        })();

        /**
         * Define a global immutable variable.
         */
        OBJ.defineProperty(GLOBAL, 'dom', {
            value: dom,
            enumerable: true,
            configurable: false,
            writable: false,
        });

        /**
         * Share ready handler for public access.
         */
        extend('ready', ready);
        extend('$root', $root);
        extend('$head', $head);

        /**
         * Initialize the library
         * when the DOM is ready.
         */
        ready(function () {
            $body = DOC.body;
            extend('$body', $body);
            console.log('dom ready');
        });

        if (domReady) {
            /**
             * If the DOM has already loaded,
             * initialize all queued init callbacks.
             */

            GLOBAL.setTimeout(init, 0);
        } else {
            /**
             * Else define event listeners for DOM ready event
             * or fallback for window load event.
             */

            DOC.addEventListener('DOMContentLoaded', init, false);
            GLOBAL.addEventListener('load', init, false);
        }

        /**
         * Calls handler when DOM is ready.
         *
         * @param {Function} callback
         *
         * @returns {Object} dom
         */
        function ready(callback) {
            if (typeof callback !== 'function') {
                throw new TypeError('Callback for `ready(callback)` must be a function.');
            }

            if (domReady) {
                callback();
            } else {
                initQueue.push(callback);
            }

            return dom;
        }

        /**
         * Calls queued init handlers
         * when DOM is ready.
         *
         * @returns {void}
         */
        function init() {
            if (!domReady) {
                DOC.removeEventListener('DOMContentLoaded', init);
                GLOBAL.removeEventListener('load', init);

                domReady = true;
            }

            while (initQueue.length) {
                initQueue.shift().call(DOC, dom);
            }
        }

        /**
         * Extends library object.
         *
         * @param {string} name
         *
         * @param {*} value
         *
         * @returns {Object} dom
         */
        function extend(name, value) {
            return OBJ.defineProperty(dom, name, {
                value: value,
                enumerable: true,
                configurable: false,
                writable: false,
            });
        }
    }
)(new Function('return this')());
