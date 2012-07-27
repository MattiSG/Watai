{
	description: 'A user should be able to look up ' + clockLookupTown + '’s local time',
	
	scenario: [
		function() {
			return ClockWidget.result
							  .then(function(elm) {
							  	return elm.getText();
							  }).then(function(text) {
							  	storage.previousHour = text.split(':')[0];	// get the hour only
							  });
		},
		ClockWidget.lookup, clockLookupTown,
		function() {
			return ClockWidget.result
							  .then(function(elm) {
							  	return elm.getText();
							  }).then(function(text) {
							  	assert.equal(text.split(':')[0], storage.previousHour - 1);
							  });
		}
	]
}
