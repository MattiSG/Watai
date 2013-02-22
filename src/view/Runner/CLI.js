var animator = require('../../../src/lib/cli-animator');

var FeatureCLIView = require('../Feature/CLI');


/**@namespace A command-line interface that outputs and formats a Runner’s events.
*/
var RunnerCLI = {};


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

/** Attaches CLI Feature view to the started feature.
*
*@param	{Feature}	feature	The feature that is about to start.
*/
RunnerCLI.feature = function onFeature(feature) {
	new FeatureCLIView(feature);
}

/** Resets the shell prompt.
*/
RunnerCLI.failure = RunnerCLI.success = function redrawCursor() {
	animator.clear();
	animator.showCursor();
}


module.exports = RunnerCLI;	// CommonJS export
