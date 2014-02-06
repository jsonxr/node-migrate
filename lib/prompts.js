var async = require('async'),
    readline = require('readline');

module.exports = function Prompts(questions, options, callback) {
    var rl, args = [];
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    options.trim = (options.trim === undefined) ? true : options.trim;
    options.input = options.input || process.stdin;
    options.output = options.output || process.stdout;
    // Prompt the user
    rl = readline.createInterface(options);
    function prompt(item, callback) {
        var question = item,
            defaultAnswer,
            keys;
        // If this is { question: answer }
        if (typeof question !== 'string') {
            keys = Object.keys(item);
            defaultAnswer = item[keys[0]];
            question = keys[0] + '(' + defaultAnswer + ')';
        }
        // Get the actual input
        rl.question(question, function (answer) {
            if (answer === '') {
                answer = defaultAnswer;
            }
            if (options.trim === true && answer !== undefined) {
                answer = answer.toString().trim();
            }
            args.push(answer);
            callback();
        });
    }
    async.eachSeries(questions, prompt, function (err) {
        rl.close();
        callback(err, args);
    });
};
