/**@namespace A command-line interface that outputs and formats a Runner’s events.
*/
var RunnerCLI = {};

var animator = require('../lib/cli-animator');

/** Informs user that the emitting Runner is waiting for the browser.
*/
RunnerCLI.beforeRun = function onBeforeRun() {
	animator.spin('waiting for browser…');
}

/** Informs user that the emitting Runner is ready to start.
*/
RunnerCLI.ready = function onReady() {
	animator.log(' ҉', 'info', 'Browser ready!            ');
}

/** Presents details of a test start to the user.
*@param	{Feature}	feature	The feature that is about to start.
*/
RunnerCLI.featureStart = function onFeatureStart(feature) {
	feature.on('matchSuccess', function(elementSelector, expected) {
		animator.log('   ☑', 'info', 'matched "' + elementSelector + '" to ' + expected);
	});

	feature.on('matchFailure', function(elementSelector, expected) {
		animator.log('   ☒', 'warn', 'could not match "' + elementSelector + '" to ' + expected);
	});

	animator.spin(feature.description);
}

/** Presents details of a test success to the user.
*@param	{Feature}	feature	The feature whose results are given.
*/
RunnerCLI.featureSuccess = function onFeatureSuccess(feature) {
	animator.log('✔', 'info', feature.description);
}

/** Presents details of a test failure to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	failures	An array of strings giving details on failures.
*/
RunnerCLI.featureFailure = function onFeatureFailure(feature, failures) {
	animator.log('✘', 'warn', feature.description, 'warn');

	failures.forEach(function(failure) {
		animator.log('   ↳', 'cyan', failure, 'cyan');
	});
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


module.exports = RunnerCLI;	// CommonJS export
