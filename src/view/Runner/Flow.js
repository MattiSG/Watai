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
		/** Informs user that this view's Runner is waiting for the browser.
		*/
		driverInit: function onDriverInit() {
			this.animator.log('➔    ', 'info', this.model);
			process.stdout.write('       Waiting for browser… ');
		},

		/** Informs the user that this view's Runner is ready to start.
		*/
		ready: function onReady() {
			process.stdout.write('ready!\n');
		}
	}
});

module.exports = RunnerFlow;	// CommonJS export
