'use strict';

const http = require('http');
const https = require('https');
const tunnel = require('tunnel');
const url = require('url');
const zlib = require('zlib');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;

/**
 * Downloads a file using http get and request
 * @param {string} src - The http URL to download from
 * @param {string} output - The filepath to save to
 * @param {object} options - Options object
 * @param {object} _parentEvent - Used for when their is a 302 redirect and need to maintain state to a new request
 * @param {number} redirects - The number of redirects, used to prevent infinite loops
 * @returns {*|EventEmitter}
 */
function download(src, output, options, _parentEvent, redirects) {
    if (typeof redirects === 'undefined') {
        redirects = 0;
    }
    let downloader = _parentEvent || new EventEmitter(),
        srcUrl,
        req;

    if (options) {
        options = parseOptions('download', options);
    } else {
        options = {
            gunzip: false
        };
    }
    srcUrl = url.parse(src);
    if (!srcUrl.protocol || srcUrl.prototype === null) {
        downloader.emit(
            'error',
            'Cannot parse url protocol for ' +
                src +
                ', please specify either HTTP or HTTPS'
        );
        return false;
    }
    srcUrl.protocol = cleanProtocol(srcUrl.protocol);

    req = request(
        {
            protocol: srcUrl.protocol,
            host: srcUrl.hostname,
            port: srcUrl.port,
            path: srcUrl.pathname + (srcUrl.search || ''),
            proxy: options ? options.proxy : undefined,
            auth: options.auth ? options.auth : undefined,
            method: 'GET'
        },
        function(res) {
            let fileSize, writeStream, downloadedSize;
            let gunzip = zlib.createGunzip();

            // Handle 302 redirects
            if (
                res.statusCode === 301 ||
                res.statusCode === 302 ||
                res.statusCode === 307
            ) {
                var newLocation = res.headers.location;
                if (res.headers.location.indexOf('/') === 0) {
                    newLocation =
                        srcUrl.protocol +
                        '://' +
                        srcUrl.hostname +
                        (srcUrl.port ? ':' + srcUrl.port : '') +
                        res.headers.location;
                }

                redirects++;
                if (redirects >= 10) {
                    downloader.emit('error', 'Infinite redirect loop detected');
                    return false;
                }
                download(newLocation, output, options, downloader, redirects);
            }

            if (res.statusCode === 200) {
                downloadedSize = 0;
                fileSize = Number(res.headers['content-length']);

                // If content length header is not sent, there is no way to determine file size.
                if (isNaN(fileSize) === true) {
                    fileSize = null;
                }
                writeStream = fs.createWriteStream(output, {
                    flags: 'w+',
                    encoding: 'binary'
                });

                res.on('error', function(err) {
                    writeStream.end();
                    downloader.emit('error', err);
                });

                var encoding = '';
                if (typeof res.headers['content-encoding'] === 'string') {
                    encoding = res.headers['content-encoding'];
                }

                // If the user has specified to unzip, and the file is gzip encoded, pipe to gunzip
                if (options.gunzip === true && encoding === 'gzip') {
                    res.pipe(gunzip);
                } else {
                    res.pipe(writeStream);
                }

                //emit a start event so the user knows the file-size he's gonna receive
                downloader.emit('start', fileSize);

                // Data handlers
                res.on('data', function(chunk) {
                    downloadedSize += chunk.length;
                    downloader.emit(
                        'progress',
                        calculateProgress(fileSize, downloadedSize)
                    );
                    downloader.emit('bytes', downloadedSize);
                });
                gunzip.on('data', function(chunk) {
                    writeStream.write(chunk);
                });

                writeStream.on('finish', function() {
                    writeStream.end();
                    downloader.emit('progress', 1);
                    downloader.emit('end', 'Finished writing to disk');
                    req.end('finished');
                });
            } else if (
                res.statusCode !== 200 &&
                res.statusCode !== 301 &&
                res.statusCode !== 302
            ) {
                downloader.emit(
                    'error',
                    'Server responded with unhandled status: ' + res.statusCode
                );
            }
        }
    );

    req.flushHeaders();
    req.on('error', function(err) {
        downloader.emit('error', err);
    });
    // Attach request to our EventEmitter for backwards compatibility, enables actions such as
    // req.abort();
    downloader.req = req;

    return downloader;
}

function request(options, callback) {
    var newOptions = {},
        newProxy = {},
        key;
    options = parseOptions('request', options);
    if (options.protocol === 'http') {
        if (options.proxy) {
            for (key in options.proxy) {
                if (key !== 'protocol') {
                    newProxy[key] = options.proxy[key];
                }
            }
            if (options.proxy.protocol === 'http') {
                options.agent = tunnel.httpOverHttp({ proxy: newProxy });
            } else if (options.proxy.protocol === 'https') {
                options.agent = tunnel.httpOverHttps({ proxy: newProxy });
            } else {
                throw options.proxy.protocol + ' proxy is not supported!';
            }
        }
        for (key in options) {
            if (key !== 'protocol' && key !== 'proxy') {
                newOptions[key] = options[key];
            }
        }
        return http.request(newOptions, callback);
    }
    if (options.protocol === 'https') {
        if (options.proxy) {
            for (key in options.proxy) {
                if (key !== 'protocol') {
                    newProxy[key] = options.proxy[key];
                }
            }
            if (options.proxy.protocol === 'http') {
                options.agent = tunnel.httpsOverHttp({ proxy: newProxy });
            } else if (options.proxy.protocol === 'https') {
                options.agent = tunnel.httpsOverHttps({ proxy: newProxy });
            } else {
                throw options.proxy.protocol + ' proxy is not supported!';
            }
        }
        for (key in options) {
            if (key !== 'protocol' && key !== 'proxy') {
                newOptions[key] = options[key];
            }
        }
        return https.request(newOptions, callback);
    }
    throw 'Your URL must use either HTTP or HTTPS.';
}

function parseOptions(type, options) {
    var proxy;
    if (type === 'download') {
        if (options.proxy) {
            if (typeof options.proxy === 'string') {
                proxy = url.parse(options.proxy);
                options.proxy = {};
                options.proxy.protocol = cleanProtocol(proxy.protocol);
                options.proxy.host = proxy.hostname;
                options.proxy.port = proxy.port;
                options.proxy.proxyAuth = proxy.auth;
                options.proxy.headers = { 'User-Agent': 'Node-Wget' };
            }
        }
        return options;
    }
    if (type === 'request') {
        if (!options.protocol) {
            options.protocol = 'http';
        }
        options.protocol = cleanProtocol(options.protocol);

        if (options.proxy) {
            if (typeof options.proxy === 'string') {
                proxy = url.parse(options.proxy);
                options.proxy = {};
                options.proxy.protocol = cleanProtocol(proxy.protocol);
                options.proxy.host = proxy.hostname;
                options.proxy.port = proxy.port;
                options.proxy.proxyAuth = proxy.auth;
                options.proxy.headers = { 'User-Agent': 'Node-Wget' };
            }
        }

        options.gunzip = options.gunzip || false;
        return options;
    }
}

function cleanProtocol(str) {
    return str
        .trim()
        .toLowerCase()
        .replace(/:$/, '');
}

function calculateProgress(fileSize, totalDownloaded) {
    // If we don't know the size of the download, we Microsoft(tm) the progress bar into a moving target...
    if (fileSize === null) {
        var length = String(totalDownloaded).length;
        // This guarantees that totalDownloaded is never greater than or equal to fileSize.
        fileSize = Math.pow(10, length) + 1;
    }

    return totalDownloaded / fileSize;
}

exports.download = download;
exports.request = request;
