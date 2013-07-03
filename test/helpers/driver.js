/** This file mocks a Runner by providing two objects that would be provided by a Runner: a `config` and `driver` (through the async `getDriverHolder`).
* The mocked Runner is more efficient for short-lived tests, as only one driver (hence browser) is actually created.
*/

var webdriver = require('wd'),
	ConfigLoader = require('mattisg.configloader');

/** Loaded configuration for the test runs.
*@type	{Object}
*/
config = new ConfigLoader({
	from: __dirname,
	appName: 'watai'
}).load('config');


/** The single driver instance to be used during the test run.
*@type	{WebDriver}
*@private
*/
var driver,
/** The number of clients that required access to the driver.
* Allows us to avoid the overhead of starting a new driver for each test suite, while still making each suite runnable on its own.
*@type	{integer}
*@private
*/
	driverClientsCount = 0;


/** Returns an object with a `driver` key, which will be set before the test suite in which this function is called, and will be quit after the suite if it is the last one of this test run.
*
*@return	{Object}	holder	An Object whose `driver` key will be eventually set to a ready-to-use WebDriver instance.
*/
function getDriverHolder() {
	var result = Object.create(null);
	setDriverIn(result);
	return result;
}

/** Sets the `driver` key in the `holder` object before the test suite in which this function is called, and will quit the driver after it if it is the last suite of this test run.
*
*@param	{Object}	holder	An Object whose `driver` key will be eventually set to a ready-to-use WebDriver instance.
*@private
*/
function setDriverIn(holder) {
	driverClientsCount++;
	before(openDriverWithin(holder));
	after(closeDriverWithin(holder));
}

/** Provides a closure setting the `driver` key in the given object, that will eventually be set to a ready-to-use WebDriver instance, taking a callback for when it has finished.
*
*@param	{object}	destination	An Object whose `driver` key will be eventually set to a ready-to-use WebDriver instance.
*@return	{function(function)}	A setter taking a callback.
*@private
*/
function openDriverWithin(destination) {
	return function openDriver(done) {
		this.timeout(config.browserWarmupTimeout);

		if (! driver) {
			driver = makeDriver(done);
			destination.driver = driver;
		} else {
			destination.driver = driver;
			done();
		}
	}
}

/** Creates a new WebDriver instance and loads the `baseURL` found in the loaded config, calling back when it is ready.
*
*@param	{function}	done	Callback for completion.
*@return	{WebDriver}
*@private
*/
function makeDriver(done) {
	var result = webdriver.promiseRemote(),
		seleniumServer = require('url').parse(config.seleniumServerURL);	// TODO: get the URL already parsed from the config instead of serializing it at each step

	result.init(Object.merge(config.driverCapabilities, {
		host: seleniumServer.hostname,
		port: seleniumServer.port
	})).then(function() {
		return result.get(config.baseURL);
	}, function() {
		console.error(['',
			'**The Selenium server could not be reached!**',
			'> Did you start it up?',
			'  See the troubleshooting guide if you need help  ;)'
		].join('\n'));

		process.exit(1);
	}).done(done);

	return result;
}

/** Provides a closure quitting the driver found in the `driver` key in the given object if it is the last call of this test run, taking a callback for when it has finished.
*
*@param	{object}	source	An Object whose `driver` key will be eventually quit.
*@return	{function(function)}	A possible quitter taking a callback.
*@private
*/
function closeDriverWithin(source) {
	return function quitDriver(done) {
		this.timeout(10000);

		if (--driverClientsCount <= 0)
			source.driver.quit().done(done);
		else
			done();
	}
}


// CommonJS export
exports.config = config;
exports.getDriverHolder = getDriverHolder;
