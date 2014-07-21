var SauceLabsTransmitter;
try {
	SauceLabsTransmitter = require('saucelabs');
} catch (e) {
	console.warn('You requested the SauceLabs view but the "saucelabs" module could not be loaded.');
	console.warn('You probably should `npm install saucelabs`.');	// TODO: require('npm').install('saucelabs'), see <https://www.npmjs.org/api/npm.html>. Complicated because async, needs adding support for lazy loading of views.
	throw e;
}

/**@class A status transmitter to SauceLabs.
*/
var RunnerSauceLabs = new Class({
	Extends: require('../PromiseView'),

	/** SauceLabs API wrapper object.
	*
	*@type	{SauceLabsTransmitter}
	*/
	transmitter: null,

	/** Used to approximate the amount of minutes left in a SauceLabs account.
	*
	*@type	{Date}
	*/
	startTime	: null,

	/** Initiates the connection to SauceLabs.
	* Smoke tests the service.
	* Fetches some account data to log at the end of the test.
	*/
	showStart: function showStart() {
		this.startTime = new Date();

		this.transmitter = new SauceLabsTransmitter(this.getAuth());

		this.transmitter.getAccountDetails(function(err, accountDetails) {
			if (err) {
				this.animator.log('✘ ', 'warn', 'Could not get SauceLabs account details (' + err.error + ')', 'warn');
				this.accountDetails = null;
			}

			this.accountDetails = accountDetails;
		}.bind(this));

		this.transmitter.getServiceStatus(function(err, sauceStatus) {
			var serviceOperationalKey	= 'service_operational',
				statusMessageKey		= 'status_message';	// TODO: when jsrc implements ignoring lines, directly access the key in the conditional. See <https://github.com/mdevils/node-jscs/issues/20>.

			if (! sauceStatus[serviceOperationalKey])
				console.log('This job will probably fail, Sauce seems to be down: ' + sauceStatus[statusMessageKey]);
		});

		if (this.model.config.quit != 'always') {
			this.animator.log('⚠︎ ', 'info', 'You are using SauceLabs but are not quitting browsers immediately, thus wasting 90 seconds per failed test', 'info');
			this.animator.log('  ', 'debug', 'You should set the "quit" configuration element to "always", and set it to something else through the CLI when you want to take control of the browser', 'debug');
			this.animator.log('  ', 'debug', 'See more at <https://github.com/MattiSG/Watai/wiki/Configuration#wiki-quit>', 'debug');
		}
	},

	/** Obtains SauceLabs authentication data, from configuration or, if not available, from environment variables.
	*
	*@throws	{ReferenceError}	If the SauceLabs authentication data can not be obtained.
	*@returns	{Object}	An object containing `username` and `password` keys, defining which SauceLabs username and access key should be used to access the account.
	*/
	getAuth: function getAuth() {
		var result		= {},
			authString	= require('url').parse(this.model.config.seleniumServerURL).auth,
			authParts	= [];

		if (authString && authString.contains(':'))	// Node's url API stores authentication information as 'user:pass'
			authParts = authString.split(':');

		result.username = authParts[0] || process.env.SAUCE_USERNAME;
		result.password = authParts[1] || process.env.SAUCE_ACCESS_KEY;

		if (! (result.username && result.password)) {
			this.animator.log('✘ ', 'warn', 'You requested the SauceLabs view, but the SauceLabs authentication information could not be found', 'warn');
			this.animator.log('  ', 'debug', 'You should provide it through the `auth` part of the seleniumServerURL config key, or through the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables', 'debug');
			throw new ReferenceError('Could not get SauceLabs authentication information');
		}

		return result;
	},

	showSuccess: function showSuccess() {
		this.sendTestPassed(true);
	},

	showFailure: function showFailure(reason) {
		this.sendTestPassed(false, reason);
	},

	/** Notifies SauceLabs about the status of the current job.
	*
	*@param	{Boolean}	passed	If `true`, flags the job as passed. If `false`, flags the job as failed.
	*@param	{String}	[reason]	If passed, will be sent as a `custom-data` parameter to SauceLabs, under the `reason` key.
	*/
	sendTestPassed: function sendTestPassed(passed, reason) {
		this.transmitter.updateJob(this.model.driver.sessionID, {
			passed: passed,
			'custom-data': {
				reason: reason
			}
		}, function(err) {
			if (err)
				console.error('Could not send status to SauceLabs', err);
		});
	},

	showEnd: function showEnd() {
		if (! this.accountDetails) return;	// there was a connection error in the first place

		var spentMinutes = (new Date() - this.startTime) / 1000 / 60;

		console.log('See this job details on <https://saucelabs.com/jobs/' + this.model.driver.sessionID + '>.');
		console.log('You have about ' + Math.round(this.accountDetails.minutes - spentMinutes) + ' minutes left on the ' + this.accountDetails.id + ' SauceLabs account.');	// we don't get the exact amount left at the end to avoid slowing down the closure process
	}
});


module.exports = RunnerSauceLabs;	// CommonJS export
