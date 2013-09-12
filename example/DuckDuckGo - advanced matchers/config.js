module.exports = {
	baseURL: {
		protocol:	'https',
		hostname:	'duckduckgo.com',
		query:		{ kad:'en_GB' }	// passing the language code is used only because DuckDuckGo adjusts to your default language, which may make the test fail
	},

	browser: 'chrome',	// this is a shortcut, relying on chromedriver having been installed, and on browsers being in their default paths
						// for more information, see the [documentation](https://github.com/MattiSG/Watai/wiki/Testing-with-Chrome) or check out the DuckDuckGo simple example

	views: [ 'Flow', 'PageDump', 'Growl' ],	// you may specify any combination of views you want; see more at <https://github.com/MattiSG/Watai/wiki/Configuration#views>

	name: function() {	// any configuration element may also be a function
		return 'Advanced stuff';	// …either synchronously returning the value to use in its place…
	},

	build: function(done) {	// …or asynchronous, in which case it takes a callback as first parameter, passing it the result once it's ready
		require('child_process').exec('git describe --all', function(err, stdout, stderr) {
			done(stdout);
		});
	}
}
