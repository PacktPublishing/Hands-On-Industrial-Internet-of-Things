/*
 * Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 */

const util = require('util');
const greengrassCommon = require('aws-greengrass-common-js');
const logging = require('aws-greengrass-common-js').logging;

const envVars = greengrassCommon.envVars;
const functionArn = envVars.MY_FUNCTION_ARN;

// Setup our lambda logger which logges to user lambda log
const arnFields = new greengrassCommon.FunctionArnFields(functionArn);
const lambdaLogGroupName = util.format('/Lambda/%s/%s/%s', arnFields.region, arnFields.accountId, arnFields.name);
const lambdaLogger = new logging.LocalWatchLogger(lambdaLogGroupName, 'fromNodeAppender');

function stdredirect() {
    console.debug = function consoleDebug(data) {
        lambdaLogger.debug(data);
    };

    console.log = function consoleLog(data) {
        lambdaLogger.info(data);
    };

    console.info = function consoleInfo(data) {
        lambdaLogger.info(data);
    };

    console.warn = function consoleWarn(data) {
        lambdaLogger.warn(data);
    };

    console.error = function consoleError(data) {
        lambdaLogger.error(data);
    };

    process.stderr.write = function stderrWrite(data) {
        lambdaLogger.error(data);
    };
}

exports.stdredirect = stdredirect;
exports.lambdaLogger = lambdaLogger;
