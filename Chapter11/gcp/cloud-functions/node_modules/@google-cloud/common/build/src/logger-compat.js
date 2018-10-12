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
/**
 * This file exports the logger function with the surface present in <=0.17.0.
 */
var is = require("is");
var logger_1 = require("./logger");
// tslint:enable:no-any
// tslint:disable-next-line:no-any
function isString(obj) {
    return is.string(obj);
}
function createLogger(optionsOrLevel) {
    // Canonicalize input.
    if (isString(optionsOrLevel)) {
        optionsOrLevel = {
            level: optionsOrLevel,
        };
    }
    var options = Object.assign({ levels: logger_1.Logger.LEVELS }, logger_1.Logger.DEFAULT_OPTIONS, optionsOrLevel);
    // ts: We construct other fields on result after its declaration.
    // tslint:disable-next-line:no-any
    var result = new logger_1.Logger(options);
    Object.defineProperty(result, 'format', {
        get: function () {
            return result[logger_1.kFormat];
        },
        // tslint:disable-next-line:no-any
        set: function (value) {
            result[logger_1.kFormat] = value.bind(result);
        }
    });
    return Object.assign(result, { levels: options.levels, level: options.level });
}
/**
 * Create a logger to print output to the console.
 * Omitted options will default to values provided in defaultLoggerOptions.
 */
exports.logger = Object.assign(createLogger, { LEVELS: logger_1.Logger.LEVELS });
//# sourceMappingURL=logger-compat.js.map