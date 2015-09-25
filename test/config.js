module.exports = {
	baseURL: 'file://' + __dirname + '/resources/page.html',
	driverCapabilities: {
		browserName: 'chrome',
		javascriptEnabled: true
	},
	quit: 'never',
	browserWarmupTimeout: 30 * 1000,	// ms
	timeout: 500	// implicit wait for elements lookup in milliseconds, has to be lower than mocha's timeout to test for missing elements rejection
}
