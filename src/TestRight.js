/* This library depends on [MooTools 1.4+](http://mootools.net). */
require('mootools');
require('./lib/mootools-additions');

/* Logging is done with [Winston](https://github.com/flatiron/winston). */
var winston = require('winston'),
	pathsUtils = require('path');


var LOG_DIR = 'log';

var err;
try {
	require('fs').mkdirSync(LOG_DIR, '0755');	// Winston cannot create the folder hierarchy on its own
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
	Widget:		require('./model/Widget'),
	Feature:	require('./model/Feature'),
	Hook:		require('./model/Hook'),	//protected, but exported for easier testing
	Runner:		require('./controller/Runner'),
	SuiteLoader:require('./controller/SuiteLoader')
}

module.exports = TestRight;	// CommonJS export


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
