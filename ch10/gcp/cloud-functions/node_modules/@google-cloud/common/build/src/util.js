"use strict";
/**
 * Copyright 2014 Google Inc. All Rights Reserved.
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
 * @module common/util
 */
var duplexify = require("duplexify");
var ent = require("ent");
var extend = require("extend");
var google_auth_library_1 = require("google-auth-library");
var is = require("is");
var r = require("request");
var retryRequest = require("retry-request");
var stream_1 = require("stream");
var streamEvents = require("stream-events");
var through = require("through2");
var request = r.defaults({
    timeout: 60000,
    gzip: true,
    forever: true,
    pool: {
        maxSockets: Infinity,
    },
});
/**
 * Custom error type for missing project ID errors.
 */
var MissingProjectIdError = /** @class */ (function (_super) {
    __extends(MissingProjectIdError, _super);
    function MissingProjectIdError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.message = "Sorry, we cannot connect to Cloud Services without a project\n    ID. You may specify one with an environment variable named\n    \"GOOGLE_CLOUD_PROJECT\".".replace(/ +/g, ' ');
        return _this;
    }
    return MissingProjectIdError;
}(Error));
exports.MissingProjectIdError = MissingProjectIdError;
/**
 * Custom error type for API errors.
 *
 * @param {object} errorBody - Error object.
 */
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(errorBodyOrMessage) {
        var _this = _super.call(this) || this;
        if (typeof errorBodyOrMessage !== 'object') {
            _this.message = errorBodyOrMessage || '';
            return _this;
        }
        var errorBody = errorBodyOrMessage;
        _this.code = errorBody.code;
        _this.errors = errorBody.errors;
        _this.response = errorBody.response;
        try {
            _this.errors = JSON.parse(_this.response.body).error.errors;
        }
        catch (e) {
            _this.errors = errorBody.errors;
        }
        var messages = [];
        if (errorBody.message) {
            messages.push(errorBody.message);
        }
        if (_this.errors && _this.errors.length === 1) {
            messages.push(_this.errors[0].message);
        }
        else if (_this.response && _this.response.body) {
            messages.push(ent.decode(errorBody.response.body.toString()));
        }
        else if (!errorBody.message) {
            messages.push('Error during request.');
        }
        _this.message = Array.from(new Set(messages)).join(' - ');
        return _this;
    }
    return ApiError;
}(Error));
exports.ApiError = ApiError;
/**
 * Custom error type for partial errors returned from the API.
 *
 * @param {object} b - Error object.
 */
var PartialFailureError = /** @class */ (function (_super) {
    __extends(PartialFailureError, _super);
    function PartialFailureError(b) {
        var _this = _super.call(this) || this;
        var errorObject = b;
        _this.errors = errorObject.errors;
        _this.name = 'PartialFailureError';
        _this.response = errorObject.response;
        var defaultErrorMessage = 'A failure occurred during this request.';
        _this.message = errorObject.message || defaultErrorMessage;
        return _this;
    }
    return PartialFailureError;
}(Error));
exports.PartialFailureError = PartialFailureError;
var Util = /** @class */ (function () {
    function Util() {
        this.MissingProjectIdError = MissingProjectIdError;
        this.ApiError = ApiError;
        this.PartialFailureError = PartialFailureError;
    }
    /**
     * No op.
     *
     * @example
     * function doSomething(callback) {
     *   callback = callback || noop;
     * }
     */
    Util.prototype.noop = function () { };
    /**
     * Uniformly process an API response.
     *
     * @param {*} err - Error value.
     * @param {*} resp - Response value.
     * @param {*} body - Body value.
     * @param {function} callback - The callback function.
     */
    Util.prototype.handleResp = function (err, resp, body, callback) {
        callback = callback || util.noop;
        var parsedResp = extend(true, { err: err || null }, resp && util.parseHttpRespMessage(resp), body && util.parseHttpRespBody(body));
        // Assign the parsed body to resp.body, even if { json: false } was passed
        // as a request option.
        // We assume that nobody uses the previously unparsed value of resp.body.
        if (!parsedResp.err && resp && typeof parsedResp.body === 'object') {
            parsedResp.resp.body = parsedResp.body;
        }
        callback(parsedResp.err, parsedResp.body, parsedResp.resp);
    };
    /**
     * Sniff an incoming HTTP response message for errors.
     *
     * @param {object} httpRespMessage - An incoming HTTP response message from `request`.
     * @return {object} parsedHttpRespMessage - The parsed response.
     * @param {?error} parsedHttpRespMessage.err - An error detected.
     * @param {object} parsedHttpRespMessage.resp - The original response object.
     */
    Util.prototype.parseHttpRespMessage = function (httpRespMessage) {
        var parsedHttpRespMessage = {
            resp: httpRespMessage,
        };
        if (httpRespMessage.statusCode < 200 || httpRespMessage.statusCode > 299) {
            // Unknown error. Format according to ApiError standard.
            parsedHttpRespMessage.err = new ApiError({
                errors: new Array(),
                code: httpRespMessage.statusCode,
                message: httpRespMessage.statusMessage,
                response: httpRespMessage,
            });
        }
        return parsedHttpRespMessage;
    };
    /**
     * Parse the response body from an HTTP request.
     *
     * @param {object} body - The response body.
     * @return {object} parsedHttpRespMessage - The parsed response.
     * @param {?error} parsedHttpRespMessage.err - An error detected.
     * @param {object} parsedHttpRespMessage.body - The original body value provided
     *     will try to be JSON.parse'd. If it's successful, the parsed value will
     * be returned here, otherwise the original value.
     */
    Util.prototype.parseHttpRespBody = function (body) {
        var parsedHttpRespBody = {
            body: body,
        };
        if (is.string(body)) {
            try {
                parsedHttpRespBody.body = JSON.parse(body);
            }
            catch (err) {
                parsedHttpRespBody.err = new ApiError('Cannot parse JSON response');
            }
        }
        if (parsedHttpRespBody.body && parsedHttpRespBody.body.error) {
            // Error from JSON API.
            parsedHttpRespBody.err = new ApiError(parsedHttpRespBody.body.error);
        }
        return parsedHttpRespBody;
    };
    /**
     * Take a Duplexify stream, fetch an authenticated connection header, and
     * create an outgoing writable stream.
     *
     * @param {Duplexify} dup - Duplexify stream.
     * @param {object} options - Configuration object.
     * @param {module:common/connection} options.connection - A connection instance used to get a token with and send the request through.
     * @param {object} options.metadata - Metadata to send at the head of the request.
     * @param {object} options.request - Request object, in the format of a standard Node.js http.request() object.
     * @param {string=} options.request.method - Default: "POST".
     * @param {string=} options.request.qs.uploadType - Default: "multipart".
     * @param {string=} options.streamContentType - Default: "application/octet-stream".
     * @param {function} onComplete - Callback, executed after the writable Request stream has completed.
     */
    Util.prototype.makeWritableStream = function (dup, options, onComplete) {
        onComplete = onComplete || util.noop;
        var writeStream = through();
        dup.setWritable(writeStream);
        var defaultReqOpts = {
            method: 'POST',
            qs: {
                uploadType: 'multipart',
            },
        };
        var metadata = options.metadata || {};
        var reqOpts = extend(true, defaultReqOpts, options.request, {
            multipart: [
                {
                    'Content-Type': 'application/json',
                    body: JSON.stringify(metadata),
                },
                {
                    'Content-Type': metadata.contentType ||
                        'application/octet-stream',
                    body: writeStream,
                },
            ],
        });
        options.makeAuthenticatedRequest(reqOpts, {
            onAuthenticated: function (err, authenticatedReqOpts) {
                if (err) {
                    dup.destroy(err);
                    return;
                }
                request(authenticatedReqOpts, function (err, resp, body) {
                    util.handleResp(err, resp, body, function (err, data) {
                        if (err) {
                            dup.destroy(err);
                            return;
                        }
                        dup.emit('response', resp);
                        onComplete(data);
                    });
                });
            },
        });
    };
    /**
     * Returns true if the API request should be retried, given the error that was
     * given the first time the request was attempted. This is used for rate limit
     * related errors as well as intermittent server errors.
     *
     * @param {error} err - The API error to check if it is appropriate to retry.
     * @return {boolean} True if the API request should be retried, false otherwise.
     */
    Util.prototype.shouldRetryRequest = function (err) {
        if (err) {
            if ([429, 500, 502, 503].indexOf(err.code) !== -1) {
                return true;
            }
            if (err.errors) {
                for (var _i = 0, _a = err.errors; _i < _a.length; _i++) {
                    var e = _a[_i];
                    var reason = e.reason;
                    if (reason === 'rateLimitExceeded') {
                        return true;
                    }
                    if (reason === 'userRateLimitExceeded') {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    /**
     * Get a function for making authenticated requests.
     *
     * @throws {Error} If a projectId is requested, but not able to be detected.
     *
     * @param {object} config - Configuration object.
     * @param {boolean=} config.autoRetry - Automatically retry requests if the
     *     response is related to rate limits or certain intermittent server
     * errors. We will exponentially backoff subsequent requests by default.
     * (default: true)
     * @param {object=} config.credentials - Credentials object.
     * @param {boolean=} config.customEndpoint - If true, just return the provided request options. Default: false.
     * @param {string=} config.email - Account email address, required for PEM/P12 usage.
     * @param {number=} config.maxRetries - Maximum number of automatic retries attempted before returning the error. (default: 3)
     * @param {string=} config.keyFile - Path to a .json, .pem, or .p12 keyfile.
     * @param {array} config.scopes - Array of scopes required for the API.
     */
    Util.prototype.makeAuthenticatedRequestFactory = function (config) {
        if (config === void 0) { config = {}; }
        var googleAutoAuthConfig = extend({}, config);
        if (googleAutoAuthConfig.projectId === '{{projectId}}') {
            delete googleAutoAuthConfig.projectId;
        }
        var authClient = new google_auth_library_1.GoogleAuth(googleAutoAuthConfig);
        function makeAuthenticatedRequest(reqOpts, optionsOrCallback) {
            var stream;
            var reqConfig = extend({}, config);
            var activeRequest_;
            if (!optionsOrCallback) {
                stream = duplexify();
                reqConfig.stream = stream;
            }
            var options = typeof optionsOrCallback === 'object' ? optionsOrCallback : undefined;
            var callback = typeof optionsOrCallback === 'function' ?
                optionsOrCallback :
                undefined;
            var onAuthenticated = function (err, authenticatedReqOpts) {
                var autoAuthFailed = err &&
                    err.message.indexOf('Could not load the default credentials') >
                        -1;
                if (autoAuthFailed) {
                    // Even though authentication failed, the API might not actually
                    // care.
                    authenticatedReqOpts = reqOpts;
                }
                if (!err || autoAuthFailed) {
                    // tslint:disable-next-line:no-any
                    var projectId = authClient._cachedProjectId;
                    if (config.projectId && config.projectId !== '{{projectId}}') {
                        projectId = config.projectId;
                    }
                    try {
                        authenticatedReqOpts =
                            util.decorateRequest(authenticatedReqOpts, projectId);
                        err = null;
                    }
                    catch (e) {
                        // A projectId was required, but we don't have one.
                        // Re-use the "Could not load the default credentials error" if
                        // auto auth failed.
                        err = err || e;
                    }
                }
                if (err) {
                    if (stream) {
                        stream.destroy(err);
                    }
                    else {
                        var fn = options && options.onAuthenticated ?
                            options.onAuthenticated :
                            callback;
                        fn(err);
                    }
                    return;
                }
                if (options && options.onAuthenticated) {
                    options.onAuthenticated(null, authenticatedReqOpts);
                }
                else {
                    activeRequest_ =
                        util.makeRequest(authenticatedReqOpts, reqConfig, callback);
                }
            };
            if (reqConfig.customEndpoint) {
                // Using a custom API override. Do not use `google-auth-library` for
                // authentication. (ex: connecting to a local Datastore server)
                onAuthenticated(null, reqOpts);
            }
            else {
                authClient.authorizeRequest(reqOpts).then(function (res) {
                    var opts = extend(true, {}, reqOpts, res);
                    onAuthenticated(null, opts);
                }, function (err) {
                    onAuthenticated(err);
                });
            }
            if (stream) {
                return stream;
            }
            return {
                abort: function () {
                    setImmediate(function () {
                        if (activeRequest_) {
                            activeRequest_.abort();
                            activeRequest_ = null;
                        }
                    });
                },
            };
        }
        var mar = makeAuthenticatedRequest;
        mar.getCredentials = authClient.getCredentials.bind(authClient);
        mar.authClient = authClient;
        return mar;
    };
    Util.prototype.makeRequest = function (reqOpts, configOrCallback, callback) {
        var config = {};
        if (is.fn(configOrCallback)) {
            callback = configOrCallback;
        }
        else {
            config = configOrCallback;
        }
        config = config || {};
        var options = {
            request: request,
            retries: config.autoRetry !== false ? config.maxRetries || 3 : 0,
            shouldRetryFn: function (httpRespMessage) {
                var err = util.parseHttpRespMessage(httpRespMessage).err;
                return err && util.shouldRetryRequest(err);
            },
        };
        if (!config.stream) {
            return retryRequest(reqOpts, options, function (err, response, body) {
                util.handleResp(err, response, body, callback);
            });
        }
        var dup = config.stream;
        // tslint:disable-next-line:no-any
        var requestStream;
        var isGetRequest = (reqOpts.method || 'GET').toUpperCase() === 'GET';
        if (isGetRequest) {
            requestStream = retryRequest(reqOpts, options);
            dup.setReadable(requestStream);
        }
        else {
            // Streaming writable HTTP requests cannot be retried.
            requestStream = request(reqOpts);
            dup.setWritable(requestStream);
        }
        // Replay the Request events back to the stream.
        requestStream.on('error', dup.destroy.bind(dup))
            .on('response', dup.emit.bind(dup, 'response'))
            .on('complete', dup.emit.bind(dup, 'complete'));
        dup.abort = requestStream.abort;
        return dup;
    };
    /**
     * Decorate the options about to be made in a request.
     *
     * @param {object} reqOpts - The options to be passed to `request`.
     * @param {string} projectId - The project ID.
     * @return {object} reqOpts - The decorated reqOpts.
     */
    Util.prototype.decorateRequest = function (reqOpts, projectId) {
        delete reqOpts.autoPaginate;
        delete reqOpts.autoPaginateVal;
        delete reqOpts.objectMode;
        if (is.object(reqOpts.qs)) {
            delete reqOpts.qs.autoPaginate;
            delete reqOpts.qs.autoPaginateVal;
            reqOpts.qs = util.replaceProjectIdToken(reqOpts.qs, projectId);
        }
        if (is.object(reqOpts.json)) {
            delete reqOpts.json.autoPaginate;
            delete reqOpts.json.autoPaginateVal;
            reqOpts.json = util.replaceProjectIdToken(reqOpts.json, projectId);
        }
        reqOpts.uri = util.replaceProjectIdToken(reqOpts.uri, projectId);
        return reqOpts;
    };
    /**
     * Populate the `{{projectId}}` placeholder.
     *
     * @throws {Error} If a projectId is required, but one is not provided.
     *
     * @param {*} - Any input value that may contain a placeholder. Arrays and objects will be looped.
     * @param {string} projectId - A projectId. If not provided
     * @return {*} - The original argument with all placeholders populated.
     */
    // tslint:disable-next-line:no-any
    Util.prototype.replaceProjectIdToken = function (value, projectId) {
        if (is.array(value)) {
            value = value
                .map(function (v) { return util.replaceProjectIdToken(v, projectId); });
        }
        if (value !== null && typeof value === 'object' &&
            is.fn(value.hasOwnProperty)) {
            for (var opt in value) {
                if (value.hasOwnProperty(opt)) {
                    // tslint:disable-next-line:no-any
                    var v = value;
                    v[opt] = util.replaceProjectIdToken(v[opt], projectId);
                }
            }
        }
        if (typeof value === 'string' &&
            value.indexOf('{{projectId}}') > -1) {
            if (!projectId || projectId === '{{projectId}}') {
                throw new MissingProjectIdError();
            }
            value = value.replace(/{{projectId}}/g, projectId);
        }
        return value;
    };
    /**
     * Extend a global configuration object with user options provided at the time
     * of sub-module instantiation.
     *
     * Connection details currently come in two ways: `credentials` or
     * `keyFilename`. Because of this, we have a special exception when overriding
     * a global configuration object. If a user provides either to the global
     * configuration, then provides another at submodule instantiation-time, the
     * latter is preferred.
     *
     * @param  {object} globalConfig - The global configuration object.
     * @param  {object=} overrides - The instantiation-time configuration object.
     * @return {object}
     */
    Util.prototype.extendGlobalConfig = function (globalConfig, overrides) {
        globalConfig = globalConfig || {};
        overrides = overrides || {};
        var defaultConfig = {};
        if (process.env.GCLOUD_PROJECT) {
            defaultConfig.projectId = process.env.GCLOUD_PROJECT;
        }
        var options = extend({}, globalConfig);
        var hasGlobalConnection = options.credentials || options.keyFilename;
        var isOverridingConnection = overrides.credentials || overrides.keyFilename;
        if (hasGlobalConnection && isOverridingConnection) {
            delete options.credentials;
            delete options.keyFilename;
        }
        var extendedConfig = extend(true, defaultConfig, options, overrides);
        // Preserve the original (not cloned) interceptors.
        extendedConfig.interceptors_ = globalConfig.interceptors_;
        return extendedConfig;
    };
    /**
     * Merge and validate API configurations.
     *
     * @param {object} globalContext - gcloud-level context.
     * @param {object} globalContext.config_ - gcloud-level configuration.
     * @param {object} localConfig - Service-level configurations.
     * @return {object} config - Merged and validated configuration.
     */
    Util.prototype.normalizeArguments = function (globalContext, localConfig) {
        var globalConfig = globalContext && globalContext.config_;
        return util.extendGlobalConfig(globalConfig, localConfig);
    };
    /**
     * Limit requests according to a `maxApiCalls` limit.
     *
     * @param {function} makeRequestFn - The function that will be called.
     * @param {object=} options - Configuration object.
     * @param {number} options.maxApiCalls - The maximum number of API calls to make.
     * @param {object} options.streamOptions - Options to pass to the Stream constructor.
     */
    Util.prototype.createLimiter = function (makeRequestFn, options) {
        options = options || {};
        var streamOptions = options.streamOptions || {};
        streamOptions.objectMode = true;
        var stream = streamEvents(new stream_1.Transform(streamOptions));
        var requestsMade = 0;
        var requestsToMake = -1;
        if (is.number(options.maxApiCalls)) {
            requestsToMake = options.maxApiCalls;
        }
        return {
            // tslint:disable-next-line:no-any
            makeRequest: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                requestsMade++;
                if (requestsToMake >= 0 && requestsMade > requestsToMake) {
                    stream.push(null);
                    return;
                }
                makeRequestFn.apply(null, args);
                return stream;
            },
            stream: stream,
        };
    };
    // tslint:disable-next-line:no-any
    Util.prototype.isCustomType = function (unknown, module) {
        function getConstructorName(obj) {
            return obj.constructor && obj.constructor.name.toLowerCase();
        }
        var moduleNameParts = module.split('/');
        var parentModuleName = moduleNameParts[0] && moduleNameParts[0].toLowerCase();
        var subModuleName = moduleNameParts[1] && moduleNameParts[1].toLowerCase();
        if (subModuleName && getConstructorName(unknown) !== subModuleName) {
            return false;
        }
        var walkingModule = unknown;
        while (true) {
            if (getConstructorName(walkingModule) === parentModuleName) {
                return true;
            }
            walkingModule = walkingModule.parent;
            if (!walkingModule) {
                return false;
            }
        }
    };
    /**
     * Create a properly-formatted User-Agent string from a package.json file.
     *
     * @param {object} packageJson - A module's package.json file.
     * @return {string} userAgent - The formatted User-Agent string.
     */
    Util.prototype.getUserAgentFromPackageJson = function (packageJson) {
        var hyphenatedPackageName = packageJson.name
            .replace('@google-cloud', 'gcloud-node') // For legacy purposes.
            .replace('/', '-'); // For UA spec-compliance purposes.
        return hyphenatedPackageName + '/' + packageJson.version;
    };
    /**
     * Wraps a callback style function to conditionally return a promise.
     *
     * @param {function} originalMethod - The method to promisify.
     * @param {object=} options - Promise options.
     * @param {boolean} options.singular - Resolve the promise with single arg instead of an array.
     * @return {function} wrapped
     */
    Util.prototype.promisify = function (originalMethod, options) {
        if (originalMethod.promisified_) {
            return originalMethod;
        }
        options = options || {};
        var slice = Array.prototype.slice;
        // tslint:disable-next-line:no-any
        var wrapper = function () {
            var context = this;
            var last;
            for (last = arguments.length - 1; last >= 0; last--) {
                var arg = arguments[last];
                if (is.undefined(arg)) {
                    continue; // skip trailing undefined.
                }
                if (!is.fn(arg)) {
                    break; // non-callback last argument found.
                }
                return originalMethod.apply(context, arguments);
            }
            // peel trailing undefined.
            var args = slice.call(arguments, 0, last + 1);
            // tslint:disable-next-line:variable-name
            var PromiseCtor = Promise;
            // Because dedupe will likely create a single install of
            // @google-cloud/common to be shared amongst all modules, we need to
            // localize it at the Service level.
            if (context && context.Promise) {
                PromiseCtor = context.Promise;
            }
            return new PromiseCtor(function (resolve, reject) {
                // tslint:disable-next-line:no-any
                args.push(function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var callbackArgs = slice.call(args);
                    var err = callbackArgs.shift();
                    if (err) {
                        return reject(err);
                    }
                    if (options.singular && callbackArgs.length === 1) {
                        resolve(callbackArgs[0]);
                    }
                    else {
                        resolve(callbackArgs);
                    }
                });
                originalMethod.apply(context, args);
            });
        };
        wrapper.promisified_ = true;
        return wrapper;
    };
    /**
     * Promisifies certain Class methods. This will not promisify private or
     * streaming methods.
     *
     * @param {module:common/service} Class - Service class.
     * @param {object=} options - Configuration object.
     */
    // tslint:disable-next-line:variable-name
    Util.prototype.promisifyAll = function (Class, options) {
        var exclude = (options && options.exclude) || [];
        var ownPropertyNames = Object.getOwnPropertyNames(Class.prototype);
        var methods = ownPropertyNames.filter(function (methodName) {
            // clang-format off
            return (is.fn(Class.prototype[methodName]) && // is it a function?
                !/(^_|(Stream|_)|promise$)|^constructor$/.test(methodName) && // is it promisable?
                exclude.indexOf(methodName) === -1); // is it blacklisted?
            // clang-format on
        });
        methods.forEach(function (methodName) {
            var originalMethod = Class.prototype[methodName];
            if (!originalMethod.promisified_) {
                Class.prototype[methodName] = util.promisify(originalMethod, options);
            }
        });
    };
    /**
     * This will mask properties of an object from console.log.
     *
     * @param {object} object - The object to assign the property to.
     * @param {string} propName - Property name.
     * @param {*} value - Value.
     */
    Util.prototype.privatize = function (object, propName, value) {
        Object.defineProperty(object, propName, { value: value, writable: true });
    };
    return Util;
}());
exports.Util = Util;
var util = new Util();
exports.util = util;
//# sourceMappingURL=util.js.map