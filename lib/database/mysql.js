var util = require('util'),

    mysql = require('mysql'),
    _ = require('underscore'),
    parseOpts = require('./utils').parseOpts,

    DEFAULT_PORT = 3316;


//----------------------------------------------------------------------------
// Database
//----------------------------------------------------------------------------

function Database(opts) {
    this.opts = parseOpts(opts);
}

Database.prototype._executeSql = function executeSql(sql, callback) {
    // args = { "database": "test" }
    var conn,
        mysqlOpts = {
            host     : this.opts.hostname,
            user     : this.opts.username,
            password : this.opts.password
        };
    conn = mysql.createConnection(mysqlOpts);
    conn.connect();
    conn.query(sql, function (err, results) {
        if (callback) {
            callback(err);
        }
    });
    conn.end();
};

Database.prototype.create = function create(args, callback) {
    var sql;
    if (typeof args === 'function') {
        callback = args;
        args = { "database": this.opts.database };
    }
    sql = _.template("CREATE DATABASE `<%= database %>`;", args);
    this._executeSql(sql, callback);
};

Database.prototype.drop = function drop(args, callback) {
    var sql;
    if (typeof args === 'function') {
        callback = args;
        args = { "database": this.opts.database };
    }
    sql = _.template("DROP DATABASE `<%= database %>`;", args);
    this._executeSql(sql, callback);
};

Database.prototype.status = function status(args, callback) {
    if (typeof args === 'function') {
        callback = args;
    }
    callback(null, true);
};

Database.prototype.execute = function execute(cmd, callback) {
    var func = this[cmd.name];
    if (func !== undefined) {
        func = func.bind(this); // Make sure it gets called with correct "this"
        func(cmd.args, callback);
    } else {
        callback("Command '" + cmd.name + "' does not exist.", -1);
    }
};

function database(opts) {
    var db = new Database(opts);//Object.create(Database);
    db.opts = parseOpts(opts, DEFAULT_PORT);
    return db;
}


//----------------------------------------------------------------------------
// Exports
//----------------------------------------------------------------------------
module.exports = database;
