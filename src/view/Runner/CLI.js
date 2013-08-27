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
			this.animator.spin(this.model + ' (waiting for browser…)');
		},

		/** Informs user that the emitting Runner is ready to start.
		*/
		ready: function onReady() {
			this.animator.log('⨁', 'info', this.model + '                       ');
		}
	},

	showFailure: function showFailure(reason) {
		var description = this.getErrorDescription(reason);
		this.animator.log('✘ ', 'warn', description.title, 'warn');
		this.animator.log('', 'debug', description.help, 'debug')
	},

	/** Resets the shell prompt.
	*/
	showEnd: function showEnd() {
		this.animator.clear();
		this.animator.showCursor();
	}
});


module.exports = RunnerCLI;	// CommonJS export
