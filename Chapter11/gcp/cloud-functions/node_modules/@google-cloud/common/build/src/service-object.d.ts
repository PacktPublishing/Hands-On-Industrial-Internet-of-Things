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
/// <reference types="node" />
import { EventEmitter } from 'events';
import * as r from 'request';
import { Service } from '.';
import { ApiError, BodyResponseCallback, DecorateRequestOptions } from './util';
export interface Interceptor {
    [index: string]: any;
}
export interface Metadata {
    error?: Error;
    done?: boolean;
}
export declare type GetMetadataCallback = (err: Error | null, metadata?: Metadata | null, apiResponse?: r.Response) => void;
export interface ExistsCallback {
    (err: Error | null, exists?: boolean): void;
}
export interface ServiceObjectConfig {
    /**
     * The base URL to make API requests to.
     */
    baseUrl?: string;
    /**
     * The method which creates this object.
     */
    createMethod?: Function;
    /**
     * The identifier of the object. For example, the name of a Storage bucket or
     * Pub/Sub topic.
     */
    id?: string;
    /**
     * A map of each method name that should be inherited.
     */
    methods?: Methods;
    /**
     * The parent service instance. For example, an instance of Storage if the
     * object is Bucket.
     */
    parent: Service;
}
export interface Methods {
    [methodName: string]: {
        reqOpts: r.OptionsWithUri;
    };
}
export interface CreateOptions {
}
export interface InstanceResponseCallback {
    (err: ApiError | null, instance?: ServiceObject | null, apiResponse?: r.Response): void;
}
export interface DeleteCallback {
    (err: Error | null, apiResponse?: r.Response): void;
}
export interface GetConfig {
    /**
     * Create the object if it doesn't already exist.
     */
    autoCreate?: boolean;
}
export interface StreamRequestOptions extends DecorateRequestOptions {
    shouldReturnStream: true;
}
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
declare class ServiceObject extends EventEmitter {
    metadata: any;
    baseUrl?: string;
    protected parent: Service;
    private id?;
    private createMethod?;
    protected methods: Methods;
    private interceptors;
    protected Promise?: PromiseConstructor;
    [index: string]: any;
    constructor(config: ServiceObjectConfig);
    /**
     * Create the object.
     *
     * @param {object=} options - Configuration object.
     * @param {function} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {object} callback.instance - The instance.
     * @param {object} callback.apiResponse - The full API response.
     */
    create(options: CreateOptions, callback?: InstanceResponseCallback): void;
    create(callback?: InstanceResponseCallback): void;
    /**
     * Delete the object.
     *
     * @param {function=} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {object} callback.apiResponse - The full API response.
     */
    delete(callback?: DeleteCallback): void;
    /**
     * Check if the object exists.
     *
     * @param {function} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {boolean} callback.exists - Whether the object exists or not.
     */
    exists(callback: ExistsCallback): void;
    /**
     * Get the object if it exists. Optionally have the object created if an
     * options object is provided with `autoCreate: true`.
     *
     * @param {object=} config - The configuration object that will be used to
     *     create the object if necessary.
     * @param {boolean} config.autoCreate - Create the object if it doesn't already exist.
     * @param {function} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {object} callback.instance - The instance.
     * @param {object} callback.apiResponse - The full API response.
     */
    get(config: GetConfig, callback?: InstanceResponseCallback): void;
    get(callback: InstanceResponseCallback): void;
    /**
     * Get the metadata of this object.
     *
     * @param {function} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {object} callback.metadata - The metadata for this object.
     * @param {object} callback.apiResponse - The full API response.
     */
    getMetadata(callback: GetMetadataCallback): void;
    /**
     * Set the metadata for this object.
     *
     * @param {object} metadata - The metadata to set on this object.
     * @param {function=} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this request.
     * @param {object} callback.instance - The instance.
     * @param {object} callback.apiResponse - The full API response.
     */
    setMetadata(metadata: {}, callback?: (err: Error | null, resp?: r.Response) => void): void;
    /**
     * Make an authenticated API request.
     *
     * @private
     *
     * @param {object} reqOpts - Request options that are passed to `request`.
     * @param {string} reqOpts.uri - A URI relative to the baseUrl.
     * @param {function} callback - The callback function passed to `request`.
     */
    request_(reqOpts: StreamRequestOptions): r.Request;
    request_(reqOpts: DecorateRequestOptions): Promise<r.Response>;
    /**
     * Make an authenticated API request.
     *
     * @private
     *
     * @param {object} reqOpts - Request options that are passed to `request`.
     * @param {string} reqOpts.uri - A URI relative to the baseUrl.
     * @param {function} callback - The callback function passed to `request`.
     */
    request(reqOpts: DecorateRequestOptions): Promise<r.Response>;
    request(reqOpts: DecorateRequestOptions, callback: BodyResponseCallback): void;
    /**
     * Make an authenticated API request.
     *
     * @private
     *
     * @param {object} reqOpts - Request options that are passed to `request`.
     * @param {string} reqOpts.uri - A URI relative to the baseUrl.
     */
    requestStream(reqOpts: DecorateRequestOptions): r.Request;
}
export { ServiceObject };
