/* This library depends on [MooTools 1.4+](http://mootools.net). */
require('mootools');
require('./lib/mootools-additions');

/* Logging is done with [Winston](https://github.com/flatiron/winston). */
var winston = require('winston'),
	pathsUtils = require('path');

/** Path to the directory containing all logs.
*@private
*/
var LOG_DIR = 'log';

// create the LOG_DIR directory, since Winston cannot create the folder hierarchy on its own
var err;
try {
	require('fs').mkdirSync(LOG_DIR, '0755');
} catch (e) {
	err = e;
} finally {
	initLoggers(err);
}


/**@namespace	This module simply exports all public classes, letting you namespace them as you wish.
*
*Example usage:
*	var TestRight = require('TestRight');
*	var myWidget = new TestRight.Widget(…);
*
*…which you could also decide to write this way:
*	var TR = require('TestRight');
*	var myWidget = new TR.Widget(…);
*
*You are therefore free of choosing your own namespacing pattern.
*/
var TestRight = {
	/**@see	Widget
	*/
	Widget:		require('./model/Widget'),
	/**@see	Feature
	*/
	Feature:	require('./model/Feature'),
	/**@see	Runner
	*/
	Runner:		require('./controller/Runner'),
	/**@see	SuiteLoader
	*/
	SuiteLoader:require('./controller/SuiteLoader'),
	/**@see	Hook
	*@private	(protected, exported for easier testing)
	*/
	Hook:		require('./model/Hook')
}

module.exports = TestRight;	// CommonJS export


/** Initializes all different Winston loggers.
*@param	{Error}	err	An optional error thrown when trying to create the `LOG_DIR` directory.
*@see	https://github.com/flatiron/winston#working-with-multiple-loggers-in-winston
*@private
*/
function initLoggers(err) {
	if (err && err.code != 'EEXIST') throw err;	// an already-existing log directory is expected and not a problem
	
	
	/** The `suites` logger logs suites names and feature status.
	*/
	winston.loggers.add('suites', {
		console: {
			level: process.env.npm_config_coverage	// if we're computing test coverage, we can't use standard output at all, since the coverage analysis result is piped through it. The trigger is an env variable. See build automation script.
				   ? 'error'
				   : 'silly',
			colorize: 'true'
		},
		file: {
			filename: pathsUtils.join(LOG_DIR, 'execution.log')
		}
	});
	
	/** The `steps` logger logs atomic actions on widgets.
	*/
	winston.loggers.add('steps', {
		console: {
			level: process.env.npm_config_coverage	// if we're computing test coverage, we can't use standard output at all, since the coverage analysis result is piped through it. The trigger is an env variable. See build automation script.
				   ? 'error'
				   : 'warn',
			colorize: 'true'
		},
		file: {
			filename: pathsUtils.join(LOG_DIR, 'execution.log')
		}
	});
}
