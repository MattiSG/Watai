var pathsUtils		= require('path');	// <http://nodejs.org/api/path.html>


var winston			= require('winston'),	// logging lib: <https://github.com/flatiron/winston>
	ConfigLoader	= require('mattisg.configloader');	// <https://github.com/MattiSG/Node-ConfigLoader#README>


/** Name of the setup file to be loaded in cascade.
*
*@type	{String}
*@private
*/
var SETUP_FILE = 'setup';


/** The setup hash.
*
*@type	{Object}
*@private
*/
var setup = {};


var SetupLoader = {

	/** Reloads the setup data.
	*
	*@param	{Hash}	[override]	If set, the setup data loaded from setup files will be overridden by the data contained in that parameter.
	*/
	reload: function reloadSetup(override) {
		setup = new ConfigLoader({
			from	: pathsUtils.dirname(module.parent.parent.filename),	// required by Watai, which is itself required either by the main CLI entry point, or by the test setup, or by any client… and we want to load from that client, not locally
			appName	: 'watai',
			override: override
		}).load(SETUP_FILE);

		this.initLoggers(setup.log);
		this.initLongStackTraces(setup.asyncTracesLimit);
	},

	/** Initializes loggers.
	* These loggers are global, and managed by the `winston` module, acting as a singleton.
	*
	*@param	{Hash}	config
	*@private
	*/
	initLoggers: function initLoggers(config) {
		Object.each(config, function(options, name) {
			winston.loggers.close(name);
			winston.loggers.add(name, options);
		});
	},

	/** Tries loading the long stack traces development module.
	* If the longjohn module is installed, this will allow for exceptions to be traced even through async callbacks.
	*
	*@param	{Number}	[limit]	The maximum async bounces to log. Increases specificity, at the expenses of memory usage.
	*@see	https://github.com/mattinsler/longjohn#limit-traced-async-calls
	*@private
	*/
	initLongStackTraces: function initLongStackTraces(limit) {
		var longjohn;

		try {
			longjohn = require('longjohn');
		} catch (e) {
			winston.loggers.get('init').warn('No long stack traces module found');
			return false;
		}

		longjohn.async_trace_limit = limit;
		winston.loggers.get('init').silly('Long stack traces loaded');

		return true;
	}
}


module.exports = SetupLoader;	// CommonJS export
