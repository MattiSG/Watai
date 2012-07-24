{
	elements: {
		selector: { css: '#dialingCode input[type=text]' },
		result: { css: '#dialingCode .result-wrapper .main' }
	},
	
	lookup: function lookup(country) {
		selector = country;
		return selector.submit();
	}
}
