description: 'A user should be able to look up ' + dialCodeLookupCountry + '’s dialcode',

scenario: [
	TripToolsComponent.open(),
	DialCodeComponent.lookup(dialCodeLookupCountry),
	{ 'DialCodeComponent.result': dialCodeExpectedResult }
]
