var webdriver = require('/Users/eurogiciel/Documents/Ghost/selenium/build/javascript/webdriver/webdriver');


exports.driver = new webdriver.Builder()
	.usingServer('http://localhost:4444/wd/hub')
	.withCapabilities({
		'browserName': 'chrome',
		'version': '',
		'platform': 'ANY',
		'javascriptEnabled': true,
		'chrome.binary': '/Applications/Browsers/Google Chrome.app/Contents/MacOS/Google Chrome',
		'firefox_binary': '/Applications/Browsers/Firefox.app/Contents/MacOS/firefox',
	}).build()

exports.baseURL = 'http://pdc.refedd.org/';
	