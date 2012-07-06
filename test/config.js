module.exports = {
	connectURL: 'http://127.0.0.1:4444/wd/hub',
	
	supportPageURL: 'file://' + __dirname + '/resources/page.html',
	
	driverCapabilities: {
		browserName: 'chrome',
		version: '',
		platform: 'ANY',
		javascriptEnabled: true,
		firefox_binary: '/Applications/Browsers/Firefox-headless.app/Contents/MacOS/firefox',
		'chrome.binary': '/Applications/Browsers/Google Chrome.app/Contents/MacOS/Google Chrome'
	},
	
	browserWarmupTimeout: 30 * 1000	//ms
}
