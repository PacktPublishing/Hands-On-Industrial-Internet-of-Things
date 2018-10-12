"use strict";
/*!
 * Copyright 2015 Google Inc. All Rights Reserved.
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
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * @module common/service-object
 */
var arrify = require("arrify");
var events_1 = require("events");
var extend = require("extend");
var is = require("is");
var util_1 = require("./util");
/**
 * ServiceObject is a base class, meant to be inherited from by a "service
 * object," like a BigQuery dataset or Storage bucket.
 *
 * Most of the time, these objects share common functionality; they can be
 * created or deleted, and you can get or set their metadata.
 *
 * By inheriting from this class, a service object will be extended with these
 * shared behaviors. Note that any method can be overridden when the service
 * object requires specific behavior.
 */
var ServiceObject = /** @class */ (function (_super) {
    __extends(ServiceObject, _super);
    /*
     * @constructor
     * @alias module:common/service-object
     *
     * @private
     *
     * @param {object} config - Configuration object.
     * @param {string} config.baseUrl - The base URL to make API requests to.
     * @param {string} config.createMethod - The method which creates this object.
     * @param {string=} config.id - The identifier of the object. For example, the
     *     name of a Storage bucket or Pub/Sub topic.
     * @param {object=} config.methods - A map of each method name that should be inherited.
     * @param {object} config.methods[].reqOpts - Default request options for this
     *     particular method. A common use case is when `setMetadata` requires a
     *     `PUT` method to override the default `PATCH`.
     * @param {object} config.parent - The parent service instance. For example, an
     *     instance of Storage if the object is Bucket.
     */
    function ServiceObject(config) {
        var _this = _super.call(this) || this;
        _this.metadata = {};
        _this.baseUrl = config.baseUrl;
        _this.parent = config.parent; // Parent class.
        _this.id = config.id; // Name or ID (e.g. dataset ID, bucket name, etc).
        _this.createMethod = config.createMethod;
        _this.methods = config.methods || {};
        _this.interceptors = [];
        _this.Promise = _this.parent ? _this.parent.Promise : undefined;
        if (config.methods) {
            Object.getOwnPropertyNames(ServiceObject.prototype)
                .filter(function (methodName) {
                return (
                // All ServiceObjects need `request`.
                // clang-format off
                !/^request/.test(methodName) &&
                    // clang-format on
                    // The ServiceObject didn't redefine the method.
                    _this[methodName] === ServiceObject.prototype[methodName] &&
                    // This method isn't wanted.
                    !config.methods[methodName]);
            })
                .forEach(function (methodName) {
                _this[methodName] = undefined;
            });
        }
        return _this;
    }
    ServiceObject.prototype.create = function (optionsOrCallback, callback) {
        var self = this;
        var args = [this.id];
        if (typeof optionsOrCallback === 'function') {
            callback = optionsOrCallback;
        }
        if (typeof optionsOrCallback === 'object') {
            args.push(optionsOrCallback);
        }
        // Wrap the callback to return *this* instance of the object, not the
        // newly-created one.
        function onCreate(err, instance) {
            var args = [].slice.call(arguments);
            if (!err) {
                self.metadata = instance.metadata;
                args[1] = self; // replace the created `instance` with this one.
            }
            callback.apply(null, args);
        }
        args.push(onCreate);
        this.createMethod.apply(null, args);
    };
    /**
     * Delete the object.
     *
     * @param {function=} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {object} callback.apiResponse - The full API response.
     */
    ServiceObject.prototype.delete = function (callback) {
        var methodConfig = this.methods.delete || {};
        callback = callback || util_1.util.noop;
        var reqOpts = extend({
            method: 'DELETE',
            uri: '',
        }, methodConfig.reqOpts);
        // The `request` method may have been overridden to hold any special
        // behavior. Ensure we call the original `request` method.
        this.request(reqOpts).then(function (res) {
            callback(null, res);
        }, function (err) {
            callback(err);
        });
    };
    /**
     * Check if the object exists.
     *
     * @param {function} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {boolean} callback.exists - Whether the object exists or not.
     */
    ServiceObject.prototype.exists = function (callback) {
        this.get(function (err) {
            if (err) {
                if (err.code === 404) {
                    callback(null, false);
                }
                else {
                    callback(err);
                }
                return;
            }
            callback(null, true);
        });
    };
    ServiceObject.prototype.get = function (configOrCallback, callback) {
        var self = this;
        var config = {};
        if (typeof configOrCallback === 'function') {
            callback = configOrCallback;
        }
        if (typeof configOrCallback === 'object') {
            config = configOrCallback;
        }
        var autoCreate = config.autoCreate && is.fn(this.create);
        delete config.autoCreate;
        function onCreate(err, instance, apiResponse) {
            if (err) {
                if (err.code === 409) {
                    self.get(config, callback);
                    return;
                }
                callback(err, null, apiResponse);
                return;
            }
            callback(null, instance, apiResponse);
        }
        this.getMetadata(function (e, metadata) {
            var err = e;
            if (err) {
                if (err.code === 404 && autoCreate) {
                    var args = [];
                    if (!is.empty(config)) {
                        args.push(config);
                    }
                    args.push(onCreate);
                    self.create.apply(self, args);
                    return;
                }
                callback(err, null, metadata);
                return;
            }
            callback(null, self, metadata);
        });
    };
    /**
     * Get the metadata of this object.
     *
     * @param {function} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {object} callback.metadata - The metadata for this object.
     * @param {object} callback.apiResponse - The full API response.
     */
    ServiceObject.prototype.getMetadata = function (callback) {
        var _this = this;
        var methodConfig = this.methods.getMetadata || {};
        var reqOpts = extend({
            uri: '',
        }, methodConfig.reqOpts);
        // The `request` method may have been overridden to hold any special
        // behavior. Ensure we call the original `request` method.
        this.request(reqOpts).then(function (resp) {
            _this.metadata = resp.body;
            callback(null, _this.metadata, resp);
        }, function (err) {
            callback(err);
        });
    };
    /**
     * Set the metadata for this object.
     *
     * @param {object} metadata - The metadata to set on this object.
     * @param {function=} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {object} callback.instance - The instance.
     * @param {object} callback.apiResponse - The full API response.
     */
    ServiceObject.prototype.setMetadata = function (metadata, callback) {
        var self = this;
        callback = callback || util_1.util.noop;
        var methodConfig = this.methods.setMetadata || {};
        var reqOpts = extend(true, {
            method: 'PATCH',
            uri: '',
            json: metadata,
        }, methodConfig.reqOpts);
        // The `request` method may have been overridden to hold any special
        // behavior. Ensure we call the original `request` method.
        this.request(reqOpts).then(function (resp) {
            self.metadata = resp;
            callback(null, resp);
        }, function (err) {
            callback(err);
        });
    };
    ServiceObject.prototype.request_ = function (reqOpts) {
        reqOpts = extend(true, {}, reqOpts);
        var isAbsoluteUrl = reqOpts.uri.indexOf('http') === 0;
        var uriComponents = [this.baseUrl, this.id || '', reqOpts.uri];
        if (isAbsoluteUrl) {
            uriComponents.splice(0, uriComponents.indexOf(reqOpts.uri));
        }
        reqOpts.uri = uriComponents
            .filter(function (x) { return x.trim(); }) // Limit to non-empty strings.
            .map(function (uriComponent) {
            var trimSlashesRegex = /^\/*|\/*$/g;
            return uriComponent.replace(trimSlashesRegex, '');
        })
            .join('/');
        var childInterceptors = arrify(reqOpts.interceptors_);
        var localInterceptors = [].slice.call(this.interceptors);
        reqOpts.interceptors_ = childInterceptors.concat(localInterceptors);
        if (reqOpts.shouldReturnStream) {
            return this.parent.requestStream(reqOpts);
        }
        return this.parent.request(reqOpts);
    };
    ServiceObject.prototype.request = function (reqOpts, callback) {
        if (!callback) {
            return this.request_(reqOpts);
        }
        this.request_(reqOpts).then(function (res) { return callback(null, res.body, res); }, function (err) { return callback(err, err.response ? err.response.body : null, err.response); });
    };
    /**
     * Make an authenticated API request.
     *
     * @private
     *
     * @param {object} reqOpts - Request options that are passed to `request`.
     * @param {string} reqOpts.uri - A URI relative to the baseUrl.
     */
    ServiceObject.prototype.requestStream = function (reqOpts) {
        var opts = extend(true, reqOpts, { shouldReturnStream: true });
        return this.request_(opts);
    };
    return ServiceObject;
}(events_1.EventEmitter));
exports.ServiceObject = ServiceObject;
util_1.util.promisifyAll(ServiceObject, { exclude: ['requestStream', 'request', 'request_'] });
//# sourceMappingURL=service-object.js.map