description: 'Looking up an ambiguous term should make a Zero Click Info box appear.',

scenario: [
	SearchBarWidget.searchFor(query),
	{
		'ZeroClickWidget.meanings': expandedAcronym
	}
]
