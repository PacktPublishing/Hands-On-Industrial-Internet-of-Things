"use strict";
/*!
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.kFormat = Symbol('Logger formatter');
exports.kTag = Symbol('Logger tag format');
/**
 * A class representing a basic logger that emits logs to stdout.
 */
var Logger = /** @class */ (function () {
    // tslint:enable:no-any
    /**
     * Create a logger to print output to the console.
     */
    function Logger(opts) {
        var _this = this;
        var options = Object.assign({}, Logger.DEFAULT_OPTIONS, opts);
        this[exports.kTag] = options.tag ? ':' + options.tag + ':' : '';
        // Get the list of levels.
        // This is undocumented behavior and subject to change.
        var levels = options.levels || Logger.LEVELS;
        // Determine lowest log level.
        // If the given level is set to false, don't log anything.
        var levelIndex = -1;
        if (options.level !== false) {
            levelIndex =
                options.level ? levels.indexOf(options.level) : levels.length - 1;
            if (levelIndex === -1) {
                throw new Error("Logger: options.level [" + options.level + "] is not one of available levels [" + levels.join(', ') + "]");
            }
        }
        var _loop_1 = function (i) {
            var level = levels[i];
            if (i <= levelIndex) {
                // ts: This doesn't have an index signature, but we want to set
                // properties anyway.
                // tslint:disable-next-line:no-any
                this_1[level] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    args.unshift(level);
                    console.log(_this[exports.kFormat].apply(_this, args));
                    return _this;
                };
            }
            else {
                // tslint:disable-next-line:no-any
                this_1[level] = function () { return _this; };
            }
        };
        var this_1 = this;
        for (var i = 0; i < levels.length; i++) {
            _loop_1(i);
        }
    }
    // tslint:disable-next-line:no-any
    Logger.prototype[exports.kFormat] = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        level = level.toUpperCase();
        var message = args.join(' ');
        return "" + level + this[exports.kTag] + " " + message;
    };
    /**
     * Default logger options.
     */
    Logger.DEFAULT_OPTIONS = { level: 'error', tag: '' };
    /**
     * The list of log levels.
     */
    Logger.LEVELS = ['silent', 'error', 'warn', 'info', 'debug', 'silly'];
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map