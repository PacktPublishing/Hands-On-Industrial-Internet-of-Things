"use strict";
/*!
 * Copyright 2016 Google Inc. All Rights Reserved.
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * @module common/operation
 */
var extend = require("extend");
var pify = require("pify");
var service_object_1 = require("./service-object");
var Operation = /** @class */ (function (_super) {
    __extends(Operation, _super);
    /**
     * An Operation object allows you to interact with APIs that take longer to
     * process things.
     *
     * @constructor
     * @alias module:common/operation
     *
     * @param {object} config - Configuration object.
     * @param {module:common/service|module:common/serviceObject|module:common/grpcService|module:common/grpcServiceObject} config.parent - The parent object.
     */
    function Operation(config) {
        var _this = this;
        var methods = {
            /**
             * Checks to see if an operation exists.
             */
            exists: true,
            /**
             * Retrieves the operation.
             */
            get: true,
            /**
             * Retrieves metadata for the operation.
             */
            getMetadata: {
                reqOpts: {
                    name: config.id,
                },
            },
        };
        config = extend({
            baseUrl: '',
        }, config);
        // tslint:disable-next-line:no-any
        config.methods = (config.methods || methods);
        _this = _super.call(this, config) || this;
        _this.completeListeners = 0;
        _this.hasActiveListeners = false;
        _this.listenForEvents_();
        return _this;
    }
    /**
     * Wraps the `complete` and `error` events in a Promise.
     *
     * @return {promise}
     */
    Operation.prototype.promise = function () {
        var _this = this;
        return new this.Promise(function (resolve, reject) {
            _this.on('error', reject).on('complete', function (metadata) {
                resolve([metadata]);
            });
        });
    };
    /**
     * Begin listening for events on the operation. This method keeps track of how
     * many "complete" listeners are registered and removed, making sure polling
     * is handled automatically.
     *
     * As long as there is one active "complete" listener, the connection is open.
     * When there are no more listeners, the polling stops.
     *
     * @private
     */
    Operation.prototype.listenForEvents_ = function () {
        var _this = this;
        this.on('newListener', function (event) {
            if (event === 'complete') {
                _this.completeListeners++;
                if (!_this.hasActiveListeners) {
                    _this.hasActiveListeners = true;
                    _this.startPolling_();
                }
            }
        });
        this.on('removeListener', function (event) {
            if (event === 'complete' && --_this.completeListeners === 0) {
                _this.hasActiveListeners = false;
            }
        });
    };
    /**
     * Poll for a status update. Returns null for an incomplete
     * status, and metadata for a complete status.
     *
     * @private
     */
    Operation.prototype.poll_ = function (callback) {
        this.getMetadata(function (err, body) {
            if (err || body.error) {
                callback(err || body.error);
                return;
            }
            if (!body.done) {
                callback(null);
                return;
            }
            callback(null, body);
        });
    };
    /**
     * Poll `getMetadata` to check the operation's status. This runs a loop to
     * ping the API on an interval.
     *
     * Note: This method is automatically called once a "complete" event handler
     * is registered on the operation.
     *
     * @private
     */
    Operation.prototype.startPolling_ = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasActiveListeners) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, pify(this.poll_.bind(this))()];
                    case 2:
                        metadata = _a.sent();
                        if (!metadata) {
                            setTimeout(this.startPolling_.bind(this), 500);
                            return [2 /*return*/];
                        }
                        this.emit('complete', metadata);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        this.emit('error', err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Operation;
}(service_object_1.ServiceObject));
exports.Operation = Operation;
//# sourceMappingURL=operation.js.map