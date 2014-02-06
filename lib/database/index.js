var parseOpts = require('./utils').parseOpts;

module.exports = function database(opts) {
    var dbOpts = parseOpts(opts, null),
        dbengine = require('./' + dbOpts.engine),
        db = dbengine(opts);
    return db;
};
