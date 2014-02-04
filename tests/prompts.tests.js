var logger = require('winston'),

    rewire = require("rewire"),
    StringReader = require('./lib/stringReader'),
    StringWriter = require('./lib/stringWriter'),

    prompts = rewire('../lib/prompts');


//----------------------------------------------------------------------------
// Initialize Test Environment
//----------------------------------------------------------------------------

// Remove the output so it doesn't interfere
logger.clear();


//----------------------------------------------------------------------------
// Unit Tests....
//----------------------------------------------------------------------------

module.exports['undefined defaults'] = function (test) {
    var stdin = new StringReader('\n'),
        stdout = new StringWriter();
    prompts.__set__({ process: { stdin: stdin, stdout: stdout } });

    test.expect(1);
    prompts(['q1'], function (err, results) {
        test.ok(results[0] === undefined, "undefined should be returned.");
        test.done();
    });
};

module.exports['accept defaults'] = function (test) {
    var stdin = new StringReader('\n\n'),
        stdout = new StringWriter();
    prompts.__set__({ process: { stdin: stdin, stdout: stdout } });

    test.expect(2);
    prompts([{'q1': 'a1'}, {'q2': 'a2'}], function (err, results) {
        test.ok(results[0] === 'a1', "default answer should be returned.");
        test.ok(results[1] === 'a2', "default answer should be returned.");
        test.done();
    });
};

module.exports.answers = function (test) {
    var stdin = new StringReader('my1\nmy2\n'),
        stdout = new StringWriter();
    prompts.__set__({ process: { stdin: stdin, stdout: stdout } });

    test.expect(2);
    prompts([{'q1': 'a1'}, {'q2': 'a2'}], function (err, results) {
        test.ok(results[0] === 'my1', "my1 answer should be returned.");
        test.ok(results[1] === 'my2', "my2 answer should be returned.");
        test.done();
    });
};

module.exports['options === undefined'] = function (test) {
    var stdin = new StringReader('one\n'),
        stdout = new StringWriter();
    prompts.__set__({ process: { stdin: stdin, stdout: stdout } });

    test.expect(3);
    prompts(['q1'], function (err, results) {
        test.ok(results.length === 1, "results.length should be 1.");
        test.ok(stdout.data === 'q1\n', 'stdout should show q1\\n');
        test.ok(results[0] === 'one', "First answer should be 'one'");
        test.done();
    });
};


module.exports['options.input'] = function (test) {
    var stdin = new StringReader('one\n'),
        stdout = new StringWriter(),
        options = {
            input: stdin
        };
    prompts.__set__({ process: { stdout: stdout } });

    test.expect(1);
    prompts(['q1'], options, function (err, results) {
        test.ok(results[0] === 'one', "First answer should be 'one'");
        test.done();
    });
};

module.exports['options.output'] = function (test) {
    var stdin = new StringReader('one\n'),
        stdout = new StringWriter(),
        options = {
            output: stdout
        };
    prompts.__set__({ process: { stdin: stdin } });

    test.expect(1);
    prompts(['q1'], options, function (err, results) {
        test.ok(stdout.data === 'q1\n', 'stdout should show q1\\n');
        test.done();
    });
};

module.exports['options.trim = true'] = function (test) {
    var stdin = new StringReader(' one \n'),
        stdout = new StringWriter();
    prompts.__set__({ process: { stdin: stdin, stdout: stdout } });

    test.expect(1);
    prompts(['q1'], { trim: true }, function (err, results) {
        test.ok(results[0] === 'one', "trimmed answer should be 'one'");
        test.done();
    });
};

module.exports['options.trim = false'] = function (test) {
    var stdin = new StringReader(' one \n'),
        stdout = new StringWriter();
    prompts.__set__({ process: { stdin: stdin, stdout: stdout } });

    test.expect(1);
    prompts(['q1'], { trim: false }, function (err, results) {
        test.ok(results[0] === ' one ', "non trimmed answer should be ' one '");
        test.done();
    });
};


module.exports['options.trim = undefined'] = function (test) {
    var stdin = new StringReader(' one \n'),
        stdout = new StringWriter();
    prompts.__set__({ process: { stdin: stdin, stdout: stdout } });

    test.expect(1);
    prompts(['q1'], function (err, results) {
        test.ok(results[0] === 'one', "trimmed answer should be 'one'");
        test.done();
    });
};
