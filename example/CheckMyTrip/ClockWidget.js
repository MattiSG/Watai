{
	elements: {
		field:	{ css: '#clock input[type=text]' },
		result:	{ css: '#clock .time-holder .time' }
	},
	
	lookup: function lookup(town) {
		this.field = town;
		return this.field.submit();
	},

	getCurrentHour: function getCurrentHour(callback) {
		return this.result
				   .getText()
				   .then(function(text) {
				    	var hour = text.split(':')[0];	// get the hour only
				    	//callback(+ hour);	// cast to Number
				    	return +hour;
				   });
	}
}
