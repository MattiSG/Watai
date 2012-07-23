module.exports = {
	seleniumServerURL: 'http://127.0.0.1:4444/wd/hub',
	supportPageURL: 'file://' + __dirname + '/resources/page.html',
	driverCapabilities: {
		browserName: 'chrome',
		javascriptEnabled: true
	},
	browserWarmupTimeout: 30 * 1000	//ms
}
