var logger = require('winston');

function Migrate() {
    this.path = process.cwd();
};

Migrate.prototype.bootstrap = function bootstrap() {
    logger.info('bootstrap');
}

Migrate.prototype.help = function help() {
    logger.info('help');
}

Migrate.prototype.init = function init() {
    logger.info('init %s', this.path);
}

var exports = module.exports = new Migrate();