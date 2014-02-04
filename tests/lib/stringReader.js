var Readable = require('stream').Readable;

module.exports = function StringReader(str) {
    var stdin = new Readable();
    stdin.pause();
    stdin.push(str);
    stdin.push(null);
    return stdin;
};
