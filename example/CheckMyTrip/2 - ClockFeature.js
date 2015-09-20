description: 'A user should be able to look up ' + clockLookupTown + '’s local time',

scenario: [
	function storeCurrentTime() {
		return ClockComponent.getCurrentHour()()
						  .then(function(hour) {
						  	storage.previousHour = hour;
						  });
	},
	ClockComponent.lookup(clockLookupTown),
	function hasExpectedTimeDiff() {
		return ClockComponent.getCurrentHour()()
						  .then(function(hour) {
						  	assert.equal(hour, timeDiff(storage.previousHour, - 1));
						  });
	}
]
