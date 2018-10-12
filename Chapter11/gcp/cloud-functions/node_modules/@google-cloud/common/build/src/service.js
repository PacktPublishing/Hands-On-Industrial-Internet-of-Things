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
 * @module common/service
 */
var arrify = require("arrify");
var extend = require("extend");
var is = require("is");
var pify = require("pify");
var util_1 = require("./util");
var PROJECT_ID_TOKEN = '{{projectId}}';
var Service = /** @class */ (function () {
    /**
     * Service is a base class, meant to be inherited from by a "service," like
     * BigQuery or Storage.
     *
     * This handles making authenticated requests by exposing a `makeReq_`
     * function.
     *
     * @constructor
     * @alias module:common/service
     *
     * @param {object} config - Configuration object.
     * @param {string} config.baseUrl - The base URL to make API requests to.
     * @param {string[]} config.scopes - The scopes required for the request.
     * @param {object=} options - [Configuration object](#/docs).
     */
    function Service(config, options) {
        options = options || {};
        this.baseUrl = config.baseUrl;
        this.globalInterceptors = arrify(options.interceptors_);
        this.interceptors = [];
        this.packageJson = config.packageJson;
        this.projectId = options.projectId || PROJECT_ID_TOKEN;
        this.projectIdRequired = config.projectIdRequired !== false;
        this.Promise = options.promise || Promise;
        var reqCfg = extend({}, config, {
            projectIdRequired: this.projectIdRequired,
            projectId: this.projectId,
            credentials: options.credentials,
            keyFile: options.keyFilename,
            email: options.email,
            token: options.token,
        });
        this.makeAuthenticatedRequest =
            util_1.util.makeAuthenticatedRequestFactory(reqCfg);
        this.authClient = this.makeAuthenticatedRequest.authClient;
        this.getCredentials = this.makeAuthenticatedRequest.getCredentials;
        var isCloudFunctionEnv = !!process.env.FUNCTION_NAME;
        if (isCloudFunctionEnv) {
            this.interceptors.push({
                request: function (reqOpts) {
                    reqOpts.forever = false;
                    return reqOpts;
                },
            });
        }
    }
    Service.prototype.getProjectId = function (callback) {
        if (!callback) {
            return this.getProjectIdAsync();
        }
        this.getProjectIdAsync().then(function (p) { return callback(null, p); }, callback);
    };
    Service.prototype.getProjectIdAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var projectId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.authClient.getDefaultProjectId()];
                    case 1:
                        projectId = _a.sent();
                        if (this.projectId === PROJECT_ID_TOKEN && projectId) {
                            this.projectId = projectId;
                        }
                        return [2 /*return*/, this.projectId];
                }
            });
        });
    };
    Service.prototype.request_ = function (reqOpts) {
        // TODO: fix the tests so this can be private
        reqOpts = extend(true, {}, reqOpts);
        var isAbsoluteUrl = reqOpts.uri.indexOf('http') === 0;
        var uriComponents = [this.baseUrl];
        if (this.projectIdRequired) {
            uriComponents.push('projects');
            uriComponents.push(this.projectId);
        }
        uriComponents.push(reqOpts.uri);
        if (isAbsoluteUrl) {
            uriComponents.splice(0, uriComponents.indexOf(reqOpts.uri));
        }
        reqOpts.uri = uriComponents
            .map(function (uriComponent) {
            var trimSlashesRegex = /^\/*|\/*$/g;
            return uriComponent.replace(trimSlashesRegex, '');
        })
            .join('/')
            // Some URIs have colon separators.
            // Bad: https://.../projects/:list
            // Good: https://.../projects:list
            .replace(/\/:/g, ':');
        // Interceptors should be called in the order they were assigned.
        var combinedInterceptors = [].slice.call(this.globalInterceptors)
            .concat(this.interceptors)
            .concat(arrify(reqOpts.interceptors_));
        var interceptor;
        // tslint:disable-next-line:no-conditional-assignment
        while ((interceptor = combinedInterceptors.shift()) &&
            interceptor.request) {
            reqOpts = interceptor.request(reqOpts);
        }
        delete reqOpts.interceptors_;
        var pkg = this.packageJson;
        reqOpts.headers = extend({}, reqOpts.headers, {
            'User-Agent': util_1.util.getUserAgentFromPackageJson(pkg),
            'x-goog-api-client': "gl-node/" + process.versions.node + " gccl/" + pkg.version,
        });
        if (reqOpts.shouldReturnStream) {
            // tslint:disable-next-line:no-any
            return this.makeAuthenticatedRequest(reqOpts);
        }
        else {
            return pify(this.makeAuthenticatedRequest, { multiArgs: true })(reqOpts)
                .then(function (args) {
                /**
                 * Note: this returns an array of results in the form of a
                 * BodyResponseCallback, which means: [body, response].  Return
                 * the response object in the promise result.
                 */
                return args.length > 1 ? args[1] : null;
            }, function (e) {
                if (is.array(e) && e.length > 0) {
                    var err = e[0], body = e[1], res = e[2];
                    if (res) {
                        res.body = err;
                        err.response = res;
                    }
                    throw err;
                }
                throw e;
            });
        }
    };
    Service.prototype.request = function (reqOpts, callback) {
        if (!callback) {
            return this.request_(reqOpts);
        }
        this.request_(reqOpts).then(function (res) { return callback(null, res.body, res); }, function (err) { return callback(err, err.response ? err.response.body : undefined, err.response); });
    };
    /**
     * Make an authenticated API request.
     *
     * @private
     *
     * @param {object} reqOpts - Request options that are passed to `request`.
     * @param {string} reqOpts.uri - A URI relative to the baseUrl.
     */
    Service.prototype.requestStream = function (reqOpts) {
        var opts = extend(true, reqOpts, { shouldReturnStream: true });
        return this.request_(opts);
    };
    return Service;
}());
exports.Service = Service;
//# sourceMappingURL=service.js.map