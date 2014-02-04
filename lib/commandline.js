var commander = require('commander'),
    migrate = require('./migrate'),
    prompts = require('./prompts');


module.exports = function execute(argv, callback) {
    var program = new commander.Command(),
        err,
        result;

    program
        .version('0.0.1');


    //------------------------------------------------------------------------
    // init
    //------------------------------------------------------------------------
    function initPrompts(callback) {
        var options = {
            'input': process.stdin,
            'output': process.stdout
        };
        prompts([{'engine: ': 'mysql'}, {'database: ': 'test'}], options,
            function (err, results) {
                var args = {
                    engine: results[0],
                    database: results[1]
                };
                callback(err, args);
            });
    }


    program
        .command('init')
        .description('Initializes migration project in current directory.')
        .action(function () {
            initPrompts(function (err, args) {
                var cmd = {
                    name: 'init',
                    args: args
                };
                migrate.execute(cmd, callback);
            });
        });

    program
        .command('create')
        .description('Creates the data store.')
        .action(function () {
            migrate.execute({ name: 'create' }, callback);
        });

    program
        .command('drop')
        .description('Drops the data store.')
        .action(function () {
            migrate.execute({ name: 'drop' }, callback);
        });

    result = program.parse(argv);
    // When not testing, commander.js prevents us from getting here when
    // a command is handled.
    if (typeof result.args[0] === 'string') {
        // we don't get here if it is handled because commander uses process.exit
        err = "Error: '" + program.args[0] + "' is not a valid command. Use --help";
        callback(err, -1);
    }
};
