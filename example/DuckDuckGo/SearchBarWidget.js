{
	elements: {
		field:	{ name: 'q' }
	},
	
	searchFor: function searchFor(term) {
		this.field = term;
		return this.field.submit();
	}
}
