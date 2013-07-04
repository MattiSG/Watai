{
	description: 'Looking up an ambiguous term should make a Zero Click Info box appear.',

	scenario: [
		SearchBarWidget.setField(lookupTerm),
		SearchBarWidget.submit(),
		{ 'ZeroClickWidget.header': 'Meanings of ' + lookupTerm }
	]
}
