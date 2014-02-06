var database = require('../lib/database/mysql');

function getDatabaseOpts() {
    var d = new Date().getTime();
    return {
        url: 'mysql://localhost/mig' + d,
        username: 'root',
        password: 'admin'
    };
}

module.exports.mysql = {
    "nonstandard port": function (test) {
        var opts = {
                url: 'mysql://localhost:33/mig'
            },
            db = database(opts);
        test.expect(1);
        test.ok(db.opts.port === 33, '33 != ' + db.opts.port);
        test.done();
    },
    "create/drop": function (test) {
        var db;
        test.expect(2);
        db = database(getDatabaseOpts());
        db.create(function (err) {
            test.ok(err === null, err);
            db.drop(function (err) {
                test.ok(err === null, err);
                test.done();
            });
        });
    },
    "create/drop args": function (test) {
        var db;
        test.expect(2);
        db = database(getDatabaseOpts());
        db.create({"database": db.opts.database }, function (err) {
            test.ok(err === null, err);
            db.drop({"database": db.opts.database }, function (err) {
                test.ok(err === null, err);
                test.done();
            });
        });
    },
    "execute invalid command": function (test) {
        test.expect(1);
        dbtemp(function (db, callback) {
            var cmd = { "name": "invalid command" };
            db.execute(cmd, function (err, results) {
                test.ok(true, '?');
                test.done();
                callback();
            });
        });
    },
    "execute": function (test) {
        test.expect(1);
        dbtemp(function (db, callback) {
            var cmd = { "name": "status" };
            db.execute(cmd, function (err, results) {
                test.ok(true, '?');
                test.done();
                callback();
            });
        });
    },
    "status": function (test) {
        test.expect(2);
        dbtemp(function (db, callback) {
            db.status(function (err, status) {
                test.ok(err === null, err);
                test.ok(status === true, 'true != ' + status);
                test.done();
                callback();
            });
        });
    }
};

function dbtemp(callback) {
    var db = database(getDatabaseOpts());
    db.create(function (err) {
        if (err) {
            console.log(err);
        }
        callback(db, function () {
            db.drop(function (err) {
                console.log(err);
            });
        });
    });
}
