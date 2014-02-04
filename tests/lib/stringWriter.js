var Writable = require('stream').Writable;

module.exports = function StringWriter() {
    var out = new Writable();
    out._write = function (chunk, enc, next) {
        if (this.data === undefined) {
            this.data = chunk.toString() + '\n';
        } else {
            this.data = this.data + chunk.toString() + '\n';
        }
        next();
    };
    return out;
};
