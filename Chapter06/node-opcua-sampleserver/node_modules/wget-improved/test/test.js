let crypto = require('crypto');
let fs = require('fs');
let expect = require('chai').expect;
let request = require('request');

let wget = require('../lib/wget');

let baseHTTP = 'http://localhost:8884';
let metadata = {};
before(function() {
    let server = require('./server');
    return server().then(function() {
        request(baseHTTP + '/file/metadata', function(err, res, body) {
            metadata = JSON.parse(body);
        });
    });
});

describe('Download Tests', function() {
    it('Should be able to download a file', function(done) {
        let download = wget.download(
            'http://localhost:8884/file',
            '/tmp/wget-test-file.bin'
        );
        let bytes = 0;
        download.on('error', function(err) {
            done(err);
        });
        download.on('start', function(fileSize) {
            expect(fileSize).to.be.a('number');
            expect(fileSize).to.equal(metadata.size);
        });
        download.on('end', function(output) {
            let file = fs.readFileSync('/tmp/wget-test-file.bin');
            let hash = crypto
                .createHash('sha256')
                .update(file)
                .digest('hex');
            expect(output).to.equal('Finished writing to disk');
            expect(hash).to.equal(metadata.hash);
            expect(bytes).to.equal(1024 * 1024);
            done();
        });
        download.on('bytes', function(input) {
            expect(input).to.be.above(0);
            bytes = input;
        });
        download.on('progress', function(progress) {
            expect(progress).to.be.above(0);
            expect(progress).to.be.below(1.00000000000001);
        });
    });

    it('Should handle a server that does not have content-length header', function(done) {
        let download = wget.download(
            'http://localhost:9933/',
            '/tmp/wget-bs-test.bin'
        );
        download.on('error', function(err) {
            done(err);
        });
        download.on('start', function(fileSize) {
            expect(fileSize).to.be.null;
        });
        download.on('progress', function(progress) {
            expect(progress).to.be.above(0);
            expect(progress).to.be.below(1.00000000000001);
        });

        download.on('end', function() {
            done();
        });
    });

    it('Should not append to the previous file.', function(done) {
        let download = wget.download(
            'http://localhost:8884/file',
            '/tmp/wget-test-file.bin'
        );
        download.on('error', function(err) {
            console.log(err);
            expect(err).to.be.null;
            done();
        });
        download.on('end', function(output) {
            let file = fs.readFileSync('/tmp/wget-test-file.bin');
            let hash = crypto
                .createHash('sha256')
                .update(file)
                .digest('hex');
            expect(output).to.equal('Finished writing to disk');
            expect(hash).to.equal(metadata.hash);
            done();
        });
    });

    it('Should handle 302 redirects that end with file download.', function(done) {
        let download = wget.download(
            'http://localhost:8884/file/redirect',
            '/tmp/wget-test-file2.bin'
        );
        download.on('end', function(output) {
            request(baseHTTP + '/file/redirect/metadata', function(
                err,
                res,
                body
            ) {
                let meta = JSON.parse(body);
                let file = fs.readFileSync('/tmp/wget-test-file2.bin');
                let hash = crypto
                    .createHash('sha256')
                    .update(file)
                    .digest('hex');
                expect(output).to.equal('Finished writing to disk');
                expect(hash).to.equal(meta.hash);
                done();
            });
        });
    });

    it('Should handle infinite redirects', function(done) {
        let download = wget.download(
            'http://localhost:8884/file/redirect/infinite',
            '/tmp/wget-test-file2.bin'
        );

        download.on('error', function(err) {
            expect(err).to.equal('Infinite redirect loop detected');
            done();
        });
    });

    it('Should handle relative path redirect', function(done) {
        let download = wget.download(
            'http://localhost:8884/file/redirect/relative',
            '/tmp/wget-test-file3.bin'
        );
        download.on('error', function(err) {
            done(err);
        });
        download.on('start', function(fileSize) {
            expect(fileSize).to.be.a('number');
            expect(fileSize).to.equal(metadata.size);
        });
        download.on('end', function(output) {
            request(baseHTTP + '/file/redirect/metadata', function(
                err,
                res,
                body
            ) {
                let meta = JSON.parse(body);
                let file = fs.readFileSync('/tmp/wget-test-file2.bin');
                let hash = crypto
                    .createHash('sha256')
                    .update(file)
                    .digest('hex');
                expect(output).to.equal('Finished writing to disk');
                expect(hash).to.equal(meta.hash);
                done();
            });
        });

        download.on('progress', function(progress) {
            expect(progress).to.be.above(0);
            expect(progress).to.be.below(1.00000000000001);
        });
    });

    it('Should handle invalid protocol (no http/https)', function(done) {
        try {
            let download = wget.download(
                'localhost:8884/file/redirect/infinite',
                '/tmp/wget-test-file2.bin'
            );
        } catch (err) {
            expect(err).to.equal('Your URL must use either HTTP or HTTPS.');
            done();
        }
    });
});
