/**@class A work-in-progress command-line interface that outputs and formats a Runner’s events in a tree-like format.
*
* WARNING: EXPERIMENTAL. This view is provided as a help for debugging cases, but it is not ready for actual delivery yet.
*/
var RunnerVerbose = new Class({
	Extends: require('./CLI'),

	submodel: {
		name: 'feature',
		view: require('../Feature/Flow')
	},

	events: {
		/** Informs the user that the emitting Runner is ready to start.
		*/
		ready: function onReady(runner) {
			this.animator.log('➔ ', 'info', runner + '                       ');
		}
	}
});

module.exports = RunnerVerbose;	// CommonJS export
