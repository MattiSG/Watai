/**@namespace A command-line interface that outputs and formats a Runner’s events.
*/
var RunnerCLI = {};

var animator = require('../../../src/lib/cli-animator');

/** Informs user that the emitting Runner is waiting for the browser.
*/
RunnerCLI.beforeRun = function onBeforeRun(runner) {
	animator.spin(runner + ' (waiting for browser…)');
}

/** Informs user that the emitting Runner is ready to start.
*/
RunnerCLI.ready = function onReady(runner) {
	animator.log('⨁', 'info', runner + '                       ');
}

/** Presents details of a test start to the user.
* Listens to step failure events.
*@param	{Feature}	feature	The feature that is about to start.
*/
RunnerCLI.featureStart = function onFeatureStart(feature) {
	animator.spin(feature.description);

	var loggedFailure = false;

	feature.on('stepFailure', function(failure, stepIndex) {
		if (! loggedFailure)
			logFeatureFailure(feature);

		loggedFailure = true;
		animator.log('   ↳', 'cyan', 'at step ' + stepIndex + ': ' + failure, 'cyan');
		animator.spin(feature.description);
	});
}

/** Presents details of a test success to the user.
*@param	{Feature}	feature	The feature whose results are given.
*/
RunnerCLI.featureSuccess = function onFeatureSuccess(feature) {
	animator.log('✔', 'info', feature.description);
}

/** Presents details of a test failure to the user.
*@param	{Feature}	feature	The feature whose results are given.
*/
function logFeatureFailure(feature) {
	animator.log('✘', 'warn', feature.description, 'warn');
}

/** Clears the feature spinner.
* Does not log anything, as individual feature failures have been logged as they came.
*@param	{Feature}	feature	The feature whose results are given.
*/
RunnerCLI.featureFailure = function onFeatureFailure(feature, failures) {
	animator.clear();
}

/** Presents details of a test error to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	errors	An array of strings giving details on errors.
*/
RunnerCLI.featureError = function onFeatureError(feature, errors) {
	animator.log('⚠', 'error', feature.description);

	errors.forEach(function(error) {
		animator.log('   ↳', 'cyan', error, 'cyan');

		if (error.stack)
			animator.log('	', 'verbose', error.stack, 'verbose');
	});
}

RunnerCLI.failure = RunnerCLI.success = function redrawCursor() {
	animator.clear();
	animator.showCursor();
}


module.exports = RunnerCLI;	// CommonJS export
