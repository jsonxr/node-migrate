"use strict";

var path = require('path'),
    fs = require('fs'),
    util = require('util'),

    _ = require('underscore'),
    yaml = require('js-yaml'),

    database = require('./database'),


    SERIALIZE_YAML = {
        ext: '.yaml',
        load: function (content) {
            return yaml.load(content);
        },
//        save: function (content) {
//            console.log('saving content as yaml...');
//        }
    },
    SERIALIZE_JSON = {
        ext: '.json',
        load: function load(content) {
            return JSON.parse(JSON.minify(content));
        },
//        save: function save(content) {
//            console.log('saving content as json...');
//        }
    },
    EXTENSIONS = {
        '.yml': SERIALIZE_YAML,
        '.yaml': SERIALIZE_YAML,
        '.json': SERIALIZE_JSON,
        '.js': SERIALIZE_JSON
    };

JSON.minify = JSON.minify || require("node-json-minify");

function Migrate(dir) {
    this.dir = dir;
    this._load();
}

function _getFilename(dir, ext) {
    return path.resolve(dir, 'settings' + ext);
}

function _getSerializerFromFilename(filename) {
    var ext = path.extname(filename);
    return EXTENSIONS[ext];
}

Migrate.prototype._loadFromFile = function _loadFromFile(filename) {
    var content = fs.readFileSync(filename);
    content = content.toString();
    this.filename = filename;
    this._serializer = _getSerializerFromFilename(this.filename);
    this.settings = this._serializer.load(content);
};

Migrate.prototype._load = function _load() {
    var extensions = Object.keys(EXTENSIONS),
        i,
        length,
        filename,
        content;
    for (i = 0, length = extensions.length; i < length; i++) {
        filename = _getFilename(this.dir, extensions[i]);
        try {
            this._loadFromFile(filename);
            break;
        } catch (err) {
            content = null;
        }
    }
};


function _getInitArgs(args) {
    var d = new Date().getTime();
    args = args || {};
    args.ext = args.ext || 'yaml';
    args.url = args.url || 'mysql://localhost/test' + d;
    args.username = args.username || 'root';
    args.password = args.password !== undefined ? args.password : '';
    return args;
}

function _createFromTemplateSync(template, filename, args) {
    var serializer = EXTENSIONS['.' + args.ext],
        content;
    if (serializer === undefined) {
        throw util.format("Unsupported { ext: \"%s\" }", args.ext);
    }
    template = path.resolve(__dirname, 'templates', template + serializer.ext);
    content = fs.readFileSync(template);
    content = content.toString();
    content = _.template(content, args);
    fs.writeFileSync(filename, content);
}


Migrate.prototype.init = function init(args, callback) {
    var filename,
        error;
    // Allow optional argument
    if (typeof args === 'function') {
        callback = args;
        args = undefined;
    }
    try {
        args = _getInitArgs(args);
        filename = _getFilename(this.dir, '.' + args.ext);
        _createFromTemplateSync('init/settings', filename, args);
        this._loadFromFile(filename);
    } catch (err) {
        error = err;
    }

    callback(error);
};

Migrate.prototype._getEnvironment = function _getEnvironment() {
    //TODO: Check --env flag that was passed in by commandline
    return this.settings.environment;
};

Migrate.prototype._getEnvironmentSettings = function _getEnvironmentSettings() {
    var env = this._getEnvironment();
    return this.settings.environments[env];
};


/**
 * This wraps a function to check that settings object exists.
 * This prevents "create" being called on an empty directory.
 *
 * @param func
 * @returns {check}
 * @private
 */
var $settings = function (func) {
    function check(args, callback) {
        /*jshint validthis: true */
        if (typeof args === 'function') {
            callback = args;
            args = undefined;
        }
        if (this.settings === undefined) {
            callback("fatal: Not a migrate repository (or any of the parent directories)");
        } else {
            func.bind(this)(args, callback);
        }
    }
    return check;
};

Migrate.prototype.create = $settings(function create(args, callback) {
    var db = database(this._getEnvironmentSettings());
    db.create(callback);
});

Migrate.prototype.drop = $settings(function drop(args, callback) {
    var db = database(this._getEnvironmentSettings());
    db.drop(callback);
});



var exports = module.exports = Migrate;
