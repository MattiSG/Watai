{
	elements: {
		field:	{ css: '#clock input[type=text]' },
		result:	{ css: '#clock .time-holder .time' }
	},
	
	lookup: function lookup(town) {
		this.field = town;
		return this.field.submit();
	}
}
