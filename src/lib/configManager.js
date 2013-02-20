var config	= Object.create(null),
/* Logging is done with [Winston](https://github.com/flatiron/winston). */
	winston	= require('winston');

/** Adds the given configuration options to the global config hash.
* Initializes Winston loggers as specified in the `log` key.
*/
exports.set = function setConfig(newConf) {
	config = Object.merge(config, newConf);

	if (newConf.log) {
		Object.each(newConf.log, function(setup, name) {
			winston.loggers.close(name);
			winston.loggers.add(name, config.log[name]);
		});
	}
}

exports.__defineGetter__('values', function() {
	return config;
});
