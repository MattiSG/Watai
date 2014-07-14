description: 'Match the Zero Click Info box header with RegExps',

scenario: [
	{
		'ZeroClickWidget.meanings': expandedAcronym,	// match the textual content with a static regexp…
		'SearchBarWidget.field': new RegExp('^' + query + '$')	// …or with a dynamic one
		// notice how we can match both the textual content of an element or the value of a field with the same syntax
	}
]
