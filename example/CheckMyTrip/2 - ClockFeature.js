{
	description: 'A user should be able to look up ' + clockLookupTown + '’s local time',
	
	scenario: [
		function() {
			return ClockWidget.getCurrentHour()
							  .then(function(hour) {
							  	storage.previousHour = hour;
							  });
		},
		ClockWidget.lookup(clockLookupTown),
		function() {
			return ClockWidget.getCurrentHour()
							  .then(function(hour) {
							  	assert.equal(hour, storage.previousHour - 1);
							  });
		}
	]
}
