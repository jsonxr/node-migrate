var migrate = require('../lib/migrate');

module.exports.setUp = function (callback) {
    migrate.path = __dirname + '/fixtures/empty';
    callback();
}

module.exports.tearDown = function (callback) {
    callback();
}

module.exports['test commands'] = {
    "init": function(test) {
        migrate.init();
        
        test.expect(1);
        test.ok(true, "this assertion should pass");
        test.done();
    },
    "bootstrap": function(test) {
        test.ok(true, 'this should pass');
        test.done();
    },
    "up": function(test) {
        test.ok(true, '');
        test.done();
    }
}
