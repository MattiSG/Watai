{
	elements: {
		selector						: { css: '#dialingCode input[type=text]' },
		result							: { css: '#dialingCode .result-wrapper .main' },
		selectAutocompleteResultButton	: { css: '.xLISTItem_dropdown' }
	},

	lookup: function lookup(country) {
		return	this.setSelector(country + '\n')()	// 'newline' to open the autocompletion list
					.then(this.selectAutocompleteResult())
					.then(function() {
						return this.selector;
					}.bind(this))
					.then(driver.submit.bind(driver));
	}
}
