var logger = require('winston'),
    rewire = require("rewire"),
    StringReader = require('./lib/stringReader'),
    StringWriter = require('./lib/stringWriter'),

    commandline = rewire('../lib/commandline'),
    migrateCommand;

//----------------------------------------------------------------------------
// Initialize Test Environment
//----------------------------------------------------------------------------

// Remove the output so it doesn't interfere
logger.clear();


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
        test.expect(1);
        var argv = getArgv(name);
        commandline(argv, function (err, retval) {
            test.ok(retval === 0, "'" + name + "' command should exist.");
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

var tests = module.exports.commands = {
    "invalid commands": function (test) {
        test.expect(1);
        var argv = getArgv('blah');
        commandline(argv, function (err, retval) {
            test.ok(retval === -1, "'blah' command should not exist.");
            test.done();
        });
    },
    "init defaults": function (test) {
        // Need to set the process.stdin for promtly
        var argv = getArgv('init'),
            stdin = new StringReader('\n\n'),
            stdout = new StringWriter(); // (just ignore the output)
        commandline.__set__({ process: { stdin: stdin, stdout: stdout } });

        test.expect(3);

        commandline(argv, function (err, retval) {
            test.ok(retval === 0, "'init' command should exist.");
            test.ok(migrateCommand.args.engine === 'mysql', 'Default engine should be mysql');
            test.ok(migrateCommand.args.database === 'test', 'Default database should be test');
            test.done();
        });
    },

    "init answers": function (test) {
        // Need to set the process.stdin for promtly
        var argv = getArgv('init'),
            stdin = new StringReader('postgres\ndev\n'),
            stdout = new StringWriter(); // (just ignore the output)
        commandline.__set__({ process: { stdin: stdin, stdout: stdout } });
        test.expect(3);
        commandline(argv, function (err, retval) {
            test.ok(retval === 0, "'init' command should exist.");
            test.ok(migrateCommand.args.engine === 'postgres', 'engine should be postgres');
            test.ok(migrateCommand.args.database === 'dev', 'database should be dev');
            test.done();
        });
    }
};

checkCommand(tests, 'create');
checkCommand(tests, 'drop');


//----------------------------------------------------------------------------
// Rewire - Mock dependencies
//----------------------------------------------------------------------------

commandline.__set__({
    migrate: {
        execute: function (command, callback) {
            migrateCommand = command;
            callback(null, 0);
        }
    }
});
