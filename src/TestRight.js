/* This library depends on [MooTools 1.4+](http://mootools.net). */
var MooTools = require('mootools');
			 	require('./lib/mootools-additions');
/* Logging is done with [Winston](https://github.com/flatiron/winston). */
var winston = require('winston');


/** The `suites` logger logs suites names and feature status.
*/
winston.loggers.add('suites', {
	console: {
		level: process.env.COVERAGE	// if we're computing test coverage, we can't use standard output at all, since the coverage analysis result is piped through it. The trigger is an env variable. See build automation script.
			   ? 'error'
			   : 'silly',
		colorize: 'true'
	},
	file: {
		filename: 'log/execution.log'
	}
});

/** The `steps` logger logs atomic actions on widgets.
*/
winston.loggers.add('steps', {
	console: {
		level: process.env.COVERAGE	// if we're computing test coverage, we can't use standard output at all, since the coverage analysis result is piped through it. The trigger is an env variable. See build automation script.
			   ? 'error'
			   : 'warn',
		colorize: 'true'
	},
	file: {
		filename: 'log/execution.log'
	}
});

/** This value stores where individual Runner contexts stack traces should be stored.
*
*@see	http://nodejs.org/api/vm.html#vm_vm_runincontext_code_context_filename (filename parameter)
*
*@constant
*@type	{String}
*/
var VM_LOG_FILE = 'log/vm.log';
GLOBAL.VM_LOG_FILE = VM_LOG_FILE;	// Node export

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
