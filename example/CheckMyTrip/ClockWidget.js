{
	elements: {
		field							: { css: '#clock input[type=text]' },
		result							: { css: '#clock .time-holder .time' },
		selectAutocompleteResultButton	: { css: '.xLISTItem_dropdown' }
	},

	lookup: function lookup(town) {
		return	this.setField(town + '\n')()	// 'newline' to open the autocompletion list
					.then(this.selectAutocompleteResult())
					.then(function() {
						return this.field;
					}.bind(this))
					.then(driver.submit.bind(driver));
	},

	getCurrentHour: function getCurrentHour() {
		return this.result.then(function(resultElement) {
			return resultElement.text();
		}).then(function(text) {
			var hour = text.split(':')[0];	// get the hour only
			return +hour;	// coerce the hour into a Number
		});
	}
}
