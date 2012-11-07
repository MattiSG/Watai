var config = require('../config.json');

exports.set = function setConfig(newConf) {
	config = Object.merge(config, newConf);
}

exports.__defineGetter__('values', function() {
	return config;
});
