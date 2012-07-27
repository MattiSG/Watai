{
	elements: {
		selector: { css: '#dialingCode input[type=text]' },
		result: { css: '#dialingCode .result-wrapper .main' }
	},
	
	lookup: function lookup(country) {
		this.selector = country;
		return this.selector.submit();
	}
}
