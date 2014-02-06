var database = require('../../lib/database/mysql');

function getDatabaseOpts() {
    var d = new Date().getTime();
    return {
        uri: 'mysql://localhost/mig' + d,
        database: 'mig' + d, // To make it easier for create/drop commands
        username: 'root',
        password: 'admin'
    };
}


module.exports.mysql = {
    "create/drop": function (test) {
        var db;
        test.expect(1);
        db = database(getDatabaseOpts());
        db.create({ 'database': opts.database }, function (err) {
            test.ok(err === undefined, err);
            test.done();
        });
    }
};

//module.exports.db = {
//    // {}
//    "mysql": function (test) {
//        var opts = {
//                uri: 'mysql://127.0.0.1:3317/mydb',
//                username: 'user',
//                password: 'password'
//            },
//            db = new Database(opts);
//        test.expect(6);
//        test.ok(db.engine === 'mysql', 'Expected mysql engine != ' + db.engine);
//        test.ok(db.hostname === '127.0.0.1', 'Expected 127.0.0.1 != ' + db.hostname);
//        test.ok(db.database === 'mydb', 'Expected mydb != ' + db.database);
//        test.ok(db.port === 3317, 'Expected 3317 != ' + db.port);
//        test.ok(db.username === 'user', 'Expected user != ' + db.username);
//        test.ok(db.password === 'password', 'Expected password != ' + db.password);
//        test.done();
//    },
//
//    "mysql - default port": function (test) {
//        var opts = {
//                uri: 'mysql://localhost/test',
//                username: 'root',
//                password: 'admin'
//            },
//            db = new Database(opts);
//        test.expect(6);
//        test.ok(db.engine === 'mysql', 'Expected mysql engine');
//        test.ok(db.hostname === 'localhost', 'Expected localhost != ' + db.hostname);
//        test.ok(db.port === 3316, 'Expected port != ' + db.port);
//        test.ok(db.database === 'test', 'test != ' + db.database);
//        test.ok(db.username === 'root', 'root != ' + db.username);
//        test.ok(db.password === 'admin', 'password != ' + db.password);
//        test.done();
//    },
//
//    "mysql - connect": function (test) {
//        var opts = getDatabaseOpts(),
//            db = new Database(opts);
//        test.expect(1);
//        db.connect(function (err) {
//            test.ok(err === null, "Err should be null != " + err);
//            test.done();
//            db.close();
//        });
//    },
//
//    "mysql - create/drop": function (test) {
//        var opts = getDatabaseOpts(),
//            db = new Database(opts);
//        test.expect(3);
//        db.connect(function (err) {
//            test.ok(err === null, "Err should be null != " + err);
//            db.createDatabase(function (err) {
//                test.ok(err === null, "Err should be null != " + err);
//                db.dropDatabase(function (err) {
//                    test.ok(err === null, "Err should be null != " + err);
//                    test.done();
//                    db.close();
//                })
//            });
//        });
//    },
//
//    "mysql - query": function (test) {
//        var opts = getDatabaseOpts(),
//            db = new Database(opts);
//        test.expect(3);
//        db.connect( function (err) {
//            db.query("select 1 as c1;", {"param": "ignore"}, function (err, rows) {
//                test.ok(err === null, "Err should be null != " + err);
//                test.ok(rows.length === 1, "length should be 1");
//                test.ok(rows[0].c1 === 1, "should be 1");
//                test.done();
//                db.close();
//            });
//        });
//    }
//};
