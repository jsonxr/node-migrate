var database = require('../lib/database');


module.exports.db = {
    // {}
    "mysql": function (test) {
        var opts = {
                url: 'mysql://localhost/test',
                username: 'root',
                password: 'admin'
            },
            db = database(opts);
        test.expect(6);
        test.ok(db.opts.engine === 'mysql', 'mysql != ' + db.opts.engine);
        test.ok(db.opts.database === 'test', 'test != ' + db.opts.database);
        test.ok(db.opts.hostname === 'localhost', 'localhost != ' + db.opts.hostname);
        test.ok(db.opts.port === 3316, 'port != ' + db.opts.port);
        test.ok(db.opts.username === 'root', 'root != ' + db.opts.username);
        test.ok(db.opts.password === 'admin', 'password != ' + db.opts.password);
        test.done();
    },

    "mysql - non standard port": function (test) {
        var opts = {
                url: 'mysql://localhost:3317/test',
                username: 'root',
                password: 'admin'
            },
            db = database(opts);
        test.expect(6);
        test.ok(db.opts.engine === 'mysql', 'mysql != ' + db.opts.engine);
        test.ok(db.opts.database === 'test', 'test != ' + db.opts.database);
        test.ok(db.opts.hostname === 'localhost', 'localhost != ' + db.opts.hostname);
        test.ok(db.opts.port === 3317, 'port != ' + db.opts.port);
        test.ok(db.opts.username === 'root', 'root != ' + db.opts.username);
        test.ok(db.opts.password === 'admin', 'password != ' + db.opts.password);
        test.done();
    }
};
