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
/*!
 * @module common/logger
 */
/**
 * Configuration options to be passed to the Logger constructor.
 */
export interface LoggerConfig {
    /**
     * The minimum log level that will print to the console.
     */
    level: string | false;
    /**
     * A tag to use in log messages.
     */
    tag: string;
}
export declare const kFormat: unique symbol;
export declare const kTag: unique symbol;
/**
 * A class representing a basic logger that emits logs to stdout.
 */
export declare class Logger {
    /**
     * Default logger options.
     */
    static readonly DEFAULT_OPTIONS: Readonly<LoggerConfig>;
    /**
     * The list of log levels.
     */
    static readonly LEVELS: ReadonlyArray<string>;
    private [kTag];
    readonly silent: (...args: any[]) => this;
    readonly error: (...args: any[]) => this;
    readonly warn: (...args: any[]) => this;
    readonly info: (...args: any[]) => this;
    readonly debug: (...args: any[]) => this;
    readonly silly: (...args: any[]) => this;
    /**
     * Create a logger to print output to the console.
     */
    constructor(opts?: Partial<LoggerConfig>);
    private [kFormat];
}
