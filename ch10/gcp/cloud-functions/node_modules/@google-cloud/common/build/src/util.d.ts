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
/// <reference types="node" />
/*!
 * @module common/util
 */
import * as duplexify from 'duplexify';
import { GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import { CredentialBody } from 'google-auth-library/build/src/auth/credentials';
import * as r from 'request';
import { Transform, TransformOptions } from 'stream';
import { Interceptor } from './service-object';
export declare type ResponseBody = any;
export interface ParsedHttpRespMessage {
    resp: r.Response;
    err?: ApiError;
}
export interface MakeAuthenticatedRequest {
    (reqOpts: DecorateRequestOptions): duplexify.Duplexify;
    (reqOpts: DecorateRequestOptions, options?: MakeAuthenticatedRequestOptions): void | Abortable;
    (reqOpts: DecorateRequestOptions, callback?: BodyResponseCallback): void | Abortable;
    (reqOpts: DecorateRequestOptions, optionsOrCallback?: MakeAuthenticatedRequestOptions | BodyResponseCallback): void | Abortable | duplexify.Duplexify;
    getCredentials: (callback: (err?: Error | null, credentials?: CredentialBody) => void) => void;
    authClient: GoogleAuth;
}
export declare type Abortable = {
    abort(): void;
};
export declare type AbortableDuplex = duplexify.Duplexify & Abortable;
export interface PromisifyAllOptions extends PromisifyOptions {
    /**
     * Array of methods to ignore when promisifying.
     */
    exclude?: string[];
}
export interface PackageJson {
    name: string;
    version: string;
}
export interface PromiseMethod extends Function {
    promisified_?: boolean;
}
export interface PromisifyOptions {
    /**
     * Resolve the promise with single arg instead of an array.
     */
    singular?: boolean;
}
export interface CreateLimiterOptions {
    /**
     * The maximum number of API calls to make.
     */
    maxApiCalls?: number;
    /**
     * Options to pass to the Stream constructor.
     */
    streamOptions?: TransformOptions;
}
export interface GlobalContext {
    config_: {};
}
export interface GlobalConfig {
    projectId?: string;
    credentials?: {};
    keyFilename?: string;
    interceptors_?: {};
}
export interface MakeAuthenticatedRequestFactoryConfig extends GoogleAuthOptions {
    /**
     * Automatically retry requests if the response is related to rate limits or
     * certain intermittent server errors. We will exponentially backoff
     * subsequent requests by default. (default: true)
     */
    autoRetry?: boolean;
    /**
     * If true, just return the provided request options. Default: false.
     */
    customEndpoint?: boolean;
    /**
     * Account email address, required for PEM/P12 usage.
     */
    email?: string;
    /**
     * Maximum number of automatic retries attempted before returning the error.
     * (default: 3)
     */
    maxRetries?: number;
    stream?: duplexify.Duplexify;
}
export interface MakeAuthenticatedRequestOptions {
    onAuthenticated: OnAuthenticatedCallback;
}
export interface OnAuthenticatedCallback {
    (err: Error | null, reqOpts?: DecorateRequestOptions): void;
}
export interface GoogleErrorBody {
    code: number;
    errors?: GoogleInnerError[];
    response: r.Response;
    message?: string;
}
export interface GoogleInnerError {
    reason?: string;
    message?: string;
}
export interface MakeWritableStreamOptions {
    /**
     * A connection instance used to get a token with and send the request
     * through.
     */
    connection?: {};
    /**
     * Metadata to send at the head of the request.
     */
    metadata?: {
        contentType?: string;
    };
    /**
     * Request object, in the format of a standard Node.js http.request() object.
     */
    request?: r.Options;
    makeAuthenticatedRequest(reqOpts: r.OptionsWithUri, fnobj: {
        onAuthenticated(err: Error | null, authenticatedReqOpts?: r.Options): void;
    }): void;
}
export interface DecorateRequestOptions extends r.OptionsWithUri {
    autoPaginate?: boolean;
    autoPaginateVal?: boolean;
    objectMode?: boolean;
    uri: string;
    interceptors_?: Interceptor[];
    shouldReturnStream?: boolean;
}
export interface ParsedHttpResponseBody {
    body: ResponseBody;
    err?: Error;
}
/**
 * Custom error type for missing project ID errors.
 */
export declare class MissingProjectIdError extends Error {
    message: string;
}
/**
 * Custom error type for API errors.
 *
 * @param {object} errorBody - Error object.
 */
export declare class ApiError extends Error {
    code?: number;
    errors?: GoogleInnerError[];
    response?: r.Response;
    constructor(errorMessage: string);
    constructor(errorBody: GoogleErrorBody);
}
/**
 * Custom error type for partial errors returned from the API.
 *
 * @param {object} b - Error object.
 */
export declare class PartialFailureError extends Error {
    errors?: GoogleInnerError[];
    response?: r.Response;
    constructor(b: GoogleErrorBody);
}
export interface BodyResponseCallback {
    (err: Error | null, body?: ResponseBody, res?: r.Response): void;
}
export interface MakeRequestConfig {
    /**
     * Automatically retry requests if the response is related to rate limits or
     * certain intermittent server errors. We will exponentially backoff
     * subsequent requests by default. (default: true)
     */
    autoRetry?: boolean;
    /**
     * Maximum number of automatic retries attempted before returning the error.
     * (default: 3)
     */
    maxRetries?: number;
    retries?: number;
    stream?: duplexify.Duplexify;
    request?: {};
    shouldRetryFn?: (response?: r.Response) => boolean;
}
export declare class Util {
    MissingProjectIdError: typeof MissingProjectIdError;
    ApiError: typeof ApiError;
    PartialFailureError: typeof PartialFailureError;
    /**
     * No op.
     *
     * @example
     * function doSomething(callback) {
     *   callback = callback || noop;
     * }
     */
    noop(): void;
    /**
     * Uniformly process an API response.
     *
     * @param {*} err - Error value.
     * @param {*} resp - Response value.
     * @param {*} body - Body value.
     * @param {function} callback - The callback function.
     */
    handleResp(err: Error | null, resp?: r.Response | null, body?: ResponseBody, callback?: BodyResponseCallback): void;
    /**
     * Sniff an incoming HTTP response message for errors.
     *
     * @param {object} httpRespMessage - An incoming HTTP response message from `request`.
     * @return {object} parsedHttpRespMessage - The parsed response.
     * @param {?error} parsedHttpRespMessage.err - An error detected.
     * @param {object} parsedHttpRespMessage.resp - The original response object.
     */
    parseHttpRespMessage(httpRespMessage: r.Response): ParsedHttpRespMessage;
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
    parseHttpRespBody(body: ResponseBody): ParsedHttpResponseBody;
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
    makeWritableStream(dup: duplexify.Duplexify, options: MakeWritableStreamOptions, onComplete?: Function): void;
    /**
     * Returns true if the API request should be retried, given the error that was
     * given the first time the request was attempted. This is used for rate limit
     * related errors as well as intermittent server errors.
     *
     * @param {error} err - The API error to check if it is appropriate to retry.
     * @return {boolean} True if the API request should be retried, false otherwise.
     */
    shouldRetryRequest(err?: ApiError): boolean;
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
    makeAuthenticatedRequestFactory(config?: MakeAuthenticatedRequestFactoryConfig): MakeAuthenticatedRequest;
    /**
     * Make a request through the `retryRequest` module with built-in error
     * handling and exponential back off.
     *
     * @param {object} reqOpts - Request options in the format `request` expects.
     * @param {object=} config - Configuration object.
     * @param {boolean=} config.autoRetry - Automatically retry requests if the
     *     response is related to rate limits or certain intermittent server
     * errors. We will exponentially backoff subsequent requests by default.
     * (default: true)
     * @param {number=} config.maxRetries - Maximum number of automatic retries
     *     attempted before returning the error. (default: 3)
     * @param {function} callback - The callback function.
     */
    makeRequest(reqOpts: r.Options, callback: BodyResponseCallback): Abortable;
    makeRequest(reqOpts: r.Options, config: MakeRequestConfig, callback: BodyResponseCallback): void | Abortable;
    /**
     * Decorate the options about to be made in a request.
     *
     * @param {object} reqOpts - The options to be passed to `request`.
     * @param {string} projectId - The project ID.
     * @return {object} reqOpts - The decorated reqOpts.
     */
    decorateRequest(reqOpts: DecorateRequestOptions, projectId: string): DecorateRequestOptions;
    /**
     * Populate the `{{projectId}}` placeholder.
     *
     * @throws {Error} If a projectId is required, but one is not provided.
     *
     * @param {*} - Any input value that may contain a placeholder. Arrays and objects will be looped.
     * @param {string} projectId - A projectId. If not provided
     * @return {*} - The original argument with all placeholders populated.
     */
    replaceProjectIdToken(value: string | string[] | {}, projectId: string): any;
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
    extendGlobalConfig(globalConfig: GlobalConfig | null, overrides: GlobalConfig): GlobalConfig;
    /**
     * Merge and validate API configurations.
     *
     * @param {object} globalContext - gcloud-level context.
     * @param {object} globalContext.config_ - gcloud-level configuration.
     * @param {object} localConfig - Service-level configurations.
     * @return {object} config - Merged and validated configuration.
     */
    normalizeArguments(globalContext: GlobalContext | null, localConfig: GlobalConfig): GlobalConfig;
    /**
     * Limit requests according to a `maxApiCalls` limit.
     *
     * @param {function} makeRequestFn - The function that will be called.
     * @param {object=} options - Configuration object.
     * @param {number} options.maxApiCalls - The maximum number of API calls to make.
     * @param {object} options.streamOptions - Options to pass to the Stream constructor.
     */
    createLimiter(makeRequestFn: Function, options?: CreateLimiterOptions): {
        makeRequest(...args: any[]): Transform | undefined;
        stream: Transform;
    };
    isCustomType(unknown: any, module: string): boolean;
    /**
     * Create a properly-formatted User-Agent string from a package.json file.
     *
     * @param {object} packageJson - A module's package.json file.
     * @return {string} userAgent - The formatted User-Agent string.
     */
    getUserAgentFromPackageJson(packageJson: PackageJson): string;
    /**
     * Wraps a callback style function to conditionally return a promise.
     *
     * @param {function} originalMethod - The method to promisify.
     * @param {object=} options - Promise options.
     * @param {boolean} options.singular - Resolve the promise with single arg instead of an array.
     * @return {function} wrapped
     */
    promisify(originalMethod: PromiseMethod, options?: PromisifyOptions): any;
    /**
     * Promisifies certain Class methods. This will not promisify private or
     * streaming methods.
     *
     * @param {module:common/service} Class - Service class.
     * @param {object=} options - Configuration object.
     */
    promisifyAll(Class: Function, options?: PromisifyAllOptions): void;
    /**
     * This will mask properties of an object from console.log.
     *
     * @param {object} object - The object to assign the property to.
     * @param {string} propName - Property name.
     * @param {*} value - Value.
     */
    privatize(object: {}, propName: string, value: {}): void;
}
declare const util: Util;
export { util };
