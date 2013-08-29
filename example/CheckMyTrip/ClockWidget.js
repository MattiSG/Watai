{
	elements: {
		field							: { css: '#clock input[type=text]' },
		submitButton					: { css: '#clock input[type=submit]' },
		result							: { css: '#clock .time-holder .time' },
		selectAutocompleteResultButton	: { css: '.xLISTItem_dropdown' }
	},

	lookup: function lookup(town) {
		return	this.setField(town)()	// immediate execution to start the chain
					.then(this.selectAutocompleteResult())
					.then(this.submit());
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
