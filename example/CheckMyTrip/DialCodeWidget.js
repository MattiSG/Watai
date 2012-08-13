{
	elements: {
		selector: { css: '#dialingCode input[type=text]' },
		result: { css: '#dialingCode .result-wrapper .main' }
	},
	
	lookup: function lookup(country) {
		this.selector = country;
		this.selector.sendKeys('\n');
		return this.selector.submit();
	}
}
