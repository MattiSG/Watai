{
	description: 'A user should be able to look up ' + clockLookupTown + '’s local time',

	scenario: [
		function storeCurrentTime() {
			return ClockWidget.getCurrentHour()()
							  .then(function(hour) {
							  	storage.previousHour = hour;
							  });
		},
		ClockWidget.lookup(clockLookupTown),
		function hasExpectedTimeDiff() {
			return ClockWidget.getCurrentHour()()
							  .then(function(hour) {
							  	assert.equal(hour, storage.previousHour - 1);
							  });
		}
	]
}
