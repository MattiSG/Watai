{
	description: 'Check an HTML attribute on an element',

	scenario: [
		{
			'SearchBarWidget.field': function() {
				return true;	// you may immediately return a value: if it is truthy, it will be considered a pass, and a fail otherwise
			},
			'SearchBarWidget.field': function(searchField) {	// if you need to do some advanced matching but don't feel like writing a matcher, you may use WebDriver's access
				return searchField.getAttribute('autocomplete').then(function(attribute) {	// notice that you should **always** `return` a promise
					if (attribute != 'off')
						throw 'Expected autocompletion to be off';
				});
			}
		}
	]
}
