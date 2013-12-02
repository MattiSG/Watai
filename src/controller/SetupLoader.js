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

/** Loads test runner setup configuration.
* Differs from loading a suite in that the "setup" is needed for application bootstrapping.
*/
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

		require('q').longStackSupport = true;	// log stack traces across async calls: <https://github.com/kriskowal/q/wiki/API-Reference#qlongstacksupport>

		this.initLoggers(setup.log);
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
	}
}


module.exports = SetupLoader;	// CommonJS export
