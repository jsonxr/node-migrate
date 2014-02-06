var URL = require('url');

module.exports.parseOpts = function parseOpts(opts, DEFAULT_PORT) {
    var parsedUrl = URL.parse(opts.url, true);
    opts.engine = parsedUrl.protocol.substr(0, parsedUrl.protocol.length - 1);
    opts.hostname = parsedUrl.hostname;
    opts.database = parsedUrl.pathname.substr(1);
    if (parsedUrl.port) {
        opts.port = parseInt(parsedUrl.port, 10);
    } else {
        opts.port = DEFAULT_PORT;
    }
    return opts;
};
