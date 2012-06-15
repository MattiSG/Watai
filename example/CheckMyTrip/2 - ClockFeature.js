{
	description: 'A user should be able to look up ' + clockLookupTown + '’s local town',
	
	scenario: [
		function() {
			prev = ClockWidget.result; //TODO: offer a place to store previous values
		},
		ClockWidget.lookup, clockLookupTown,
		function() {
			assert.equal(ClockWidget.result, prev - 1); //TODO: offer assertions
		}
	]
}
