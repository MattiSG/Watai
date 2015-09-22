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
*	var myComponent = new Watai.Component(…);
*@example
*	var TR = require('Watai');
*	var myComponent = new TR.Component(…);
*@namespace
*/
var Watai = {
	/**@see	Component
	*/
	Component:		require('./model/Component'),
	/**@see	Scenario
	*/
	Scenario:		require('./model/Scenario'),
	/**@see	Runner
	*/
	Runner:			require('./controller/Runner'),
	/**@see	SuiteLoader
	*/
	SuiteLoader:	require('./controller/SuiteLoader'),
	/**@see	Locator
	*@protected
	*/
	Locator:		require('./model/Locator'),
	/**@see	SetupLoader
	*/
	setup:			require('./controller/SetupLoader'),
	steps:			require('./model/steps'),
	matchers:		require('./model/steps/state')
}


Watai.setup.reload();	// ensure setup is initialized at least once


module.exports = Watai;	// CommonJS export
