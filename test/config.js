module.exports = {
	seleniumServerURL: 'http://127.0.0.1:4444/wd/hub',
	baseURL: 'file://' + __dirname + '/resources/page.html',
	driverCapabilities: {
		browserName: 'chrome',
		javascriptEnabled: true
	},
	quit: 'never',
	browserWarmupTimeout: 30 * 1000,	// ms
	timeout: 500	// implicit wait for elements lookup in milliseconds, has to be lower than mocha's timeout to test for missing elements rejection
}
