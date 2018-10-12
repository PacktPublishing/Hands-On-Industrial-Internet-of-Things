
function inlineText(f) {
    var k = f.toString().
        replace(/^[^\/]+\/\*!?/, '').
        replace(/\*\/[^\/]+$/, '');
    k = k.split("\n").map(function(t){  t = t.trim(); return t; }).join("\n");
    return k;
}
exports.inlineText = inlineText;


/**
 * @method makeBuffer
 * turn a string make of hexadecimal bytes into a buffer
 *
 * @example
 *     var buffer = makeBuffer("BE EF");
 *
 * @param listOfBytes
 * @return {Buffer}
 */
function makeBuffer(listOfBytes) {
    var l = listOfBytes.split(" ");
    var b = new Buffer(l.length);
    var i = 0;
    l.forEach(function (value) {
        b.writeUInt8(parseInt(value, 16), i);
        i += 1;
    });
    return b;
}

var hexString = function (str) {
    var hexline = "";
    var lines = str.split("\n");
    lines.forEach(function (line) {

        line = line.trim();
        if (line.length > 80) {
            line = line.substr(10, 98).trim();
            hexline = hexline ? hexline + " " + line : line;
        } else if (line.length > 60) {
            line = line.substr(7, 48).trim();
            hexline = hexline ? hexline + " " + line : line;
        }
    });
    return hexline;
};

function makebuffer_from_trace(func) {
    return makeBuffer(hexString(inlineText(func)));
}
exports.makebuffer_from_trace = makebuffer_from_trace;
