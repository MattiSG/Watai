elements: {
	field:			{ name: 'q' },
	submitButton:	{ id: 'search_button_homepage' }
},

searchFor: function searchFor(term) {
	return	this.setField(term)()
				.then(this.submit());
}
