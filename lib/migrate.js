"use strict";

var logger = require('winston'),
    path = require('path'),
    fs = require('fs');

function Migrate() {
    this.path = process.cwd();
}

Migrate.prototype.execute = function execute(command, callback) {
    var func = this[command.name];
    if (func !== undefined) {
        func = func.bind(this); // Make sure it gets called with correct "this"
        func(command.args, callback);
    } else {
        callback("Command '" + command.name + "' does not exist.", -1);
    }
};

Migrate.prototype.init = function init(args, callback) {
    var template = path.resolve(__dirname, 'templates/bootstrap.json'),
        filename = path.resolve(this.path, 'bootstrap.json'),
        readable = fs.createReadStream(template),
        writable = fs.createWriteStream(filename);

    writable.on('finish', function () {
        callback(null, 0);
    });
    writable.on('error', function (err) {
        callback(err, -1);
    })
    readable.pipe(writable);
};

Migrate.prototype.create = function create(args, callback) {
    var err = "not yet implemented";
    callback(err, 0);
};

Migrate.prototype.drop = function drop(args, callback) {
    var err = "not yet implemented";
    callback(err, 0);
};

var exports = module.exports = new Migrate();
