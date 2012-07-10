/* This library depends on [MooTools 1.4+](http://mootools.net). */
require('mootools');
require('./lib/mootools-additions');

/* Logging is done with [Winston](https://github.com/flatiron/winston). */
var winston = require('winston'),
	pathsUtils = require('path');

initLoggers();

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
*@see	https://github.com/flatiron/winston#working-with-multiple-loggers-in-winston
*@private
*/
function initLoggers() {
	/** The `suites` logger logs suites names and feature status.
	*/
	winston.loggers.add('suites', {
		console: {
			level: process.env.npm_config_coverage	// if we're computing test coverage, we can't use standard output at all, since the coverage analysis result is piped through it. The trigger is an env variable. See build automation script.
				   ? 'error'
				   : 'silly',
			colorize: 'true'
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
		}
	});
}
