/* This library depends on [MooTools 1.4+](http://mootools.net).
* Since MooTools augments prototypes, requiring it here is enough.
*/
require('mootools');
/* Object property paths manipulation.
*/
require('./lib/mootools-additions');


/** This module simply exports all public classes, letting you namespace them as you wish.
*@example
*	var Watai = require('Watai');
*	var myWidget = new Watai.Widget(…);
*@example
*	var TR = require('Watai');
*	var myWidget = new TR.Widget(…);
*@namespace
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
	*@protected
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
