module.exports = {
	baseURL: 'http://pdc.refedd.org/',

	browser: 'firefox',	// if you’d rather test with Chrome, you will need to install chromedriver
						// read more at https://github.com/MattiSG/Watai/wiki/Testing-with-Chrome

	// The above "browser" key is a shortcut, relying on browsers being installed in their default paths, and on a "standard" setup.
	// If you want to set your browsers more specifically, you will need to fill the following "driverCapabilities" hash.
	driverCapabilities: {	// see all allowed values at http://code.google.com/p/selenium/wiki/DesiredCapabilities
		// browserName:			'firefox',
		// javascriptEnabled:	false,	// defaults to true when using the "browser" shortcut

		// If your browsers are placed in a “non-default” path, set the paths to the **binaries** in the following keys:
		// firefox_binary:		'/Applications/Firefox.app/Contents/MacOS/firefox',
		// 'chrome.binary':	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	}
}
