{
	elements: {
		selector: { css: '#dialingCode input[type=text]' },
		result	: { css: '#dialingCode .result-wrapper .main' }
	},

	lookup: function lookup(country) {
		return this.setSelector(country + '\n')().then(function(selector) {
			return driver.submit(selector);
		});
	}
}
