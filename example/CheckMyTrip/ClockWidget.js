{
	elements: {
		field:	{ css: '#clock input[type=text]' },
		result:	{ css: '#clock .time-holder .time' }
	},
	
	lookup: function lookup(town) {
		field = town;
		return field.submit();
	}
}
