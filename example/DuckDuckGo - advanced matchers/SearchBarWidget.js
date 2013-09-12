field:			{ name: 'q' },
submitButton:	'#search_button_homepage',

searchFor: function searchFor(term) {
	return	this.setField(term)()	// (yes, this syntax is ugly and will be fixed in an upcoming release, see issue #99)
				.then(this.submit());
}
