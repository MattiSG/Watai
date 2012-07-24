{
	description: 'A user should be able to look up ' + dialCodeLookup + '’s dialcode',
	
	scenario: [
		TripToolsWidget.open,
		DialCodeWidget.lookup, dialCodeLookup,
		{ 'DialCodeWidget.result': dialCodeResult }
	]
}
