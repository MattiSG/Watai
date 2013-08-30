{
	description: 'Check an HTML attribute on an element with custom matcher functions',

	scenario: [
		{
			'ZeroClickWidget.header': function isAlwaysValid(header) {	// providing a good name (i.e. prefixed with `is`) for the function will allow for better reports
				assert.ok(true, 'This is always valid');	// you can do whatever you please in a function; if it throws, it will be considered a failure
				// Node's [assert](http://nodejs.org/api/assert.html) default library is injected, so you can use it instead of `throw`ing yourself
			},
			'SearchBarWidget.field': function hasNoAutocompletion(searchField) {	// custom matchers are always passed a WD reference to the element they evaluate; see API for such objects at <https://github.com/admc/wd#supported-methods>
				return searchField.getAttribute('autocomplete')	// notice that if you're using a promise, you should **always** `return` from it
						.then(function(attribute) {	// a promise-returning matcher will be evaluated based on whether it was resolved or rejected
							assert.equal(attribute, 'off', 'Expected autocompletion to be off');
						});
			}
		}
	]
}
