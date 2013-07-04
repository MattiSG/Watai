{
	elements: {
		field:	{ css: '#clock input[type=text]' },
		result:	{ css: '#clock .time-holder .time' }
	},

	lookup: function lookup(town) {
		return this.setField(town + '\n\n\n')();	// one return to open the autocompletion list, one return to select the first result, one return to select the first result
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
