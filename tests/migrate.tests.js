var temp = require('temp'),
    path = require('path'),
    fs = require('fs'),

    logger = require('winston'),
    yaml = require('js-yaml'),
    _ = require('underscore'),
    async = require('async'),

    mysql = require('mysql'),

    rewire = require("rewire"),
    Migrate = rewire('../lib/migrate');

JSON.minify = JSON.minify || require("node-json-minify");


//----------------------------------------------------------------------------
// Initialize Test Environment
//----------------------------------------------------------------------------

// Remove the output so it doesn't interfere
logger.clear();
// Clean up the temporary files when we are done
temp.track();


//----------------------------------------------------------------------------
// migrate.init tests
//----------------------------------------------------------------------------

function _testInitialize(test, args, expected) {
    var migrate = new Migrate(temp.mkdirSync()),
        keys = Object.keys(expected);
    test.expect(1 + keys.length);
    migrate.init(args, function (err) {
        test.ok(err === undefined, 'err should be undefined.');
        var settings = migrate.settings,
            dev = settings.environments.development;
        _.each(keys, function (key) {
            test.ok(dev[key] === expected[key], key + ': ' + expected[key] + ' !== ' + dev[key]);
        });
        test.done();
    });
}

/**
 *
 * @param test
 * @param ext
 * @param load
 * @private
 */
function _testSerialize(test, ext, load) {
    var migrate = new Migrate(temp.mkdirSync()),
        filename = path.resolve(migrate.dir, 'settings.' + ext);
        args = {
            ext: ext,
            url: "postgres://127.0.0.1:2020/mydb",
            username: "myuser",
            password: "mypassword"
        };
    test.expect(2);
    migrate.init(args, function (err, retval) {
        var content;
        test.ok(err === undefined, 'err should be undefined.');
        content = fs.readFileSync(filename);
        content = content.toString();
        // callback to get json object
        load(content, function (json) {
            var dev = json.environments.development;
            test.ok(dev.url === 'postgres://127.0.0.1:2020/mydb', 'postgres://127.0.0.1:2020/mydb != '+ dev.url);
            test.done();
        });
    });
}

module.exports.init = {
    // {}
//    "{}": function (test) {
//        var defaults = {
//            url: "mysql://localhost/test",
//            username: "root"
//        };
//        _testInitialize(test, {}, defaults);
//    },
    "{ /* no defaults */ }": function (test) {
        var args = {
            url: "postgres://127.0.0.1:2020/mydb",
            username: "myuser",
            password: "mypassword"
        };
        _testInitialize(test, args, args);
    },
    "{} - readFile error": function (test) {
        // Testing the error handling so mock a read failure...
        Migrate.__set__({ fs: {
            readFileSync: function (filename) { throw "oops"; },
            existsSync: function () { return true; }
        } });
        var migrate = new Migrate(temp.mkdirSync());
        test.expect(1);
        migrate.init(function (err) {
            Migrate.__set__({ fs: fs }); // Fix it back up
            test.ok(err !== undefined, 'Err should not be undefined.');
            test.done();
        });
    },
    "{} - writable stream error": function (test) {
        var migrate = new Migrate(path.resolve(temp.mkdirSync(), 'blah'));
        test.expect(1);
        migrate.init({}, function (err) {
            test.ok(err !== undefined, 'Err should not be undefined.');
            test.done();
        });
    },

    // ext
    "{ ext: \"yml\" }": function (test) {
        _testSerialize(test, 'yml', function (content, callback) {
            var settings = yaml.load(content);
            callback(settings);
        });
    },
    "{ ext: \"yaml\" }": function (test) {
        _testSerialize(test, 'yaml', function (content, callback) {
            var settings = yaml.load(content);
            callback(settings);
        });
    },
    "{ ext: \"json\" }": function (test) {
        _testSerialize(test, 'json', function (content, callback) {
            var settings = JSON.parse(JSON.minify(content));
            callback(settings);
        });
    },
    "{ ext: \"js\" }": function (test) {
        _testSerialize(test, 'js', function (content, callback) {
            var settings = JSON.parse(JSON.minify(content));
            callback(settings);
        });
    },
    "{ ext: \"invalid\" }": function (test) {
        var migrate = new Migrate(temp.mkdirSync());
        migrate.path = temp.mkdirSync();
        test.expect(1);
        migrate.init({ "ext": 'invalid' }, function (err) {
            test.ok(err === "Unsupported { ext: \"invalid\" }", 'err should be defined.');
            test.done();
        });
    }

};

//----------------------------------------------------------------------------
// migrate.create tests
//----------------------------------------------------------------------------

function _testCreate(test, args, expected) {
    var migrate = new Migrate(temp.mkdirSync()),
        keys = Object.keys(expected);
    test.expect(2 + keys.length);
    migrate.path = temp.mkdirSync();
    migrate.init(args, function (err, retval) {
        test.ok(err === undefined, 'err should be undefined.');
        test.ok(retval === 0, "'init' command should exist.");
        var settings = migrate.getSettings(),
            dev = settings.environments.development;
        _.each(keys, function (key) {
            test.ok(dev[key] === expected[key], key + ': ' + expected[key] + ' !== ' + dev[key]);
        });
        test.done();
    });
}

function getDatabaseOpts() {
    var d = new Date().getTime();
    return {
        url: 'mysql://localhost/m' + d,
        username: 'root',
        password: 'admin'
    };
}

module.exports.create = {
    // {}
    "{}": function (test) {
        var migrate = new Migrate(temp.mkdirSync()),
            opts = getDatabaseOpts();
        test.expect(1);
        migrate.init(opts, function (err) {
            if (! err) {
                migrate.create(function (err) {
                    if (! err) {
                        test.ok(true, '');
                        migrate.drop(function (err) {
                        });
                    }
                    test.done();
                });
            } else {
                test.done();
            }
        });
    },

//    "no settings file": function (test) {
//        var migrate = new Migrate(temp.mkdirSync());
//        test.expect(1);
//        // Didn't call init on empty directory so, should err
//        migrate.create(function (err) {
//            test.ok(err !== undefined, 'err should not be undefined:'+err);
//            test.done();
//        });
//    }
};

//----------------------------------------------------------------------------
// Rewire - Mock dependencies
//----------------------------------------------------------------------------

