/**@class A work-in-progress command-line interface that outputs and formats a Runner’s events in a tree-like format.
*
* WARNING: EXPERIMENTAL. This view is provided as a help for debugging cases, but it is not ready for actual delivery yet.
*/
var RunnerFlow = new Class({
	Extends: require('../PromiseView'),

	submodel: {
		name: 'feature',
		view: require('../Feature/Flow')
	},

	events: {
		/** Informs the user that this view's Runner is ready to start.
		*/
		ready: function onReady() {
			process.stdout.write('ready!\n');
		}
	},

	/** Informs user that this view's Runner is waiting for the browser.
	*/
	showStart: function showStart() {
		this.animator.log('➔    ', 'info', this.model);
		process.stdout.write('       Waiting for browser… ');
	},

	showFailure: function showFailure(reason) {
		var description = this.getErrorDescription(reason);
		this.animator.log('✘ ', 'warn', description.title, 'warn', process.stderr);
		this.animator.log('', 'debug', description.help, 'debug', process.stderr);
	},
});

module.exports = RunnerFlow;	// CommonJS export
