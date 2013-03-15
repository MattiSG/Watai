module.exports = {
	url: 'https://duckduckgo.com/?kad=en_GB',	// passing the language code is used only because DuckDuckGo adjusts to your default language, which may make the test fail; you don't need to add anything to test your own website

	// see all allowed values at http://code.google.com/p/selenium/wiki/DesiredCapabilities
	desiredCapabilities: {
		browserName: 'chrome',	// if you’d rather test with Chrome, you will need to install chromedriver
								// read more at https://github.com/MattiSG/Watai/wiki/Testing-with-Chrome

		// If your browsers are placed in a “non-default” path, set the paths to the **binaries** in the following keys:
		//	firefox_binary: '/Applications/Firefox.app/Contents/MacOS/firefox',
		//	'chrome.binary': '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	},

	views: [ 'Flow' ]
}
