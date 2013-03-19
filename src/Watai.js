/* This library depends on [MooTools 1.4+](http://mootools.net).
* Since MooTools augments prototypes, requiring it here is enough.
*/
require('mootools');
/* Object property paths manipulation.
*/
require('./lib/mootools-additions');


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
	/**@see	SetupLoader
	*/
	setup:			require('./controller/SetupLoader'),
	steps:			require('./model/scenario'),
	matchers:		require('./model/scenario/state')
}


Watai.setup.reload();	// ensure setup is initialized at least once


module.exports = Watai;	// CommonJS export
