description: 'Match the Zero Click Info box header with RegExps',

scenario: [
	{
		'ZeroClickWidget.header': /Meanings of/,	// match the textual content with a static regexp…
		'ZeroClickWidget.header': new RegExp(lookupTerm + '$')	// …or with a dynamic one
	}
]
