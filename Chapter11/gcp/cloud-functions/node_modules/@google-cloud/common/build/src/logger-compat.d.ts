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
import { kFormat, LoggerConfig } from './logger';
export interface CustomLevelsLoggerConfig extends LoggerConfig {
    /**
     * The list of levels to use.
     */
    levels: string[];
}
export declare type CustomLevelsLogger = {
    [kFormat]: (...args: any[]) => string;
    [logLevel: string]: (...args: any[]) => CustomLevelsLogger;
} & {
    format: (...args: any[]) => string;
    levels: string[];
    level: string | false;
};
declare function createLogger(optionsOrLevel?: Partial<CustomLevelsLoggerConfig> | string): CustomLevelsLogger;
/**
 * Create a logger to print output to the console.
 * Omitted options will default to values provided in defaultLoggerOptions.
 */
export declare const logger: typeof createLogger & {
    LEVELS: ReadonlyArray<string>;
};
export {};
