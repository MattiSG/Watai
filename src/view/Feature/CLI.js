var animator = require('../../../src/lib/cli-animator');

var ViewsManager = require('../ViewsManager');


/**@namespace A command-line interface that outputs and formats a Feature’s events.
*/
var FeatureCLI = {};


/** Presents details of a test start to the user.
* Attaches to resolution handlers.
*
*@param	{Feature}	feature	The feature that is about to start.
*/
FeatureCLI.start = function onStart(feature) {
	animator.spin(feature.description);

	feature.then(onSuccess, onFailure).fin(onEnd);
}

/** Attaches CLI Step view to the started step.
*
*@param	{Step}	step	The step that is about to start.
*/
FeatureCLI.step = function onStep(step) {
	ViewsManager.attach('Step/CLI', step);
}

/** Presents details of a test success to the user.
*
*@param	{Feature}	feature	The feature whose results are given.
*/
function onSuccess(feature) {
	animator.log('✔', 'info', feature.description);
}

/** Presents details of a test failure to the user.
*
*@param	{Feature}	feature	The feature whose results are given.
*/
function onFailure(feature) {
	animator.log('✘', 'warn', feature.description, 'warn');
}

/** Clears the feature spinner.
*
*@param	{Feature}	feature	The feature whose results are given.
*/
function onEnd(feature) {
	animator.clear();
}

/** Presents details of a test error to the user.
*
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Error}		error	The error that was encountered.
*/
FeatureCLI.error = function onError(feature, error) {
	animator.log('⚠', 'error', feature.description);
	animator.log('   ↳', 'cyan', error.description, 'cyan');

	if (error.stack)
		animator.log('      ', 'verbose', error.stack, 'verbose');
}


module.exports = FeatureCLI;	// CommonJS export
