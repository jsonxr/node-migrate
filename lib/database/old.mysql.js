var URL = require('url'),
    parseUri = require('./utils').parseOpts,
    mysql = require('mysql'),
    _ = require('underscore'),

    DEFAULT_PORT = 3316;

var Database = function Database(opts) {
    this.engine = 'mysql';
    var uri = URL.parse(opts.uri, true);
    if (uri.port) {
        this.port = parseInt(uri.port, 10);
    } else {
        this.port = DEFAULT_PORT;
    }
    this.hostname = uri.hostname;
    this.database = uri.pathname.substr(1);
    this.username = opts.username;
    this.password = opts.password;
};

/**
 *
 * @param cmd - {
 *     "name": "create",
 *     "args": {
 *         "database": "test"
 *     }
 * }
 *
 * @param callback
 */
Database.prototype.execute = function execute(cmd, callback) {
    var self = this,
        opts = {};
    opts.database = this.database;

    this.connect(opts, function (err) {
        if (err) {
            callback(err);
        } else {
            self.db.createDatabase(function (err) {
                if (err) {
                    callback(err);
                } else {
                    self.db.close(function (err) {
                        callback(err);
                    });
                }
            });
        }
    });
};

Database.prototype.connect = function connect(args, callback) {
    if (typeof args === 'function') {
        callback = args;
        args = {};
    }
    // {database: this.database}
    var mysqlOpts = {
        host     : this.hostname,
        user     : this.username,
        password : this.password
    };
    mysqlOpts.database = args.database;
    this.connection = mysql.createConnection(mysqlOpts);
    this.connection.connect(callback);
};

Database.prototype.close = function close(callback) {
    this.connection.end(function (err) {
        if (callback !== undefined) {
            callback(err);
        }
    });
};

Database.prototype.createDatabase = function createDatabase(args, callback) {

    // args = { database: 'mydatabase' }
    var sql = _.template('CREATE DATABASE <%= database %>;', args);
    console.log(sql);
    this.connection.query(sql, function (err) {
        callback(err); // No rows returned, send it on through to caller
    });
};

Database.prototype.dropDatabase = function dropDatabase(args, callback) {
    // args = { database: 'mydatabase' }
    var sql = _.template('DROP DATABASE <%= database %>;', args);
    this.connection.query(sql, function (err) {
        callback(err);
    });
};

Database.prototype.query = function query(q, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = {};
    }
    this.connection.query(q, params, callback);
};
