module.exports = {
	baseURL: 'http://pdc.refedd.org/', //TODO: add environments support (production / dev…)
	
	driverCapabilities: {
		browserName: 'firefox',
		version: '',
		platform: 'ANY',
		javascriptEnabled: true,
		firefox_binary: '/Applications/Browsers/Firefox-headless.app/Contents/MacOS/firefox',
		'chrome.binary': '/Applications/Browsers/Google Chrome.app/Contents/MacOS/Google Chrome'
	}
}
	