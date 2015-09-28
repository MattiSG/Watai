module.exports = {
	baseURL: {
		protocol:	'https',
		hostname:	'duckduckgo.com',
		query:		{ kad:'en_GB' }	// passing the language code is used only because DuckDuckGo adjusts to your default language, which may make the test fail
	},

	browser: 'chrome',	// this is a shortcut, relying on chromedriver having been installed, and on browsers being in their default paths
						// for more information, see the [documentation](https://github.com/MattiSG/Watai/wiki/Testing-with-Chrome) or check out the DuckDuckGo simple example

	views: [ 'Verbose', 'PageDump', 'Growl' ],	// you may specify any combination of views you want; see more at <https://github.com/MattiSG/Watai/wiki/Configuration#views>

	name: function() {	// any configuration element may also be a function
		return 'Advanced stuff';	// …either synchronously returning the value to use in its place…
	},

	build: function(promise) {	// …or asynchronous, in which case it takes a Q deferred object as its first parameter
		require('child_process').exec('git rev-parse HEAD',	// set the build number to be the SHA of the Git repo available in the current working directory
			function(err, stdout, stderr) {
				if (err) return promise.reject(err);
				promise.resolve(stdout.trim());
			}
		);

		return promise.promise;
	},

	ignore: [ 5 ]	// list indices of scenarios to be ignored; best used at the command-line
}
