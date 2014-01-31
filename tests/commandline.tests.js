var logger = require('winston'),
    rewire = require("rewire"),
    temp = require('temp'),
    commandline = rewire('../lib/commandline');


//----------------------------------------------------------------------------
// Initialize Test Environment
//----------------------------------------------------------------------------

// Remove the output so it doesn't interfere
logger.clear();
// Clean up the temporary files when we are done
temp.track();


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
    }
};

checkCommand(tests, 'init');
checkCommand(tests, 'create');
checkCommand(tests, 'drop');


//----------------------------------------------------------------------------
// Rewire - Mock dependencies
//----------------------------------------------------------------------------

commandline.__set__({
    migrate: {
        execute: function (command, callback) {
            callback(null, 0);
        }
    }
});


