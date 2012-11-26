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
	animator.log(' ҉', 'info', 'Browser ready!            ', 'default');
}

/** Presents details of a test start to the user.
*@param	{Feature}	feature	The feature that is about to start.
*/
RunnerCLI.featureStart = function onFeatureStart(feature) {
	animator.spin(feature.description);
}

/** Presents details of a test success to the user.
*@param	{Feature}	feature	The feature whose results are given.
*/
RunnerCLI.featureSuccess = function onFeatureSuccess(feature) {
	animator.log('✔', 'info', feature.description, 'default');
}

/** Presents details of a test failure to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	failures	An array of strings giving details on failures.
*/
RunnerCLI.featureFailure = function onFeatureFailure(feature, failures) {
	animator.log('✘', 'fail', feature.description);

	failures.forEach(function(failure) {
		animator.log('   ↳', 'cyan', failure);
	});
}

/** Presents details of a test error to the user.
*@param	{Feature}	feature	The feature whose results are given.
*@param	{Array.<String>}	errors	An array of strings giving details on errors.
*/
RunnerCLI.featureError = function onFeatureError(feature, errors) {
	animator.log('⚠', 'error', feature.description);
	
	errors.forEach(function(error) {
		animator.log('   ↳', 'cyan', error);
		
		if (error.stack)
			animator.log('	', 'verbose', error.stack);
	});
}

/** Presents details of a runner error to the user.
*@param	{String|Error}	error	Details on the given error.
*@param	{String}	[help]	Instructions that may help the user out of the problem.
*/
RunnerCLI.error = function onError(error, help) {
	animator.log('⚠', 'fail', error);
	animator.log('   ↳', 'debug', help);
}


module.exports = RunnerCLI;	// CommonJS export
