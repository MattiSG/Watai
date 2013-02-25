var animator = require('../../../src/lib/cli-animator');

var FeatureCLIView = require('../Feature/CLI');


/**@class A command-line interface that outputs and formats a Runner’s events.
*/
var RunnerCLI = new Class({
	Extends: require('../PromiseView'),

	submodel: {
		name: 'feature',
		view: FeatureCLIView
	},

	events: {
		/** Informs user that the emitting Runner is waiting for the browser.
		*/
		driverInit: function onDriverInit() {
			animator.spin(this.model + ' (waiting for browser…)');
		},

		/** Informs user that the emitting Runner is ready to start.
		*/
		ready: function onReady() {
			animator.log('⨁', 'info', this.model + '                       ');
		}
	},

	/** Resets the shell prompt.
	*/
	showEnd: function showEnd() {
		animator.clear();
		animator.showCursor();
	}
});


module.exports = RunnerCLI;	// CommonJS export
