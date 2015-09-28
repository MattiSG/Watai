/**@class	Dumps page content on first step failure.
*/
var RunnerPageDump = new Class(/** @lends RunnerPageDump# */{
	Extends: require('../PromiseView'),

	/** Whether the first scenario has already been found or not.
	*
	*@type	{Boolean}
	*@private
	*/
	attached: false,

	/** Will be `join`ed and prepended to the DOM dump
	*
	*@private
	*/
	header: [
		'------------',
		'Page source:',
		'------------'
	],

	/** The promise for a page source dump.
	*
	*@type	{QPromise}
	*@private
	*/
	pageSourcePromise: null,

	/** Events that are listened to.
	*/
	events: {
		steps: function(scenario) {
			if (this.attached)
				return;

			var view = this,	// callbacks reference traversal
				driver = this.model.getDriver();

			scenario.on('step', function(step) {
				step.once('start', function() {
					step.promise.fail(function() {
						if (! view.pageSourcePromise)
							view.pageSourcePromise = driver.source();
					});
				});
			});

			this.attached = true;
		}
	},

	showFailure: function() {
		if (this.pageSourcePromise)	// we might fail even before the first scenario was started (unreachable server, bad syntax…). In this case, do not do anything.
			this.pageSourcePromise.then(this.dumpPage.bind(this));
	},

	/** Presents the given DOM dump to the user.
	*
	*@private
	*/
	dumpPage: function dumpPage(domDump) {
		var message = this.header;
		message.push(domDump);
		message.push('');

		process.stdout.write(message.join('\n'));
	}

});


module.exports = RunnerPageDump;	// CommonJS export
