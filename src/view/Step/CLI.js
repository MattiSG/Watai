var animator = require('../../../src/lib/cli-animator');


/**@namespace A command-line interface that outputs and formats a Step’s events.
*/
var StepCLI = {};

/** Presents details of a Step start to the user.
* Attaches to resolution handlers.
*
*@param	{Step}	step	The step that is about to start.
*/
StepCLI.start = function onStart(step) {
	step.fail(onFailure);
}

/** Presents details of a step failure to the user.
*
*@param	{Feature}	step	The step whose results are given.
*@param	{String}	message	The reason why the step failed.
*/
function onFailure(step, message) {
	//stepIndex++;	// make the step index 1-based for the user	// TODO: add stepIndex back
	animator.log('   ↳', 'cyan', message, 'cyan');
}

module.exports = StepCLI;	// CommonJS export
