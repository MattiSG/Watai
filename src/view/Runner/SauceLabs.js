var SauceLabs = require('saucelabs');


/**@class A status transmitter to SauceLabs.
*/
var RunnerSauceLabs = new Class({
	Extends: require('../PromiseView'),

	/** The connection to the account data.
	*
	*@type	{SauceLabs}
	*/
	connection: null,

	/** Initiates the connection to SauceLabs.
	* Smoke tests the service.
	* Fetches some account data to log at the end of the test.
	*/
	showStart: function showStart() {
		var authParts = require('url').parse(this.model.config.seleniumServerURL).auth.split(':');	// Node's url API stores authentication information as 'user:pass'

		this.connection = new SauceLabs({
			username: authParts[0] || process.env.SAUCE_USERNAME,
			password: authParts[1] || process.env.SAUCE_ACCESS_KEY
		});

		this.connection.getServiceStatus(function(err, sauceStatus) {
			if (! sauceStatus.service_operational)
				console.log('This job will probably fail, Sauce seems to be down: ' + sauceStatus.status_message);
		});

		this.connection.getAccountDetails(function(err, accountDetails) {
			if (err) return console.error('Could not get SauceLabs account details');
			this.accountDetails = accountDetails;
		}.bind(this));
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
		console.log('See this job details on <https://saucelabs.com/jobs/' + this.model.driver.sessionID + '>.');
		console.log('You had ' + this.accountDetails.minutes + ' minutes left on the ' + this.accountDetails.id + ' SauceLabs account before running this test.');	// we don't get the amount left at the end to avoid slowing down the closure process
	}
});


module.exports = RunnerSauceLabs;	// CommonJS export
