elements: {
	selector		: { css: '#dialingCode input[type=text]' },
	submitButton	: { css: '#dialingCode input[type=submit]' },
	result			: { css: '#dialingCode .result-wrapper .main' },
},

lookup: function lookup(country) {
	return	this.setSelector(country)()	// immediate execution to start the chain
				.then(this.submit());
}
