module.exports = {
	baseURL: 'https://duckduckgo.com/?kad=en_GB',	// you don't need to add any query string to test your own website
													// passing the language code is used only because DuckDuckGo adjusts to your default language, which may make the test fail
	browser: 'chrome',	// this is a shortcut, relying on chromedriver having been installed, and on browsers being in their default paths
						// for more information, see the [documentation](https://github.com/MattiSG/Watai/wiki/Testing-with-Chrome) or check out the DuckDuckGo simple example
	views: [ 'Flow' ]
}
