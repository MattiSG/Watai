field							: '#clock input[type=text]' ,
submitButton					: '#clock input[type=submit]' ,
result							: '#clock .time-holder .time' ,
selectAutocompleteResultButton	: '.xLISTItem_dropdown',

lookup: function(town) {
	return	this.setField(town)()	// immediate execution to start the chain
				.delay(800)			// autocompletion is quite slow, give it some time (note that this is a `Q` method, not `wd`'s)
				.then(this.setField('\ue015'))	// down arrow
				.then(this.submit());
},

getCurrentHour: function() {
	return this.result.then(function(resultElement) {
		return resultElement.text();
	}).then(function(text) {
		var hour = text.split(':')[0];	// get the hour only
		return +hour;	// coerce the hour into a Number
	});
}
