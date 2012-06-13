{
	description: 'Looking up an ambiguous term should make the Zero-Click toolbox appear.',
	
	scenario: [
		SearchBarWidget.searchFor, lookupTerm,
		{ 'ZeroClickWidget.header': 'Meanings of ' + lookupTerm }
	]
}
