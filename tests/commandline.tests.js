var temp = require('temp'),
    logger = require('winston'),
    rewire = require("rewire"),
    StringReader = require('./lib/stringReader'),
    StringWriter = require('./lib/stringWriter'),
    Migrate = require('../lib/migrate'),

    commandline = rewire('../lib/commandline'),
    mockArgs;

//----------------------------------------------------------------------------
// Initialize Test Environment
//----------------------------------------------------------------------------

// Remove the output so it doesn't interfere
logger.clear();
// Clean up the temporary files when we are done
//temp.track();


//----------------------------------------------------------------------------
// Helper methods
//----------------------------------------------------------------------------

/**
 * This simulates an array that commander needs to parse
 * @param name
 * @returns {*[]}
 */
function getArgv(name) {
    return ['node', 'bin/migrate', name];
}

/**
 * This creates a test to make sure that a command exists
 * @param tests
 * @param name
 */
function checkCommand(tests, name) {

    function check(test) {
        var dir = temp.mkdirSync(),
            argv = getArgv(name);
        test.expect(1);
        commandline(dir, argv, function (err) {
            test.ok(err === undefined, "'" + name + "' command should exist.");
            test.done();
        });
    }
    tests[name] = check;
}


//----------------------------------------------------------------------------
// Unit Tests....
//----------------------------------------------------------------------------

module.exports.setUp = function (callback) {
    callback();
};

module.exports.tearDown = function (callback) {
    callback();
};

module.exports.init = {
    "invalid commands": function (test) {
        var dir = temp.mkdirSync(),
            argv = getArgv('blah');
        test.expect(1);
        commandline(dir, argv, function (err) {
            test.ok(err !== undefined, "Should return an error.");
            test.done();
        });
    },
    "defaults": function (test) {
        // Need to set the process.stdin for promtly
        var dir = temp.mkdirSync(),
            argv = getArgv('init');
        mockMigrate(true, 'init');
        mockStdInOut(true, '\n\n\n\n');
        test.expect(2);
        commandline(dir, argv, function (err) {
            test.ok(err === undefined, "'init' command should exist != "+ err);
            test.ok(mockArgs.url === 'mysql://localhost/test', 'mysql://localhost/test != ' + mockArgs.url);
            test.done();
        });
    },

    "settings already exist": function (test) {
        // Need to set the process.stdin for promtly
        var dir = temp.mkdirSync(),
            argv = getArgv('init');
        mockStdInOut(true, '\n\n\n\n');
        mockMigrate(false, 'init');
        test.expect(2);
        commandline(dir, argv, function (err) {
            test.ok(err === undefined, "\"init\" command should exist != "+ err);
            mockStdInOut(true, '\n\n\n\n');
            commandline(dir, argv, function (err) {
                test.ok(err, "Expected 'existing migration repo found, etc, etc != " + err);
                test.done();
            });
        });
    },

    "answer questions": function (test) {
        // Need to set the process.stdin for promtly
        var dir = temp.mkdirSync(),
            argv = getArgv('init');
        mockStdInOut(true, 'postgres\nmydb\nmyusername\nmypassword\n');
        mockMigrate(true, 'init');
        test.expect(3);
        commandline(dir, argv, function (err) {
            test.ok(err === undefined, "'init' command should exist.");
            test.ok(mockArgs.url === 'postgres://localhost/mydb', 'url should be postgres://localhost/mydb != ' + mockArgs.url);
            test.ok(mockArgs.username === 'myusername', 'username should be myusername != ' + mockArgs.username);
            test.done();
        });
    }
};

function testCommand(cmd) {
    return function (test) {
        // Need to set the process.stdin for promtly
        var dir = temp.mkdirSync(),
            argv = getArgv(cmd);
        mockStdInOut(true, '\n\n\n\n');
        mockMigrate(true, cmd);
        test.expect(1);
        commandline(dir, argv, function (err) {
            test.ok(err === undefined, "\"" + cmd + "\" command should exist.");
            test.done();
        });
    };
}

module.exports.create = testCommand('create');
module.exports.drop = testCommand('drop');



//----------------------------------------------------------------------------
// Rewire - Mock dependencies
//----------------------------------------------------------------------------

function mockStdInOut(enable, str) {
    // str = 'postgres\nmydb\nmyusername\nmypassword\n'
    var stdin, stdout;
    if (enable) {
        stdin = new StringReader(str);
        stdout = new StringWriter(); // (just ignore the output)
        commandline.__set__({ process: { stdin: stdin, stdout: stdout } });
    } else {
        commandline.__set__({ process: { stdin: process.stdin, stdout: process.stdout } });
    }
}

var MigrateSaved = {
    init: Migrate.prototype.init,
    create: Migrate.prototype.create,
    drop: Migrate.prototype.drop
};

function mockMigrate(enable, func) {
    if (enable) {
        commandline.__set__('Migrate.prototype.' + func, function (args, callback) {
            if (typeof args === "function") {
                callback = args;
                args = undefined;
            }
            mockArgs = args;
            callback();
        });
    } else {
        commandline.__set__('Migrate.prototype.' + func, MigrateSaved[func]);
    }
}
