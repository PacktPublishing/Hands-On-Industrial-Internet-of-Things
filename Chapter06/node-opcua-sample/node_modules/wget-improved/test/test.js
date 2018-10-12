let wget = require('../lib/wget');
let expect = require('chai').expect;

describe("Download Tests", function() {
    // with a proxy:
    it("Should be able to download the NPM logo", function(done) {
        let download = wget.download('https://www.npmjs.com/static/images/npm-logo.svg', '/tmp/npm-logo.svg');
        // @todo upgrade these tests to use a more consistent environment, with its own http server and files.

        download.on('error', function(err) {
            console.log(err);
            expect(err).to.be.null;
            done();
        });
        download.on('start', function(fileSize) {
            expect(fileSize).to.be.a('string');
            fileSize = Number(fileSize);
            expect(fileSize).to.be.above(200);
            expect(fileSize).to.be.below(500);
        });
        download.on('end', function(output) {
            expect(output).to.equal('Finished writing to disk');
            done();
            process.exit();
        });
        download.on('progress', function(progress) {
            expect(progress).to.be.above(0);
        });
    });
});