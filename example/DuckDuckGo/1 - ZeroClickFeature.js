description: 'Looking up an ambiguous term should make a Zero Click Info box appear.',

scenario: [
	SearchBarComponent.searchFor(query),
	{
		'ZeroClickComponent.meanings': expandedAcronym
	}
]
