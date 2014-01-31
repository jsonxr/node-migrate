var logger = require('winston'),
    rewire = require("rewire"),
    temp = require('temp'),
    path = require('path'),
    fs = require('fs'),

    migrate = rewire('../lib/migrate');


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
    },
    "init": function (test) {
        var filename = path.resolve(__dirname, '../lib/templates/bootstrap.json'),
            content = fs.readFileSync(filename),
            validate;

        migrate.path = temp.mkdirSync();
        test.expect(2);
        migrate.init({}, function (err, retval) {
            test.ok(retval === 0, "'init' command should exist.");
            validate = fs.readFileSync(path.resolve(migrate.path,'bootstrap.json'));
            test.ok(validate.toString() === content.toString(), 'bootstrap.json does not match.');
            test.done();
        });
    }
};

checkCommand(testCommands, 'create');
checkCommand(testCommands, 'drop');


//----------------------------------------------------------------------------
// Rewire - Mock dependencies
//----------------------------------------------------------------------------

