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
Object.defineProperty(exports, "__esModule", { value: true });
// Logger is new in 0.18.0.
var logger_1 = require("./logger");
exports.Logger = logger_1.Logger;
// logger is the interface exported prior to 0.18.0. The two logging-related
// interfaces are not mutually compatible, though the implementation
// of logger is currently a wrapper around Logger.
// TODO: logger should eventually be deprecated.
var logger_compat_1 = require("./logger-compat");
exports.logger = logger_compat_1.logger;
/**
 * @type {module:common/operation}
 * @private
 */
var operation_1 = require("./operation");
exports.Operation = operation_1.Operation;
/**
 * @type {module:common/paginator}
 * @private
 */
var paginator_1 = require("./paginator");
exports.paginator = paginator_1.paginator;
exports.Paginator = paginator_1.Paginator;
/**
 * @type {module:common/service}
 * @private
 */
var service_1 = require("./service");
exports.Service = service_1.Service;
/**
 * @type {module:common/serviceObject}
 * @private
 */
var service_object_1 = require("./service-object");
exports.ServiceObject = service_object_1.ServiceObject;
/**
 * @type {module:common/util}
 * @private
 */
var util_1 = require("./util");
exports.ApiError = util_1.ApiError;
exports.util = util_1.util;
//# sourceMappingURL=index.js.map