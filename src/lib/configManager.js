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

exports.__defineGetter__('values', function getConfig() {
	return config;
});

/** Since winston does not allow modifying loggers on the fly, to ensure logger references are not stale and always reflect the current config state, always access loggers through this method and not `winston.loggers` accessor.
*
*@returns	{Winston.Logger}
*/
exports.getLogger = function getLogger(name) {
	return winston.loggers.get(name);
}
