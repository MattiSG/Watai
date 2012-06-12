/* This library depends on MooTools 1.4+.
*/
var MooTools = require('mootools');


/** This flag triggers various detailed logging operations across all classes.
* Set it to `true` when debugging.
*
*@type	{boolean}
*/
var VERBOSE = false;
GLOBAL.VERBOSE = VERBOSE;	// export flag

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
//TODO: make sure this cyclic refs problem can't be solved with direct inclusion instead of using this delayed evaluation trick
var TestRight = function() {
	return {
		Widget:		require('./model/Widget'),
		Feature:	require('./model/Feature'),
		Runner:		require('./controller/Runner'),
		SuiteLoader:require('./controller/SuiteLoader')
	}
}

module.exports = TestRight;	// CommonJS export
