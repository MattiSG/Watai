description: 'Match the Zero Click Info box header with RegExps',

scenario: [
	{
		'ZeroClickComponent.meanings': expandedAcronym,	// match the textual content with a static regexp…
		'SearchBarComponent.field': new RegExp('^' + query + '$')	// …or with a dynamic one
		// notice how we can match both the textual content of an element or the value of a field with the same syntax
	}
]
