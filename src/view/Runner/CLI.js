/**@class A command-line interface that outputs and formats a Runner’s events.
*/
var RunnerCLI = new Class({
	Extends: require('../PromiseView'),

	submodel: {
		name: 'scenario',
		view: require('../Scenario/CLI')
	},

	events: {
		/** Informs user that the emitting Runner is ready to start.
		*/
		ready: function onReady() {
			this.animator.log('⨁', 'info', this.model + '                       ');
		}
	},

	/** Informs user that the emitting Runner is waiting for the browser.
	*/
	showStart: function showStart() {
		this.animator.spin(this.model + ' (waiting for browser…)');
	},

	showFailure: function showFailure(reason) {
		var description = this.getErrorDescription(reason);
		if (description.title) {	// if we can't give more info, simply don't show anything
			this.animator.log('✘ ', 'warn', description.title, 'warn', process.stderr);
			this.animator.log('  ', 'debug', description.help, 'debug', process.stderr);
		}
	},

	/** Resets the shell prompt.
	*/
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

		this.animator.clear();
		this.animator.showCursor();
	}
});


module.exports = RunnerCLI;	// CommonJS export
