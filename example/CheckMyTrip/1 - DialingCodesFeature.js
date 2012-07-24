{
	description: 'A user should be able to look up ' + dialCodeLookupCountry + '’s dialcode',
	
	scenario: [
		TripToolsWidget.open,
		DialCodeWidget.lookup, dialCodeLookupCountry,
		{ 'DialCodeWidget.result': dialCodeExpectedResult }
	]
}
