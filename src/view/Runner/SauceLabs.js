var SauceLabs;
try {
	SauceLabs = require('saucelabs');
} catch (e) {
	console.warn('You requested the SauceLabs view but the "saucelabs" module could not be loaded.');
	console.warn('You probably should `npm install saucelabs`.');
	throw e;
}

/**@class A status transmitter to SauceLabs.
*/
var RunnerSauceLabs = new Class({
	Extends: require('../PromiseView'),

	/** The connection to the account data.
	*
	*@type	{SauceLabs}
	*/
	connection: null,

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

		this.connection = new SauceLabs(this.getAuth());

		this.connection.getAccountDetails(function(err, accountDetails) {
			if (err) {
				this.animator.log('✘ ', 'warn', 'Could not get SauceLabs account details (' + err.error + ')', 'warn');
				this.accountDetails = null;
			}

			this.accountDetails = accountDetails;
		}.bind(this));

		this.connection.getServiceStatus(function(err, sauceStatus) {
			if (! sauceStatus.service_operational)
				console.log('This job will probably fail, Sauce seems to be down: ' + sauceStatus.status_message);
		});
	},

	/** Obtains SauceLabs authentication data, from configuration or, if not available, from environment variables.
	*
	*@throws	{ReferenceError}	If the SauceLabs authentication data can not be obtained.
	*@returns	{Object}	An object containing `username` and `password` keys, defining which SauceLabs username and access key should be used to access the account.
	*/
	getAuth: function getAuth() {
		var result = {},
			authString = require('url').parse(this.model.config.seleniumServerURL).auth;

		if (authString && authString.contains(':')) {	// Node's url API stores authentication information as 'user:pass'
			var authParts = authString.split(':');
			result.username = authParts[0];
			result.password = authParts[1];
		} else if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
			result.username = process.env.SAUCE_USERNAME;
			result.password = process.env.SAUCE_ACCESS_KEY;
		} else {
			this.animator.log('✘ ', 'warn', 'You requested the SauceLabs view, but the SauceLabs authentication information could not be found', 'warn');
			this.animator.log('  ', 'debug', 'You should provide it through the `auth` part of the seleniumServerURL config key, or through the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables', 'debug');
			throw new ReferenceError('Could not get SauceLabs authentication information');
		}

		return result;
	},

	showSuccess: function showSuccess() {
		this.setPassed(true);
	},

	showFailure: function showFailure(reason) {
		this.setPassed(false, reason);
	},

	setPassed: function setPassed(passed, reason) {
		this.connection.updateJob(this.model.driver.sessionID, {
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
