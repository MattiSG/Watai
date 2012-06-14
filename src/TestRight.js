/* This library depends on MooTools 1.4+.
*/
var MooTools = require('mootools');


/** This flag triggers various detailed logging operations across all classes.
* Set it to `true` when debugging.
*
*@constant
*@type	{boolean}
*/
var VERBOSE = true;
GLOBAL.VERBOSE = VERBOSE;	// export flag

/** This value stores where individual Runner contexts stack traces should be stored.
*
*@see	http://nodejs.org/api/vm.html#vm_vm_runincontext_code_context_filename (filename parameter)
*
*@constant
*@type	{String}
*/
var LOG_FILE = 'log/VM.log';
GLOBAL.LOG_FILE = LOG_FILE;	// export value

/**@namespace	This module simply exports all public classes, letting you namespace them as you wish.
*
*Example usage:
*	var TestRight = require('TestRight')();
*	var myWidget = new TestRight.Widget(…);
*
*…which you could also decide to write this way:
*	var TR = require('TestRight')();
*	var myWidget = new TR.Widget(…);
*
*You are therefore free of choosing your own namespacing pattern.
*
*Embedded as a function to avoid problems with cyclic references (modules in this namespace that need access to other classes). 
*/
var TestRight = {
	Widget:		require('./model/Widget'),
	Feature:	require('./model/Feature'),
	Runner:		require('./controller/Runner'),
	SuiteLoader:require('./controller/SuiteLoader')
}

module.exports = TestRight;	// CommonJS export
