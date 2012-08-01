/* This library depends on [MooTools 1.4+](http://mootools.net). */
require('mootools');
/* Object property paths manipulation */
require('./lib/mootools-additions');
/* Class.Binds mutator */
require('./lib/mootools-class-bind');

/* Logging is done with [Winston](https://github.com/flatiron/winston). */
var winston = require('winston'),
/* http://nodejs.org/api/path.html */
	pathsUtils = require('path'),
/* https://github.com/MattiSG/Node-ConfigLoader#readme */
	ConfigLoader = require('mattisg.configloader');


var config = new ConfigLoader({
	from: pathsUtils.dirname(module.parent.filename),
	appName: 'watai'
}).load('config');

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
*@memberOf	TestRight
*@see	https://github.com/flatiron/winston#working-with-multiple-loggers-in-winston
*@private
*/
function initLoggers() {
	/** The `suites` logger logs suites names and feature status.
	*/
	winston.loggers.add('suites', {
		console: {
			level: config.logLevel.suites,
			colorize: 'true'
		}
	});
	
	/** The `steps` logger logs atomic actions on widgets.
	*/
	winston.loggers.add('steps', {
		console: {
			level: config.logLevel.steps,
			colorize: 'true'
		}
	});
}
