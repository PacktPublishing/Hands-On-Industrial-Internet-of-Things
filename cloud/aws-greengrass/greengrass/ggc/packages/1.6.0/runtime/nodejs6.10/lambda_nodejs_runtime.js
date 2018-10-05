/*eslint import/no-dynamic-require: 0*/

/*
 * Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 */

const Try = require('./try');
const stdredirect = require('./redirect.js').stdredirect;
const start = require('./start.js').start;
const lambdaLogger = require('./redirect.js').lambdaLogger;
const greengrassCommon = require('aws-greengrass-common-js');
const logging = require('aws-greengrass-common-js').logging;
const encodingTypeJSON = require('aws-greengrass-common-js').encodingType.encodingTypeJSON;
const encodingTypeBinary = require('aws-greengrass-common-js').encodingType.encodingTypeBinary;
const parseVersion = require('aws-greengrass-common-js').versionParser.parseVersion;

let IPCClient = null;
IPCClient = require('aws-greengrass-ipc-sdk-js');

const BackoffRetry = greengrassCommon.BackoffRetry;
const envVars = greengrassCommon.envVars;

// Setup our runtime logger
const runtimeLogger = new logging.LocalWatchLogger();

// Read in our required environment variables
const myFunctionArn = envVars.MY_FUNCTION_ARN;
const authToken = envVars.AUTH_TOKEN;
const encodingType = envVars.ENCODING_TYPE;
const ggMaxInterfaceVersion = envVars.GGC_MAX_INTERFACE_VERSION;

const EnvVars = new Map([
    ['MY_FUNCTION_ARN', myFunctionArn],
    ['AWS_CONTAINER_AUTHORIZATION_TOKEN', authToken],
    ['ENCODING_TYPE', encodingType],
    ['GGC_MAX_INTERFACE_VERSION', ggMaxInterfaceVersion],
]);

function checkEnvVars(vars) {
    // throw error when env var is missing
    for (const key of vars.keys()) {
        if (!vars.get(key)) {
            const err = new Error(`Missing ${key} environment variable`);
            runtimeLogger.error(err);
            throw err;
        }
    }

    // validate encoding type
    const encoding = vars.get('ENCODING_TYPE');
    if ((encoding !== encodingTypeBinary) && (encoding !== encodingTypeJSON)) {
        const err = new Error(`Invalid ENCODING_TYPE environment variable: ${encoding}`);
        runtimeLogger.error(err);
        throw err;
    }
}

checkEnvVars(EnvVars);

function _compareVersion(sdkIV, maxIV) {
    const [sdkMajorVersion, sdkMinorVersion] = parseVersion(sdkIV);
    const [maxMajorVersion, maxMinorVersion] = parseVersion(maxIV);
    if (sdkMajorVersion !== maxMajorVersion || sdkMinorVersion > maxMinorVersion) {
        return false;
    }
    return true;
}

function checkGreengrassInterfaceVersion() {
    let ggSdk;
    let ggInterfaceVersion;
    try {
        ggSdk = require('aws-greengrass-core-sdk');
    } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
            runtimeLogger.error(err);
            throw err;
        }
        // Greengrass SDK not in use, skip check.
        return;
    }
    if (ggSdk.GreengrassInterfaceVersion) {
        ggInterfaceVersion = ggSdk.GreengrassInterfaceVersion;
    } else {
        // Old SDK, default to default interface version number
        ggInterfaceVersion = '1.0';
    }

    const maxInterfaceVersion = EnvVars.get('GGC_MAX_INTERFACE_VERSION');
    if (!_compareVersion(ggInterfaceVersion, maxInterfaceVersion)) {
        const err = new Error('There was a version incompatibility between the Greengrass SDK used ' +
            `by your function [${myFunctionArn}] and the Greengrass Core. Please visit ` +
            'the AWS Greengrass Developer Guide for version compatibility information');
        runtimeLogger.error(err);
        throw err;
    }
}

checkGreengrassInterfaceVersion();

runtimeLogger.info(`Running [${myFunctionArn}]`);

/*
Invocation manages the state and lifecycle of a single invocation of a customer's handler, as opposed to the Runtime
class which manages state across multiple invocations of a customer handler. Invocation does not interact with the IPC
directly or try to format input/output to/from the customer handler, instead leaving that to Runtime which provides
callbacks to Invocation.

Invocation is a separate class from Runtime only for organizational/readability purposes.
 */
class Invocation {
    constructor(functionArn, invocationId, clientContext, postResultCallback) {
        this.functionArn = functionArn;
        this.invocationId = invocationId;

        // postResultCallback will be called when the customer has returned an error or result object and we need to
        // report it back to Daemon and get new work.
        this.postResultCallback = postResultCallback;

        // The customer can call the handler callback multiple times, or the Runtime can with default values if the
        // customer never called it during their handler execution. This variable keeps track of if we have run the
        // callback yet for this invocation so we can only post the work result or error if we have not already.
        this._handlerCallbackHasRun = false;

        const arnFields = new greengrassCommon.FunctionArnFields(functionArn);

        // Create the context object that will be passed to the customer's handler
        this.context = {
            invokedFunctionArn: functionArn,
            awsRequestId: invocationId,

            functionName: arnFields.name,
            functionVersion: arnFields.qualifier,

            clientContext: {
                client: {},  // We do not support invocation from the AWS Mobile SDK at this time, so this is empty
                Custom: clientContext.custom ? clientContext.custom : {},
                env: {},  // We do not support invocation from the AWS Mobile SDK at this time, so this is empty
            },

            // Currently unable to provide the following attributes (see http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html):
            // memoryLimitInMB
            // logGroupName
            // logStreamName
            // identity
            // getRemainingTimeInMillis: function() {}
        };
    }

    handlerCallback(error, result) {
        // If we have already run this callback during this invocation, just return
        // and do nothing.
        if (this._handlerCallbackHasRun) {
            return;
        }

        // If this is the first time running the handler callback during this invocation,
        // make sure we don't run it again in the future.
        this._handlerCallbackHasRun = true;

        // Post the error or result to Daemon and get new work.
        process.nextTick(() => this.postResultCallback(error, result));
    }

    invoke(customerHandler, customerModule, event) {
        // Instead of directly invoking the handler, invoke it using the module we imported the handler from as 'this'.
        // We, however, need to bind our handlerCallback to this Invocation object to make sure it still has access
        // to the Invocation object's properties.
        lambdaLogger.info(`START RequestId: ${this.invocationId}`);
        try {
            customerHandler.apply(customerModule, [event, this.context, this.handlerCallback.bind(this)]);
        } catch (e) {
            const err = new Error(`Failed to invoke handler: ${e}`);
            runtimeLogger.error(err);
            this.postResultCallback(err, undefined);
        }
        lambdaLogger.info(`End RequestId: ${this.invocationId}`);
    }
}

/*
Runtime holds data that's constant across multiple invocations of a customer's handler (such as a reference to the
handler, the IPC client, etc.) and serves as an interface between the customer's handler and the raw data read from
the IPC client.

Each invocation of the customer's handler will create a new Invocation object (set to this.currentInvocation) which
manages the state and lifecycle of a single customer handler invocation.
 */
class Runtime {
    constructor(handlerConfiguration, functionArn, authenticationToken) {
        this._functionArn = functionArn;

        this._ipc = new IPCClient(authenticationToken);
        this._ipcGetWork = this._ipc.getWork.bind(this._ipc);
        this._ipcPostErr = this._ipc.postHandlerErr.bind(this._ipc);
        this._ipcPostWorkResult = this._ipc.postWorkResult.bind(this._ipc);
        this.encodingType = encodingType;

        // Import the customer handler. We also hold onto the module itself that contains the handler because we
        // need to execute the customer handler bound to that module, which is to say, when the customer uses the 'this'
        // keyword in their handler, 'this' should refer to the module containing their handler, not the global 'this'
        // or any objects from our runtime here. This is the behavior of Lambda in the cloud.
        try {
            // handlerConfiguration is in form 'foo.bar.handler_name', we need to extract
            // 'foo.bar' and 'handler_name' as moduleName and handlerName respectively
            const handlerSplit = handlerConfiguration.split('.');
            const moduleName = handlerSplit.slice(0, handlerSplit.length - 1).join('.');
            const handlerName = handlerSplit[handlerSplit.length - 1];

            this._module = require(moduleName);
            this._handler = this._module[handlerName];
        } catch (e) {
            // If we can't import their handler, we can't continue. Log the error and raise it so we exit.
            runtimeLogger.error(`Failed to import function handler ${handlerConfiguration} due to exception: ${e}`);
            throw e;
        }

        // We won't have a current invocation until someone calls getWorkAndInvoke and we get work from the IPC
        this.currentInvocation = undefined;
    }

    static _stackTraceMap(v) {
        const prefixToRemove = '    at ';
        return v.startsWith(prefixToRemove) ? v.slice(prefixToRemove.length) : v;
    }

    /*
     Turn a generic object returned by the customer as their error into a Stringify-able object conforming to the docs
     here: http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-mode-exceptions.html

     This logic is translated directly from Cloud Lambda's code.
     */
    static _getErrObject(obj) {
        if (obj instanceof Error) {
            // If the object returned as an error is an actual javascript Error object, we will provide the message,
            // error type and stack trace.
            const errObject = {
                errorMessage: obj.message,
                stackTrace: obj.stack.split('\n').slice(1).map(this._stackTraceMap),
            };
            if (obj.code) {
                errObject.errorType = obj.code;
            }
            return errObject;
        } else if ((obj === undefined) || (obj === null) || (obj === '__emptyFailParamBackCompat')) {
            // If the object returned as an error is some other object, we will set the error message by calling
            // toString on it or, if it's null or undefined, the JSON "null".

            // TODO understand what __emptyFailParamBackCompat is. Right now this logic is translated directly from
            // Lambda in the cloud's code. It may or may not be needed here.
            return {
                errorMessage: null,
            };
        } else {
            return {
                errorMessage: obj.toString(),
            };
        }
    }

    static _getClientContext(clientContextEncoded) {
        if (clientContextEncoded) {
            // Start by base64 decoding it.
            const clientContextB64DecodedTry = Try.safeBase64Decode(clientContextEncoded);
            if (clientContextB64DecodedTry.error) {
                return clientContextB64DecodedTry;
            }

            // Now JSON deserialize it to get the final clientContext object
            return Try.safeJsonParse(clientContextB64DecodedTry.value);
        } else {
            return Try.TryResult.newValue({});
        }
    }

    static _getEvent(serializedPayload, payloadEncodingType) {
        if (payloadEncodingType === encodingTypeJSON) {
            return serializedPayload ? Try.safeJsonParse(serializedPayload) : Try.TryResult.newValue({});
        } else {
            return Try.TryResult.newValue(serializedPayload);
        }
    }

    _getNewInvocation(invocationId, clientContext) {
        return new Invocation(
            this._functionArn,
            invocationId,
            clientContext,

            // callback for when the customer wants to post their result or error
            this.postWorkResultOrError.bind(this));
    }

    getWorkAndInvoke() {
        const runtime = this;
        function doInvoke(error, payload, invocationId, clientContextEncoded) {
            // No need to check error here as calls to invoke will be wrapped by backoffRetry which does error checking
            // for us

            // Create the context object that will be passed to customer handler.
            const clientContextTry = Runtime._getClientContext(clientContextEncoded);
            if (clientContextTry.error) {
                runtimeLogger.error(clientContextTry.error);
                return;
            }

            // Create the eventTry object that will be passed to customer handler. If there was no payload, set eventTry to
            // an empty object
            const eventTry = Runtime._getEvent(payload, this.encodingType);
            if (eventTry.error) {
                runtimeLogger.error(`Cannot parse given invoke payload as JSON: ${eventTry.error}`);
                return;
            }

            // Invoke the customer handler
            runtime.currentInvocation = runtime._getNewInvocation(invocationId, clientContextTry.value);

            runtime.currentInvocation.invoke(runtime._handler, runtime._module, eventTry.value);
        }

        const errorCallback = function onGetWorkError(error) {
            runtimeLogger.error(`Encountered error during attempt to get work: ${error}`);
        };

        const getWorkWithRetry = new BackoffRetry(this._ipcGetWork, this, errorCallback, 50, 2, 500, 10, 3000, true).tryOrThrowError;
        getWorkWithRetry(this._functionArn, doInvoke);
    }

    /*
    postWorkResultOrError translates the output of a customer's handler (in which they can provide error, result, or both),
    to the IPC calls that actually send that output to Daemon.

    If a customer provides both error and result, result will be ignored and only error will be processed, see:
    http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
     */
    postWorkResultOrError(error, result) {
        if (error !== undefined && error !== null) {
            this._postHandlerErr(error);
        } else {
            this._postWorkResult(result);
        }
    }

    _postWorkResult(result) {
        // JSON serialize the result. If the result was undefined, use null instead, which will return an actual
        // JSON string.
        let encodedResultTry;
        if (this.encodingType === encodingTypeJSON) {
            encodedResultTry = Try.safeJsonStringify(result !== undefined ? result : null);
        } else {
            encodedResultTry = Try.TryResult.newValue(result);
        }

        if (encodedResultTry.error) {
            // If the value object cannot be serialized, log the occurrence post the serialization error as a
            // handler error.
            const err = new Error(`Error occurred while attempting to serialize handler result to JSON: ${encodedResultTry.error.toString()}`);

            runtimeLogger.error(`Failed to parse work result: ${encodedResultTry.error}`);
            this._postHandlerErr(err);

            return;
        }

        // Post the work result with exponential backoff retries in case of failure. If error thresholds are exceeded,
        // an exception will be thrown and the process will die.
        const errorCallback = function onPostWorkResultError(error) {
            runtimeLogger.error(`Encountered error during attempt to post work result: ${error}`);
        };

        const postWorkResultWithRetry = new BackoffRetry(this._ipcPostWorkResult, this, errorCallback, 50, 2, 500, 10, 3000, true).tryOrThrowError;
        postWorkResultWithRetry(this._functionArn, encodedResultTry.value, this.currentInvocation.invocationId, this.getWorkAndInvoke.bind(this));
    }

    _postHandlerErr(error) {
        const errorJsonTry = Try.safeJsonStringify(Runtime._getErrObject(error));
        if (errorJsonTry.error) {
            // Runtime._getErrObject should guarantee that the error object is JSON serializable. If we failed to
            // serialize the error object, something is wrong, log and raise the error.
            runtimeLogger.error(`Failed to parse handler error: ${errorJsonTry.error}`);
            throw errorJsonTry.error;
        }

        // Post the handler error with exponential backoff retries in case of failure. If error thresholds are exceeded,
        // an exception will be thrown and the process will die.
        const errorCallback = function onPostHandlerErrError(err) {
            runtimeLogger.error(`Encountered error during attempt to post handler error: ${err}`);
        };

        const postErrWithRetry = new BackoffRetry(this._ipcPostErr, this, errorCallback, 50, 2, 500, 10, 3000, true).tryOrThrowError;
        postErrWithRetry(this._functionArn, errorJsonTry.value, this.currentInvocation.invocationId, this.getWorkAndInvoke.bind(this));
    }
}

// A real argument parser lib may be called for if our arg list
// ever grows in complexity but it would also add extra dependencies
// we need to manage and deploy, so this simple but limited parsing
// logic suffices for now.
function _handlerFind(element) {
    return element.startsWith('--handler=');
}

function getHandlerConfiguration(argv) {
    const handlerFlag = argv.find(_handlerFind);
    if (handlerFlag === undefined) {
        throw new Error('--handler=<handler name> is a required argument');
    }

    const handlerNameIndex = handlerFlag.indexOf('=');
    return handlerFlag.slice(handlerNameIndex + 1);
}

// Setup our runtime
const runtime = new Runtime(getHandlerConfiguration(process.argv), myFunctionArn, authToken);

// If we receive SIGTERM, we want to shutdown gracefully
process.on('SIGTERM', () => {
    runtimeLogger.info('Caught SIGTERM. Stopping runtime.');
    process.exit(0);
});

// This callback runs whenever the NodeJS event loop is empty. By default, a single invocation
// of a customer's handler is considered done when the NodeJS event loop is empty after the initial
// invocation of their handler (though they can disable this behavior using context.callbackWaitsForEmptyEventLoop).
//
// Normally, the NodeJS process will exit when the event loop is empty, however because we are going to add new callbacks
// to the event loop, the process will not exit and continue executing. This will NOT execute, however, if the process
// is exiting due to a raised exception or call to process.exit
process.on('beforeExit', () => {
    // If there is a current invocation, call the handlerCallback provided to the customer's handler in case the
    // customer never did. If the customer did already call handlerCallback, this will be a no-op.
    // See: http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-prog-model-handler-callback
    if (runtime.currentInvocation) {
        runtime.currentInvocation.handlerCallback(undefined, undefined);
    }
});

// stdredirect and start functions are imported from different modules so they can be mocked out in unit tests because
// setting stdredirect or starting the runtime in top level will cause test to hang or run functions not under test
stdredirect();
start(runtime);
