/* This library depends on [MooTools 1.4+](http://mootools.net). */
require('mootools');
/* Object property paths manipulation */
require('./lib/mootools-additions');

/* Logging is done with [Winston](https://github.com/flatiron/winston). */
var winston			= require('winston'),
	/* http://nodejs.org/api/path.html */
	pathsUtils		= require('path'),
	/* https://github.com/MattiSG/Node-ConfigLoader#readme */
	ConfigLoader	= require('mattisg.configloader');


var setup = new ConfigLoader({
	from	: pathsUtils.dirname(module.parent.filename),
	appName	: 'watai'
}).load('setup');


// init loggers
Object.each(setup.log, function(options, name) {
	winston.loggers.close(name);
	winston.loggers.add(name, options);
});


/* Try to load long stack traces development module.
*/
try {
	var longjohn = require('longjohn');
	longjohn.async_trace_limit = setup.debug.asyncTraces;
	winston.loggers.get('init').silly('Long stack traces loaded');
} catch (e) {
	winston.loggers.get('init').warn('No long stack traces module found');
}

/**@namespace	This module simply exports all public classes, letting you namespace them as you wish.
*
*Example usage:
*	var Watai = require('Watai');
*	var myWidget = new Watai.Widget(…);
*
*…which you could also decide to write this way:
*	var TR = require('Watai');
*	var myWidget = new TR.Widget(…);
*
*You are therefore free of choosing your own namespacing pattern.
*/
var Watai = {
	/**@see	Widget
	*/
	Widget:			require('./model/Widget'),
	/**@see	Feature
	*/
	Feature:		require('./model/Feature'),
	/**@see	Runner
	*/
	Runner:			require('./controller/Runner'),
	/**@see	SuiteLoader
	*/
	SuiteLoader:	require('./controller/SuiteLoader'),
	/**@see	Hook
	*@private	(protected, exported for easier testing)
	*/
	Hook:			require('./model/Hook'),
	setup:			setup,
	steps:			require('./model/scenario'),
	matchers:		require('./model/scenario/state')
}

module.exports = Watai;	// CommonJS export
