/**	All public scenario steps.
* A _step_ is an object that handles an element in a Scenario array.
* You can access them through this hash.
*
*@namespace
*/
var steps = {
	FunctionalStep:	require('./FunctionalStep'),
	StateStep:		require('./StateStep')
}

module.exports = steps;
