var logger = require('winston'),
    rewire = require("rewire"),
    migrate = rewire('../lib/migrate');


//----------------------------------------------------------------------------
// Initialize Test Environment
//----------------------------------------------------------------------------

// Remove the output so it doesn't interfere
logger.clear();


//----------------------------------------------------------------------------
// Helper methods
//----------------------------------------------------------------------------

/**
 * This creates a test to make sure that a command exists
 * @param tests
 * @param name
 */
function checkCommand(tests, name) {

    function check(test) {
        var command = {
            name: name
        };
        test.expect(1);
        migrate.execute(command, function (err, retval) {
            test.ok(retval === 0, "'" + name + "' command should exist.");
            test.done();
        });
    }
    tests[name] = check;
}


//----------------------------------------------------------------------------
// Unit Tests....
//----------------------------------------------------------------------------

var testCommands = module.exports.commands = {
    "invalid commands": function (test) {
        var command = {
            name: 'blah'
        };
        test.expect(1);
        migrate.execute(command, function (err, retval) {
            test.ok(retval === -1, "'blah' command should not exist.");
            test.done();
        });
    }
};

checkCommand(testCommands, 'init');
checkCommand(testCommands, 'create');
checkCommand(testCommands, 'drop');


//----------------------------------------------------------------------------
// Rewire - Mock dependencies
//----------------------------------------------------------------------------

