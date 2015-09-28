/**@class A work-in-progress command-line interface that outputs and formats a Runner’s events in a tree-like format.
*
* WARNING: EXPERIMENTAL. This view is provided as a help for debugging cases, but it is not ready for actual delivery yet.
*/
var RunnerVerbose = new Class({
	Extends: require('../PromiseView'),

	submodel: {
		name: 'scenario',
		view: require('../Scenario/Verbose')
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
		if (description.title) {	// if we can't give more info, simply don't show anything
			this.animator.log('✘ ', 'warn', description.title, 'warn', process.stderr);
			this.animator.log('', 'debug', description.help, 'debug', process.stderr);
		}
	},

	showEnd: function showEnd() {
		if (this.model.config.ignore.length) {
			this.animator.log(
				'⨁ ',
				'cyan',
				'ignored scenario'.count(this.model.config.ignore.length)
				+ ' (#'
				+ this.model.config.ignore.join(', #')
				+ ')',
				'cyan'
			);
		}
	}
});

module.exports = RunnerVerbose;	// CommonJS export
