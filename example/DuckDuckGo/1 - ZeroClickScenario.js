description: 'Looking up an ambiguous term should make a Zero Click Info box appear.',

steps: [
	SearchBarComponent.searchFor(query),
	{
		'ZeroClickComponent.meanings': expandedAcronym
	}
]
