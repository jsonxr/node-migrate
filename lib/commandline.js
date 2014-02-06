var util = require('util'),
    commander = require('commander'),
    Migrate = require('./migrate'),
    prompts = require('./prompts');


module.exports = function execute(dir, argv, callback) {

    var program = new commander.Command(),
        migrate = new Migrate(dir),
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
        prompts([
            {'engine: ': 'mysql'},
            {'database: ': 'test'},
            {'username: ': 'root'},
            {'password: ': '' }
        ], options,
            function (err, results) {
                var engine = results[0],
                    database = results[1],
                    hostname = 'localhost',
                    username = results[2],
                    password = results[3],
                    url = util.format("%s://%s/%s", engine, hostname, database),
                    args = {
                        url: url,
                        username: username,
                        password: password
                    };
                callback(err, args);
            });
    }


    program
        .command('init')
        .description('Initializes migration project in current directory.')
        .action(function () {
            if (migrate.settings !== undefined) {
                callback("Existing migration repository found at " + migrate.filename);
            } else {
                initPrompts(function (err, args) {
                    migrate.init(args, callback);
                });
            }
        });

    program
        .command('create')
        .description('Creates the data store.')
        .action(function () {
            migrate.create(callback);
        });

    program
        .command('drop')
        .description('Drops the data store.')
        .action(function () {
            migrate.drop(callback);
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
