/**@namespace A work-in-progress command-line interface that outputs and formats a Runner’s events in a tree-like format.
*
* WARNING: EXPERIMENTAL. This view is provided as a help for debugging cases, but it is not ready for actual delivery yet.
*/
var RunnerVerbose = {};

var animator = require('../../../src/lib/cli-animator');

/** Informs user that the emitting Runner is waiting for the browser.
*/
RunnerVerbose.beforeRun = function onBeforeRun(runner) {
	animator.spin(runner + ' (waiting for browser…)');
}

/** Informs user that the emitting Runner is ready to start.
*/
RunnerVerbose.ready = function onReady(runner) {
	animator.log('➔  ┍', 'info', runner + '                       ');
}

/** Presents details of a test start to the user.
*@param	{Feature}	feature	The feature that is about to start.
*/
RunnerVerbose.featureStart = function onFeatureStart(feature) {
	feature.on('matchSuccess', function(elementSelector, expected) {
		animator.log('   ┝☑', 'info', 'matched "' + elementSelector + '" to ' + expected);
		animator.spin(feature.description);
	});

	feature.on('matchFailure', function(elementSelector, expected) {
		animator.log('   ┝☒', 'warn', 'could not match "' + elementSelector + '" to ' + expected);
		animator.spin(feature.description);
	});

	feature.on('stepSuccess', function(stepIndex) {
		animator.log('   ┝', 'info', 'step ' + stepIndex + ' passed');
		animator.spin(feature.description);
	});

	feature.on('stepFailure', function(failure, stepIndex) {
		animator.log('   ┝', 'cyan', 'step ' + stepIndex + ':\n' + failure, 'cyan');
		animator.spin(feature.description);
	});

	animator.spin(feature.description);
}

/** Presents details of a test success to the user.
*@param	{Feature}	feature	The feature whose results are given.
*/
RunnerVerbose.featureSuccess = function onFeatureSuccess(feature) {
	animator.log('✔  ┕', 'info', feature.description);
}

/** Presents details of a test failure to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	failures	An array of strings giving details on failures.
*/
RunnerVerbose.featureFailure = function onFeatureFailure(feature, failures) {
	animator.log('✘  ┕', 'warn', feature.description, 'warn');
}

/** Presents details of a test error to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	errors	An array of strings giving details on errors.
*/
RunnerVerbose.featureError = function onFeatureError(feature, errors) {
	animator.log('⚠', 'error', feature.description);

	errors.forEach(function(error) {
		animator.log('   ↳', 'cyan', error, 'cyan');

		if (error.stack)
			animator.log('	', 'verbose', error.stack, 'verbose');
	});
}

RunnerVerbose.failure = RunnerVerbose.success = function redrawCursor() {
	animator.showCursor();
}


module.exports = RunnerVerbose;	// CommonJS export
