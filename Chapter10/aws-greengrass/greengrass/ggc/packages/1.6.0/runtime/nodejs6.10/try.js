/*
 * Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 */

// Try represents the result of a computation that can return either an error or a desired value
exports.TryResult = class TryResult {
    constructor(error, value) {
        this.error = error;
        this.value = value;
    }

    static newError(error) {
        return new exports.TryResult(error, undefined);
    }

    static newValue(value) {
        return new exports.TryResult(undefined, value);
    }
};

exports.safeJsonParse = function safeJsonParse(input) {
    try {
        return exports.TryResult.newValue(JSON.parse(input));
    } catch (e) {
        return exports.TryResult.newError(e);
    }
};

exports.safeJsonStringify = function safeJsonStringify(input) {
    try {
        return exports.TryResult.newValue(JSON.stringify(input));
    } catch (e) {
        return exports.TryResult.newError(e);
    }
};

exports.safeBase64Decode = function safeBase64Decode(input) {
    try {
        return exports.TryResult.newValue(Buffer.from(input, 'base64'));
    } catch (e) {
        return exports.TryResult.newError(e);
    }
};
